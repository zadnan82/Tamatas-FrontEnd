import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const PublicHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Fresh Trade</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/marketplace" className="text-gray-600 hover:text-gray-900">
              Marketplace
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;