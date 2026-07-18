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

  test('shows the generic error page for any error (no Atlassian-specific configuration page)', () => {
    // The Jira/Confluence integration was removed, so an env-style error must
    // no longer render the old "Configuration Required" / Atlassian fix page.
    const envError = new Error('Missing required environment variables: SOME_VAR');

    render(
      <ErrorBoundary>
        <ThrowError error={envError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    expect(screen.queryByText('Configuration Required')).not.toBeInTheDocument();
    expect(screen.queryByText(/How to Fix This/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/JIRA and Confluence/i)).not.toBeInTheDocument();
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

    // Should show error details (sanitized — raw error messages are not rendered)
    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();

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
