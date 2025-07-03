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
      console.log('🔐 Checking auth with token:', token ? 'EXISTS' : 'MISSING');
      
      if (token) {
        apiClient.setToken(token);
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
        console.log('✅ Auth check successful for user:', userData.email);
      } else {
        console.log('❌ No token found in localStorage');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
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
      console.log('🔐 Starting login for:', email);
      
      // Step 1: Call login API
      const response = await apiClient.login(email, password);
      console.log('🔐 Login API response:', response);
      
      // Step 2: Verify token was set
      const tokenAfterLogin = localStorage.getItem('auth_token');
      const apiClientToken = apiClient.token;
      
      console.log('🔐 Token in localStorage after login:', tokenAfterLogin ? 'SET' : 'MISSING');
      console.log('🔐 Token in apiClient after login:', apiClientToken ? 'SET' : 'MISSING');
      
      // Step 3: If no token, something went wrong
      if (!tokenAfterLogin || !apiClientToken) {
        console.error('❌ Login failed: No token received or stored');
        console.log('Response details:', response);
        throw new Error('Login failed: Authentication token not received');
      }
      
      // Step 4: Get user data after successful login
      console.log('🔐 Getting user data...');
      const userData = await apiClient.getCurrentUser();
      console.log('🔐 User data retrieved:', userData);
      
      setUser(userData);
      console.log('✅ Login completed successfully for:', userData.email);
      
      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Clean up on failure
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
      setUser(null);
      throw error;
    }
  };

  const register = async (email, password, full_name) => {
    try {
      console.log('🔐 Starting registration for:', email);
      
      const response = await apiClient.register({
        email,
        password,
        full_name,
        bio: '',
        phone: '',
        address: '',
        profile_image: ''
      });
      
      console.log('🔐 Registration response:', response);
      
      // Check if token was set during registration
      const tokenAfterRegister = localStorage.getItem('auth_token');
      console.log('🔐 Token after registration:', tokenAfterRegister ? 'SET' : 'MISSING');
      
      if (!tokenAfterRegister) {
        console.error('❌ Registration failed: No token received');
        throw new Error('Registration failed: Authentication token not received');
      }
      
      // Get user data after successful registration
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      console.log('✅ Registration completed successfully for:', userData.email);
      
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      // Clean up on failure
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    console.log('🔐 Logging out user:', user?.email);
    apiClient.logout();
    setUser(null);
    console.log('✅ Logout completed');
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

  // Debug function to check auth state
  const debugAuth = () => {
    console.log('=== AUTH DEBUG ===');
    console.log('User:', user);
    console.log('localStorage token:', localStorage.getItem('auth_token'));
    console.log('apiClient token:', apiClient.token);
    console.log('isAuthenticated:', !!user);
    console.log('==================');
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    debugAuth, // Add debug function
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