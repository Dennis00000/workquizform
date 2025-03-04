import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const useWebSockets = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const { user } = useAuth();

  // Connect to WebSocket
  useEffect(() => {
    if (!url) return;

    // Create WebSocket connection
    const socket = new WebSocket(url);
    socketRef.current = socket;

    // Connection opened
    socket.addEventListener('open', () => {
      setIsConnected(true);
      setError(null);
      
      // Send authentication if user is logged in
      if (user) {
        socket.send(JSON.stringify({
          type: 'auth',
          token: user.token
        }));
      }
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    });

    // Connection closed
    socket.addEventListener('close', (event) => {
      setIsConnected(false);
      if (event.code !== 1000) {
        setError(`WebSocket connection closed unexpectedly: ${event.reason}`);
        toast.error('Connection lost. Trying to reconnect...');
      }
    });

    // Connection error
    socket.addEventListener('error', (event) => {
      setError('WebSocket error');
      console.error('WebSocket error:', event);
    });

    // Cleanup on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [url, user]);

  // Send message
  const sendMessage = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  return {
    isConnected,
    messages,
    error,
    sendMessage,
    disconnect
  };
};

export default useWebSockets; 