import axios from 'axios';
import { handleApiError } from './errorHandler';
import { performanceMonitor } from './performance';
import config from '../config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Start performance monitoring
    const perfKey = performanceMonitor.startApiCall(config.url, config.method);
    config.metadata = { perfKey };
    
    // Get auth token from localStorage if it exists
    const token = localStorage.getItem(config.auth.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // End performance monitoring
    if (response.config.metadata?.perfKey) {
      performanceMonitor.endApiCall(response.config.metadata.perfKey, true);
    }
    
    return response;
  },
  (error) => {
    // End performance monitoring
    if (error.config?.metadata?.perfKey) {
      performanceMonitor.endApiCall(error.config.metadata.perfKey, false);
    }
    
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userKey);
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }
    
    // Handle the error with our error handler
    handleApiError(error);
    
    return Promise.reject(error);
  }
);

export default apiClient; 