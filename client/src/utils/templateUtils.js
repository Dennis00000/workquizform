/**
 * Safely get template data with defaults for missing values
 * @param {Object} template - The template object
 * @returns {Object} - Template with default values for missing properties
 */
export const safeTemplate = (template) => {
  if (!template) return null;
  
  return {
    ...template,
    title: template.title || '',
    description: template.description || '',
    topic: template.topic || 'Other',
    is_public: template.is_public !== undefined ? template.is_public : true,
    likes_count: template.likes_count || 0,
    comments_count: template.comments_count || 0,
    questions: template.questions || [],
    profiles: template.profiles || { name: 'Unknown User' }
  };
};

/**
 * Check if the current user is the author of a template
 * @param {Object} template - The template object
 * @param {string} userId - The current user's ID
 * @returns {boolean} - True if the user is the author
 */
export const isTemplateAuthor = (template, userId) => {
  if (!template || !userId) return false;
  return template.user_id === userId;
}; 