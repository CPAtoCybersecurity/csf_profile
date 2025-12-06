import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to console (could be sent to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <AlertTriangle size={48} />
            </div>

            <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
              The application encountered an unexpected error.
            </p>

            {this.state.error && (
              <details className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                <summary className="cursor-pointer text-gray-700 dark:text-gray-300 font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-gray-500 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-40 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <button
                onClick={this.handleClearStorage}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Reset Application Data
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              If this problem persists, try resetting the application data or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
