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

/**
 * Get the author information from a template
 * @param {Object} template - The template object
 * @returns {Object} - The author object with id and name
 */
export const getTemplateAuthor = (template) => {
  if (!template) return { id: null, name: 'Unknown' };
  
  // If the template has an author property, use it
  if (template.author) return template.author;
  
  // If the template has a profiles property, use it
  if (template.profiles) {
    return {
      id: template.profiles.id,
      name: template.profiles.name || 'Unknown User'
    };
  }
  
  // Fallback to user_id
  return {
    id: template.user_id,
    name: 'Unknown User'
  };
}; 