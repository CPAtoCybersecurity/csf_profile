import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MessageSquare, History, X, Send, Trash2 } from 'lucide-react';
import useCommentsStore, { segmentMentions, MAX_COMMENT_LENGTH } from '../stores/commentsStore';
import useAuditLogStore from '../stores/auditLogStore';
import useUserStore from '../stores/userStore';
import { ACTION_META, formatAuditTimestamp } from '../utils/auditActions';

/**
 * RecordPanel — the shared right-docked Comments + History panel for
 * Assessment Evaluation records, Controls, and Findings.
 *
 * Positioning is inline style, not utility classes: this repo's index.css is
 * a hand-rolled subset with no `right-0`/`w-96`, so the two existing right
 * panels (Findings, RequirementDetailPanel) hand-roll position/top/right/
 * bottom the same way. zIndex 1100 sits above the Findings slide-over (1000)
 * and every `z-50` modal; react-hot-toast (9999) stays on top, correctly.
 */

// Comment text renders as plain JSX text — mentions get a highlighted span.
// No dangerouslySetInnerHTML anywhere in this file, by policy.
const CommentText = ({ text, users }) => {
  const segments = segmentMentions(text, users);
  return (
    <span style={{ overflowWrap: 'anywhere' }}>
      {segments.map((seg, i) =>
        seg.userId !== undefined ? (
          <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">{seg.text}</span>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        )
      )}
    </span>
  );
};

const ActionBadge = ({ action }) => {
  const meta = ACTION_META[action] || { label: action, color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
      {meta.label}
    </span>
  );
};

/**
 * Top-right trigger for the panel — drop into a record header's button
 * cluster. Shows a count badge when the record has comments.
 */
export const CommentsButton = ({ onClick, targetType, targetId, title = 'Comments' }) => {
  const count = useCommentsStore((state) =>
    state.comments.filter(c => c.targetType === targetType && c.targetId === targetId).length
  );
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <MessageSquare size={14} />
      {count > 0 && (
        <span className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium" style={{ minWidth: 18, height: 18, padding: '0 4px' }}>
          {count}
        </span>
      )}
    </button>
  );
};

