import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserManagement from './UserManagement';
import useUserStore from '../stores/userStore';
import { DEMO_SEED_SOURCE } from '../utils/assessmentScope';

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() }
}));

/**
 * Issue #299: shipped demo (Alma) users delete WITHOUT the confirmation
 * prompt — they are fictional example data. Real users keep the confirm, and
 * cancelling it still aborts the delete.
 */

const DEMO_USER = {
  id: 101,
  name: 'Gerry.Callahan',
  title: 'CISO',
  email: 'gerry.callahan@almasecurity.com',
  seedSource: DEMO_SEED_SOURCE
};
const REAL_USER = {
  id: 102,
  name: 'Pat.Real',
  title: 'Analyst',
  email: 'pat.real@example.com'
};

describe('UserManagement delete confirmation (issue #299)', () => {
  let confirmSpy;

  beforeEach(() => {
    useUserStore.setState({ users: [DEMO_USER, REAL_USER] });
    confirmSpy = jest.spyOn(window, 'confirm');
  });

  afterEach(() => confirmSpy.mockRestore());

  // Rows render in store order ([DEMO_USER, REAL_USER]), so the Delete
  // buttons come back in that same order.
  const deleteButtons = () => screen.getAllByTitle('Delete');

  test('deleting a demo user skips the confirm prompt entirely', () => {
    render(<UserManagement />);
    fireEvent.click(deleteButtons()[0]);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(useUserStore.getState().users.find(u => u.id === DEMO_USER.id)).toBeUndefined();
    expect(useUserStore.getState().users.find(u => u.id === REAL_USER.id)).toBeDefined();
  });

  test('deleting a real user still asks for confirmation', () => {
    confirmSpy.mockReturnValue(true);
    render(<UserManagement />);
    fireEvent.click(deleteButtons()[1]);
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this user?');
    expect(useUserStore.getState().users.find(u => u.id === REAL_USER.id)).toBeUndefined();
  });

  test('cancelling the confirm keeps the real user', () => {
    confirmSpy.mockReturnValue(false);
    render(<UserManagement />);
    fireEvent.click(deleteButtons()[1]);
    expect(confirmSpy).toHaveBeenCalled();
    expect(useUserStore.getState().users.find(u => u.id === REAL_USER.id)).toBeDefined();
  });

  test('the demo badge marks demo users only', () => {
    render(<UserManagement />);
    // Exactly one Demo badge for the one seeded user in the table.
    expect(screen.getAllByText('Demo')).toHaveLength(1);
    expect(
      screen.getByTitle('Shipped example user — part of the Alma Security demo assessment')
    ).toBeInTheDocument();
  });
});
