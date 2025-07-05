// src/hooks/useMarketplace.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';

export const useMarketplace = () => {
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
  const [favorites, setFavorites] = useState([]);
  
  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs for debouncing
  const searchTimeoutRef = useRef(null);
  const locationTimeoutRef = useRef(null);
  const apiCallTimeoutRef = useRef(null);
  const lastApiCallParamsRef = useRef('');

  // Load user location
  const loadUserLocation = useCallback(async () => {
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
  }, [user]);

  // Load listings with current filters
  const loadListings = useCallback(async () => {
    try {
      const currentParams = JSON.stringify({
        ...filters,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      if (currentParams === lastApiCallParamsRef.current) {
        return;
      }
      
      lastApiCallParamsRef.current = currentParams;
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

      Object.keys(currentFilters).forEach(key => 
        currentFilters[key] === undefined && delete currentFilters[key]
      );
      
      const data = await apiClient.getListings(currentFilters);
      
      if (data !== null && data !== undefined) {
        setListings(data || []);
        setFilteredListings(data || []);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      if (listings.length === 0) {
        toast.error('Failed to load listings');
      }
    } finally {
      setLoading(false);
    }
  }, [filters, listings.length, toast]);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    try {
      const favoritesData = await apiClient.getFavorites();
      setFavorites(favoritesData.map(fav => fav.listing_id) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (listingId) => {
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
  }, [user, favorites, toast]);

  return {
    // State
    listings,
    filteredListings,
    userLocation,
    filters,
    loading,
    favorites,
    searchInput,
    locationInput,
    locationSuggestions,
    showLocationSuggestions,
    isSearching,
    
    // Setters
    setFilters,
    setSearchInput,
    setLocationInput,
    setLocationSuggestions,
    setShowLocationSuggestions,
    setIsSearching,
    
    // Functions
    loadUserLocation,
    loadListings,
    loadFavorites,
    toggleFavorite,
    
    // Refs
    searchTimeoutRef,
    locationTimeoutRef,
    apiCallTimeoutRef,
    lastApiCallParamsRef
  };
};
