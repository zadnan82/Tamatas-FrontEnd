import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navigation from './Navigation';
import PublicHeader from './PublicHeader';

// Layout component with proper desktop sidebar detection
const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 overflow-hidden">
      <Navigation />
      {/* Main content with proper sidebar spacing and max-width */}
      <main className={`flex-1 overflow-auto ${isDesktop ? 'ml-64' : 'ml-0'}`}>
        <div className="min-h-full p-3 sm:p-4 lg:p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;