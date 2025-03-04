import { useContext } from 'react';

/**
 * Factory function to create custom hooks for contexts with type checking
 * @param {React.Context} Context - The React context
 * @param {string} hookName - Name of the hook (for error messages)
 * @returns {Function} - Custom hook that consumes the context
 */
export function createContextHook(Context, hookName) {
  return function useCustomContext() {
    const context = useContext(Context);
    
    if (context === undefined) {
      throw new Error(`${hookName} must be used within a ${Context.displayName || 'ContextProvider'}`);
    }
    
    return context;
  };
} 