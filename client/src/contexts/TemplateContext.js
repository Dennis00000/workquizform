import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';
import { templateCache } from '../utils/cache';

const TemplateContext = createContext();

export function useTemplates() {
  return useContext(TemplateContext);
}

export function TemplateProvider({ children }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all public templates
  const fetchPublicTemplates = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cachedTemplates = templateCache.get('public-templates');
      if (cachedTemplates) {
        setTemplates(cachedTemplates);
        setLoading(false);
        
        // Still refresh in background
        refreshPublicTemplates();
        return;
      }
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:user_id (name, avatar_url),
          categories:template_categories (
            categories:category_id (name, slug)
          ),
          likes:template_likes (count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to make it easier to work with
      const processedData = data.map(template => ({
        ...template,
        user: template.profiles,
        categories: template.categories?.map(c => c.categories) || [],
        likes_count: template.likes?.length || 0,
        // Add a liked_by_user field if the user is logged in
        liked_by_user: user ? template.likes?.some(like => like.user_id === user.id) : false
      }));
      
      setTemplates(processedData);
      
      // Update cache
      templateCache.set('public-templates', processedData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError(error.message);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh public templates in background (no loading state)
  const refreshPublicTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:user_id (name, avatar_url),
          categories:template_categories (
            categories:category_id (name, slug)
          ),
          likes:template_likes (count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data
      const processedData = data.map(template => ({
        ...template,
        user: template.profiles,
        categories: template.categories?.map(c => c.categories) || [],
        likes_count: template.likes?.length || 0,
        liked_by_user: user ? template.likes?.some(like => like.user_id === user.id) : false
      }));
      
      setTemplates(processedData);
      
      // Update cache
      templateCache.set('public-templates', processedData);
    } catch (error) {
      console.error('Error refreshing templates:', error);
    }
  }, [user]);

  // Fetch user's templates
  const fetchUserTemplates = useCallback(async () => {
    if (!user) {
      setUserTemplates([]);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          categories:template_categories (
            categories:category_id (name, slug)
          ),
          likes:template_likes (count),
          questions:questions (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data
      const processedData = data.map(template => ({
        ...template,
        categories: template.categories?.map(c => c.categories) || [],
        likes_count: template.likes?.length || 0,
        questions_count: template.questions?.length || 0
      }));
      
      setUserTemplates(processedData);
    } catch (error) {
      console.error('Error fetching user templates:', error);
      setError(error.message);
      toast.error('Failed to load your templates');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get a single template by ID
  const getTemplateById = useCallback(async (id) => {
    try {
      // Check cache first
      const cachedTemplate = templateCache.get(`template-${id}`);
      if (cachedTemplate) {
        return cachedTemplate;
      }
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:user_id (name, avatar_url),
          categories:template_categories (
            categories:category_id (name, slug)
          ),
          likes:template_likes (user_id),
          questions:questions (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Update template views count
      await supabase
        .rpc('increment_view_count', { template_id: id })
        .catch(err => console.error('Error incrementing view count:', err));
      
      // Process the data
      const processedData = {
        ...data,
        user: data.profiles,
        categories: data.categories?.map(c => c.categories) || [],
        likes_count: data.likes?.length || 0,
        liked_by_user: user ? data.likes?.some(like => like.user_id === user.id) : false,
        questions: data.questions.sort((a, b) => a.position - b.position)
      };
      
      // Update cache
      templateCache.set(`template-${id}`, processedData);
      
      return processedData;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      toast.error('Failed to load template');
      throw error;
    }
  }, [user]);

  // Create a new template
  const createTemplate = useCallback(async (templateData) => {
    if (!user) {
      toast.error('You must be logged in to create a template');
      throw new Error('Authentication required');
    }
    
    try {
      // First, create the template
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .insert({
          ...templateData,
          user_id: user.id
        })
        .select()
        .single();
      
      if (templateError) throw templateError;
      
      // Add to user templates
      setUserTemplates(prev => [template, ...prev]);
      
      // If public, add to all templates
      if (template.is_public) {
        setTemplates(prev => [
          { ...template, user: { name: user.name, avatar_url: user.avatar_url }, likes_count: 0 },
          ...prev
        ]);
        
        // Invalidate cache
        templateCache.delete('public-templates');
      }
      
      toast.success('Template created successfully');
      return template;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      throw error;
    }
  }, [user]);

  // Update an existing template
  const updateTemplate = useCallback(async (id, templateData) => {
    if (!user) {
      toast.error('You must be logged in to update a template');
      throw new Error('Authentication required');
    }
    
    try {
      const { data: template, error } = await supabase
        .from('templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update in user templates
      setUserTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, ...template } : t)
      );
      
      // Update in all templates if exists
      setTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, ...template } : t)
      );
      
      // Invalidate cache
      templateCache.delete(`template-${id}`);
      templateCache.delete('public-templates');
      
      toast.success('Template updated successfully');
      return template;
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
      throw error;
    }
  }, [user]);

  // Delete a template
  const deleteTemplate = useCallback(async (id) => {
    if (!user) {
      toast.error('You must be logged in to delete a template');
      throw new Error('Authentication required');
    }
    
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from user templates
      setUserTemplates(prev => prev.filter(t => t.id !== id));
      
      // Remove from all templates if exists
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      // Invalidate cache
      templateCache.delete(`template-${id}`);
      templateCache.delete('public-templates');
      
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      throw error;
    }
  }, [user]);

  // Toggle like on a template
  const toggleLike = useCallback(async (templateId) => {
    if (!user) {
      toast.error('You must be logged in to like a template');
      throw new Error('Authentication required');
    }
    
    try {
      const { data, error } = await supabase.rpc('toggle_like', {
        p_template_id: templateId,
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      // Update templates with new like status
      setTemplates(prev => 
        prev.map(t => {
          if (t.id === templateId) {
            return { 
              ...t, 
              liked_by_user: !t.liked_by_user,
              likes_count: t.liked_by_user ? t.likes_count - 1 : t.likes_count + 1
            };
          }
          return t;
        })
      );
      
      // Invalidate cache
      templateCache.delete(`template-${templateId}`);
      templateCache.delete('public-templates');
      
      return data;
    } catch (error) {
      console.error('Error toggling template like:', error);
      toast.error('Failed to like template');
      throw error;
    }
  }, [user]);

  // Initial data load
  useEffect(() => {
    fetchPublicTemplates();
  }, [fetchPublicTemplates]);
  
  // Load user templates when user changes
  useEffect(() => {
    fetchUserTemplates();
  }, [fetchUserTemplates]);

  const value = {
    templates,
    userTemplates,
    loading,
    error,
    fetchPublicTemplates,
    fetchUserTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleLike,
    refreshPublicTemplates
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
} 