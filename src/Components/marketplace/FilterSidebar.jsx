import React from 'react';
import { X, Navigation, Leaf } from 'lucide-react';
import MarketplaceStats from './MarketplaceStats';

const FilterSidebar = ({
  filters,
  categories,
  userLocation,
  showFilters,
  listings,
  onFilterChange,
  onNearMeToggle,
  onClearFilters,
  onCloseFilters
}) => {
  return (
    <>
      <div className={`clay-card p-3 sm:p-4 bg-white/60 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearFilters}
              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              Clear All
            </button>
            <button
              onClick={onCloseFilters}
              className="p-1 rounded-lg lg:hidden text-gray-600 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Near Me Toggle */}
          {userLocation?.latitude && userLocation?.longitude && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.near_me}
                  onChange={(e) => onNearMeToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <Navigation className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Near Me</span>
                  <p className="text-xs text-gray-500">
                    Show listings within {filters.radius} miles of your location
                  </p>
                </div>
              </label>
              
              {filters.near_me && (
                <div className="mt-2">
                  <label className="block text-xs font-medium mb-1 text-gray-700">
                    Search Radius: {filters.radius} miles
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={filters.radius}
                    onChange={(e) => onFilterChange({ radius: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5mi</span>
                    <span>100mi</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Category</label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          {/* Listing Type Filter */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Listing Type</label>
            <select
              value={filters.listing_type}
              onChange={(e) => onFilterChange({ listing_type: e.target.value })}
              className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="all">All Types</option>
              <option value="for_sale">🛒 For Sale</option>
              <option value="looking_for">🔍 Looking For</option>
              <option value="give_away">🎁 Give Away (FREE)</option>
            </select>
          </div>
          
          {/* Price Range Filter */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Price Range</label>
            <select
              value={filters.price_range}
              onChange={(e) => onFilterChange({ price_range: e.target.value })}
              className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="all">Any Price</option>
              <option value="free">FREE (Give Away)</option>
              <option value="0-5">$0 - $5</option>
              <option value="5-10">$5 - $10</option>
              <option value="10-20">$10 - $20</option>
              <option value="20+">$20+</option>
            </select>
          </div>
          
          {/* Organic Only Checkbox */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.organic_only}
                onChange={(e) => onFilterChange({ organic_only: e.target.checked })}
                className="w-3 h-3 rounded border-gray-300"
              />
              <Leaf className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-gray-700">Organic Only</span>
            </label>
          </div>
          
          {/* Sort By Filter */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-700">Sort By</label>
            <select
              value={filters.sort_by}
              onChange={(e) => onFilterChange({ sort_by: e.target.value })}
              className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="created_date">Most Recent</option>
              <option value="view_count">Most Popular</option>
              <option value="price">Price: Low to High</option>
              {filters.near_me && <option value="distance">Nearest First</option>}
            </select>
          </div>
        </div>
      </div>
      
      {/* Marketplace Stats */}
      <MarketplaceStats listings={listings} />
    </>
  );
};

export default FilterSidebar;