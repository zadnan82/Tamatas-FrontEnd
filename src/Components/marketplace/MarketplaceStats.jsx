// src/components/marketplace/MarketplaceStats.jsx
import React from 'react';

const MarketplaceStats = ({ listings }) => {
  return (
    <div className="clay-card p-3 mt-4 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:block">
      <h3 className="text-sm font-semibold mb-2 text-gray-900">Marketplace Stats</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-xs text-gray-600">Total Listings</span>
          <span className="font-semibold text-xs">{listings.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-600">🛒 For Sale</span>
          <span className="font-semibold text-xs text-green-600">
            {listings.filter(l => l.listing_type === 'for_sale').length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-600">🔍 Looking For</span>
          <span className="font-semibold text-xs text-blue-600">
            {listings.filter(l => l.listing_type === 'looking_for').length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-600">🎁 Give Away</span>
          <span className="font-semibold text-xs text-orange-600">
            {listings.filter(l => l.listing_type === 'give_away').length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-600">🌱 Organic</span>
          <span className="font-semibold text-xs text-emerald-600">
            {listings.filter(l => l.organic).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceStats;