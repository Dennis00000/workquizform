/**
 * Utilities for performance optimization
 */

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function call
 * @param {Function} func - The function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize a function (cache results based on arguments)
 * @param {Function} fn - The function to memoize
 * @returns {Function} - Memoized function
 */
export function memoize(fn) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Group array items by a key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by
 * @returns {Object} - Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Performance monitoring utilities
 */

// Simple event bus for performance events
class EventBusClass {
  constructor() {
    this.events = {};
  }
  
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }
  
  publish(event, data) {
    if (!this.events[event]) {
      return;
    }
    
    this.events[event].forEach(callback => {
      callback(data);
    });
  }
  
  // Add emit method as an alias for publish
  emit(event, data) {
    return this.publish(event, data);
  }
}

export const EventBus = new EventBusClass();

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: {},
      apiCalls: {},
      interactions: {}
    };
    
    this.isEnabled = process.env.NODE_ENV === 'production' || 
                     localStorage.getItem('enablePerformanceMonitoring') === 'true';
  }
  
  /**
   * Enable or disable performance monitoring
   * @param {boolean} enabled - Whether to enable monitoring
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (enabled) {
      localStorage.setItem('enablePerformanceMonitoring', 'true');
    } else {
      localStorage.removeItem('enablePerformanceMonitoring');
    }
  }
  
  /**
   * Start timing a page load
   * @param {string} pageName - Name of the page
   */
  startPageLoad(pageName) {
    if (!this.isEnabled) return;
    
    this.metrics.pageLoads[pageName] = {
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
  }
  
  /**
   * End timing a page load
   * @param {string} pageName - Name of the page
   */
  endPageLoad(pageName) {
    if (!this.isEnabled || !this.metrics.pageLoads[pageName]) return;
    
    const endTime = performance.now();
    const startTime = this.metrics.pageLoads[pageName].startTime;
    const duration = endTime - startTime;
    
    this.metrics.pageLoads[pageName] = {
      startTime,
      endTime,
      duration
    };
    
    // Publish event
    EventBus.publish('performance:pageLoad', {
      pageName,
      duration
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Page Load - ${pageName}: ${duration.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('pageLoad', {
        pageName,
        duration
      });
    }
  }
  
  /**
   * Start timing an API call
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   */
  startApiCall(endpoint, method) {
    if (!this.isEnabled) return;
    
    const key = `${method}:${endpoint}`;
    this.metrics.apiCalls[key] = {
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
    
    return key;
  }
  
  /**
   * End timing an API call
   * @param {string} key - API call key
   * @param {boolean} success - Whether the call was successful
   */
  endApiCall(key, success = true) {
    if (!this.isEnabled || !this.metrics.apiCalls[key]) return;
    
    const endTime = performance.now();
    const startTime = this.metrics.apiCalls[key].startTime;
    const duration = endTime - startTime;
    
    this.metrics.apiCalls[key] = {
      startTime,
      endTime,
      duration,
      success
    };
    
    // Publish event
    EventBus.publish('performance:apiCall', {
      key,
      duration,
      success
    });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Call - ${key}: ${duration.toFixed(2)}ms (${success ? 'Success' : 'Failed'})`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('apiCall', {
        key,
        duration,
        success
      });
    }
  }
  
  /**
   * Record a user interaction
   * @param {string} action - User action
   * @param {Object} details - Additional details
   */
  recordInteraction(action, details = {}) {
    if (!this.isEnabled) return;
    
    const timestamp = performance.now();
    
    this.metrics.interactions[timestamp] = {
      action,
      details,
      timestamp
    };
    
    // Publish event
    EventBus.publish('performance:interaction', {
      action,
      details,
      timestamp
    });
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics('interaction', {
        action,
        details
      });
    }
  }
  
  /**
   * Send metrics to analytics service
   * @param {string} type - Type of metric
   * @param {Object} data - Metric data
   */
  sendToAnalytics(type, data) {
    // Implementation would depend on your analytics service
    // This is a placeholder
    if (window.analytics) {
      window.analytics.track(`performance:${type}`, data);
    }
  }
  
  /**
   * Get all collected metrics
   * @returns {Object} - All metrics
   */
  getMetrics() {
    return this.metrics;
  }
  
  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = {
      pageLoads: {},
      apiCalls: {},
      interactions: {}
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor; 