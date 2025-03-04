import { supabase } from '../config/supabase';
import { EventBus } from './performance';

let refreshPromise = null;

/**
 * Initialize auth listener to handle token refresh
 */
export function initializeAuthListener() {
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      // User signed in, store session
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      EventBus.emit('auth:signed-in', { user: session?.user });
    } else if (event === 'SIGNED_OUT') {
      // User signed out, clear session
      localStorage.removeItem('supabase.auth.token');
      EventBus.emit('auth:signed-out');
    } else if (event === 'TOKEN_REFRESHED') {
      // Token refreshed, update session
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      EventBus.emit('auth:token-refreshed', { session });
    } else if (event === 'USER_UPDATED') {
      // User data updated
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      EventBus.emit('auth:user-updated', { user: session?.user });
    }
  });
}

/**
 * Check if token needs refresh and refresh if needed
 * Uses a shared promise to prevent multiple refresh requests
 */
export async function checkAndRefreshToken() {
  const session = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  // Check if token is expired or about to expire (within 5 minutes)
  const expiresAt = session?.expires_at * 1000; // Convert to milliseconds
  const isExpired = expiresAt < Date.now();
  const expiresInMs = expiresAt - Date.now();
  const isExpiringSoon = expiresInMs > 0 && expiresInMs < 5 * 60 * 1000;
  
  if (isExpired || isExpiringSoon) {
    // If a refresh is already in progress, return the promise
    if (refreshPromise) {
      return refreshPromise;
    }
    
    // Set up the refresh promise
    refreshPromise = supabase.auth.refreshSession()
      .then(({ data, error }) => {
        refreshPromise = null; // Clear the promise
        
        if (error) {
          throw error;
        }
        
        return data?.session;
      })
      .catch(error => {
        refreshPromise = null; // Clear the promise
        console.error('Failed to refresh token:', error);
        
        // Force re-login if refresh fails
        if (error.status === 401) {
          // Clear auth state and redirect to login
          supabase.auth.signOut();
          window.location.href = '/login';
        }
        
        throw error;
      });
    
    return refreshPromise;
  }
  
  return session;
}

/**
 * Intercept Supabase API requests to ensure token is fresh
 */
export function setupAuthInterceptor() {
  // This is a simplified version since Supabase handles token refresh
  // For custom API calls, you would need to implement request interceptors
  
  // Example for fetch API
  const originalFetch = window.fetch;
  window.fetch = async function(url, options = {}) {
    // Only intercept API requests
    if (url.includes('/api/') || url.includes('supabase.co')) {
      // Check if token needs refresh before making request
      try {
        await checkAndRefreshToken();
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
    
    return originalFetch(url, options);
  };
} 