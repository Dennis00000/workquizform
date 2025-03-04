import React from 'react';
import { toast } from 'react-hot-toast';

/**
 * Error boundary component to catch JavaScript errors anywhere in child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    toast.error('Something went wrong. Please try again later.');
  }
  
  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">We're sorry, but there was an error loading this page.</p>
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    
    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 