import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import useUserStore from './userStore';
import { csvFormulaGuard } from '../utils/sanitize';

// Retention cap — oldest entries fall off past this count. Raised from 500
// when field-level logging across three entity types landed; at ~250 bytes
// per truncated entry this is ~250KB of localStorage worst-case.
const MAX_ENTRIES = 1000;

// Values stored in oldValue/newValue are truncated so a pasted document
// can't bloat localStorage through the log.
const MAX_VALUE_LENGTH = 120;

// Several edit surfaces (Controls detail panel, evaluation edit mode) write
// to their store on every keystroke. Consecutive changes to the same field of
// the same record by the same actor within this window UPDATE the newest
// matching entry instead of appending — the log records "A → final text",
// not one row per character.
export const COALESCE_WINDOW_MS = 5 * 60 * 1000;

// A change typed straight back to its original value is dropped as a no-op —
// but ONLY at genuine keystroke/misclick grain. Past this window the trail
// stays append-only: a deliberate A → B → A sequence keeps the A → B entry
// and gains a B → A entry, so the log never loses evidence that B existed.
export const REVERT_DROP_WINDOW_MS = 15 * 1000;

const truncateValue = (v) => {
  if (v == null) return null;
  const s = String(v);
  return s.length > MAX_VALUE_LENGTH ? `${s.slice(0, MAX_VALUE_LENGTH - 1)}…` : s;
};

/**
 * Resolve the acting user's display name for attribution. Falls back to
 * 'System' when no acting user is selected (or the user was deleted).
 */
export const getActorName = () => {
  try {
    return useUserStore.getState().getCurrentUserName();
  } catch {
    return 'System';
  }
};

const useAuditLogStore = create(
  persist(
    (set, get) => ({
      entries: [],

      // Add a log entry. targetType/targetId scope the entry to a record
      // ('evaluation' | 'control' | 'finding' | 'assessment') so per-record
      // history views can query it; legacy entries without them still render.
      addEntry: ({ action, entity, field, oldValue, newValue, user, targetType, targetId }) => {
        const now = Date.now();
        const actor = user || getActorName();
        const entries = get().entries;

        // Coalesce keystroke-grain updates: newest entry for the same
        // action + record + field + actor within the window absorbs this
        // change instead of a new row appearing per keystroke.
        if (field && targetType && targetId) {
          const idx = entries.findIndex(e =>
            e.action === action &&
            e.targetType === targetType &&
            e.targetId === targetId &&
            e.field === field &&
            e.user === actor
          );
          if (idx !== -1 && now - new Date(entries[idx].timestamp).getTime() < COALESCE_WINDOW_MS) {
            const truncatedNew = truncateValue(newValue);
            // Typed back to the original value — at keystroke grain the net
            // change is nothing, so drop the entry. Only when the comparison
            // is unambiguous (a truncated stored oldValue can no longer prove
            // full-value equality) AND within the tight revert window: a
            // LATER revert falls through to append its own B → A entry, so
            // the trail stays append-only for deliberate changes.
            const unambiguous = entries[idx].oldValue == null || entries[idx].oldValue.length < MAX_VALUE_LENGTH;
            if (unambiguous && entries[idx].oldValue === truncatedNew) {
              if (now - new Date(entries[idx].timestamp).getTime() < REVERT_DROP_WINDOW_MS) {
                set({ entries: entries.filter((_, i) => i !== idx) });
                return;
              }
              // fall through — append a new entry recording the revert
            } else {
              const updated = { ...entries[idx], newValue: truncatedNew, timestamp: new Date().toISOString() };
              set({ entries: [updated, ...entries.filter((_, i) => i !== idx)].slice(0, MAX_ENTRIES) });
              return;
            }
          }
        }

        const entry = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          action,
          entity,
          field: field || null,
          oldValue: truncateValue(oldValue),
          newValue: truncateValue(newValue),
          user: actor,
          targetType: targetType || null,
          targetId: targetId || null
        };
        set({ entries: [entry, ...entries].slice(0, MAX_ENTRIES) });
      },

      /**
       * Diff `before` vs `after` across a named field list and write one
       * entry per changed field. Only fields PRESENT in `after` are compared
       * (partial updates never log untouched fields). Returns the number of
       * entries written.
       *
       * fields: array of { key, label?, action?, get? } — `get(obj)` reads a
       * nested value; label overrides the field name shown in the log.
       */
      logFieldChanges: ({ targetType, targetId, entity, before, after, fields, user, defaultAction }) => {
        let count = 0;
        fields.forEach((spec) => {
          const { key, label, action, get: getter } = typeof spec === 'string' ? { key: spec } : spec;
          const nextRaw = getter ? getter(after) : after?.[key];
          if (nextRaw === undefined) return; // field not part of this update
          const prevRaw = getter ? getter(before) : before?.[key];
          const prev = prevRaw == null ? '' : String(prevRaw);
          const next = nextRaw == null ? '' : String(nextRaw);
          if (prev === next) return;
          get().addEntry({
            action: action || defaultAction || 'field_changed',
            entity,
            field: label || key,
            oldValue: prevRaw == null ? null : prevRaw,
            newValue: nextRaw,
            user,
            targetType,
            targetId
          });
          count += 1;
        });
        return count;
      },

      // Get entries with optional filters
      getEntries: (filters = {}) => {
        let entries = get().entries;
        if (filters.action) entries = entries.filter(e => e.action === filters.action);
        if (filters.entity) entries = entries.filter(e => e.entity?.includes(filters.entity));
        return entries;
      },

      // All entries for one record, newest first (store order is newest-first).
      getEntriesForRecord: (targetType, targetId) => {
        if (!targetType || !targetId) return [];
        return get().entries.filter(e => e.targetType === targetType && e.targetId === targetId);
      },

      // Record-id rename support: history follows the record instead of
      // orphaning (accountability survives a controlId edit).
      retargetRecord: (targetType, oldTargetId, newTargetId) => {
        if (!targetType || !oldTargetId || !newTargetId || oldTargetId === newTargetId) return;
        set((state) => ({
          entries: state.entries.map(e =>
            e.targetType === targetType && e.targetId === oldTargetId
              ? { ...e, targetId: newTargetId }
              : e
          )
        }));
      },

      // Clear all entries
      clearLog: () => set({ entries: [] }),

      // Export as CSV
      exportCSV: () => {
        const entries = get().entries;
        const headers = 'Timestamp,Action,Entity,Field,Old Value,New Value,User\n';
        const rows = entries.map(e =>
          [e.timestamp, e.action, e.entity, e.field, e.oldValue, e.newValue, e.user]
            // csvFormulaGuard neutralizes leading =+-@ (mention syntax makes
            // @ routine in these values); the manual wrap below still does
            // the quoting, which is the split of duties its docstring names.
            .map(v => `"${csvFormulaGuard(v == null ? '' : v).replace(/"/g, '""')}"`)
            .join(',')
        ).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }),
    { name: 'csf-audit-log' }
  )
);

export default useAuditLogStore;
