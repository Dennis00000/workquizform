import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { submissionCache } from '../utils/cache';

const SubmissionContext = createContext();

export function useSubmissions() {
  return useContext(SubmissionContext);
}

export function SubmissionProvider({ children }) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch submissions for a specific template
  const fetchTemplateSubmissions = useCallback(async (templateId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = `template-submissions-${templateId}`;
      const cachedSubmissions = submissionCache.get(cacheKey);
      
      if (cachedSubmissions) {
        setSubmissions(cachedSubmissions);
        setLoading(false);
        
        // Still refresh in background
        refreshTemplateSubmissions(templateId);
        return cachedSubmissions;
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles(name, email, avatar_url)')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSubmissions(data);
      submissionCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(error.message);
      toast.error('Failed to load submissions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh submissions in background (no loading state)
  const refreshTemplateSubmissions = useCallback(async (templateId) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles(name, email, avatar_url)')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSubmissions(data);
      submissionCache.set(`template-submissions-${templateId}`, data);
    } catch (error) {
      console.error('Error refreshing submissions:', error);
    }
  }, [user]);

  // Fetch user's own submissions
  const fetchUserSubmissions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = `user-submissions-${user.id}`;
      const cachedSubmissions = submissionCache.get(cacheKey);
      
      if (cachedSubmissions) {
        setSubmissions(cachedSubmissions);
        setLoading(false);
        
        // Still refresh in background
        refreshUserSubmissions();
        return cachedSubmissions;
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          templates:template_id (
            id,
            title,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSubmissions(data);
      submissionCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      setError(error.message);
      toast.error('Failed to load your submissions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh user submissions in background
  const refreshUserSubmissions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          templates:template_id (
            id,
            title,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSubmissions(data);
      submissionCache.set(`user-submissions-${user.id}`, data);
    } catch (error) {
      console.error('Error refreshing user submissions:', error);
    }
  }, [user]);

  // Get a single submission by ID
  const getSubmissionById = useCallback(async (submissionId) => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = `submission-${submissionId}`;
      const cachedSubmission = submissionCache.get(cacheKey);
      
      if (cachedSubmission) {
        setCurrentSubmission(cachedSubmission);
        return cachedSubmission;
      }
      
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          profiles:user_id (name, email, avatar_url),
          templates:template_id (
            *,
            questions:questions (*)
          )
        `)
        .eq('id', submissionId)
        .single();
      
      if (error) throw error;
      
      setCurrentSubmission(data);
      submissionCache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching submission:', error);
      setError(error.message);
      toast.error('Failed to load submission');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new submission
  const createSubmission = useCallback(async (templateId, answers) => {
    if (!user && !answers.anonymous) {
      toast.error('You must be logged in to submit this form');
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      
      const submissionData = {
        template_id: templateId,
        user_id: user?.id || null,
        answers,
        is_anonymous: !user || answers.anonymous === true
      };
      
      const { data, error } = await supabase
        .from('submissions')
        .insert(submissionData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Invalidate caches
      submissionCache.delete(`template-submissions-${templateId}`);
      if (user) {
        submissionCache.delete(`user-submissions-${user.id}`);
      }
      
      toast.success('Form submitted successfully');
      return data;
    } catch (error) {
      console.error('Error creating submission:', error);
      toast.error('Failed to submit form');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Delete a submission
  const deleteSubmission = useCallback(async (submissionId) => {
    if (!user) {
      toast.error('You must be logged in to delete a submission');
      throw new Error('Authentication required');
    }
    
    try {
      setLoading(true);
      
      // Get the template ID before deleting
      const { data: submission } = await supabase
        .from('submissions')
        .select('template_id')
        .eq('id', submissionId)
        .single();
      
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId)
        .eq('user_id', user.id); // Ensure user can only delete their own
      
      if (error) throw error;
      
      // Remove from state
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      
      // Invalidate caches
      submissionCache.delete(`submission-${submissionId}`);
      if (submission?.template_id) {
        submissionCache.delete(`template-submissions-${submission.template_id}`);
      }
      submissionCache.delete(`user-submissions-${user.id}`);
      
      toast.success('Submission deleted successfully');
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const value = {
    submissions,
    currentSubmission,
    loading,
    error,
    fetchTemplateSubmissions,
    fetchUserSubmissions,
    getSubmissionById,
    createSubmission,
    deleteSubmission,
    refreshTemplateSubmissions,
    refreshUserSubmissions
  };

  return (
    <SubmissionContext.Provider value={value}>
      {children}
    </SubmissionContext.Provider>
  );
} 