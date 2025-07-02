import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navigation from './Navigation';
import PublicHeader from './PublicHeader';

// Updated Layout component with Tamatas branding
const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <PublicHeader />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <Navigation />
      <main className="flex-1 overflow-auto lg:ml-64">
        <div className="min-h-full p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;