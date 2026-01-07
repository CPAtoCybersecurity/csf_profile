/**
 * Tests for BackupReminder component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackupReminder from './BackupReminder';

describe('BackupReminder Component', () => {
  const mockOnClose = jest.fn();
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock createPortal to render directly (avoid portal in tests)
    jest.spyOn(require('react-dom'), 'createPortal').mockImplementation((element) => element);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders reminder notification', () => {
    render(<BackupReminder onClose={mockOnClose} onExport={mockOnExport} />);
    
    expect(screen.getByText(/time to back up your data/i)).toBeInTheDocument();
    expect(screen.getByText(/it's been a while since your last export/i)).toBeInTheDocument();
  });

  test('displays Export Now button', () => {
    render(<BackupReminder onClose={mockOnClose} onExport={mockOnExport} />);
    
    expect(screen.getByText(/export now/i)).toBeInTheDocument();
  });

  test('displays Remind Later button', () => {
    render(<BackupReminder onClose={mockOnClose} onExport={mockOnExport} />);
    
    expect(screen.getByText(/remind later/i)).toBeInTheDocument();
  });

  test('calls onExport when Export Now is clicked', () => {
    render(<BackupReminder onClose={mockOnClose} onExport={mockOnExport} />);
    
    const exportButton = screen.getByText(/export now/i);
    fireEvent.click(exportButton);
    
    expect(mockOnExport).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('calls onClose when Remind Later is clicked', () => {
    render(<BackupReminder onClose={mockOnClose} onExport={mockOnExport} />);
    
    const remindLaterButton = screen.getByText(/remind later/i);
    fireEvent.click(remindLaterButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnExport).not.toHaveBeenCalled();
  });

  test('calls onClose when X button is clicked', () => {
    render(<BackupReminder onClose={mockOnClose} onExport={mockOnExport} />);
    
    const closeButton = screen.getByLabelText(/close reminder/i);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnExport).not.toHaveBeenCalled();
  });

  test('renders with orange warning styling', () => {
    const { container } = render(<BackupReminder onClose={mockOnClose} onExport={mockOnExport} />);
    
    // Check for orange border styling (border-l-4 border-orange-400)
    const notification = container.querySelector('[class*="border-orange"]');
    expect(notification).toBeInTheDocument();
  });
});
