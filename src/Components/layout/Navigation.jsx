import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/button';
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
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Feeds', icon: Flame, path: '/feeds' },
    { name: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { name: 'Favorites', icon: Heart, path: '/favorites' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Forum', icon: MessageCircleQuestion, path: '/forum' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-gray-900">Fresh Trade</h2>
            <p className="text-xs text-green-600">Local Food Exchange</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                location.pathname === item.path
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="mt-8">
          <Link to="/create-listing">
            <Button className="w-full flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Listing
            </Button>
          </Link>
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={logout} 
          className="w-full justify-start text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Navigation;