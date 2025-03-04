// Add this to your templateService.js file

// Helper function to handle both author_id and user_id
const getAuthorId = (template) => {
  return template.user_id || template.author_id;
};

// Helper function to check if user is the author
const isAuthor = (template, userId) => {
  return (template.user_id === userId) || (template.author_id === userId);
};

// Use these helpers in your component code:
// Example:
// if (isAuthor(template, user.id)) {
//   // User is the author
// } 