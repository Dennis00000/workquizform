import axios from 'axios';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please log in again.');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
          break;
        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action');
          break;
        case 404:
          // Not found
          console.log('Resource not found:', data.message || 'Not found');
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message || 'Internal server error');
          break;
        default:
          // Other errors
          console.error('API error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
      
      // Only show toast if not in development
      if (process.env.NODE_ENV !== 'development') {
        toast.error('Network error. Please check your connection.');
      }
    } else {
      // Error in setting up request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API wrapper with common methods
const apiWrapper = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  
  // Supabase direct methods
  supabase: {
    // Templates
    getTemplates: async (options = {}) => {
      const { limit = 10, offset = 0, isPublic, sortBy = 'created_at', order = 'desc' } = options;
      
      let query = supabase
        .from('templates')
        .select('*, profiles:user_id(name, avatar_url)')
        .order(sortBy, { ascending: order === 'asc' })
        .limit(limit)
        .range(offset, offset + limit - 1);
        
      if (isPublic !== undefined) {
        query = query.eq('is_public', isPublic);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    
    getTemplate: async (id) => {
      const { data, error } = await supabase
        .from('templates')
        .select('*, profiles:user_id(name, avatar_url), questions(*)')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
    
    createTemplate: async (template) => {
      const { data, error } = await supabase
        .from('templates')
        .insert([template])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    
    updateTemplate: async (id, template) => {
      const { data, error } = await supabase
        .from('templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    
    deleteTemplate: async (id) => {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    },
    
    // Questions
    getQuestions: async (templateId) => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index');
        
      if (error) throw error;
      return data;
    },
    
    // Submissions
    createSubmission: async (submission) => {
      const { data, error } = await supabase
        .from('submissions')
        .insert([submission])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    
    // User profiles
    getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      return data;
    },
    
    updateProfile: async (userId, profile) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    
    // Search
    searchTemplates: async (query, filters = {}) => {
      let searchQuery = supabase
        .from('templates')
        .select('*, profiles:user_id(name, avatar_url)')
        .order('created_at', { ascending: false });
        
      if (query) {
        searchQuery = searchQuery.textSearch('fts', query);
      }
      
      if (filters.topic) {
        searchQuery = searchQuery.eq('topic', filters.topic);
      }
      
      if (filters.isPublic !== undefined) {
        searchQuery = searchQuery.eq('is_public', filters.isPublic);
      }
      
      const { data, error } = await searchQuery;
      
      if (error) throw error;
      return data;
    }
  }
};

// Export both the api object and supabase for direct access
export { api, supabase };
export default apiWrapper; 