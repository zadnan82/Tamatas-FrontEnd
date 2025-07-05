// src/components/marketplace/ResultsInfo.jsx - IMPROVED VERSION
import React from 'react';
import { MapPin, Filter, X } from 'lucide-react';

const ResultsInfo = ({ filteredListings, filters, userLocation, viewMode, onClearFilters }) => {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sort_by' && value === 'created_date') return false;
    if (key === 'sort_order' && value === 'desc') return false;
    if (key === 'radius' && value === 25) return false;
    if (key === 'price_range' && value === 'all') return false;
    return value !== 'all' && value !== '' && value !== false;
  });

  const getResultText = () => {
    const count = filteredListings.length;
    const itemText = count === 1 ? 'listing' : 'listings';
    
    if (count === 0) {
      return `No ${itemText} found`;
    }
    
    return `${count} ${itemText} found`;
  };

  const getSearchContext = () => {
    const contexts = [];
    
    if (filters.search) {
      contexts.push(`for "${filters.search}"`);
    }
    
    if (filters.location) {
      contexts.push(`in ${filters.location}`);
    } else if (filters.near_me && userLocation?.search_radius) {
      contexts.push(`within ${userLocation.search_radius} miles of your location`);
    }
    
    if (filters.category !== 'all') {
      contexts.push(`in ${filters.category}`);
    }
    
    if (filters.listing_type !== 'all') {
      const typeLabels = {
        'for_sale': 'for sale',
        'give_away': 'free/give away',
        'looking_for': 'wanted/looking for'
      };
      contexts.push(`(${typeLabels[filters.listing_type] || filters.listing_type})`);
    }
    
    if (filters.organic_only) {
      contexts.push('(organic only)');
    }
    
    return contexts.join(' ');
  };

  const getActiveFilterTags = () => {
    const tags = [];
    
    if (filters.search) {
      tags.push({
        label: `Search: "${filters.search}"`,
        type: 'search',
        color: 'blue'
      });
    }
    
    if (filters.location) {
      tags.push({
        label: `📍 ${filters.location}`,
        type: 'location',
        color: 'purple'
      });
    }
    
    if (filters.near_me) {
      tags.push({
        label: `📍 Near Me (${filters.radius}mi)`,
        type: 'near_me',
        color: 'green'
      });
    }
    
    if (filters.category !== 'all') {
      tags.push({
        label: filters.category,
        type: 'category',
        color: 'orange'
      });
    }
    
    if (filters.listing_type !== 'all') {
      const typeLabels = {
        'for_sale': 'For Sale',
        'give_away': 'Give Away',
        'looking_for': 'Looking For'
      };
      tags.push({
        label: typeLabels[filters.listing_type] || filters.listing_type,
        type: 'listing_type',
        color: 'indigo'
      });
    }
    
    if (filters.organic_only) {
      tags.push({
        label: 'Organic Only',
        type: 'organic',
        color: 'emerald'
      });
    }
    
    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  return (
    <div className="clay-card p-3 mb-4 bg-white/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Results Count and Context */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900">
              {getResultText()}
            </p>
            {filteredListings.length === 0 && hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            )}
          </div>
          
          {getSearchContext() && (
            <p className="text-xs text-gray-600">
              {getSearchContext()}
            </p>
          )}
          
          {viewMode === 'map' && filteredListings.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Click map markers for details
            </p>
          )}
        </div>
        
        {/* Active Filter Tags */}
        {activeFilterTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activeFilterTags.map((tag, index) => {
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-800',
                purple: 'bg-purple-100 text-purple-800',
                green: 'bg-green-100 text-green-800',
                orange: 'bg-orange-100 text-orange-800',
                indigo: 'bg-indigo-100 text-indigo-800',
                emerald: 'bg-emerald-100 text-emerald-800'
              };
              
              return (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[tag.color] || 'bg-gray-100 text-gray-800'}`}
                >
                  {tag.label}
                </span>
              );
            })}
            
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
                title="Clear all filters"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* No Results Help */}
      {filteredListings.length === 0 && hasActiveFilters && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            <strong>No listings match your criteria.</strong> Try:
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Expanding your search area</li>
            <li>• Using broader search terms</li>
            <li>• Removing some filters</li>
            <li>• Checking different categories</li>
          </ul>
        </div>
      )}
      
      {/* Empty State for No Filters */}
      {filteredListings.length === 0 && !hasActiveFilters && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Welcome to the marketplace!</strong> 
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Use the search bar above to find fresh produce, or browse by category using the filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsInfo;