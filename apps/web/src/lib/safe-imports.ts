// Safe import utilities to handle missing components gracefully
import React from 'react';

export function safeImport<T>(
  importFn: () => Promise<T>,
  fallback: T,
  componentName?: string
): Promise<T> {
  return importFn().catch((error) => {
    console.warn(`Failed to import ${componentName || 'component'}:`, error);
    return fallback;
  });
}

// Safe component loader
export async function loadComponent<T>(
  componentPath: string,
  fallbackComponent: T
): Promise<T> {
  try {
    const moduleImport = await import(componentPath);
    return moduleImport.default || moduleImport;
  } catch (error) {
    console.error(`Failed to load component from ${componentPath}:`, error);
    return fallbackComponent;
  }
}

// Utility to check if a module exists
export function moduleExists(modulePath: string): boolean {
  try {
    require.resolve(modulePath);
    return true;
  } catch {
    return false;
  }
}

// Safe React.lazy wrapper
export function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: T
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    importFn().catch(() => ({ default: fallback }))
  );
}

// Component availability checker
export const componentRegistry = {
  'AIFeatures': () => import('@/components/AIFeatures'),
  'LoadingSpinner': () => import('@/components/LoadingSpinner'),
  'ErrorBoundary': () => import('@/components/ErrorBoundary'),
  'Button': () => import('@/components/ui/Button'),
  'Card': () => import('@/components/ui/Card'),
  'Input': () => import('@/components/ui/Input'),
};

export async function checkComponentAvailability(): Promise<{
  available: string[];
  missing: string[];
}> {
  const available: string[] = [];
  const missing: string[] = [];

  for (const [name, importFn] of Object.entries(componentRegistry)) {
    try {
      await importFn();
      available.push(name);
    } catch {
      missing.push(name);
    }
  }

  return { available, missing };
}