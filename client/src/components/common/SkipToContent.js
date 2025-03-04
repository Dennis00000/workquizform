import React from 'react';

/**
 * Skip to content link for keyboard accessibility
 * This component allows keyboard users to skip navigation
 */
const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent; 