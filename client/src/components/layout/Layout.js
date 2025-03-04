import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Main Layout component that wraps all pages
 * Uses the Outlet component from react-router to render child routes
 */
const Layout = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''}`}>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>
      
      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node
};

export default Layout; 