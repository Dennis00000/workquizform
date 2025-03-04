const { v4: uuidv4 } = require('uuid');

const templates = [
  {
    id: uuidv4(),
    title: 'Customer Feedback Survey',
    description: 'Gather feedback about our services',
    topic: 'Education',
    is_public: true,
    questions: [
      {
        title: 'How satisfied are you with our service?',
        type: 'number',
        validation: { min: 1, max: 5 },
        show_in_table: true
      },
      {
        title: 'What could we improve?',
        type: 'text',
        show_in_table: false
      }
    ],
    tags: ['feedback', 'customer', 'service']
  }
  // Add more templates...
];

module.exports = templates; 