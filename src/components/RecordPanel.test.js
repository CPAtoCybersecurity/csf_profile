import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import RecordPanel, { CommentsButton } from './RecordPanel';
import useCommentsStore from '../stores/commentsStore';
import useAuditLogStore from '../stores/auditLogStore';
import useUserStore from '../stores/userStore';

const USERS = [
  { id: 1, name: 'Gerry.Callahan', title: 'CISO', email: 'g@x.com' },
  { id: 2, name: 'Nadia.Khan', title: 'D&R Lead', email: 'n@x.com' }
];

const target = { targetType: 'finding', targetId: 'FND-panel-1' };

beforeEach(() => {
  window.localStorage.clear();
  useCommentsStore.setState({ comments: [] });
  useAuditLogStore.setState({ entries: [] });
  useUserStore.setState({ users: USERS, currentUserId: 1 });
});

describe('RecordPanel', () => {
  test('renders nothing when closed', () => {
    render(<RecordPanel open={false} onClose={() => {}} {...target} title="FND-panel-1" />);
    expect(screen.queryByTestId('record-panel')).not.toBeInTheDocument();
  });

  test('shows empty states on both tabs', () => {
    render(<RecordPanel open onClose={() => {}} {...target} title="FND-panel-1" />);
    expect(screen.getByText('No comments yet')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    expect(screen.getByText('No changes recorded yet')).toBeInTheDocument();
  });

  test('adds a comment with author, timestamp, and clears the composer', () => {
    render(<RecordPanel open onClose={() => {}} {...target} title="FND-panel-1" />);
    const textarea = screen.getByPlaceholderText(/add a comment/i);
    fireEvent.change(textarea, { target: { value: 'First note' } });
    fireEvent.click(screen.getByRole('button', { name: /^comment$/i }));
    expect(screen.getByText('First note')).toBeInTheDocument();
    // the author name appears in the comment row AND the "Commenting as" footer
    expect(screen.getAllByText('Gerry.Callahan').length).toBeGreaterThanOrEqual(2);
    expect(textarea).toHaveValue('');
    // date-stamped: the stored comment carries an ISO timestamp that renders
    const stored = useCommentsStore.getState().comments[0];
    expect(new Date(stored.createdAt).toISOString()).toBe(stored.createdAt);
  });

  test('typing @ opens the user suggestion dropdown, filtered by prefix', () => {
    render(<RecordPanel open onClose={() => {}} {...target} title="FND-panel-1" />);
    const textarea = screen.getByPlaceholderText(/add a comment/i);
    fireEvent.change(textarea, { target: { value: 'ping @Nad' } });
    const dropdown = screen.getByTestId('mention-suggestions');
    expect(dropdown).toBeInTheDocument();
    expect(within(dropdown).getByText('Nadia.Khan')).toBeInTheDocument();
    expect(within(dropdown).queryByText('Gerry.Callahan')).not.toBeInTheDocument();
  });

  test('selecting a suggestion inserts the mention and it renders highlighted', () => {
    render(<RecordPanel open onClose={() => {}} {...target} title="FND-panel-1" />);
    const textarea = screen.getByPlaceholderText(/add a comment/i);
    fireEvent.change(textarea, { target: { value: 'ping @Nad' } });
    fireEvent.click(screen.getByText('Nadia.Khan'));
    expect(textarea).toHaveValue('ping @Nadia.Khan ');
    fireEvent.click(screen.getByRole('button', { name: /^comment$/i }));
    expect(useCommentsStore.getState().comments[0].mentions).toEqual([2]);
    expect(screen.getByText('@Nadia.Khan')).toBeInTheDocument();
  });

  test('History tab lists a scoped change with actor and old → new', () => {
    useAuditLogStore.getState().addEntry({
      action: 'finding_updated', entity: 'FND-panel-1', field: 'status',
      oldValue: 'Not Started', newValue: 'In Progress', ...target
    });
    render(<RecordPanel open onClose={() => {}} {...target} title="FND-panel-1" />);
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    expect(screen.getByText('Finding Updated')).toBeInTheDocument();
    expect(screen.getByText('Not Started')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Gerry.Callahan')).toBeInTheDocument();
  });

  test('Escape closes the panel without reaching underlying document handlers', () => {
    const onClose = jest.fn();
    const underlying = jest.fn();
    document.addEventListener('keydown', underlying); // bubble phase, like a modal
    render(<RecordPanel open onClose={onClose} {...target} title="FND-panel-1" />);
    fireEvent.keyDown(screen.getByPlaceholderText(/add a comment/i), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(underlying).not.toHaveBeenCalled();
    document.removeEventListener('keydown', underlying);
  });

  test('comment delete is two-step and logs comment_deleted', () => {
    useCommentsStore.getState().addComment({ ...target, text: 'to remove' });
    render(<RecordPanel open onClose={() => {}} {...target} title="FND-panel-1" />);
    fireEvent.click(screen.getByRole('button', { name: /delete comment/i }));
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(useCommentsStore.getState().comments).toHaveLength(0);
    const actions = useAuditLogStore.getState().getEntriesForRecord(target.targetType, target.targetId).map(e => e.action);
    expect(actions).toContain('comment_deleted');
  });
});

describe('CommentsButton', () => {
  test('shows a count badge only when comments exist', () => {
    const { rerender } = render(<CommentsButton onClick={() => {}} {...target} />);
    expect(screen.getByRole('button', { name: /comments/i })).toBeInTheDocument();
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    useCommentsStore.getState().addComment({ ...target, text: 'one' });
    rerender(<CommentsButton onClick={() => {}} {...target} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
