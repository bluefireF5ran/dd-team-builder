import React from 'react';

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
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border-2 border-red-800 rounded-lg p-8 max-w-lg w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">☠️</div>
            <h1 className="font-darkest text-2xl text-dd-red mb-3">
              Alas, Something Has Gone Wrong...
            </h1>
            <p className="text-gray-400 mb-6 text-sm">
              The light has gone out. An unexpected error occurred.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 bg-gray-900 rounded p-3 border border-gray-700">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-red-400 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-2 bg-dd-red hover:bg-red-700 text-white font-darkest rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
