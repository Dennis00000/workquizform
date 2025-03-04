// Mock data for development
const mockTemplates = [
  {
    id: '1',
    title: 'Customer Satisfaction Survey',
    description: 'A simple survey to gather customer feedback',
    author: 'John Doe',
    created_at: '2023-05-15T10:30:00Z',
    updated_at: '2023-05-15T10:30:00Z',
    tags: ['survey', 'customer', 'feedback'],
    likes: 42,
    views: 156,
    is_public: true
  },
  {
    id: '2',
    title: 'Employee Onboarding Form',
    description: 'Form for new employee information',
    author: 'Jane Smith',
    created_at: '2023-05-10T14:20:00Z',
    updated_at: '2023-05-12T09:15:00Z',
    tags: ['hr', 'onboarding', 'employee'],
    likes: 28,
    views: 94,
    is_public: true
  },
  {
    id: '3',
    title: 'Event Registration',
    description: 'Registration form for company events',
    author: 'Mike Johnson',
    created_at: '2023-05-05T11:45:00Z',
    updated_at: '2023-05-05T11:45:00Z',
    tags: ['event', 'registration', 'company'],
    likes: 35,
    views: 112,
    is_public: true
  }
];

// Mock API service
class MockApiService {
  // Get popular templates
  async getPopularTemplates() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ templates: mockTemplates.sort((a, b) => b.likes - a.likes) });
      }, 500);
    });
  }

  // Get latest templates
  async getLatestTemplates() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          templates: mockTemplates.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          ) 
        });
      }, 500);
    });
  }

  // Get template by ID
  async getTemplateById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const template = mockTemplates.find(t => t.id === id);
        if (template) {
          resolve({ template });
        } else {
          reject(new Error('Template not found'));
        }
      }, 500);
    });
  }

  // Search templates
  async searchTemplates(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockTemplates.filter(t => 
          t.title.toLowerCase().includes(query.toLowerCase()) || 
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        resolve({ templates: results });
      }, 500);
    });
  }
}

export const mockApi = new MockApiService();
export default mockApi; 