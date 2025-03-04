import { queryClient } from '../providers/QueryProvider';
import { EventBus } from './performance';

/**
 * Advanced cache management utility
 */
class CacheManager {
  constructor() {
    // Listen for network status changes
    window.addEventListener('online', this.handleOnline.bind(this));
    
    // Subscribe to events
    EventBus.on('user:logout', this.clearUserSpecificCaches.bind(this));
    EventBus.on('storage:quota-exceeded', this.pruneOldCaches.bind(this));
  }
  
  /**
   * Prefetch and cache data based on user navigation patterns
   * @param {Array} recentRoutes - Recently visited routes
   */
  prefetchBasedOnUserPatterns(recentRoutes) {
    // Analyze patterns to determine likely next pages
    const predictedRoutes = this.predictNextRoutes(recentRoutes);
    
    // Prefetch data for predicted routes
    predictedRoutes.forEach(route => {
      if (route.startsWith('/templates/')) {
        const templateId = route.split('/').pop();
        queryClient.prefetchQuery(['templates', templateId], () => 
          import('../services/api/templateApi').then(m => 
            m.templateApi.getTemplateWithQuestions(templateId)
          )
        );
      } else if (route === '/templates') {
        queryClient.prefetchQuery(['templates', 'public'], () => 
          import('../services/api/templateApi').then(m => 
            m.templateApi.getPublicTemplates()
          )
        );
      }
    });
  }
  
  /**
   * Predict likely next routes based on recent navigation
   * @param {Array} recentRoutes - Recently visited routes
   * @returns {Array} - Predicted next routes
   */
  predictNextRoutes(recentRoutes) {
    // This could use machine learning or simple heuristics
    // For now, using simple patterns:
    const predictedRoutes = [];
    
    const lastRoute = recentRoutes[recentRoutes.length - 1] || '';
    
    if (lastRoute === '/dashboard') {
      predictedRoutes.push('/templates', '/submissions');
    } else if (lastRoute === '/templates') {
      // Predict they might view template details
      const templateIds = queryClient.getQueryData(['templates', 'public'])
        ?.slice(0, 3)
        .map(t => `/templates/${t.id}`) || [];
      
      predictedRoutes.push(...templateIds);
    } else if (lastRoute.startsWith('/templates/')) {
      // After viewing template details, they might submit or go back to list
      predictedRoutes.push('/templates', `/forms/${lastRoute.split('/').pop()}`);
    }
    
    return predictedRoutes;
  }
  
  /**
   * Handle coming back online - refresh stale data
   */
  handleOnline() {
    // Refetch only stale queries when coming back online
    queryClient.invalidateQueries({ stale: true });
  }
  
  /**
   * Clear user-specific caches on logout
   */
  clearUserSpecificCaches() {
    // Remove user-specific data
    queryClient.removeQueries(['submissions', 'user']);
    queryClient.removeQueries(['templates', 'user']);
    queryClient.removeQueries(['user', 'profile']);
  }
  
  /**
   * Prune old or low-priority caches when storage quota is exceeded
   */
  pruneOldCaches() {
    const queries = queryClient.getQueryCache().findAll();
    
    // Sort by priority and staleness
    const sortedQueries = queries.sort((a, b) => {
      // If one is active and the other isn't, keep the active one
      if (a.isActive() !== b.isActive()) {
        return a.isActive() ? -1 : 1;
      }
      
      // Sort by last updated, oldest first
      return a.state.dataUpdatedAt - b.state.dataUpdatedAt;
    });
    
    // Remove oldest 25% of queries
    const toRemove = sortedQueries.slice(Math.floor(sortedQueries.length * 0.75));
    
    toRemove.forEach(query => {
      queryClient.removeQueries(query.queryKey);
    });
  }
  
  /**
   * Update related entities in cache when an entity changes
   * @param {string} entityType - Type of entity
   * @param {string} id - Entity ID
   * @param {Object} updatedData - New data
   */
  updateRelatedEntities(entityType, id, updatedData) {
    if (entityType === 'templates') {
      // Update template in user templates
      this.updateEntityInCollection(['templates', 'user'], 
        templates => templates.map(t => t.id === id ? { ...t, ...updatedData } : t)
      );
      
      // Update template in public templates
      this.updateEntityInCollection(['templates', 'public'], 
        templates => templates.map(t => t.id === id ? { ...t, ...updatedData } : t)
      );
    } else if (entityType === 'submissions') {
      const submission = queryClient.getQueryData(['submissions', id]);
      
      if (submission) {
        const { template_id: templateId, user_id: userId } = submission;
        
        // Update in template submissions
        this.updateEntityInCollection(['submissions', 'template', templateId], 
          submissions => submissions.map(s => s.id === id ? { ...s, ...updatedData } : s)
        );
        
        // Update in user submissions
        this.updateEntityInCollection(['submissions', 'user', userId], 
          submissions => submissions.map(s => s.id === id ? { ...s, ...updatedData } : s)
        );
      }
    }
  }
  
  /**
   * Update an entity in a collection query
   * @param {Array} queryKey - Query key for the collection
   * @param {Function} updateFn - Function to update the collection
   */
  updateEntityInCollection(queryKey, updateFn) {
    const data = queryClient.getQueryData(queryKey);
    
    if (data) {
      queryClient.setQueryData(queryKey, updateFn(data));
    }
  }
}

export const cacheManager = new CacheManager(); 