import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import errorLogger from './utils/errorLogger';
// Import i18n configuration and global styles are already in App.js

// Add console logs for debugging
console.log('Index.js is running');
console.log('React version:', React.version);

const rootElement = document.getElementById('root');
console.log('Root element found:', !!rootElement);

// Create a root
const root = createRoot(rootElement);

// Log before render
console.log('Render called');

// Render the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize error logger
console.log('Error logger initialized');

// Report web vitals
reportWebVitals();

// Register service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

window.onerror = (message, source, lineno, colno, error) => {
  errorLogger.log(error || new Error(message), { source, lineno, colno });
  return false;
};
