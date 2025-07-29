"use client";
import React from 'react';

// Fallback component for missing dependencies
export function ComponentFallback({ 
  componentName, 
  error 
}: { 
  componentName: string; 
  error?: string; 
}) {
  return (
    <div className="min-h-[200px] flex items-center justify-center bg-white border border-gray-200 rounded-lg">
      <div className="text-center p-6">
        <div className="mb-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">Component Loading</h3>
        <p className="text-xs text-gray-500 mb-4">
          {error ? `Error: ${error}` : `Loading ${componentName}...`}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

// Safe component wrapper
export function SafeComponent({ 
  children, 
  fallback, 
  componentName = "Component" 
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`Error in ${componentName}:`, error);
    return fallback || <ComponentFallback componentName={componentName} error={String(error)} />;
  }
}

// Loading component
export function LoadingComponent({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2"></div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default ComponentFallback;