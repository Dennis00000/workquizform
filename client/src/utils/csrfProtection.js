import { nanoid } from 'nanoid';

/**
 * CSRF protection utility for API requests
 */
class CSRFProtection {
  constructor() {
    this.tokenKey = 'csrf_token';
    this.headerName = 'X-CSRF-Token';
    
    // Generate a new token when the class is instantiated
    this.generateToken();
  }
  
  /**
   * Generate a new CSRF token and store it
   * @returns {string} - Generated token
   */
  generateToken() {
    const token = nanoid(32);
    localStorage.setItem(this.tokenKey, token);
    return token;
  }
  
  /**
   * Get the current CSRF token
   * @returns {string} - Current token
   */
  getToken() {
    let token = localStorage.getItem(this.tokenKey);
    
    // Generate a token if one doesn't exist yet
    if (!token) {
      token = this.generateToken();
    }
    
    return token;
  }
  
  /**
   * Add CSRF token to fetch request options
   * @param {Object} options - Fetch options
   * @returns {Object} - Updated fetch options with CSRF token
   */
  addTokenToRequest(options = {}) {
    const token = this.getToken();
    
    // Create or update headers
    const headers = options.headers || {};
    headers[this.headerName] = token;
    
    return {
      ...options,
      headers
    };
  }
  
  /**
   * Validate a token from a response
   * @param {string} token - Token to validate
   * @returns {boolean} - Whether token is valid
   */
  validateToken(token) {
    const storedToken = localStorage.getItem(this.tokenKey);
    return token === storedToken;
  }
  
  /**
   * Setup fetch interceptor to automatically add CSRF tokens
   */
  setupFetchInterceptor() {
    const originalFetch = window.fetch;
    
    window.fetch = async (url, options = {}) => {
      // Only add token for same-origin or trusted API requests
      const isSameOrigin = url.startsWith('/') || url.startsWith(window.location.origin);
      const isTrustedApi = typeof url === 'string' && (
        url.includes('/api/') || url.includes('supabase.co')
      );
      
      if (isSameOrigin || isTrustedApi) {
        // Add CSRF token to request
        options = this.addTokenToRequest(options);
      }
      
      return originalFetch(url, options);
    };
  }
}

export const csrfProtection = new CSRFProtection(); 