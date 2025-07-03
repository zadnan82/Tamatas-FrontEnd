import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const PublicHeader = () => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-orange-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="Tamatas Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Tamatas
              </span>
              <p className="text-xs text-gray-500 font-medium">Fresh Local Exchange</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/marketplace" 
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Marketplace
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Contact
            </Link>
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              Menu
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
