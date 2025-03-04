import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../config';
import { performanceMonitor } from '../utils/performance';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Start performance monitoring
    const perfKey = performanceMonitor.startApiCall(config.url, config.method);
    config.metadata = { perfKey };
    
    // Get auth token from localStorage if it exists
    const token = localStorage.getItem('token');
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
axiosInstance.interceptors.response.use(
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 