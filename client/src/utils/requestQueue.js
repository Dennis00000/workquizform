import { EventBus } from './performance';

class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.isOnline = navigator.onLine;
    
    // Setup online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  /**
   * Handle coming back online
   */
  handleOnline = () => {
    this.isOnline = true;
    EventBus.emit('network:online');
    this.processQueue();
  };
  
  /**
   * Handle going offline
   */
  handleOffline = () => {
    this.isOnline = false;
    EventBus.emit('network:offline');
  };
  
  /**
   * Add a request to the queue
   * @param {Function} requestFn - Function that returns a promise for the request
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves when the request is processed
   */
  enqueue(requestFn, options = {}) {
    return new Promise((resolve, reject) => {
      const request = {
        id: Date.now().toString(),
        requestFn,
        resolve,
        reject,
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
        priority: options.priority || 'normal' // 'high', 'normal', 'low'
      };
      
      this.queue.push(request);
      this.sortQueue();
      
      // Process immediately if online, otherwise save for later
      if (this.isOnline) {
        this.processQueue();
      } else {
        // Store in IndexedDB or localStorage for persistence across sessions
        this.persistQueue();
        EventBus.emit('request:queued', request);
      }
    });
  }
  
  /**
   * Sort the queue by priority
   */
  sortQueue() {
    const priorityValues = { high: 0, normal: 1, low: 2 };
    
    this.queue.sort((a, b) => {
      const priorityA = priorityValues[a.priority];
      const priorityB = priorityValues[b.priority];
      return priorityA - priorityB;
    });
  }
  
  /**
   * Process all requests in the queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !this.isOnline) {
      return;
    }
    
    this.isProcessing = true;
    EventBus.emit('queue:processing', { total: this.queue.length });
    
    while (this.queue.length > 0 && this.isOnline) {
      const request = this.queue.shift();
      
      try {
        const result = await request.requestFn();
        request.resolve(result);
        EventBus.emit('request:success', { id: request.id });
      } catch (error) {
        if (request.retryCount < request.maxRetries) {
          // Put back in queue for retry
          request.retryCount++;
          this.queue.push(request);
          EventBus.emit('request:retry', { id: request.id, retryCount: request.retryCount });
        } else {
          request.reject(error);
          EventBus.emit('request:failed', { id: request.id, error });
        }
      }
      
      this.persistQueue();
    }
    
    this.isProcessing = false;
    EventBus.emit('queue:processed');
  }
  
  /**
   * Persist the queue to local storage
   */
  persistQueue() {
    try {
      // We can't serialize functions, so we only store metadata
      const queueMetadata = this.queue.map(({ id, retryCount, maxRetries, priority }) => ({
        id,
        retryCount,
        maxRetries,
        priority,
        timestamp: Date.now()
      }));
      
      localStorage.setItem('requestQueue', JSON.stringify(queueMetadata));
    } catch (error) {
      console.error('Failed to persist request queue:', error);
    }
  }
  
  /**
   * Clear the queue
   */
  clearQueue() {
    this.queue = [];
    localStorage.removeItem('requestQueue');
    EventBus.emit('queue:cleared');
  }
}

export const requestQueue = new RequestQueue(); 