const RecordPanel = ({ open, onClose, targetType, targetId, title }) => {
  const [tab, setTab] = useState('comments');
  const [draft, setDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [mentionQuery, setMentionQuery] = useState(null); // null = dropdown closed
  // Ref mirror so the Escape handler can branch WITHOUT side effects inside
  // a state updater (StrictMode double-invokes updaters; onClose in one is
  // a render-phase setState hazard).
  const mentionQueryRef = useRef(null);
  mentionQueryRef.current = mentionQuery;
  const textareaRef = useRef(null);

  const users = useUserStore((state) => state.users);
  const currentUserName = useUserStore((state) => state.getCurrentUserName());
  const comments = useCommentsStore((state) => state.comments);
  const addComment = useCommentsStore((state) => state.addComment);
  const deleteComment = useCommentsStore((state) => state.deleteComment);
  const entries = useAuditLogStore((state) => state.entries);

  const recordComments = useMemo(
    () => comments
      .filter(c => c.targetType === targetType && c.targetId === targetId)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0)),
    [comments, targetType, targetId]
  );
  const recordEntries = useMemo(
    () => entries.filter(e => e.targetType === targetType && e.targetId === targetId),
    [entries, targetType, targetId]
  );

  // Escape closes the mention dropdown first, then the panel. Capture phase +
  // stopPropagation so the Escape that closes this overlay can never also
  // close the record modal/panel underneath it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (mentionQueryRef.current !== null) {
        setMentionQuery(null);
      } else {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  // Reset transient state when the target record changes.
  useEffect(() => {
    setDraft('');
    setConfirmDeleteId(null);
    setMentionQuery(null);
  }, [targetType, targetId]);

  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return users
      .filter(u => typeof u.name === 'string' && u.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [mentionQuery, users]);

  const handleDraftChange = (e) => {
    const value = e.target.value;
    setDraft(value);
    const caret = e.target.selectionStart ?? value.length;
    const beforeCaret = value.slice(0, caret);
    const match = beforeCaret.match(/@(\S*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const insertMention = (user) => {
    const el = textareaRef.current;
    const caret = el?.selectionStart ?? draft.length;
    const beforeCaret = draft.slice(0, caret);
    // Function replacer: a directory name containing $&, $1, $$ etc. must be
    // inserted literally, not treated as a replacement pattern.
    const replaced = beforeCaret.replace(/@(\S*)$/, () => `@${user.name} `);
    setDraft(replaced + draft.slice(caret));
    setMentionQuery(null);
    el?.focus();
  };

  const submit = () => {
    const added = addComment({ targetType, targetId, text: draft, entity: title });
    if (added) {
      setDraft('');
      setMentionQuery(null);
    }
  };

  if (!open) return null;

  return (
    <div
      data-testid="record-panel"
      className="flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(400px, 92vw)',
        zIndex: 1100,
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
          <MessageSquare size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={title}>
            {title}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setTab('comments')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${tab === 'comments'
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          <MessageSquare size={14} />
          Comments{recordComments.length > 0 ? ` (${recordComments.length})` : ''}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${tab === 'history'
            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
        >
          <History size={14} />
          History{recordEntries.length > 0 ? ` (${recordEntries.length})` : ''}
        </button>
      </div>

      {tab === 'comments' ? (
        <>
          {/* Comment list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {recordComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquare size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No comments yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Start the conversation — use @ to tag a teammate.
                </p>
              </div>
            ) : (
              recordComments.map((comment) => (
                <div key={comment.id} className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {formatAuditTimestamp(comment.createdAt)}
                      </span>
                    </div>
                    {confirmDeleteId === comment.id ? (
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <button
                          onClick={() => { deleteComment(comment.id, title); setConfirmDeleteId(null); }}
                          className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(comment.id)}
                        aria-label="Delete comment"
                        className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 mt-1">
                    <CommentText text={comment.text} users={users} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 relative">
            {mentionQuery !== null && mentionSuggestions.length > 0 && (
              <div
                className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-xl overflow-y-auto"
                style={{ bottom: '100%', left: 16, right: 16, marginBottom: 4, maxHeight: 180, zIndex: 10 }}
                data-testid="mention-suggestions"
              >
                {mentionSuggestions.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => insertMention(user)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span className="font-medium">{user.name}</span>
                    {user.title && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">{user.title}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">
              Commenting as <span className="font-medium text-gray-600 dark:text-gray-300">{currentUserName}</span>
            </div>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={handleDraftChange}
              placeholder="Add a comment — @ to tag"
              rows={3}
              maxLength={MAX_COMMENT_LENGTH}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ resize: 'none' }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {draft.length}/{MAX_COMMENT_LENGTH}
              </span>
              <button
                onClick={submit}
                disabled={!draft.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={13} />
                Comment
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {recordEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <History size={32} className="text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No changes recorded yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Edits to this record will appear here with who and when.
              </p>
            </div>
          ) : (
            recordEntries.map((entry) => (
              <div key={entry.id} className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-2">
                  <ActionBadge action={entry.action} />
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatAuditTimestamp(entry.timestamp)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">{entry.user || 'System'}</span>
                  {entry.field ? <> · {entry.field}</> : null}
                </div>
                {(entry.oldValue != null || entry.newValue != null) && (
                  <div className="flex items-center gap-1.5 text-xs mt-1" style={{ flexWrap: 'wrap' }}>
                    {entry.oldValue != null && (
                      <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-mono" style={{ overflowWrap: 'anywhere' }}>
                        {entry.oldValue}
                      </span>
                    )}
                    {entry.oldValue != null && entry.newValue != null && (
                      <span className="text-gray-400">→</span>
                    )}
                    {entry.newValue != null && (
                      <span className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-mono" style={{ overflowWrap: 'anywhere' }}>
                        {entry.newValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RecordPanel;
