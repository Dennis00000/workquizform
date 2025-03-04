import BaseApiService from './baseApi';
import { supabase } from '../../lib/supabase';

class AuthApiService extends BaseApiService {
  constructor() {
    super('auth');
  }

  async login(email, password) {
    try {
      const { user, session, error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
      return { user, session };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async register(email, password, userData = {}) {
    try {
      const { user, session, error } = await supabase.auth.signUp(
        { email, password },
        { data: userData }
      );
      if (error) throw error;
      return { user, session };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async updatePassword(password) {
    try {
      const { error } = await supabase.auth.update({ password });
      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const user = supabase.auth.user();
      return user;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getSession() {
    try {
      const session = supabase.auth.session();
      return session;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

export default new AuthApiService(); 