import { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Hook to observe element dimensions using ResizeObserver
 * @param {Object} options - Configuration options
 * @returns {Object} - Ref and dimensions
 */
function useResizeObserver(options = {}) {
  const { 
    debounceMs = 0,
    box = 'content-box',
    skipInitialCallback = false
  } = options;
  
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const skipNextRef = useRef(skipInitialCallback);
  
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  });
  
  const updateDimensions = useCallback((entries) => {
    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }
    
    if (!entries || !entries[0]) return;
    
    const entry = entries[0];
    const { top, left, bottom, right, width, height } = entry.contentRect;
    
    setDimensions({ top, left, bottom, right, width, height });
  }, []);
  
  const debouncedUpdateDimensions = useCallback((entries) => {
    if (debounceMs > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        updateDimensions(entries);
      }, debounceMs);
    } else {
      updateDimensions(entries);
    }
  }, [debounceMs, updateDimensions]);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Initialize ResizeObserver
    observerRef.current = new ResizeObserver(debouncedUpdateDimensions);
    observerRef.current.observe(elementRef.current, { box });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [debouncedUpdateDimensions, box]);
  
  return { ref: elementRef, dimensions };
}

export default useResizeObserver; 