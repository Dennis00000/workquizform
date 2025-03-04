import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Role-Based Access Control (RBAC) hook
 */
export function useRBAC() {
  const { user } = useContext(AuthContext);
  
  // Role hierarchy (higher roles include permissions of lower roles)
  const roleHierarchy = {
    admin: ['admin', 'manager', 'premium', 'user'],
    manager: ['manager', 'premium', 'user'],
    premium: ['premium', 'user'],
    user: ['user']
  };
  
  // Get current user role
  const userRole = user?.role || 'anonymous';
  
  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} - Whether user has the role
   */
  const hasRole = (role) => {
    // Admin has all permissions
    if (userRole === 'admin') return true;
    
    // No user or anonymous users have limited access
    if (!user || userRole === 'anonymous') {
      return role === 'anonymous';
    }
    
    // Check role hierarchy
    return roleHierarchy[userRole]?.includes(role) || false;
  };
  
  /**
   * Check if user has permission to perform an action
   * @param {string} action - Action to check
   * @param {Object} resource - Resource to check permission against
   * @returns {boolean} - Whether user has permission
   */
  const hasPermission = (action, resource = null) => {
    // Basic role-based permissions
    const rolePermissions = {
      anonymous: ['view:public'],
      user: ['view:public', 'view:own', 'create:own', 'update:own', 'delete:own'],
      premium: ['view:public', 'view:own', 'create:own', 'update:own', 'delete:own', 'export:own'],
      manager: ['view:public', 'view:own', 'view:any', 'create:own', 'create:any', 'update:own', 'update:any', 'delete:own'],
      admin: ['view:public', 'view:own', 'view:any', 'create:own', 'create:any', 'update:own', 'update:any', 'delete:own', 'delete:any', 'manage:system']
    };
    
    // If no user or anonymous, check against anonymous permissions
    if (!user || userRole === 'anonymous') {
      return rolePermissions.anonymous.includes(action);
    }
    
    // Admin has all permissions
    if (userRole === 'admin') return true;
    
    // Check if user role has the action permission
    const userRolePerms = rolePermissions[userRole] || [];
    if (!userRolePerms.includes(action)) {
      return false;
    }
    
    // For resource-specific checks
    if (resource) {
      // 'own' resources can only be accessed by their owner
      if (action.includes(':own')) {
        return resource.user_id === user.id;
      }
      
      // 'any' permissions are checked above in the role permissions
    }
    
    return true;
  };
  
  /**
   * Check if a component should be rendered based on user role
   * @param {string|Array} requiredRole - Required role(s) to render component
   * @returns {boolean} - Whether component should be rendered
   */
  const canRender = (requiredRole) => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => hasRole(role));
    }
    return hasRole(requiredRole);
  };
  
  /**
   * Protect a function with role-based access control
   * @param {Function} fn - Function to protect
   * @param {string|Array} requiredRole - Required role(s) to execute function
   * @returns {Function} - Protected function
   */
  const protect = (fn, requiredRole) => {
    return (...args) => {
      if (!canRender(requiredRole)) {
        throw new Error('Access denied: Insufficient permissions');
      }
      
      return fn(...args);
    };
  };
  
  return {
    hasRole,
    hasPermission,
    canRender,
    protect,
    userRole
  };
} 