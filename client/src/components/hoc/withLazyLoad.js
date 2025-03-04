import React, { Suspense, lazy } from 'react';

/**
 * Higher-order function to create a lazily loaded component with loading state
 * 
 * @param {Function} importFn - Dynamic import function
 * @param {React.Component} LoadingComponent - Component to show while loading
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Lazily loaded component with Suspense
 */
export function withLazyLoad(importFn, LoadingComponent, options = {}) {
  const {
    fallbackMinDuration = 300, // Minimum time to show loading state to prevent flickers
    timeout = null, // Optional timeout for loading
    onError = null // Optional error handler
  } = options;
  
  // Create the lazy-loaded component
  const LazyComponent = lazy(() => {
    // Start timing for minimum duration
    const startTime = Date.now();
    
    // Create a promise that resolves after the minimum duration
    const minDurationPromise = new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, fallbackMinDuration);
    });
    
    // Create a promise for the component import
    const importPromise = importFn().catch(error => {
      if (onError) {
        onError(error);
      }
      // Re-throw to let Suspense handle it
      throw error;
    });
    
    // If there's a timeout, add a timeout promise
    let timeoutPromise = null;
    if (timeout) {
      timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Loading timed out after ${timeout}ms`));
        }, timeout);
      });
    }
    
    // Return a promise that:
    // 1. Resolves after both the import and minimum duration are complete
    // 2. Rejects if the timeout is reached first (if specified)
    return Promise.race([
      // This promise resolves when both the component loads and min duration passes
      Promise.all([importPromise, minDurationPromise]).then(([module]) => module),
      // This promise rejects if the timeout is reached (if specified)
      ...(timeoutPromise ? [timeoutPromise] : [])
    ]);
  });
  
  // Return a component that uses Suspense with the specified loading component
  return (props) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
} 