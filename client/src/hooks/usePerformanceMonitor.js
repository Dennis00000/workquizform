import { useRef, useEffect } from 'react';
import { EventBus } from '../utils/performance';

/**
 * Hook to monitor component performance
 * @param {string} componentName - Name of the component being monitored
 * @param {Object} options - Configuration options
 * @returns {Object} - Performance monitoring utilities
 */
export default function usePerformanceMonitor(componentName, options = {}) {
  const {
    logToConsole = process.env.NODE_ENV === 'development',
    threshold = 16, // 60fps threshold in ms
    trackRenders = true,
    trackEffects = false
  } = options;
  
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const renderDurations = useRef([]);
  
  // Track render time
  useEffect(() => {
    if (!trackRenders) return;
    
    const startTime = lastRenderTime.current;
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    renderCount.current += 1;
    renderDurations.current.push(duration);
    
    if (duration > threshold) {
      const message = `Slow render detected: ${componentName} took ${duration.toFixed(2)}ms (render #${renderCount.current})`;
      
      // Log performance issue
      if (logToConsole) {
        console.warn(message);
      }
      
      // Emit event for performance monitoring system
      EventBus.emit('performance:slow-render', {
        componentName,
        duration,
        renderCount: renderCount.current
      });
    }
    
    // Update last render time for next measurement
    lastRenderTime.current = performance.now();
  });
  
  // Measure specific operation time
  const measureOperation = (operationFn, operationName) => {
    const startTime = performance.now();
    const result = operationFn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > threshold) {
      const message = `Slow operation detected: ${componentName}.${operationName} took ${duration.toFixed(2)}ms`;
      
      if (logToConsole) {
        console.warn(message);
      }
      
      EventBus.emit('performance:slow-operation', {
        componentName,
        operationName,
        duration
      });
    }
    
    return result;
  };
  
  // Start measuring an effect or async operation
  const startMeasure = (operationName) => {
    if (!trackEffects) return () => {};
    
    const startTime = performance.now();
    
    // Return a function to end the measurement
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > threshold) {
        const message = `Slow effect detected: ${componentName}.${operationName} took ${duration.toFixed(2)}ms`;
        
        if (logToConsole) {
          console.warn(message);
        }
        
        EventBus.emit('performance:slow-effect', {
          componentName,
          operationName,
          duration
        });
      }
    };
  };
  
  // Get performance metrics
  const getMetrics = () => {
    const durations = renderDurations.current;
    
    return {
      renderCount: renderCount.current,
      averageDuration: durations.length 
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
        : 0,
      maxDuration: durations.length 
        ? Math.max(...durations) 
        : 0,
      lastDuration: durations.length 
        ? durations[durations.length - 1] 
        : 0
    };
  };
  
  return {
    measureOperation,
    startMeasure,
    getMetrics
  };
} 