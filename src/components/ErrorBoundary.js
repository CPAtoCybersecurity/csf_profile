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
      // Check if this is an environment variable error
      const isEnvError = this.state.error && typeof this.state.error.message === 'string' &&
        this.state.error.message.includes('Missing required environment variables');

      return (
        <div className="min-h-screen flex items-center justify-center px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-4xl w-full rounded-xl shadow-2xl overflow-hidden bg-white">
            {/* Icon and Header */}
            <div className="flex flex-col items-center px-12 py-12 bg-white">
              <div className="mb-6">
                <AlertTriangle size={64} className="text-red-500" strokeWidth={1.5} />
              </div>

              <h1 className="text-4xl font-bold text-center mb-3 text-gray-900">
                {isEnvError ? 'Configuration Required' : 'Something Went Wrong'}
              </h1>

              <p className="text-lg text-center max-w-2xl text-gray-600">
                {isEnvError
                  ? 'The application needs API credentials to connect with JIRA and Confluence.'
                  : 'The application encountered an unexpected error.'}
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

              {/* Fix Instructions */}
              {isEnvError && (
                <div className="p-6 border-l-4 rounded-r-lg bg-white border-blue-500">
                  <h3 className="font-semibold mb-5 text-base text-blue-800">
                    How to Fix This
                  </h3>
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-sm font-semibold bg-blue-500">1</span>
                      <div className="flex-1 pt-0">
                        <p className="mb-2">
                          Copy the <code className="px-2 py-1 mx-1 rounded font-mono text-xs bg-gray-100 text-blue-700 border border-gray-300">.env.example</code> file to <code className="px-2 py-1 mx-1 rounded font-mono text-xs bg-gray-100 text-blue-700 border border-gray-300">.env</code>
                        </p>
                        <div className="p-3 rounded font-mono text-sm bg-gray-100 text-gray-800">
                          cp .env.example .env
                        </div>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-sm font-semibold bg-blue-500">2</span>
                      <span className="pt-0.5">
                        Edit the <code className="px-2 py-1 mx-1 rounded font-mono text-xs bg-gray-100 text-blue-700 border border-gray-300">.env</code> file and add your API credentials
                      </span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-sm font-semibold bg-blue-500">3</span>
                      <span className="pt-0.5">
                        Generate API tokens at{' '}
                        <a
                          href="https://id.atlassian.com/manage-profile/security/api-tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline text-blue-600 hover:text-blue-700"
                        >
                          Atlassian Account Settings
                        </a>
                      </span>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-sm font-semibold bg-blue-500">4</span>
                      <span className="pt-0.5">
                        Restart the application
                      </span>
                    </li>
                  </ol>
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
