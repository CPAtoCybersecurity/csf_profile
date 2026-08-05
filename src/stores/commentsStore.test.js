/**
 * commentsStore — add/sanitize/cap/mention-parse/scoped-get/delete/count,
 * restore normalization, and audit-log linkage. Attribution tests run the
 * PRODUCTION path (set acting user → addComment → assert persisted author),
 * not a grep — the 'System' fallback makes string greps prove nothing.
 */
import useCommentsStore, {
  segmentMentions,
  parseMentions,
  normalizeCommentFields,
  MAX_COMMENT_LENGTH
} from './commentsStore';
import useAuditLogStore from './auditLogStore';
import useUserStore from './userStore';

const USERS = [
  { id: 1, name: 'Gerry.Callahan', title: 'CISO', email: 'g@example.com' },
  { id: 2, name: 'Steve.Mercer', title: 'Director', email: 's@example.com' },
  // Regex metacharacters and a prefix collision with user 2 on purpose:
  { id: 3, name: 'Steve.Mercer (Contractor)', title: 'Advisor', email: 'sc@example.com' },
  { id: 4, name: 'Jane Alvarez', title: 'Engineer', email: 'j@example.com' }
];

beforeEach(() => {
  window.localStorage.clear();
  useCommentsStore.setState({ comments: [] });
  useAuditLogStore.setState({ entries: [] });
  useUserStore.setState({ users: USERS, currentUserId: null });
});

describe('segmentMentions / parseMentions', () => {
  test('parses a simple mention and resolves the user id', () => {
    expect(parseMentions('ping @Gerry.Callahan please', USERS)).toEqual([1]);
  });

  test('longest name wins on prefix collisions', () => {
    expect(parseMentions('cc @Steve.Mercer (Contractor) too', USERS)).toEqual([3]);
  });

  test('names with spaces and regex metacharacters are safe', () => {
    expect(parseMentions('for @Jane Alvarez to review', USERS)).toEqual([4]);
    expect(() => parseMentions('@(((', USERS)).not.toThrow();
  });

  test('unknown @tokens are not mentions', () => {
    expect(parseMentions('@nobody.here hello', USERS)).toEqual([]);
  });

  test('duplicate mentions dedupe; case-insensitive match', () => {
    expect(parseMentions('@steve.mercer and @Steve.Mercer', USERS)).toEqual([2]);
  });

  test('segments reconstruct the full text (render path = parse path)', () => {
    const text = 'a @Gerry.Callahan b @Jane Alvarez c';
    const joined = segmentMentions(text, USERS).map(s => s.text).join('');
    expect(joined).toBe(text);
  });
});

describe('addComment', () => {
  const target = { targetType: 'finding', targetId: 'FND-1', entity: 'FND-1 — test' };

  test('adds a comment with ISO timestamp and parsed mentions', () => {
    const c = useCommentsStore.getState().addComment({ ...target, text: 'look @Steve.Mercer' });
    expect(c).not.toBeNull();
    expect(c.mentions).toEqual([2]);
    expect(new Date(c.createdAt).toISOString()).toBe(c.createdAt);
  });

  test('rejects empty and whitespace-only text', () => {
    expect(useCommentsStore.getState().addComment({ ...target, text: '   ' })).toBeNull();
    expect(useCommentsStore.getState().addComment({ ...target, text: '' })).toBeNull();
    expect(useCommentsStore.getState().comments).toHaveLength(0);
  });

  test('strips markup at the producer — no <script> is ever persisted', () => {
    const c = useCommentsStore.getState().addComment({ ...target, text: 'hi <script>alert(1)</script>' });
    expect(c.text).not.toMatch(/<script/i);
    expect(useCommentsStore.getState().comments[0].text).not.toMatch(/</);
  });

  test('caps raw input length before sanitize', () => {
    const c = useCommentsStore.getState().addComment({ ...target, text: 'x'.repeat(MAX_COMMENT_LENGTH + 500) });
    expect(c.text.length).toBeLessThanOrEqual(MAX_COMMENT_LENGTH);
  });

  test('attributes to the acting user via the production path', () => {
    useUserStore.getState().setCurrentUser(2);
    const c = useCommentsStore.getState().addComment({ ...target, text: 'attributed' });
    expect(c.authorId).toBe(2);
    expect(c.authorName).toBe('Steve.Mercer');
  });

  test('falls back to System when no acting user is selected', () => {
    const c = useCommentsStore.getState().addComment({ ...target, text: 'anon' });
    expect(c.authorId).toBeNull();
    expect(c.authorName).toBe('System');
  });

  test('writes a comment_added audit entry scoped to the record', () => {
    useCommentsStore.getState().addComment({ ...target, text: 'logged' });
    const entries = useAuditLogStore.getState().getEntriesForRecord('finding', 'FND-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe('comment_added');
  });
});

describe('scoped reads and delete', () => {
  test('getComments returns only the record, oldest-first; count matches', () => {
    const add = useCommentsStore.getState().addComment;
    add({ targetType: 'control', targetId: 'CTL-1', text: 'first' });
    add({ targetType: 'control', targetId: 'CTL-1', text: 'second' });
    add({ targetType: 'control', targetId: 'CTL-2', text: 'other record' });
    const list = useCommentsStore.getState().getComments('control', 'CTL-1');
    expect(list.map(c => c.text)).toEqual(['first', 'second']);
    expect(useCommentsStore.getState().getCommentCount('control', 'CTL-1')).toBe(2);
  });

  test('deleteComment removes exactly one and logs comment_deleted', () => {
    const c = useCommentsStore.getState().addComment({ targetType: 'finding', targetId: 'FND-9', text: 'bye' });
    useCommentsStore.getState().deleteComment(c.id);
    expect(useCommentsStore.getState().comments).toHaveLength(0);
    const actions = useAuditLogStore.getState().getEntriesForRecord('finding', 'FND-9').map(e => e.action);
    expect(actions).toContain('comment_deleted');
  });
});

describe('normalizeCommentFields (restore lane)', () => {
  test('drops junk-shaped records, keeps well-formed ones unchanged', () => {
    const good = {
      id: 'a', targetType: 'finding', targetId: 'FND-1', text: 'ok',
      authorId: 1, authorName: 'G', mentions: [1], createdAt: '2026-01-01T00:00:00.000Z'
    };
    const { comments } = normalizeCommentFields({
      comments: [good, null, 'junk', { id: 'b' }, { ...good, id: 'c', mentions: 'not-an-array', authorName: '' }]
    });
    expect(comments).toHaveLength(2);
    expect(comments[0]).toEqual(good);
    expect(comments[1].mentions).toEqual([]);
    expect(comments[1].authorName).toBe('System');
  });

  test('non-array state passes through untouched', () => {
    const state = { comments: undefined };
    expect(normalizeCommentFields(state)).toBe(state);
  });
});
