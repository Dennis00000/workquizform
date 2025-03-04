import api from './api';

class UserService {
  async getProfile() {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await api.post('/users/change-password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async searchUsers(query) {
    try {
      const response = await api.get('/users/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService(); 