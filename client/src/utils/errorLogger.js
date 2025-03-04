import { api } from '../services/api';

/**
 * Error logging utility for client-side errors
 */
class ErrorLogger {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  log(error, context = {}) {
    // In development, don't send logs to the server
    if (this.isDevelopment) {
      console.error('Error logged (development mode):', error);
      return;
    }
    
    const errorData = {
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.queue.push(errorData);
    this.processQueue();
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0 || this.isDevelopment) {
      return;
    }

    this.processing = true;
    
    try {
      const errorData = this.queue.shift();
      await api.post('/log/client-errors', errorData);
    } catch (error) {
      console.log('Failed to send error logs:', error);
    } finally {
      this.processing = false;
      
      // Continue processing if there are more items
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }
}

export const errorLogger = new ErrorLogger();
export default errorLogger; 