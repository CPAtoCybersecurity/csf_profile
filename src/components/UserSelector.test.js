import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserSelector from './UserSelector';
import useUserStore from '../stores/userStore';

/**
 * Scoped mode (issue #297): with scopeUserIds set, the dropdown lists only
 * the assessment's roster; the rest of the directory sits behind an explicit
 * "Browse directory…" expansion (or a typed search), and picking a directory
 * user reports it through onAddToScope so the caller can link them.
 */

const DIRECTORY = [
  { id: 'u1', name: 'Roster Rita', title: 'Auditor', email: 'rita@example.com' },
  { id: 'u2', name: 'Directory Dan', title: 'Engineer', email: 'dan@example.com' },
  { id: 'u3', name: 'Demo Gerry', title: 'CISO', email: 'gerry@almasecurity.example' }
];

beforeEach(() => {
  useUserStore.setState({ users: DIRECTORY });
});

const openDropdown = () => fireEvent.click(screen.getByTitle('Select user'));

describe('UserSelector — unscoped (legacy behavior unchanged)', () => {
  it('lists the whole directory', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} />);
    openDropdown();
    expect(screen.getByText('Roster Rita')).toBeInTheDocument();
    expect(screen.getByText('Directory Dan')).toBeInTheDocument();
    expect(screen.getByText('Demo Gerry')).toBeInTheDocument();
    expect(screen.queryByText('Browse directory…')).not.toBeInTheDocument();
  });
});

describe('UserSelector — scoped mode (issue #297)', () => {
  it('lists only the roster by default; directory users are hidden', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={['u1']} />);
    openDropdown();
    expect(screen.getByText('Roster Rita')).toBeInTheDocument();
    expect(screen.queryByText('Directory Dan')).not.toBeInTheDocument();
    expect(screen.queryByText('Demo Gerry')).not.toBeInTheDocument();
  });

  it('an empty roster shows a helpful empty state, not the demo directory', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={[]} />);
    openDropdown();
    expect(screen.getByText('No users on this assessment yet')).toBeInTheDocument();
    expect(screen.queryByText('Demo Gerry')).not.toBeInTheDocument();
  });

  it('Browse directory reveals the rest of the directory', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={['u1']} />);
    openDropdown();
    fireEvent.click(screen.getByText('Browse directory…'));
    expect(screen.getByText('Directory Dan')).toBeInTheDocument();
    expect(screen.getByText('Directory — selecting adds the user to this assessment')).toBeInTheDocument();
  });

  it('typing a search also surfaces matching directory users', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={['u1']} />);
    openDropdown();
    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'Dan' } });
    expect(screen.getByText('Directory Dan')).toBeInTheDocument();
  });

  it('picking a directory user fires onAddToScope AND onChange', () => {
    const onChange = jest.fn();
    const onAddToScope = jest.fn();
    render(
      <UserSelector
        selectedUsers={null}
        onChange={onChange}
        scopeUserIds={['u1']}
        onAddToScope={onAddToScope}
      />
    );
    openDropdown();
    fireEvent.click(screen.getByText('Browse directory…'));
    fireEvent.click(screen.getByText('Directory Dan'));
    expect(onAddToScope).toHaveBeenCalledWith('u2');
    expect(onChange).toHaveBeenCalledWith('u2');
  });

  it('picking a roster user does NOT fire onAddToScope', () => {
    const onAddToScope = jest.fn();
    render(
      <UserSelector
        selectedUsers={null}
        onChange={() => {}}
        scopeUserIds={['u1']}
        onAddToScope={onAddToScope}
      />
    );
    openDropdown();
    fireEvent.click(screen.getByText('Roster Rita'));
    expect(onAddToScope).not.toHaveBeenCalled();
  });
});
