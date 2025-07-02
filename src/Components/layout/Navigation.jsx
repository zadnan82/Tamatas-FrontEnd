import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  ShoppingBag, 
  MessageSquare, 
  User as UserIcon,
  Plus,
  Leaf,
  Heart,
  MessageCircleQuestion,
  LogOut,
  Flame
} from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      path: '/dashboard',
      color: 'from-vibrant-orange to-vibrant-red'
    },
    { 
      name: 'Feeds', 
      icon: Flame, 
      path: '/feeds',
      color: 'from-vibrant-red to-vibrant-pink'
    },
    { 
      name: 'Marketplace', 
      icon: ShoppingBag, 
      path: '/marketplace',
      color: 'from-vibrant-blue to-vibrant-cyan'
    },
    { 
      name: 'Favorites', 
      icon: Heart, 
      path: '/favorites',
      color: 'from-vibrant-pink to-vibrant-red'
    },
    { 
      name: 'Messages', 
      icon: MessageSquare, 
      path: '/messages',
      color: 'from-vibrant-cyan to-vibrant-blue'
    },
    { 
      name: 'Forum', 
      icon: MessageCircleQuestion, 
      path: '/forum',
      color: 'from-vibrant-purple to-vibrant-blue'
    },
    { 
      name: 'Profile', 
      icon: UserIcon, 
      path: '/profile',
      color: 'from-vibrant-green to-vibrant-cyan'
    },
  ];

  return (
    <div className="w-48 clay-nav h-screen flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-vibrant-orange via-vibrant-red to-vibrant-cyan rounded-xl flex items-center justify-center clay-animate-float">
            <Leaf className="w-4 h-4 text-white drop-shadow-lg" />
          </div>
          <div>
            <h2 className="font-bold text-base clay-text-title">Fresh Trade</h2>
            <p className="text-xs text-vibrant-green font-medium">Local Exchange</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`clay-nav-item w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all relative overflow-hidden ${
                  isActive ? 'active' : ''
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${item.color.split(' ')[1]} 0%, ${item.color.split(' ')[3]} 100%)`,
                  color: 'white',
                  boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.1)'
                } : {}}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-white/20' : `bg-gradient-to-br ${item.color}`
                }`}>
                  <item.icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-white'}`} />
                </div>
                <span className="font-medium text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-4">
          <Link to="/create-listing">
            <button className="clay-button-primary w-full flex items-center gap-2 px-2 py-2 text-xs font-semibold">
              <Plus className="w-3 h-3" />
              Create Listing
            </button>
          </Link>
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-2 border-t border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-vibrant-green to-vibrant-cyan rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs truncate">
              {user?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs clay-text-soft truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="clay-button w-full justify-start text-vibrant-red hover:bg-red-50 text-xs flex items-center gap-2"
        >
          <LogOut className="w-3 h-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Navigation;