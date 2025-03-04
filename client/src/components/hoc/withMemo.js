import React, { memo, useRef } from 'react';
import isEqual from 'lodash/isEqual';

/**
 * Higher-order component for advanced memoization of expensive components
 * Uses deep comparison by default
 * 
 * @param {React.Component} Component - Component to memoize
 * @param {Function} propsAreEqual - Custom comparison function (optional)
 * @returns {React.Component} - Memoized component
 */
export function withMemo(Component, propsAreEqual = isEqual) {
  // Create the memoized version
  const MemoizedComponent = memo(Component, propsAreEqual);
  
  // Add a wrapper to track render counts for debugging
  const MemoWrapper = (props) => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;
    
    // Attach render count for debugging in dev tools
    const componentWithRef = (
      <MemoizedComponent
        {...props}
        __renderCount={renderCountRef.current}
      />
    );
    
    return componentWithRef;
  };
  
  // Keep the original display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  MemoWrapper.displayName = `withMemo(${displayName})`;
  
  return MemoWrapper;
}

/**
 * Memoize a component only when certain props haven't changed
 * 
 * @param {React.Component} Component - Component to memoize
 * @param {Array} keys - Prop keys to check for equality
 * @returns {React.Component} - Memoized component
 */
export function withMemoKeys(Component, keys = []) {
  // Create a custom comparison function that only checks the specified keys
  const propsAreEqual = (prevProps, nextProps) => {
    // If no keys specified, only update on referential equality
    if (!keys.length) {
      return true;
    }
    
    // Check if specified keys have changed
    return keys.every(key => isEqual(prevProps[key], nextProps[key]));
  };
  
  return withMemo(Component, propsAreEqual);
} 