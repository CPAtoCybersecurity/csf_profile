/**
 * Tests for FirstVisitWarning component (terminal Welcome modal)
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

  test('renders welcome modal when it is first visit', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);

    render(<FirstVisitWarning />);

    expect(screen.getByText(/welcome to csf_profile/i)).toBeInTheDocument();
    expect(screen.getByText(/nist csf 2\.0 assessment tool/i)).toBeInTheDocument();
    expect(screen.getByText(/start exploring/i)).toBeInTheDocument();
  });

  test('does not render when first visit already acknowledged', () => {
    backupTracking.isFirstVisit.mockReturnValue(false);

    const { container } = render(<FirstVisitWarning />);

    expect(container.firstChild).toBeNull();
  });

  test('introduces the pre-loaded Alma Security sample assessment', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);

    render(<FirstVisitWarning />);

    expect(screen.getByText(/alma security/i)).toBeInTheDocument();
    expect(screen.getByText(/pre-loaded and selected/i)).toBeInTheDocument();
  });

  test('lists what the user can explore', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);

    render(<FirstVisitWarning />);

    expect(screen.getByText(/score current vs\. target state per subcategory/i)).toBeInTheDocument();
    expect(screen.getByText(/watch the dashboard radar update as you go/i)).toBeInTheDocument();
    expect(screen.getByText(/document observations, findings, and evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/export audit-ready csv workpapers/i)).toBeInTheDocument();
  });

  test('warns that data lives in local storage', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);

    render(<FirstVisitWarning />);

    expect(screen.getByText(/data lives in your browser's local storage/i)).toBeInTheDocument();
  });

  test('calls acknowledgeFirstVisit when "Start exploring" is clicked', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);

    render(<FirstVisitWarning />);

    const button = screen.getByText(/start exploring/i);
    fireEvent.click(button);

    expect(backupTracking.acknowledgeFirstVisit).toHaveBeenCalledTimes(1);
  });

  test('modal disappears after acknowledgment', () => {
    backupTracking.isFirstVisit.mockReturnValue(true);

    const { rerender } = render(<FirstVisitWarning />);

    expect(screen.getByText(/welcome to csf_profile/i)).toBeInTheDocument();

    const button = screen.getByText(/start exploring/i);
    fireEvent.click(button);

    // After clicking, component should unmount
    backupTracking.isFirstVisit.mockReturnValue(false);
    rerender(<FirstVisitWarning />);

    expect(screen.queryByText(/welcome to csf_profile/i)).not.toBeInTheDocument();
  });
});
