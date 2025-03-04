const { supabase } = require('../lib/supabase');
const { AppError } = require('../middleware/errorHandler');

/**
 * Template controller for handling template-related operations
 */
class TemplateController {
  /**
   * Get all templates with optional filtering
   */
  async getTemplates(req, res, next) {
    try {
      const { 
        topic, 
        is_public, 
        user_id, 
        sort_by = 'created_at', 
        sort_order = 'desc',
        limit = 10,
        offset = 0
      } = req.query;
      
      // Build the query
      let query = supabase
        .from('templates')
        .select('*, profiles:user_id(name, avatar_url)', { count: 'exact' })
        .order(sort_by, { ascending: sort_order === 'asc' })
        .range(offset, offset + limit - 1);
      
      // Apply filters if provided
      if (topic) {
        query = query.eq('topic', topic);
      }
      
      if (is_public !== undefined) {
        query = query.eq('is_public', is_public === 'true');
      }
      
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        return next(new AppError(error.message, 500));
      }
      
      // Transform the data to include empty tags array if needed
      const transformedData = data.map(template => ({
        ...template,
        tags: template.tags || []
      }));
      
      res.status(200).json({
        status: 'success',
        results: transformedData.length,
        count,
        data: transformedData
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
  
  /**
   * Get a single template by ID
   */
  async getTemplate(req, res, next) {
    try {
      const { id } = req.params;
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          questions(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return next(new AppError('Template not found', 404));
        }
        return next(new AppError(error.message, 500));
      }
      
      // Ensure tags is an array
      const transformedData = {
        ...data,
        tags: data.tags || []
      };
      
      res.status(200).json({
        status: 'success',
        data: transformedData
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
  
  /**
   * Create a new template
   */
  async createTemplate(req, res, next) {
    try {
      const { title, description, is_public, topic, questions, tags } = req.body;
      const user_id = req.user.id;
      
      // Validate required fields
      if (!title) {
        return next(new AppError('Title is required', 400));
      }
      
      // Create the template
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .insert({
          title,
          description,
          is_public,
          topic,
          user_id
        })
        .select()
        .single();
        
      if (templateError) {
        return next(new AppError(templateError.message, 500));
      }
      
      // Add questions if provided
      if (questions && questions.length > 0) {
        const questionsWithTemplateId = questions.map(question => ({
          ...question,
          template_id: template.id
        }));
        
        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsWithTemplateId);
          
        if (questionsError) {
          return next(new AppError(questionsError.message, 500));
        }
      }
      
      // Add tags if provided
      if (tags && tags.length > 0) {
        const tagLinks = tags.map(tag_id => ({
          template_id: template.id,
          tag_id
        }));
        
        const { error: tagsError } = await supabase
          .from('template_tags')
          .insert(tagLinks);
          
        if (tagsError) {
          return next(new AppError(tagsError.message, 500));
        }
      }
      
      res.status(201).json({
        status: 'success',
        data: template
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
  
  /**
   * Update an existing template
   */
  async updateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, is_public, topic, questions, tags } = req.body;
      const user_id = req.user.id;
      
      // Check if template exists and belongs to user
      const { data: existingTemplate, error: checkError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return next(new AppError('Template not found', 404));
        }
        return next(new AppError(checkError.message, 500));
      }
      
      // Check ownership
      if (existingTemplate.user_id !== user_id) {
        return next(new AppError('You do not have permission to update this template', 403));
      }
      
      // Update the template
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .update({
          title,
          description,
          is_public,
          topic,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (templateError) {
        return next(new AppError(templateError.message, 500));
      }
      
      // Update questions if provided
      if (questions && questions.length > 0) {
        // First delete existing questions
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('template_id', id);
          
        if (deleteError) {
          return next(new AppError(deleteError.message, 500));
        }
        
        // Then insert new questions
        const questionsWithTemplateId = questions.map(question => ({
          ...question,
          template_id: id
        }));
        
        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsWithTemplateId);
          
        if (questionsError) {
          return next(new AppError(questionsError.message, 500));
        }
      }
      
      // Update tags if provided
      if (tags) {
        // First delete existing tag links
        const { error: deleteTagsError } = await supabase
          .from('template_tags')
          .delete()
          .eq('template_id', id);
          
        if (deleteTagsError) {
          return next(new AppError(deleteTagsError.message, 500));
        }
        
        // Then insert new tag links
        if (tags.length > 0) {
          const tagLinks = tags.map(tag_id => ({
            template_id: id,
            tag_id
          }));
          
          const { error: tagsError } = await supabase
            .from('template_tags')
            .insert(tagLinks);
            
          if (tagsError) {
            return next(new AppError(tagsError.message, 500));
          }
        }
      }
      
      res.status(200).json({
        status: 'success',
        data: template
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
  
  /**
   * Delete a template
   */
  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      
      // Check if template exists and belongs to user
      const { data: existingTemplate, error: checkError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return next(new AppError('Template not found', 404));
        }
        return next(new AppError(checkError.message, 500));
      }
      
      // Check ownership
      if (existingTemplate.user_id !== user_id) {
        return next(new AppError('You do not have permission to delete this template', 403));
      }
      
      // Delete the template (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        return next(new AppError(deleteError.message, 500));
      }
      
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
  
  /**
   * Toggle like on a template
   */
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      
      // Check if template exists
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (templateError) {
        if (templateError.code === 'PGRST116') {
          return next(new AppError('Template not found', 404));
        }
        return next(new AppError(templateError.message, 500));
      }
      
      // Check if user has already liked the template
      const { data: existingLike, error: likeError } = await supabase
        .from('template_likes')
        .select('*')
        .eq('template_id', id)
        .eq('user_id', user_id)
        .single();
        
      if (likeError && likeError.code !== 'PGRST116') {
        return next(new AppError(likeError.message, 500));
      }
      
      let action;
      
      // If like exists, remove it
      if (existingLike) {
        const { error: unlikeError } = await supabase
          .from('template_likes')
          .delete()
          .eq('template_id', id)
          .eq('user_id', user_id);
          
        if (unlikeError) {
          return next(new AppError(unlikeError.message, 500));
        }
        
        action = 'unliked';
      } 
      // Otherwise, add a like
      else {
        const { error: addLikeError } = await supabase
          .from('template_likes')
          .insert({
            template_id: id,
            user_id
          });
          
        if (addLikeError) {
          return next(new AppError(addLikeError.message, 500));
        }
        
        action = 'liked';
      }
      
      // Get updated like count
      const { data: likeCount, error: countError } = await supabase
        .from('template_likes')
        .select('*', { count: 'exact', head: true })
        .eq('template_id', id);
        
      if (countError) {
        return next(new AppError(countError.message, 500));
      }
      
      // Update template likes_count
      const { error: updateError } = await supabase
        .from('templates')
        .update({ likes_count: likeCount })
        .eq('id', id);
        
      if (updateError) {
        return next(new AppError(updateError.message, 500));
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          action,
          likes: likeCount
        }
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
  
  /**
   * Get latest templates
   */
  async getLatestTemplates(req, res, next) {
    try {
      const limit = req.query.limit || 6;
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:user_id (name, avatar_url),
          template_likes (user_id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        return next(new AppError(error.message, 500));
      }
      
      // Process the data to include likes_count
      const templates = data.map(template => ({
        ...template,
        likes_count: template.template_likes ? template.template_likes.length : 0,
        liked_by_user: req.user ? template.template_likes.some(like => like.user_id === req.user.id) : false
      }));
      
      res.status(200).json({
        status: 'success',
        templates
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
  
  /**
   * Get popular templates
   */
  async getPopularTemplates(req, res, next) {
    try {
      const limit = req.query.limit || 6;
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:user_id (name, avatar_url),
          template_likes (user_id)
        `)
        .eq('is_public', true)
        .order('likes_count', { ascending: false })
        .limit(limit);
      
      if (error) {
        return next(new AppError(error.message, 500));
      }
      
      // Process the data to include likes_count
      const templates = data.map(template => ({
        ...template,
        likes_count: template.template_likes ? template.template_likes.length : 0,
        liked_by_user: req.user ? template.template_likes.some(like => like.user_id === req.user.id) : false
      }));
      
      res.status(200).json({
        status: 'success',
        templates
      });
    } catch (error) {
      next(new AppError(error.message, 500));
    }
  }
}

module.exports = new TemplateController(); 