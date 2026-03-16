import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
const ThrowError = ({ error }) => {
  throw error;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests since we expect errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('displays environment error page when error message contains "Missing required environment variables"', () => {
    const envError = new Error('Missing required environment variables: REACT_APP_JIRA_API_TOKEN');

    render(
      <ErrorBoundary>
        <ThrowError error={envError} />
      </ErrorBoundary>
    );

    // Should show environment-specific error message
    expect(screen.getByText('Configuration Required')).toBeInTheDocument();
    expect(screen.getByText(/The application needs API credentials to connect with JIRA and Confluence/i)).toBeInTheDocument();
    expect(screen.getByText(/How to Fix This/i)).toBeInTheDocument();
  });

  test('displays generic error page when error is not environment-related', () => {
    const genericError = new Error('Something went wrong with the application');

    render(
      <ErrorBoundary>
        <ThrowError error={genericError} />
      </ErrorBoundary>
    );

    // Should show generic error message
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.getByText(/The application encountered an unexpected error/i)).toBeInTheDocument();

    // Should show error details
    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong with the application/i)).toBeInTheDocument();

    // Should NOT show environment-specific instructions
    expect(screen.queryByText(/How to Fix This/i)).not.toBeInTheDocument();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
