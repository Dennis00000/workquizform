import { withLazyLoad } from '../components/hoc/withLazyLoad';

/**
 * Map of feature flags to component imports
 * Centralizes feature-based code splitting decisions
 */
const featureComponentMap = {
  // Core features always loaded
  core: {
    Dashboard: () => import('../pages/dashboard/DashboardPage'),
    Login: () => import('../pages/auth/LoginPage'),
    Register: () => import('../pages/auth/RegisterPage'),
    Templates: () => import('../pages/templates/TemplatesPage'),
    TemplateDetail: () => import('../pages/templates/TemplateDetailPage'),
  },
  
  // Admin features only loaded for admin users
  admin: {
    UserManagement: () => import('../pages/admin/UserManagementPage'),
    SystemSettings: () => import('../pages/admin/SystemSettingsPage'),
    Analytics: () => import('../pages/admin/AnalyticsPage'),
  },
  
  // Premium features only loaded for premium users
  premium: {
    AdvancedReports: () => import('../pages/premium/AdvancedReportsPage'),
    DataExport: () => import('../pages/premium/DataExportPage'),
    CustomBranding: () => import('../pages/premium/CustomBrandingPage'),
  },
  
  // Experimental features only loaded when the feature flag is enabled
  experimental: {
    AIAssistant: () => import('../pages/experimental/AIAssistantPage'),
    BetaFeatures: () => import('../pages/experimental/BetaFeaturesPage'),
  }
};

/**
 * Load a component based on feature flag and user role
 * 
 * @param {string} featureSet - Feature set name (core, admin, premium, experimental)
 * @param {string} componentName - Component name within the feature set
 * @param {React.Component} LoadingComponent - Component to show while loading
 * @param {Object} options - Additional options
 * @returns {React.Component} - Lazy-loaded component or fallback
 */
export function loadFeatureComponent(featureSet, componentName, LoadingComponent, options = {}) {
  const { 
    fallbackComponent = null,
    shouldLoad = true // Function or boolean to determine if component should load
  } = options;
  
  // Check if the feature set and component exist
  if (!featureComponentMap[featureSet] || !featureComponentMap[featureSet][componentName]) {
    console.error(`Feature component ${featureSet}.${componentName} not found`);
    return fallbackComponent;
  }
  
  // Check if we should load this component
  const canLoad = typeof shouldLoad === 'function' ? shouldLoad() : shouldLoad;
  
  if (!canLoad) {
    return fallbackComponent;
  }
  
  // Get the import function
  const importFn = featureComponentMap[featureSet][componentName];
  
  // Create and return the lazy-loaded component
  return withLazyLoad(importFn, LoadingComponent, options);
}

/**
 * Load a component based on user role
 * 
 * @param {string} componentName - Component name
 * @param {string} userRole - User's role
 * @param {React.Component} LoadingComponent - Component to show while loading
 * @param {Object} options - Additional options
 * @returns {React.Component} - Lazy-loaded component or fallback
 */
export function loadRoleBasedComponent(componentName, userRole, LoadingComponent, options = {}) {
  const featureSet = userRole === 'admin' 
    ? 'admin' 
    : userRole === 'premium' 
      ? 'premium' 
      : 'core';
  
  return loadFeatureComponent(featureSet, componentName, LoadingComponent, options);
} 