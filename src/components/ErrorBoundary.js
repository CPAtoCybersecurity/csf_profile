import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (could be sent to error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-4xl w-full rounded-xl shadow-2xl overflow-hidden bg-white">
            {/* Icon and Header */}
            <div className="flex flex-col items-center px-12 py-12 bg-white">
              <div className="mb-6">
                <AlertTriangle size={64} className="text-red-500" strokeWidth={1.5} />
              </div>

              <h1 className="text-4xl font-bold text-center mb-3 text-gray-900">
                Something Went Wrong
              </h1>

              <p className="text-lg text-center max-w-2xl text-gray-600">
                The application encountered an unexpected error.
              </p>
            </div>

            {/* Error Message */}
            <div className="px-8 py-6 bg-white">
              {this.state.error && (
                <div className="mb-6 p-6 border-l-4 rounded-r-lg bg-red-50 border-red-500">
                  <h3 className="font-semibold mb-4 text-base text-red-800">
                    Error Details
                  </h3>
                  <div className="text-sm font-mono p-4 rounded-lg text-red-900 bg-white/80">
                    An unexpected error occurred. Please refresh the page or contact support.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
