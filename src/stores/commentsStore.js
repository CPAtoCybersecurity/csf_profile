import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeInput } from '../utils/sanitize';
import useUserStore from './userStore';
import useAuditLogStore from './auditLogStore';

// Raw input is capped BEFORE sanitize so DOMPurify's entity encoding can
// never be truncated mid-entity (the sanitized form may run slightly longer).
export const MAX_COMMENT_LENGTH = 2000;

/**
 * Split comment text into segments for mention-aware work. This single
 * function backs BOTH the parse-at-write path (mentions[]) and the
 * highlight-at-render path, so stored mentions and visible highlights can
 * never diverge. String scan — no regex built from user names, so names with
 * regex metacharacters ('.', '(', '+') are safe. Candidates are matched
 * longest-name-first so '@Steven Mercer' never resolves as '@Steve' + 'n';
 * on duplicate display names the first user in directory order wins.
 *
 * Returns [{ text, userId? }, ...] where segments with userId are mentions
 * (text includes the leading '@').
 */
export const segmentMentions = (text, users) => {
  const value = typeof text === 'string' ? text : '';
  if (!value) return [];
  const candidates = (users || [])
    .filter(u => typeof u.name === 'string' && u.name.trim())
    .sort((a, b) => b.name.length - a.name.length);
  const lower = value.toLowerCase();
  const segments = [];
  let plainStart = 0;
  let i = 0;
  while (i < value.length) {
    if (value[i] === '@') {
      const match = candidates.find(u =>
        lower.startsWith(u.name.toLowerCase(), i + 1)
      );
      if (match) {
        if (i > plainStart) segments.push({ text: value.slice(plainStart, i) });
        segments.push({ text: `@${value.slice(i + 1, i + 1 + match.name.length)}`, userId: match.id });
        i += 1 + match.name.length;
        plainStart = i;
        continue;
      }
    }
    i += 1;
  }
  if (plainStart < value.length) segments.push({ text: value.slice(plainStart) });
  return segments;
};

export const parseMentions = (text, users) => {
  const ids = segmentMentions(text, users)
    .filter(s => s.userId !== undefined)
    .map(s => s.userId);
  return [...new Set(ids)];
};

/**
 * Shape repair for the restore/import lane (bulk setters bypass zustand's
 * load-time migrate). Drops junk-shaped records, coerces mentions to an
 * array, backfills authorName. Absent-only and idempotent — a well-formed
 * comment passes through unchanged.
 */
export const normalizeCommentFields = (state) => {
  if (!Array.isArray(state?.comments)) return state;
  const comments = state.comments
    .filter(c =>
      c && typeof c === 'object' &&
      typeof c.id === 'string' &&
      typeof c.targetType === 'string' &&
      typeof c.targetId === 'string' &&
      typeof c.text === 'string'
    )
    .map(c => ({
      ...c,
      mentions: Array.isArray(c.mentions) ? c.mentions : [],
      authorName: typeof c.authorName === 'string' && c.authorName ? c.authorName : 'System',
      createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString()
    }));
  return { ...state, comments };
};

const useCommentsStore = create(
  persist(
    (set, get) => ({
      // Seeds EMPTY by design — no demo comments (standing no-DEFAULT-seeds rule).
      comments: [],

      /**
       * Add a comment to a record. targetType: 'evaluation' | 'control' |
       * 'finding'. Returns the new comment, or null for empty input.
       * entity is the human-readable record label for the audit log.
       */
      addComment: ({ targetType, targetId, text, entity }) => {
        if (!targetType || !targetId) return null;
        const raw = typeof text === 'string' ? text.trim() : '';
        if (!raw) return null;
        const capped = raw.slice(0, MAX_COMMENT_LENGTH);
        const clean = sanitizeInput(capped);
        if (!clean.trim()) return null;

        const userStore = useUserStore.getState();
        const author = userStore.getCurrentUser();
        const comment = {
          id: uuidv4(),
          targetType,
          targetId,
          text: clean,
          authorId: author?.id ?? null,
          // Name snapshot so the comment stays attributed even if the user
          // is later deleted from the directory.
          authorName: author?.name || 'System',
          mentions: parseMentions(clean, userStore.users),
          createdAt: new Date().toISOString()
        };
        set((state) => ({ comments: [...state.comments, comment] }));

        useAuditLogStore.getState().addEntry({
          action: 'comment_added',
          entity: entity || `${targetType} ${targetId}`,
          targetType,
          targetId
        });
        return comment;
      },

      deleteComment: (id, entity) => {
        const existing = get().comments.find(c => c.id === id);
        if (!existing) return;
        set((state) => ({ comments: state.comments.filter(c => c.id !== id) }));
        // Deletion is logged — silently removing discussion from a record
        // would defeat the accountability this feature exists for.
        useAuditLogStore.getState().addEntry({
          action: 'comment_deleted',
          entity: entity || `${existing.targetType} ${existing.targetId}`,
          targetType: existing.targetType,
          targetId: existing.targetId
        });
      },

      // Oldest-first — a conversation reads top-down.
      getComments: (targetType, targetId) =>
        get().comments
          .filter(c => c.targetType === targetType && c.targetId === targetId)
          .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0)),

      getCommentCount: (targetType, targetId) =>
        get().comments.filter(c => c.targetType === targetType && c.targetId === targetId).length,

      // Bulk setter for restore/import lanes (bypasses per-comment logging).
      setComments: (comments) => {
        set({ comments: Array.isArray(comments) ? comments : [] });
      }
    }),
    {
      name: 'csf-comments-storage',
      version: 1
    }
  )
);

export default useCommentsStore;
