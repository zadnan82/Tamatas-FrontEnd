import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.setToken(token);
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      
      // Get user data after successful login
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email, password, full_name) => {
    try {
      const response = await apiClient.register({
        email,
        password,
        full_name,
        bio: '',
        phone: '',
        address: '',
        profile_image: ''
      });
      
      // Get user data after successful registration
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    // Redirect to home page
    window.location.href = '/';
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = await apiClient.updateProfile(updates);
      setUser(prevUser => ({ ...prevUser, ...updatedUser }));
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    // Additional helper methods
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.full_name || user?.email?.split('@')[0] || 'User'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};