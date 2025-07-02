import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navigation from './Navigation';
import PublicHeader from './PublicHeader';

// Layout component with proper responsive handling
const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <PublicHeader />
        <main className="px-3 sm:px-4 md:px-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <Navigation />
      {/* Main content with proper responsive spacing */}
      <main className="lg:ml-64"> {/* Only add left margin on large screens for desktop sidebar */}
        <div className="min-h-screen p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;