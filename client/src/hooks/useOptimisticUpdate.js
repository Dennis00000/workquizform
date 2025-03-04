import { useCallback } from 'react';
import { queryClient } from '../providers/QueryProvider';

/**
 * Hook for optimistic updates with React Query
 * Allows for immediate UI updates while waiting for the server response
 */
function useOptimisticUpdate() {
  /**
   * Perform an optimistic update
   * @param {string} queryKey - Key for the query to update
   * @param {Function} updateFn - Function to update the cache
   * @param {Function} mutationFn - Async function to perform the actual mutation
   * @param {Object} options - Additional options
   * @returns {Promise} - Promise that resolves when mutation is complete
   */
  const optimisticUpdate = useCallback(
    async (queryKey, updateFn, mutationFn, options = {}) => {
      // Get the previous data for potential rollback
      const previousData = queryClient.getQueryData(queryKey);
      
      // Immediately update the cache optimistically
      queryClient.setQueryData(queryKey, updateFn);
      
      try {
        // Perform the actual mutation
        const result = await mutationFn();
        
        // If the mutation was successful, invalidate the query to refetch fresh data
        if (options.invalidateOnSuccess !== false) {
          queryClient.invalidateQueries(queryKey);
        }
        
        return result;
      } catch (error) {
        // If the mutation failed, revert to the previous state
        console.error('Optimistic update failed, rolling back...', error);
        queryClient.setQueryData(queryKey, previousData);
        
        // Allow caller to handle error
        if (options.onError) {
          options.onError(error);
        }
        
        throw error;
      }
    },
    []
  );
  
  return { optimisticUpdate };
}

export default useOptimisticUpdate; 