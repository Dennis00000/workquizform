/**
 * Simple in-memory rate limiter utility
 */
class RateLimiter {
  constructor() {
    this.requests = {};
    this.cleanupInterval = setInterval(this.cleanup.bind(this), 60000); // Clean up every minute
  }
  
  /**
   * Check if a request is allowed based on rate limits
   * @param {string} key - Request identifier (e.g., endpoint, userId)
   * @param {Object} options - Rate limit options
   * @returns {boolean} - Whether the request is allowed
   */
  isAllowed(key, options = {}) {
    const { 
      maxRequests = 60, // Max requests within the time window
      timeWindow = 60000, // Time window in milliseconds (default: 1 minute)
      blockDuration = 300000 // Block duration in milliseconds (default: 5 minutes)
    } = options;
    
    const now = Date.now();
    
    // Initialize entry for key if it doesn't exist
    if (!this.requests[key]) {
      this.requests[key] = {
        count: 0,
        resetAt: now + timeWindow,
        blockedUntil: 0,
        timestamps: []
      };
    }
    
    const entry = this.requests[key];
    
    // Check if blocked
    if (entry.blockedUntil > now) {
      return false;
    }
    
    // Reset counter if time window has passed
    if (entry.resetAt <= now) {
      entry.count = 0;
      entry.resetAt = now + timeWindow;
      entry.timestamps = [];
    }
    
    // Add current timestamp
    entry.timestamps.push(now);
    entry.count++;
    
    // Check if rate limit exceeded
    if (entry.count > maxRequests) {
      // Block requests for blockDuration
      entry.blockedUntil = now + blockDuration;
      return false;
    }
    
    return true;
  }
  
  /**
   * Clean up old entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    
    Object.keys(this.requests).forEach(key => {
      const entry = this.requests[key];
      
      // Remove entries that have been blocked for too long
      if (entry.blockedUntil < now && entry.resetAt < now) {
        delete this.requests[key];
      }
      
      // Remove old timestamps
      entry.timestamps = entry.timestamps.filter(timestamp => 
        timestamp > now - 3600000 // Keep timestamps from the last hour
      );
    });
  }
  
  /**
   * Destroy the rate limiter
   */
  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Apply rate limiting to an API function
 * @param {Function} fn - Function to rate limit
 * @param {string} key - Unique key for the rate limit
 * @param {Object} options - Rate limit options
 * @returns {Function} - Rate-limited function
 */
export function withRateLimiting(fn, key, options = {}) {
  return function rateLimitedFn(...args) {
    // Get dynamic key (optional)
    const actualKey = typeof key === 'function' ? key(...args) : key;
    
    if (!rateLimiter.isAllowed(actualKey, options)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    return fn(...args);
  };
} 