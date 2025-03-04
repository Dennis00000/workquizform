import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionApi } from '../../services/api/submissionApi';
import { toast } from 'react-hot-toast';

/**
 * Hook for submission-related queries and mutations using React Query
 */
export function useSubmissions() {
  const queryClient = useQueryClient();

  // Get submissions for a specific template
  const useTemplateSubmissions = (templateId, options = {}) => {
    return useQuery({
      queryKey: ['submissions', 'template', templateId],
      queryFn: () => submissionApi.getTemplateSubmissions(templateId),
      enabled: !!templateId,
      ...options
    });
  };

  // Get submissions by a specific user
  const useUserSubmissions = (userId, options = {}) => {
    return useQuery({
      queryKey: ['submissions', 'user', userId],
      queryFn: () => submissionApi.getUserSubmissions(userId),
      enabled: !!userId,
      ...options
    });
  };

  // Get a specific submission with details
  const useSubmission = (id, options = {}) => {
    return useQuery({
      queryKey: ['submissions', id],
      queryFn: () => submissionApi.getSubmissionWithDetails(id),
      enabled: !!id,
      ...options
    });
  };

  // Create a new submission
  const useCreateSubmission = (options = {}) => {
    return useMutation({
      mutationFn: (submissionData) => submissionApi.create(submissionData),
      onSuccess: (data) => {
        // Get the template ID and user ID from the created submission
        const { template_id: templateId, user_id: userId } = data;
        
        // Invalidate affected queries
        queryClient.invalidateQueries(['submissions', 'template', templateId]);
        queryClient.invalidateQueries(['submissions', 'user', userId]);
        
        if (options.onSuccess) {
          options.onSuccess(data);
        }
        
        toast.success('Form submitted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to submit form: ${error.message}`);
        
        if (options.onError) {
          options.onError(error);
        }
      }
    });
  };

  // Delete a submission
  const useDeleteSubmission = (options = {}) => {
    return useMutation({
      mutationFn: (id) => submissionApi.delete(id),
      onSuccess: async (_, variables) => {
        // Get the submission ID
        const submissionId = variables;
        
        // Get submission data before removal to know which queries to invalidate
        const submissionData = queryClient.getQueryData(['submissions', submissionId]);
        
        // Remove from cache
        queryClient.removeQueries(['submissions', submissionId]);
        
        // Invalidate affected list queries
        if (submissionData) {
          const { template_id: templateId, user_id: userId } = submissionData;
          
          queryClient.invalidateQueries(['submissions', 'template', templateId]);
          queryClient.invalidateQueries(['submissions', 'user', userId]);
        } else {
          // If we don't have the data, invalidate all submission lists to be safe
          queryClient.invalidateQueries(['submissions', 'template']);
          queryClient.invalidateQueries(['submissions', 'user']);
        }
        
        if (options.onSuccess) {
          options.onSuccess();
        }
        
        toast.success('Submission deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete submission: ${error.message}`);
        
        if (options.onError) {
          options.onError(error);
        }
      }
    });
  };

  return {
    useTemplateSubmissions,
    useUserSubmissions,
    useSubmission,
    useCreateSubmission,
    useDeleteSubmission
  };
} 