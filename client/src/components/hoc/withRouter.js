import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

/**
 * HOC to provide router functionality to class components
 * @param {Component} Component - Component to wrap
 * @returns {Function} - Wrapped component with router props
 */
export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    
    return (
      <Component
        {...props}
        navigate={navigate}
        location={location}
        params={params}
        router={{ navigate, location, params }}
      />
    );
  }
  
  return ComponentWithRouterProp;
} 