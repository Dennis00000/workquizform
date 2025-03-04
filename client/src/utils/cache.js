/**
 * Simple cache utility with time expiration
 */
class Cache {
  constructor(defaultExpiration = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.defaultExpiration = defaultExpiration;
  }

  /**
   * Set a cache item with optional expiration
   */
  set(key, value, expiration = this.defaultExpiration) {
    const item = {
      value,
      expiry: Date.now() + expiration
    };
    
    this.cache.set(key, item);
    return value;
  }

  /**
   * Get a cache item if it exists and hasn't expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Check if the item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Remove a specific item from cache
   */
  invalidate(key) {
    this.cache.delete(key);
  }

  /**
   * Remove all items that start with a prefix
   */
  invalidateStartsWith(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }
}

// Create cache instances for different types of data
export const templateCache = new Cache(10 * 60 * 1000); // 10 minutes
export const userCache = new Cache(30 * 60 * 1000); // 30 minutes
export const submissionCache = new Cache(5 * 60 * 1000); // 5 minutes 