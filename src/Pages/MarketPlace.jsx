// src/Pages/MarketPlace.jsx - OPTIMIZED VERSION with debounced search
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';

// Import components
import MarketplaceHeader from '../components/marketplace/MarketplaceHeader';
import SearchAndFilters from '../components/marketplace/SearchAndFilters';
import ResultsInfo from '../components/marketplace/ResultsInfo';
import FilterSidebar from '../components/marketplace/FilterSidebar';
import ListingsGrid from '../components/marketplace/ListingsGrid';
import ListingsList from '../components/marketplace/ListingsList';
import MapView from '../components/marketplace/MapView';
import { categories } from '../data/categories';

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Main state
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    listing_type: 'all',
    location: '',
    organic_only: false,
    near_me: false,
    radius: 25,
    price_range: 'all',
    sort_by: 'created_date',
    sort_order: 'desc'
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [hoveredListing, setHoveredListing] = useState(null);
  
  // Search state - OPTIMIZED with debouncing
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Refs for debouncing
  const locationSearchTimeout = useRef(null);
  const abortController = useRef(null);

  // Load initial data
  useEffect(() => {
    loadUserLocation();
    loadListings();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // Trigger search on filter changes (excluding search/location inputs)
  useEffect(() => {
    loadListings();
  }, [
    filters.category,
    filters.listing_type, 
    filters.organic_only,
    filters.near_me,
    filters.radius,
    filters.sort_by,
    filters.sort_order,
    filters.search,    // Only when search button clicked
    filters.location   // Only when search button clicked
  ]);

  // API functions
  const loadUserLocation = async () => {
    if (!user) return;
    
    try {
      const locationData = await apiClient.getUserLocation();
      setUserLocation(locationData);
      
      if (locationData?.search_radius) {
        setFilters(prev => ({ ...prev, radius: locationData.search_radius }));
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  const loadListings = async () => {
    try {
      setLoading(true);
      
      const currentFilters = {
        skip: 0,
        limit: 100,
        category: filters.category !== 'all' ? filters.category : undefined,
        listing_type: filters.listing_type !== 'all' ? filters.listing_type : undefined,
        search: filters.search || undefined,
        location: filters.location || undefined,
        organic_only: filters.organic_only || undefined,
        near_me: filters.near_me || undefined,
        radius: filters.radius || undefined,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order
      };

      // Remove undefined values
      Object.keys(currentFilters).forEach(key => 
        currentFilters[key] === undefined && delete currentFilters[key]
      );
      
      console.log('🔍 Loading listings with filters:', currentFilters);
      
      const data = await apiClient.getListings(currentFilters);
      
      if (data !== null && data !== undefined) {
        setListings(data || []);
        setFilteredListings(data || []);
        console.log(`✅ Loaded ${data?.length || 0} listings`);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      if (listings.length === 0) {
        toast.error('Failed to load listings');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesData = await apiClient.getFavorites();
      setFavorites(favoritesData.map(fav => fav.listing_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // OPTIMIZED location suggestions with debouncing
  const loadLocationSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      setIsLoadingSuggestions(false);
      return;
    }

    // Cancel previous request if still pending
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      setIsLoadingSuggestions(true);
      console.log(`🌍 Searching locations for: "${query}"`);
      
      const suggestions = await apiClient.searchLocations(query, 5);
      
      if (suggestions && suggestions.length > 0) {
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(true);
        console.log(`✅ Found ${suggestions.length} location suggestions`);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading location suggestions:', error);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // OPTIMIZED search input handlers
  const handleSearchInputChange = (value) => {
    setSearchInput(value);
    // No automatic search - wait for button click
  };

  const handleLocationInputChange = (value) => {
    setLocationInput(value);
    
    // Clear previous timeout
    if (locationSearchTimeout.current) {
      clearTimeout(locationSearchTimeout.current);
    }
    
    // Debounce location search by 300ms
    locationSearchTimeout.current = setTimeout(() => {
      if (value.length >= 2) {
        loadLocationSuggestions(value);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 300);
  };

  // Single search function for both inputs
  const handleSearchSubmit = () => {
    setIsSearching(true);
    
    console.log(`🔍 Search submitted - Search: "${searchInput}", Location: "${locationInput}"`);
    
    // Update both search and location at the same time
    setFilters(prev => ({
      ...prev,
      search: searchInput.trim(),
      location: locationInput.trim(),
      near_me: false  // Disable near me when searching specific location
    }));
    
    setShowLocationSuggestions(false);
    
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  const handleLocationSelect = (suggestion) => {
    const locationStr = `${suggestion.city}, ${suggestion.country}`;
    setLocationInput(locationStr);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
    console.log(`📍 Location selected: ${locationStr}`);
  };

  const handleNearMeToggle = (enabled) => {
    if (enabled && (!userLocation?.latitude || !userLocation?.longitude)) {
      toast.error('Please set your location in your profile to use "Near Me" search');
      return;
    }
    
    console.log(`📍 Near Me ${enabled ? 'enabled' : 'disabled'}`);
    setFilters(prev => ({ ...prev, near_me: enabled }));
  };

  const handleFilterChange = (newFilters) => {
    console.log('🔧 Filters changed:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    
    const defaultFilters = {
      category: 'all',
      search: '',
      listing_type: 'all',
      location: '',
      organic_only: false,
      near_me: false,
      radius: userLocation?.search_radius || 25,
      price_range: 'all',
      sort_by: 'created_date',
      sort_order: 'desc'
    };
    
    setSearchInput('');
    setLocationInput('');
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setFilters(defaultFilters);
  };

  const toggleFavorite = async (listingId) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      const isFavorited = favorites.includes(listingId);
      if (isFavorited) {
        await apiClient.removeFavorite(listingId);
        setFavorites(prev => prev.filter(id => id !== listingId));
        toast.success('Removed from favorites');
      } else {
        await apiClient.addFavorite(listingId);
        setFavorites(prev => [...prev, listingId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleMapListingClick = (listing) => {
    window.location.href = `/listing/${listing.id}`;
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (locationSearchTimeout.current) {
        clearTimeout(locationSearchTimeout.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        <div className="clay-card p-6 text-center">
          <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading fresh produce...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6">
      {/* Header */}
      <MarketplaceHeader 
        userLocation={userLocation}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      {/* Search and Filters */}
      <SearchAndFilters
        searchInput={searchInput}
        locationInput={locationInput}
        locationSuggestions={locationSuggestions}
        showLocationSuggestions={showLocationSuggestions}
        isSearching={isSearching}
        isLoadingSuggestions={isLoadingSuggestions}
        onSearchInputChange={handleSearchInputChange}
        onLocationInputChange={handleLocationInputChange}
        onLocationSelect={handleLocationSelect}
        onLocationFocus={() => {
          if (locationSuggestions.length > 0) {
            setShowLocationSuggestions(true);
          }
        }}
        onLocationBlur={() => {
          setTimeout(() => setShowLocationSuggestions(false), 200);
        }}
        onClearSearch={() => {
          setSearchInput('');
        }}
        onClearLocation={() => {
          setLocationInput('');
          setShowLocationSuggestions(false);
        }}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Results Info */}
      <ResultsInfo
        filteredListings={filteredListings}
        filters={filters}
        userLocation={userLocation}
        viewMode={viewMode}
      />

      {viewMode === 'map' ? (
        /* Map View Layout */
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              categories={categories}
              userLocation={userLocation}
              showFilters={showFilters}
              listings={listings}
              onFilterChange={handleFilterChange}
              onNearMeToggle={handleNearMeToggle}
              onClearFilters={clearFilters}
              onCloseFilters={() => setShowFilters(false)}
            />
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="clay-card p-4 bg-white/60">
              <MapView 
                listings={filteredListings}
                userLocation={userLocation}
                onListingHover={setHoveredListing}
                onListingClick={handleMapListingClick}
              />
            </div>
            
            <div className="clay-card p-4 bg-white/60">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                Listings ({filteredListings.length})
              </h3>
              <ListingsList
                listings={filteredListings}
                favorites={favorites}
                hoveredListing={hoveredListing}
                onToggleFavorite={toggleFavorite}
                onClearFilters={clearFilters}
                user={user}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Grid/List View Layout */
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              categories={categories}
              userLocation={userLocation}
              showFilters={showFilters}
              listings={listings}
              onFilterChange={handleFilterChange}
              onNearMeToggle={handleNearMeToggle}
              onClearFilters={clearFilters}
              onCloseFilters={() => setShowFilters(false)}
            />
          </div>

          <div className="lg:col-span-3">
            {showFilters && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
                <div className="absolute right-0 top-0 h-full w-80 max-w-full">
                  <FilterSidebar
                    filters={filters}
                    categories={categories}
                    userLocation={userLocation}
                    showFilters={true}
                    listings={listings}
                    onFilterChange={handleFilterChange}
                    onNearMeToggle={handleNearMeToggle}
                    onClearFilters={clearFilters}
                    onCloseFilters={() => setShowFilters(false)}
                  />
                </div>
              </div>
            )}

            {viewMode === 'grid' ? (
              <ListingsGrid
                listings={filteredListings}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onClearFilters={clearFilters}
                user={user}
              />
            ) : (
              <ListingsList
                listings={filteredListings}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onClearFilters={clearFilters}
                user={user}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;