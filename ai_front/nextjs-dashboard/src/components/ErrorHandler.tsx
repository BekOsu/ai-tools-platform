"use client";
import { useEffect } from 'react';

interface ErrorHandlerProps {
  children: React.ReactNode;
}

export default function ErrorHandler({ children }: ErrorHandlerProps) {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
}

// Custom error component for displaying errors
export function ErrorDisplay({ 
  error, 
  onRetry 
}: { 
  error: Error | string; 
  onRetry?: () => void; 
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-300 rounded-lg p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Loading state component
export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title = "No data found", 
  description = "There's nothing to display at the moment.",
  action
}: { 
  title?: string; 
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        {action}
      </div>
    </div>
  );
}