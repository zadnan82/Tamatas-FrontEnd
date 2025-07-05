// src/components/marketplace/ListingsList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import ListingCard from './ListingCard';

const ListingsList = ({ listings, favorites, hoveredListing, onToggleFavorite, onClearFilters, user }) => {
  if (listings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-base font-semibold mb-2 text-gray-900">No listings found</h3>
        <p className="text-gray-600 mb-4 text-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <button 
          onClick={onClearFilters}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {listings.map(listing => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
          compact={true}
          highlighted={hoveredListing?.id === listing.id}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default ListingsList;
 