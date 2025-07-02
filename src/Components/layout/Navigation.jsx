import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  ShoppingBag, 
  MessageSquare, 
  User as UserIcon,
  Plus,
  Heart,
  MessageCircleQuestion,
  LogOut,
  Flame,
  Menu,
  X,
  Bell,
  Settings
} from 'lucide-react';
import Button from '../ui/Button';

// Tamatas logo component
const TamatasLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex items-center justify-center shadow-lg`}>
      <span className="text-white font-bold text-sm">🍅</span>
    </div>
  );
};

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      color: 'from-orange-400 to-red-400'
    },
    { 
      name: 'Feeds', 
      icon: Flame, 
      path: '/feeds',
      color: 'from-red-400 to-pink-400',
      badge: 'Hot'
    },
    { 
      name: 'Marketplace', 
      icon: ShoppingBag, 
      path: '/marketplace',
      color: 'from-blue-400 to-cyan-400'
    },
    { 
      name: 'Favorites', 
      icon: Heart, 
      path: '/favorites',
      color: 'from-pink-400 to-red-400'
    },
    { 
      name: 'Messages', 
      icon: MessageSquare, 
      path: '/messages',
      color: 'from-cyan-400 to-blue-400',
      count: 3
    },
    { 
      name: 'Forum', 
      icon: MessageCircleQuestion, 
      path: '/forum',
      color: 'from-purple-400 to-blue-400'
    },
    { 
      name: 'Profile', 
      icon: UserIcon, 
      path: '/profile',
      color: 'from-green-400 to-cyan-400'
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar - Force show on desktop */}
      {isDesktop && (
        <div className="flex w-64 flex-col fixed inset-y-0 bg-white/90 backdrop-blur-xl border-r border-gray-100 shadow-lg z-30">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-gray-100">
            <TamatasLogo size="lg" />
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Tamatas
              </h2>
              <p className="text-xs text-gray-500 font-medium">Fresh Local Exchange</p>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-[1.02]` 
                      : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:scale-[1.01]'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all
                    ${isActive 
                      ? 'bg-white/20' 
                      : `bg-gradient-to-r ${item.color}`
                    }
                  `}>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white'}`} />
                  </div>
                  
                  <span className="font-medium text-sm flex-1">{item.name}</span>
                  
                  {item.count && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {item.count}
                    </span>
                  )}
                  
                  {item.badge && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            <div className="pt-4">
              <Button 
                variant="primary" 
                fullWidth
                icon={<Plus />}
                onClick={() => window.location.href = '/create-listing'}
              >
                Create Listing
              </Button>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-gray-800">
                  {user?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="xs"
                icon={<Settings />}
                onClick={() => window.location.href = '/profile'}
                className="opacity-70 hover:opacity-100"
              />
            </div>
            
            <Button 
              variant="danger" 
              size="sm"
              fullWidth
              icon={<LogOut />}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Header - Only show on mobile */}
      {!isDesktop && (
        <div className="bg-white/90 backdrop-blur-xl border-b border-orange-100 px-4 py-3 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TamatasLogo size="md" />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  Tamatas
                </h1>
                <p className="text-xs text-gray-500 font-medium">Fresh Local Exchange</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              {/* User Avatar */}
              <Link to="/profile" className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </Link>
              
              {/* Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay - Only show on mobile */}
      {!isDesktop && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-80 bg-white/95 backdrop-blur-xl border-l border-gray-100 shadow-2xl">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50">
              <div className="flex items-center gap-3">
                <TamatasLogo size="md" />
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    Tamatas
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">Fresh Local Exchange</p>
                </div>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 hover:text-orange-600 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-all
                      ${isActive 
                        ? 'bg-white/20' 
                        : `bg-gradient-to-r ${item.color}`
                      }
                    `}>
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white'}`} />
                    </div>
                    
                    <span className="font-medium text-sm flex-1">{item.name}</span>
                    
                    {item.count && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        {item.count}
                      </span>
                    )}
                    
                    {item.badge && (
                      <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              
              <div className="pt-4">
                <Button 
                  variant="primary" 
                  fullWidth
                  icon={<Plus />}
                  onClick={() => {
                    window.location.href = '/create-listing';
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Create Listing
                </Button>
              </div>
            </nav>

            {/* Mobile User Section */}
            <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-gray-800">
                    {user?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="xs"
                  icon={<Settings />}
                  onClick={() => {
                    window.location.href = '/profile';
                    setIsMobileMenuOpen(false);
                  }}
                />
              </div>
              
              <Button 
                variant="danger" 
                size="sm"
                fullWidth
                icon={<LogOut />}
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;