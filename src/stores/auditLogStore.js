import { create } from 'zustand';
import { scopedKey } from '../utils/visitorId';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useAuditLogStore = create(
  persist(
    (set, get) => ({
      entries: [],

      // Add a log entry
      addEntry: ({ action, entity, field, oldValue, newValue, user }) => {
        const entry = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          action,
          entity,
          field: field || null,
          oldValue: oldValue != null ? String(oldValue) : null,
          newValue: newValue != null ? String(newValue) : null,
          user: user || 'System'
        };
        set((state) => ({
          entries: [entry, ...state.entries].slice(0, 500) // Keep last 500
        }));
      },

      // Get entries with optional filters
      getEntries: (filters = {}) => {
        let entries = get().entries;
        if (filters.action) entries = entries.filter(e => e.action === filters.action);
        if (filters.entity) entries = entries.filter(e => e.entity?.includes(filters.entity));
        return entries;
      },

      // Clear all entries
      clearLog: () => set({ entries: [] }),

      // Export as CSV
      exportCSV: () => {
        const entries = get().entries;
        const headers = 'Timestamp,Action,Entity,Field,Old Value,New Value,User\n';
        const rows = entries.map(e =>
          [e.timestamp, e.action, e.entity, e.field, e.oldValue, e.newValue, e.user]
            .map(v => `"${(v || '').replace(/"/g, '""')}"`)
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
    { name: scopedKey('csf-audit-log') }
  )
);

export default useAuditLogStore;
