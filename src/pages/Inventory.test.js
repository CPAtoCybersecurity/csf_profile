import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Inventory from './Inventory';
import useInventoryStore, { SYSTEM_FIELD_DEFAULTS } from '../stores/inventoryStore';
import useUserStore from '../stores/userStore';

beforeEach(() => {
  window.localStorage.clear();
  useInventoryStore.setState({ systems: [] });
});

const seedSystem = (overrides = {}) =>
  useInventoryStore.getState().setSystems([
    {
      ...SYSTEM_FIELD_DEFAULTS,
      id: 'SYS-001',
      name: 'Payroll Platform',
      deploymentType: 'SaaS',
      stage: 'Live',
      dataClassification: 'Confidential',
      securityTier: 'Tier 2',
      source: 'manual',
      createdDate: '2026-01-01',
      lastModified: '2026-01-01',
      ...overrides
    }
  ]);

describe('Inventory page', () => {
  test('renders the empty state with the privacy stance when no systems exist', () => {
    render(<Inventory />);
    expect(screen.getByText(/No systems yet/i)).toBeInTheDocument();
    expect(screen.getByText(/excluded from share exports by default/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add your first system/i })).toBeInTheDocument();
  });

  test('add flow: form saves through the store and the row appears with SYS-001', () => {
    render(<Inventory />);
    fireEvent.click(screen.getByRole('button', { name: /Add your first system/i }));
    fireEvent.change(screen.getByLabelText('System name'), { target: { value: 'New HRIS' } });
    fireEvent.click(screen.getByRole('button', { name: /^Add system$/i }));

    expect(screen.getByText('New HRIS')).toBeInTheDocument();
    expect(screen.getByText('SYS-001')).toBeInTheDocument();

    // Untouched tri-states persist as blank — the form must not default them.
    const [record] = useInventoryStore.getState().systems;
    expect(record.pii).toBe('');
    expect(record.ssoMfa).toBe('');
  });

  test('save without a name is rejected — nothing reaches the store', () => {
    render(<Inventory />);
    fireEvent.click(screen.getByRole('button', { name: /Add your first system/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Add system$/i }));
    expect(useInventoryStore.getState().systems).toHaveLength(0);
  });

  test('a safe https application URL renders as a link', () => {
    seedSystem({ applicationUrl: 'https://payroll.example.test/login' });
    render(<Inventory />);
    const link = screen.getByRole('link', { name: /payroll.example.test/i });
    expect(link).toHaveAttribute('href', 'https://payroll.example.test/login');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  test('a javascript: URL renders as plain text, never an anchor', () => {
    // eslint-disable-next-line no-script-url -- attack fixture: render must degrade to text
    seedSystem({ applicationUrl: 'javascript:alert(1)' });
    render(<Inventory />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    // eslint-disable-next-line no-script-url -- attack fixture: the raw string renders as text
    expect(screen.getByText('javascript:alert(1)')).toBeInTheDocument();
  });

  test('delete asks for confirmation and only proceeds on OK', () => {
    seedSystem();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValueOnce(false);
    render(<Inventory />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete SYS-001' }));
    expect(useInventoryStore.getState().systems).toHaveLength(1);

    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: 'Delete SYS-001' }));
    expect(useInventoryStore.getState().systems).toHaveLength(0);
    confirmSpy.mockRestore();
  });

  test('edit flow updates the record in place', () => {
    seedSystem();
    render(<Inventory />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit SYS-001' }));
    fireEvent.change(screen.getByLabelText('System name'), { target: { value: 'Payroll v2' } });
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(screen.getByText('Payroll v2')).toBeInTheDocument();
    const [record] = useInventoryStore.getState().systems;
    expect(record.id).toBe('SYS-001');
    expect(record.name).toBe('Payroll v2');
  });

  test('owner ids resolve to user names', () => {
    const userId = useUserStore.getState().addUser({
      name: 'Owner Olive',
      title: 'Director',
      email: 'olive@example.test'
    });
    seedSystem({ businessOwnerId: userId });
    render(<Inventory />);
    expect(screen.getByText('Owner Olive')).toBeInTheDocument();
  });

  test('an unknown owner ref degrades honestly instead of rendering blank', () => {
    seedSystem({ businessOwnerId: 'ghost-user-id' });
    render(<Inventory />);
    expect(screen.getByText('(unknown user)')).toBeInTheDocument();
  });
});
