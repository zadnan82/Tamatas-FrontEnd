// src/components/AuthDebug.jsx - Temporary debug component

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../config/api';

const AuthDebug = () => {
  const { user, debugAuth } = useAuth();
  const [testResults, setTestResults] = useState([]);

  const addResult = (test, success, message) => {
    setTestResults(prev => [...prev, { test, success, message, timestamp: new Date() }]);
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8001/health');
      const data = await response.json();
      addResult('Backend Health', true, `Backend responding: ${data.status}`);
    } catch (error) {
      addResult('Backend Health', false, `Backend unreachable: ${error.message}`);
    }
  };

  const testLocationEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:8001/location/test');
      const data = await response.json();
      addResult('Location Services', true, `Location services: ${data.status}`);
    } catch (error) {
      addResult('Location Services', false, `Location services failed: ${error.message}`);
    }
  };

  const testRegistration = async () => {
    const testUserData = {
      email: 'test@example.com',
      password: 'testpass123',
      full_name: 'Test User',
      location: {
        country: 'United States',
        city: 'New York',
        state: 'New York'
      },
      location_precision: 'city',
      search_radius: 25
    };

    try {
      // First try to register (might fail if user exists)
      const response = await apiClient.register(testUserData);
      addResult('Test Registration', true, 'Registration successful');
    } catch (error) {
      if (error.message.includes('already registered')) {
        addResult('Test Registration', true, 'User already exists (expected)');
      } else {
        addResult('Test Registration', false, `Registration failed: ${error.message}`);
      }
    }
  };

  const testLogin = async () => {
    try {
      const response = await apiClient.login('farmer@example.com', 'password123');
      addResult('Test Login', true, 'Demo login successful');
    } catch (error) {
      addResult('Test Login', false, `Login failed: ${error.message}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Auth Debug Panel</h3>
        <button 
          onClick={clearResults}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>

      {/* Current Auth State */}
      <div className="mb-4 p-2 bg-gray-50 rounded text-xs">
        <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
        <p><strong>Token:</strong> {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
        <p><strong>Location:</strong> {user?.location ? `${user.location.city}, ${user.location.country}` : 'Not set'}</p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button 
          onClick={testBackendConnection}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          Test Backend
        </button>
        <button 
          onClick={testLocationEndpoint}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
        >
          Test Location
        </button>
        <button 
          onClick={testRegistration}
          className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
        >
          Test Register
        </button>
        <button 
          onClick={testLogin}
          className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
        >
          Test Login
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-1">
        {testResults.slice(-5).map((result, index) => (
          <div 
            key={index}
            className={`p-2 rounded text-xs ${
              result.success 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{result.test}</span>
              <span className="text-xs opacity-70">
                {result.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1">{result.message}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-200">
        <button 
          onClick={debugAuth}
          className="w-full px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
        >
          Console Debug
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;