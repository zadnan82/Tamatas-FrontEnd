import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navigation from './Navigation';
import PublicHeader from './PublicHeader';

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicHeader />
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;