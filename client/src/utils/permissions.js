// Define permission levels
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
  GUEST: 'guest'
};

// Define permissions for each role
export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'templates:create',
    'templates:read',
    'templates:update',
    'templates:delete',
    'users:read',
    'users:update',
    'users:delete',
    'settings:read',
    'settings:update',
    'analytics:read'
  ],
  [ROLES.EDITOR]: [
    'templates:create',
    'templates:read',
    'templates:update',
    'templates:delete',
    'users:read'
  ],
  [ROLES.USER]: [
    'templates:create',
    'templates:read',
    'templates:update:own',
    'templates:delete:own'
  ],
  [ROLES.GUEST]: [
    'templates:read:public'
  ]
};

// Check if a user has a specific permission
export const hasPermission = (user, permission) => {
  if (!user) return PERMISSIONS[ROLES.GUEST].includes(permission);
  
  const role = user.role || ROLES.USER;
  const userPermissions = PERMISSIONS[role] || [];
  
  // Check for exact permission match
  if (userPermissions.includes(permission)) return true;
  
  // Check for wildcard permissions (e.g., 'templates:*')
  const resourceType = permission.split(':')[0];
  if (userPermissions.includes(`${resourceType}:*`)) return true;
  
  return false;
};

// Higher-order component for protecting routes
export const withPermission = (permission) => (Component) => (props) => {
  const { user } = useAuth();
  
  if (!hasPermission(user, permission)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return <Component {...props} />;
}; 