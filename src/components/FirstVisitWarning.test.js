/**
 * Tests for FirstVisitWarning component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FirstVisitWarning from './FirstVisitWarning';
import * as backupTracking from '../utils/backupTracking';

// Mock the backupTracking utility
jest.mock('../utils/backupTracking');

describe('FirstVisitWarning Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock createPortal to render directly (avoid portal in tests)
    jest.spyOn(require('react-dom'), 'createPortal').mockImplementation((element) => element);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders modal when it is first visit', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);
    
    render(<FirstVisitWarning />);
    
    expect(screen.getByText('Data Storage Warning')).toBeInTheDocument();
    expect(screen.getByText(/local browser storage only/i)).toBeInTheDocument();
    expect(screen.getByText(/I Understand/i)).toBeInTheDocument();
  });

  test('does not render when first visit already acknowledged', () => {
    backupTracking.isFirstVisit.mockReturnValue(false);
    
    const { container } = render(<FirstVisitWarning />);
    
    expect(container.firstChild).toBeNull();
  });

  test('displays warning about data loss risks', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);
    
    render(<FirstVisitWarning />);
    
    expect(screen.getByText(/clear browser cache or site data/i)).toBeInTheDocument();
    expect(screen.getByText(/uninstall or reset your browser/i)).toBeInTheDocument();
    expect(screen.getByText(/reach storage limits/i)).toBeInTheDocument();
  });

  test('displays protection tips', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);
    
    render(<FirstVisitWarning />);
    
    expect(screen.getByText(/export data regularly as csv backups/i)).toBeInTheDocument();
    expect(screen.getByText(/store backups in multiple locations/i)).toBeInTheDocument();
    expect(screen.getByText(/enable backup reminders in settings/i)).toBeInTheDocument();
  });

  test('calls acknowledgeFirstVisit when "I Understand" is clicked', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);
    
    render(<FirstVisitWarning />);
    
    const button = screen.getByText(/I Understand/i);
    fireEvent.click(button);
    
    expect(backupTracking.acknowledgeFirstVisit).toHaveBeenCalledTimes(1);
  });

  test('calls acknowledgeFirstVisit when close button is clicked', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);
    
    render(<FirstVisitWarning />);
    
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    
    expect(backupTracking.acknowledgeFirstVisit).toHaveBeenCalledTimes(1);
  });

  test('modal disappears after acknowledgment', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);
    
    const { rerender } = render(<FirstVisitWarning />);
    
    expect(screen.getByText('Data Storage Warning')).toBeInTheDocument();
    
    const button = screen.getByText(/I Understand/i);
    fireEvent.click(button);
    
    // After clicking, component should unmount
    backupTracking.isFirstVisit.mockReturnValue(false);
    rerender(<FirstVisitWarning />);
    
    expect(screen.queryByText('Data Storage Warning')).not.toBeInTheDocument();
  });
});
