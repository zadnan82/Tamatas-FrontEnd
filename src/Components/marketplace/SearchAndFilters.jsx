// src/components/marketplace/SearchAndFilters.jsx - OPTIMIZED VERSION
import React from 'react';
import { Search, MapPin, X, SlidersHorizontal, Loader2 } from 'lucide-react';

const SearchAndFilters = ({
  searchInput,
  locationInput,
  locationSuggestions,
  showLocationSuggestions,
  isSearching,
  isLoadingSuggestions, // NEW: show loading state for location suggestions
  onSearchInputChange,
  onLocationInputChange,
  onLocationSelect,
  onLocationFocus,
  onLocationBlur,
  onClearSearch,
  onClearLocation,
  onToggleFilters,
  onSearchSubmit
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  const hasSearchTerms = searchInput.trim() || locationInput.trim();

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
      {/* Item Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <input
          type="text"
          placeholder="Search for fresh produce, herbs, vegetables..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full text-sm p-2.5 pl-10 pr-10 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors"
        />
        {searchInput && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Location Search Input */}
      <div className="relative w-full sm:w-64">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
        <input
          type="text"
          placeholder="Search area: Stockholm, Malmö..."
          value={locationInput}
          onChange={(e) => onLocationInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={onLocationFocus}
          onBlur={onLocationBlur}
          className="w-full text-sm p-2.5 pl-10 pr-8 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
        />
        
        {/* Loading indicator for location suggestions */}
        {isLoadingSuggestions ? (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          </div>
        ) : locationInput ? (
          <button
            onClick={onClearLocation}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear location"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        
        {/* Location Suggestions Dropdown */}
        {showLocationSuggestions && locationSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
            {locationSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onLocationSelect(suggestion)}
                onMouseDown={(e) => e.preventDefault()}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 group-hover:text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.city}
                      {suggestion.state && `, ${suggestion.state}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.country}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={onSearchSubmit}
        disabled={isSearching}
        className={`px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all
          ${hasSearchTerms 
            ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 shadow-md' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
          ${isSearching ? 'opacity-75 cursor-not-allowed' : ''}
        `}
        title={hasSearchTerms ? 'Search listings' : 'Enter search terms to search'}
      >
        {isSearching ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            Search
          </>
        )}
      </button>

      {/* Mobile Filter Toggle */}
      <button
        onClick={onToggleFilters}
        className="lg:hidden px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
        title="Show filters"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-sm">Filters</span>
      </button>
    </div>
  );
};

export default SearchAndFilters;