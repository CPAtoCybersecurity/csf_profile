/**
 * Tests for LastBackupIndicator component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LastBackupIndicator from './LastBackupIndicator';
import * as backupTracking from '../utils/backupTracking';

// Mock the backupTracking utility
jest.mock('../utils/backupTracking');

describe('LastBackupIndicator Component', () => {
  const mockOnExportClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    backupTracking.getTimeSinceLastExport.mockReturnValue('Never');
    backupTracking.getBackupWarningLevel.mockReturnValue('danger');
    backupTracking.getLastExportDate.mockReturnValue(null);
  });

  test('renders with "Never" when no export has been made', () => {
    render(<LastBackupIndicator onExportClick={mockOnExportClick} />);
    
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(screen.getByText(/last backup:/i)).toBeInTheDocument();
  });

  test('renders success state for recent backup', () => {
    backupTracking.getTimeSinceLastExport.mockReturnValue('2 hours ago');
    backupTracking.getBackupWarningLevel.mockReturnValue('success');
    backupTracking.getLastExportDate.mockReturnValue(new Date());
    
    render(<LastBackupIndicator onExportClick={mockOnExportClick} />);
    
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    // Success state should not show "Backup Now" button
    expect(screen.queryByText(/backup now/i)).not.toBeInTheDocument();
  });

  test('renders warning state with backup button', () => {
    backupTracking.getTimeSinceLastExport.mockReturnValue('15 days ago');
    backupTracking.getBackupWarningLevel.mockReturnValue('warning');
    backupTracking.getLastExportDate.mockReturnValue(new Date('2025-12-23'));
    
    render(<LastBackupIndicator onExportClick={mockOnExportClick} />);
    
    expect(screen.getByText('15 days ago')).toBeInTheDocument();
    expect(screen.getByText(/backup now/i)).toBeInTheDocument();
  });

  test('renders danger state with backup button', () => {
    backupTracking.getTimeSinceLastExport.mockReturnValue('45 days ago');
    backupTracking.getBackupWarningLevel.mockReturnValue('danger');
    
    render(<LastBackupIndicator onExportClick={mockOnExportClick} />);
    
    expect(screen.getByText('45 days ago')).toBeInTheDocument();
    expect(screen.getByText(/backup now/i)).toBeInTheDocument();
  });

  test('calls onExportClick when Backup Now button is clicked', () => {
    backupTracking.getBackupWarningLevel.mockReturnValue('danger');
    
    render(<LastBackupIndicator onExportClick={mockOnExportClick} />);
    
    const backupButton = screen.getByText(/backup now/i);
    fireEvent.click(backupButton);
    
    expect(mockOnExportClick).toHaveBeenCalledTimes(1);
  });

  test('displays tooltip with last backup date', () => {
    const mockDate = new Date('2026-01-01T12:00:00Z');
    backupTracking.getLastExportDate.mockReturnValue(mockDate);
    backupTracking.getTimeSinceLastExport.mockReturnValue('6 days ago');
    backupTracking.getBackupWarningLevel.mockReturnValue('success');
    
    render(<LastBackupIndicator onExportClick={mockOnExportClick} />);
    
    const indicator = screen.getByText('6 days ago').closest('div');
    expect(indicator).toHaveAttribute('title', expect.stringContaining('Last backup:'));
  });

  test('displays appropriate tooltip when never exported', () => {
    backupTracking.getLastExportDate.mockReturnValue(null);
    backupTracking.getBackupWarningLevel.mockReturnValue('danger');
    
    render(<LastBackupIndicator onExportClick={mockOnExportClick} />);
    
    const indicator = screen.getByText('Never').closest('div');
    expect(indicator).toHaveAttribute('title', expect.stringContaining('No backup yet'));
  });
});
