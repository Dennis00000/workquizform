import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRoutes from './routes';
import './i18n';
import './styles/global.css';
import './styles/light-mode.css';

function App() {
  return (
    <Router>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <Toaster position="top-right" />
            <AppRoutes />
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </Router>
  );
}

export default App;
