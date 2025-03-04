import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../../services/api/templateApi';
import { toast } from 'react-hot-toast';

/**
 * Hook for template-related queries and mutations using React Query
 */
export function useTemplates() {
  const queryClient = useQueryClient();

  // Get all public templates
  const usePublicTemplates = (options = {}) => {
    return useQuery({
      queryKey: ['templates', 'public'],
      queryFn: () => templateApi.getPublicTemplates(),
      ...options
    });
  };

  // Get a specific template with all its questions
  const useTemplate = (id, options = {}) => {
    return useQuery({
      queryKey: ['templates', id],
      queryFn: () => templateApi.getTemplateWithQuestions(id),
      enabled: !!id,
      ...options
    });
  };

  // Get templates created by a specific user
  const useUserTemplates = (userId, options = {}) => {
    return useQuery({
      queryKey: ['templates', 'user', userId],
      queryFn: () => templateApi.getUserTemplates(userId),
      enabled: !!userId,
      ...options
    });
  };

  // Create a new template
  const useCreateTemplate = (options = {}) => {
    return useMutation({
      mutationFn: (templateData) => templateApi.create(templateData),
      onSuccess: (data) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries(['templates']);
        
        if (options.onSuccess) {
          options.onSuccess(data);
        }
        
        toast.success('Template created successfully');
      },
      onError: (error) => {
        toast.error(`Failed to create template: ${error.message}`);
        
        if (options.onError) {
          options.onError(error);
        }
      }
    });
  };

  // Update an existing template
  const useUpdateTemplate = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, data }) => templateApi.update(id, data),
      onSuccess: (data) => {
        // Invalidate specific template query
        queryClient.invalidateQueries(['templates', data.id]);
        
        if (options.onSuccess) {
          options.onSuccess(data);
        }
        
        toast.success('Template updated successfully');
      },
      onError: (error) => {
        toast.error(`Failed to update template: ${error.message}`);
        
        if (options.onError) {
          options.onError(error);
        }
      }
    });
  };

  // Delete a template
  const useDeleteTemplate = (options = {}) => {
    return useMutation({
      mutationFn: (id) => templateApi.delete(id),
      onSuccess: (_, variables) => {
        // Variables contains the ID that was passed to the mutation
        const templateId = variables;
        
        // Remove from cache
        queryClient.removeQueries(['templates', templateId]);
        
        // Invalidate lists that might contain this template
        queryClient.invalidateQueries(['templates', 'public']);
        queryClient.invalidateQueries(['templates', 'user']);
        
        if (options.onSuccess) {
          options.onSuccess();
        }
        
        toast.success('Template deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete template: ${error.message}`);
        
        if (options.onError) {
          options.onError(error);
        }
      }
    });
  };

  // Toggle like status for a template
  const useToggleTemplateLike = (options = {}) => {
    return useMutation({
      mutationFn: (templateId) => templateApi.toggleLike(templateId),
      onMutate: async (templateId) => {
        // Cancel any outgoing refetches to avoid overwriting optimistic update
        await queryClient.cancelQueries(['templates', templateId]);
        
        // Get current template data
        const previousTemplate = queryClient.getQueryData(['templates', templateId]);
        
        // Optimistically update the likes count
        if (previousTemplate) {
          queryClient.setQueryData(['templates', templateId], {
            ...previousTemplate,
            likes: previousTemplate.likes ? previousTemplate.likes - 1 : previousTemplate.likes + 1
          });
        }
        
        return { previousTemplate };
      },
      onSuccess: (_, variables) => {
        const templateId = variables;
        
        // Invalidate affected queries
        queryClient.invalidateQueries(['templates', templateId]);
        queryClient.invalidateQueries(['templates', 'public']);
        
        if (options.onSuccess) {
          options.onSuccess();
        }
      },
      onError: (error, _, context) => {
        // Revert to previous state if available
        if (context?.previousTemplate) {
          queryClient.setQueryData(['templates', context.previousTemplate.id], context.previousTemplate);
        }
        
        toast.error(`Failed to update like status: ${error.message}`);
        
        if (options.onError) {
          options.onError(error);
        }
      }
    });
  };

  return {
    usePublicTemplates,
    useTemplate,
    useUserTemplates,
    useCreateTemplate,
    useUpdateTemplate,
    useDeleteTemplate,
    useToggleTemplateLike
  };
} 