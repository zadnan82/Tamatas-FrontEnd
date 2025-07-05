// src/components/marketplace/MarketplaceHeader.jsx
import React from 'react';
import { Grid, List, Map } from 'lucide-react';

const MarketplaceHeader = ({ userLocation, viewMode, setViewMode }) => {
  return (
    <div className="clay-card p-3 sm:p-4 mb-4 bg-gradient-to-br from-white/80 to-white/60">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold mb-1 text-gray-900">Fresh Marketplace</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Discover fresh produce from local farmers and gardeners
            {userLocation?.location?.city && ` • ${userLocation.location.city}, ${userLocation.location.country}`}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 border border-gray-200 rounded-lg ${
              viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 border border-gray-200 rounded-lg ${
              viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 border border-gray-200 rounded-lg ${
              viewMode === 'map' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;