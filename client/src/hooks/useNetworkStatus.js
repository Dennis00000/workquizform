import { useState, useEffect } from 'react';
import { EventBus } from '../utils/performance';

/**
 * Hook to track and react to network status changes
 */
export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState(null);
  const [connectionSpeed, setConnectionSpeed] = useState(null);
  
  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      EventBus.emit('network:online');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      EventBus.emit('network:offline');
    };
    
    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Get connection information if available
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      setConnectionType(connection.effectiveType);
      setConnectionSpeed(connection.downlink);
      
      // Listen for connection changes
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType);
        setConnectionSpeed(connection.downlink);
        
        EventBus.emit('network:change', {
          type: connection.effectiveType,
          speed: connection.downlink
        });
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return {
    isOnline,
    connectionType,
    connectionSpeed,
    isSlowConnection: connectionType === '2g' || connectionType === 'slow-2g' || connectionSpeed < 1
  };
} 