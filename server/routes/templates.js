router.get('/templates', async (req, res) => {
  try {
    const { isPublic, limit = 10, offset = 0, sortBy } = req.query;
    
    let query = supabase.from('templates').select(`
      *,
      user:user_id (
        id,
        name,
        email
      )
    `);
    
    // Apply filters
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic === 'true');
    }
    
    // Add sorting
    if (sortBy) {
      const sortOptions = JSON.parse(sortBy);
      query = query.order(sortOptions.column, { ascending: sortOptions.order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Add pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform the data to add missing fields and handle schema differences
    const transformedData = data.map(template => ({
      ...template,
      user: template.user ? {
        ...template.user,
        avatar_url: null // Add this field since it's expected by the client
      } : null,
      tags: template.tags || [],
      questions_count: 0 // Add a default value
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Make sure the search route is defined BEFORE the /:id route
router.get('/templates/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }
    
    // Search templates by title, description, or tags
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email
        )
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to add missing fields
    const transformedData = data.map(template => ({
      ...template,
      user: template.user ? {
        ...template.user,
        avatar_url: null // Add this field since it's expected by the client
      } : null,
      tags: template.tags || [],
      questions_count: 0 // Add a default value
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({ error: 'Failed to search templates' });
  }
});

// Then define the route for getting a specific template by ID
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the template
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email
        ),
        questions (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting template:', error);
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Transform the data
    const transformedData = {
      ...data,
      user: data.user ? {
        ...data.user,
        avatar_url: null
      } : null,
      tags: data.tags || [],
      questions: data.questions || []
    };
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
}); 