import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export const useWebSocket = () => {
  const ws = useRef(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      // Authenticate the WebSocket connection
      ws.current.send(JSON.stringify({
        type: 'auth',
        token
      }));
    };

    ws.current.onclose = () => {
      // Attempt to reconnect after 1 second
      setTimeout(() => {
        ws.current = null;
      }, 1000);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [token]);

  return ws.current;
}; 