import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  // Success notification
  const success = useCallback((message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options
    });
  }, []);

  // Error notification
  const error = useCallback((message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      ...options
    });
  }, []);

  // Info notification
  const info = useCallback((message, options = {}) => {
    return toast(message, {
      duration: 3000,
      style: {
        background: '#3b82f6',
        color: '#fff'
      },
      ...options
    });
  }, []);

  // Warning notification
  const warning = useCallback((message, options = {}) => {
    return toast(message, {
      duration: 4000,
      style: {
        background: '#f59e0b',
        color: '#fff'
      },
      icon: '⚠️',
      ...options
    });
  }, []);

  // Custom notification
  const custom = useCallback((message, options = {}) => {
    return toast(message, options);
  }, []);

  // Create a promise toast for async operations
  const promise = useCallback((promise, messages = {}, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'An error occurred'
      },
      options
    );
  }, []);

  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  const value = {
    success,
    error,
    info,
    warning,
    custom,
    promise,
    dismissAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
} 