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
      const { topic, is_public, user_id, search, sort_by, sort_order, limit = 10, page = 1 } = req.query;
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Start building the query
      let query = supabase
        .from('templates')
        .select('*, profiles:user_id(id, name, email)', { count: 'exact' })
        .order(sort_by || 'created_at', { ascending: sort_order === 'asc' });
      
      // Apply filters if provided
      if (topic) query = query.eq('topic', topic);
      if (is_public !== undefined) query = query.eq('is_public', is_public === 'true');
      if (user_id) query = query.eq('user_id', user_id);
      
      // Apply search if provided
      if (search) {
        query = query.or(`title.ilike.%${search}%, description.ilike.%${search}%`);
      }
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) return next(new AppError(error.message, 500));
      
      // Transform the data to include user info and ensure tags is an array
      const templates = data.map(template => ({
        ...template,
        user: {
          id: template.profiles?.id,
          name: template.profiles?.name || 'Unknown User',
          email: template.profiles?.email,
          avatar_url: template.profiles?.avatar_url || null
        },
        tags: template.tags || [],
        profiles: undefined // Remove the profiles object
      }));
      
      res.status(200).json({
        status: 'success',
        results: templates.length,
        total: count,
        data: templates
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
      
      // Get the template with its questions
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:user_id(id, name, email),
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
      
      // Transform the data to include user info
      const template = {
        ...data,
        user: {
          id: data.profiles?.id,
          name: data.profiles?.name || 'Unknown User',
          email: data.profiles?.email,
          avatar_url: data.profiles?.avatar_url || null
        },
        tags: data.tags || [],
        profiles: undefined // Remove the profiles object
      };
      
      res.status(200).json({
        status: 'success',
        data: template
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
      const { title, description, is_public, tags = [] } = req.body;
      const user_id = req.user.id;
      
      // Validate required fields
      if (!title) {
        return next(new AppError('Title is required', 400));
      }
      
      // Create the template
      const { data: template, error } = await supabase
        .from('templates')
        .insert({
          title,
          description,
          user_id,
          is_public: is_public || false,
          tags: tags || []
        })
        .select()
        .single();
      
      if (error) {
        return next(new AppError(error.message, 500));
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
      const { title, description, is_public, tags = [] } = req.body;
      const user_id = req.user.id;
      
      // Check if template exists and belongs to user
      const { data: existingTemplate, error: checkError } = await supabase
        .from('templates')
        .select('user_id')
        .eq('id', id)
        .single();
      
      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return next(new AppError('Template not found', 404));
        }
        return next(new AppError(checkError.message, 500));
      }
      
      if (existingTemplate.user_id !== user_id) {
        return next(new AppError('You do not have permission to update this template', 403));
      }
      
      // Update the template
      const { data: template, error } = await supabase
        .from('templates')
        .update({
          title,
          description,
          is_public,
          tags: tags || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return next(new AppError(error.message, 500));
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