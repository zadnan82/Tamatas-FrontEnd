// src/components/marketplace/ListingsGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import ListingCard from './ListingCard';

const ListingsGrid = ({ listings, favorites, onToggleFavorite, onClearFilters, user }) => {
  if (listings.length === 0) {
    return (
      <div className="clay-card p-6 sm:p-8 text-center bg-white/40">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-base font-semibold mb-2 text-gray-900">No listings found</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button 
            onClick={onClearFilters}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Clear Filters
          </button>
          {user && (
            <Link 
              to="/create-listing"
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Create Listing
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {listings.map(listing => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default ListingsGrid;