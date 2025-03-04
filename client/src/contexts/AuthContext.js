import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { supabase } from '../lib/supabase';
import authService from '../services/authService';
import { toast } from 'react-hot-toast';
import { setUser, clearUser } from '../store/slices/authSlice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  // Function to fetch profile data and merge it with the user object
  const fetchAndMergeProfileData = async (authUser) => {
    if (!authUser) return null;
    
    try {
      console.log('Fetching profile data for user:', authUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile data:', error.message);
        return authUser;
      }
      
      if (!profile) {
        console.warn('No profile found for user:', authUser.id);
        return authUser;
      }
      
      console.log('Profile data fetched successfully:', profile);
      console.log('User role:', profile.role);
      
      // Merge auth user data with profile data
      const mergedUser = { ...authUser, ...profile };
      return mergedUser;
    } catch (err) {
      console.error('Error in fetchAndMergeProfileData:', err);
      return authUser;
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        
        // If we have a user, fetch their profile data and merge it
        if (data.session?.user) {
          const fullUser = await fetchAndMergeProfileData(data.session.user);
          setUserState(fullUser);
          
          // Update Redux store
          dispatch(setUser(fullUser));
        } else {
          setUserState(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        
        // If we have a user, fetch their profile data and merge it
        if (session?.user) {
          const fullUser = await fetchAndMergeProfileData(session.user);
          setUserState(fullUser);
          
          // Update Redux store
          dispatch(setUser(fullUser));
        } else {
          setUserState(null);
          dispatch(clearUser());
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [dispatch]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { user: authUser } = await authService.signIn(email, password);
      
      // Fetch profile data and merge it with the user object
      if (authUser) {
        const fullUser = await fetchAndMergeProfileData(authUser);
        return { success: true, user: fullUser };
      }
      
      return { success: true, user: authUser };
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting registration process with:', { email, name });
      
      if (!email || !password) {
        const errorMsg = 'Email and password are required';
        console.error(errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      const metadata = { name };
      
      try {
        console.log('Calling authService.signUp with:', { email, metadata });
        const result = await authService.signUp(email, password, metadata);
        
        if (!result || !result.user) {
          console.error('No user returned from authService.signUp');
          throw new Error('Registration failed: No user data returned');
        }
        
        console.log('Registration successful, user:', result.user?.id);
        toast.success('Registration successful! Please check your email to confirm your account.');
        return { success: true, user: result.user };
      } catch (serviceError) {
        console.error('Auth service error:', serviceError);
        throw serviceError;
      }
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      setError(error.message);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message;
      
      if (error.message.includes('duplicate key') || error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.message.includes('weak password')) {
        errorMessage = 'Please use a stronger password. It should be at least 6 characters long.';
      } else if (error.message.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message.includes('Database error')) {
        errorMessage = 'There was a problem creating your account. Please try again later.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      
      setUserState(null);
      setSession(null);
      dispatch(clearUser());
      toast.success('Logged out successfully');
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setLoading(true);
      await authService.resetPassword(email);
      
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (password) => {
    try {
      setLoading(true);
      await authService.updatePassword(password);
      
      toast.success('Password updated successfully');
      return { success: true };
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 