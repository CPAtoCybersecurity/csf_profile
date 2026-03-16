import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportPasswordDialog from './ExportPasswordDialog';

describe('ExportPasswordDialog', () => {
  beforeEach(() => {
    // Render portals inline in tests
    jest.spyOn(require('react-dom'), 'createPortal').mockImplementation((element) => element);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('does not render when closed', () => {
    render(
      <ExportPasswordDialog
        isOpen={false}
        title="Export"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.queryByText('Export')).not.toBeInTheDocument();
  });

  test('renders when open and can cancel', () => {
    const onCancel = jest.fn();

    render(
      <ExportPasswordDialog
        isOpen
        title="Export All Assessments"
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />
    );

    expect(screen.getByText('Export All Assessments')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('calls onConfirm with empty password (unencrypted)', () => {
    const onConfirm = jest.fn();

    render(
      <ExportPasswordDialog
        isOpen
        title="Export"
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(onConfirm).toHaveBeenCalledWith('');
  });

  test('calls onConfirm with typed password (encrypted)', () => {
    const onConfirm = jest.fn();

    render(
      <ExportPasswordDialog
        isOpen
        title="Export"
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'secret' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Export Encrypted' }));
    expect(onConfirm).toHaveBeenCalledWith('secret');
  });
});
