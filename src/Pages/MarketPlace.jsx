import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { 
  Search, 
  MapPin, 
  Leaf, 
  ShoppingBag, 
  MessageSquare,
  Calendar,
  Heart,
  Filter,
  Grid,
  List,
  Star,
  Eye,
  Clock,
  User,
  TrendingUp,
  SlidersHorizontal,
  X,
  Plus,
  Map,
  Navigation,
  Gift,
  UserSearch,
  DollarSign,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced custom markers for three listing types
const createCustomIcon = (listing) => {
  const getCategoryIcon = (category) => {
    const iconMap = {
      'tomatoes_peppers': '🍅',
      'herbs': '🌿',
      'berries': '🫐',
      'root_vegetables': '🥕',
      'leafy_greens': '🥬',
      'citrus_fruits': '🍊',
      'stone_fruits': '🍑',
      'tropical_fruits': '🥭',
      'apples_pears': '🍎',
      'beans_peas': '🫘',
      'squash_pumpkins': '🎃',
      'other': '🥒'
    };
    return iconMap[category] || '🥒';
  };

  // NEW: Different colors for three listing types
  const getTypeColor = (type) => {
    switch(type) {
      case 'for_sale': return '#22c55e';      // Green
      case 'looking_for': return '#3b82f6';   // Blue  
      case 'give_away': return '#f59e0b';     // Orange/Gold
      default: return '#6b7280';              // Gray
    }
  };

  const color = getTypeColor(listing.listing_type);
  const icon = getCategoryIcon(listing.category);
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        position: relative;
      ">
        ${icon}
        ${listing.listing_type === 'give_away' ? '<div style="position:absolute;top:-2px;right:-2px;background:#f59e0b;color:white;font-size:8px;padding:1px 3px;border-radius:6px;font-weight:bold;">FREE</div>' : ''}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};
 

const MapView = ({ listings, onListingHover, onListingClick, userLocation }) => {
  const mapRef = useRef(null);
  const [activePopup, setActivePopup] = useState(null);

  // Custom icon creation
  const createCustomIcon = useCallback((listing) => {
    const getCategoryIcon = (category) => {
      const iconMap = {
        'tomatoes_peppers': '🍅',
        'herbs': '🌿',
        'berries': '🫐',
        // Add other categories as needed
        'other': '🥒'
      };
      return iconMap[category] || '🥒';
    };

    const getTypeColor = (type) => {
      switch(type) {
        case 'for_sale': return '#22c55e';
        case 'looking_for': return '#3b82f6';
        case 'give_away': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    const color = getTypeColor(listing.listing_type);
    const icon = getCategoryIcon(listing.category);
    
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          position: relative;
        ">
          ${icon}
          ${listing.listing_type === 'give_away' ? 
            '<div style="position:absolute;top:-2px;right:-2px;background:#f59e0b;color:white;font-size:8px;padding:1px 3px;border-radius:6px;font-weight:bold;">FREE</div>' : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, []);

  // Filter listings with valid coordinates
  const listingsWithCoords = useMemo(() => {
    return listings.filter(listing => 
      listing.location?.latitude && listing.location?.longitude
    ).map(listing => ({
      ...listing,
      lat: parseFloat(listing.location.latitude),
      lng: parseFloat(listing.location.longitude)
    }));
  }, [listings]);

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return [userLocation.latitude, userLocation.longitude];
    }
    
    if (listingsWithCoords.length > 0) {
      const avgLat = listingsWithCoords.reduce((sum, listing) => 
        sum + listing.lat, 0) / listingsWithCoords.length;
      const avgLng = listingsWithCoords.reduce((sum, listing) => 
        sum + listing.lng, 0) / listingsWithCoords.length;
      return [avgLat, avgLng];
    }
    
    return [59.3293, 18.0686]; // Default to Stockholm
  }, [userLocation, listingsWithCoords]);

  // Calculate zoom level
  const zoomLevel = useMemo(() => {
    if (userLocation?.search_radius) {
      const radius = userLocation.search_radius;
      if (radius <= 10) return 12;
      if (radius <= 25) return 10;
      if (radius <= 50) return 9;
      return 8;
    }
    
    if (listingsWithCoords.length <= 1) return 12;
    
    const lats = listingsWithCoords.map(l => l.lat);
    const lngs = listingsWithCoords.map(l => l.lng);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange > 2) return 8;
    if (maxRange > 0.5) return 10;
    if (maxRange > 0.1) return 12;
    return 14;
  }, [userLocation, listingsWithCoords]);

  // Handle marker hover
  const handleMarkerHover = useCallback((listing, e) => {
    if (mapRef.current) {
      // Temporarily disable map movement during hover
      mapRef.current.dragging.disable();
      mapRef.current.scrollWheelZoom.disable();
      
      // Open popup and set active listing
      e.target.openPopup();
      setActivePopup(listing.id);
      onListingHover?.(listing);
    }
  }, [onListingHover]);

  // Handle marker leave
  const handleMarkerLeave = useCallback((e) => {
    if (mapRef.current) {
      // Re-enable map movement
      mapRef.current.dragging.enable();
      mapRef.current.scrollWheelZoom.enable();
      
      // Close popup and clear active listing
      e.target.closePopup();
      setActivePopup(null);
      onListingHover?.(null);
    }
  }, [onListingHover]);

  // Handle marker click
  const handleMarkerClick = useCallback((listing) => {
    onListingClick?.(listing);
  }, [onListingClick]);

  if (listingsWithCoords.length === 0) {
    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No locations to display</h3>
          <p className="text-sm text-gray-500 mb-4">
            Found {listings.length} listings but none have valid location coordinates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User location marker */}
        {userLocation?.latitude && userLocation?.longitude && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              html: `
                <div style="
                  background:#3b82f6;
                  width:20px;
                  height:20px;
                  border-radius:50%;
                  border:3px solid white;
                  box-shadow:0 2px 4px rgba(0,0,0,0.3);
                ">
                  <div style="
                    width:8px;
                    height:8px;
                    background:white;
                    border-radius:50%;
                    margin:3px;
                  "></div>
                </div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-blue-600">Your Location</p>
                <p className="text-xs text-gray-500">
                  {userLocation.location?.city && userLocation.location?.country 
                    ? `${userLocation.location.city}, ${userLocation.location.country}`
                    : 'Current location'
                  }
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Listing markers */}
        {listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.lat, listing.lng]}
            icon={createCustomIcon(listing)}
            eventHandlers={{
              mouseover: (e) => handleMarkerHover(listing, e),
              mouseout: handleMarkerLeave,
              click: () => handleMarkerClick(listing)
            }}
          >
            <Popup className="custom-popup">
              <div className="w-72 p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-1 flex-1">
                    {listing.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    listing.listing_type === 'for_sale' 
                      ? 'bg-green-500 text-white' 
                      : listing.listing_type === 'looking_for'
                      ? 'bg-blue-500 text-white'
                      : 'bg-orange-500 text-white'
                  }`}>
                    {listing.listing_type === 'for_sale' && <ShoppingBag className="w-2 h-2" />}
                    {listing.listing_type === 'looking_for' && <UserSearch className="w-2 h-2" />}
                    {listing.listing_type === 'give_away' && <Gift className="w-2 h-2" />}
                    {listing.listing_type === 'for_sale' && 'For Sale'}
                    {listing.listing_type === 'looking_for' && 'Looking For'}
                    {listing.listing_type === 'give_away' && 'FREE'}
                  </span>
                </div>

                {/* Rest of your popup content */}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">For Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Looking For</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Give Away (FREE)</span>
          </div>
          {userLocation?.latitude && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
              <span className="text-xs text-gray-600">Your Location</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Search radius indicator */}
      {userLocation?.search_radius && (
        <div className="absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-2 text-xs text-blue-800 max-w-xs z-10">
          <strong>Search Radius:</strong> {userLocation.search_radius} miles
        </div>
      )}
    </div>
  );
};
 

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);
  // NEW: Location autocomplete state
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [hoveredListing, setHoveredListing] = useState(null);
const [searchLoading, setSearchLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [isTyping, setIsTyping] = useState(false);
 const [searchInput, setSearchInput] = useState('');
const searchTimeoutRef = useRef(null);
const [locationInput, setLocationInput] = useState('');
const locationTimeoutRef = useRef(null);
const [isSearching, setIsSearching] = useState(false);


// Add this effect to handle clicks when popup is open
useEffect(() => {
  if (hoveredListing) {
    const timer = setTimeout(() => {
      setHoveredListing(null);
    }, 3000); // Auto-close after 3 seconds
    return () => clearTimeout(timer);
  }
}, [hoveredListing]);

// Handle item search input
const handleSearchChange = (value) => {
  setSearchInput(value);
  
  // Clear previous timeout
  clearTimeout(searchTimeoutRef.current);
  
  // Set new timeout (350ms delay)
  searchTimeoutRef.current = setTimeout(() => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
    setIsSearching(false);
  }, 350);
  
  setIsSearching(true);
};

// Handle location search input
const handleLocationChange = (value) => {
  setLocationInput(value);
  
  // Clear previous timeout
  clearTimeout(locationTimeoutRef.current);
  
  // Set new timeout (400ms delay)
  locationTimeoutRef.current = setTimeout(() => {
    if (value.length >= 2) {
      loadLocationSuggestions(value);
    }
    setFilters(prev => ({
      ...prev,
      location: value
    }));
  }, 400);
};

// Handle location suggestion selection
const handleLocationSelect = (suggestion) => {
  const locationStr = `${suggestion.city}, ${suggestion.country}`;
  setLocationInput(locationStr);
  setFilters(prev => ({
    ...prev,
    location: locationStr,
    near_me: false // Disable "near me" when selecting a specific location
  }));
  setShowLocationSuggestions(false);
  loadListings();
};






  // NEW: Load location suggestions
  const loadLocationSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      const suggestions = await apiClient.searchLocations(query);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } catch (error) {
      console.error('Error loading location suggestions:', error);
      setLocationSuggestions([]);
    }
  };

  
// Debounced search effect
useEffect(() => {
  const handler = setTimeout(() => {
    if (isTyping) {
      setFilters(prev => ({...prev, search: searchTerm}));
      setIsTyping(false);
    }
  }, 300); // Adjust timing as needed (300ms is good balance)

  return () => clearTimeout(handler);
}, [searchTerm, isTyping]);

// Only trigger API call when filters.search changes
useEffect(() => {
  if (filters.search !== undefined) {
    loadListings();
  }
}, [filters.search]);

  const handleLocationSearchChange = useCallback((value) => {
    // Update location immediately for UI
    setSearchLocation(value);
    setFilters(prev => ({...prev, location: value}));
  }, []);

  // Separate debounced effects for API calls
  useEffect(() => {
  const timer = setTimeout(() => {
    if (filters.search.length >= 2 || filters.search.length === 0) {
      setSearchLoading(true);
      loadListings().finally(() => setSearchLoading(false));
    }
  }, 300); // Reduced from 500ms to 300ms

  return () => clearTimeout(timer);
}, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchLocation.length >= 2) {
        loadLocationSuggestions(searchLocation);
      } else if (searchLocation.length === 0) {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchLocation]); // Only watch location changes

  // NEW: Updated categories to match backend
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tomatoes_peppers', label: 'Tomatoes & Peppers' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'berries', label: 'Berries' },
    { value: 'root_vegetables', label: 'Root Vegetables' },
    { value: 'leafy_greens', label: 'Leafy Greens' },
    { value: 'citrus_fruits', label: 'Citrus Fruits' },
    { value: 'stone_fruits', label: 'Stone Fruits' },
    { value: 'tropical_fruits', label: 'Tropical Fruits' },
    { value: 'apples_pears', label: 'Apples & Pears' },
    { value: 'beans_peas', label: 'Beans & Peas' },
    { value: 'squash_pumpkins', label: 'Squash & Pumpkins' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadUserLocation();
    loadListings();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  // Only trigger API calls when specific filters change
  useEffect(() => {
    loadListings();
  }, [
    filters.category,
    filters.listing_type, 
    filters.organic_only,
    filters.near_me,
    filters.radius,
    filters.sort_by,
    filters.sort_order
  ]);

  // Separate effect for filtering (client-side only)
  useEffect(() => {
    if (listings.length > 0) {
      filterListings();
    }
  }, [listings]);

  useEffect(() => {
  return () => {
    clearTimeout(searchTimeoutRef.current);
    clearTimeout(locationTimeoutRef.current);
  };
}, []);
  // NEW: Load user location from backend
  const loadUserLocation = async () => {
    if (!user) return;
    
    try {
      const locationData = await apiClient.getUserLocation();
      setUserLocation(locationData);
      
      // Update radius filter if user has custom radius
      if (locationData.search_radius) {
        setFilters(prev => ({ ...prev, radius: locationData.search_radius }));
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  // NEW: Enhanced listing loading with better state management
  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Use current filters state to build query
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
      
      const data = await apiClient.getListings(currentFilters);
      
      // Only update if we actually got data
      if (data !== null && data !== undefined) {
        setListings(data || []);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      // Don't show error toast on every search - only on initial load
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

  const filterListings = () => {
    // Basic filtering is now handled by the backend,
    // but we can still do client-side filtering for immediate response
    let filtered = [...listings];

    if (filters.search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location?.state?.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location?.country?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredListings(filtered);
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

  // NEW: Handle "Near Me" toggle
  const handleNearMeToggle = (enabled) => {
    if (enabled && (!userLocation?.latitude || !userLocation?.longitude)) {
      toast.error('Please set your location in your profile to use "Near Me" search');
      return;
    }
    
    const newFilters = { ...filters, near_me: enabled };
    setFilters(newFilters);
    
    // Reload with new filters
    setTimeout(() => loadListings(), 100);
  };

  const handleFilterChange = (newFilters) => {
    // Use functional update to prevent stale closures
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters, ...newFilters };
      
      // Delay the API call to next tick to ensure state is updated
      setTimeout(() => {
        loadListings();
      }, 50);
      
      return updatedFilters;
    });
  };

  const clearFilters = () => {
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
    setFilters(defaultFilters);
    setSearchLocation(''); // Clear location search
    setShowLocationSuggestions(false);
    setTimeout(() => loadListings(), 100);
  };

  const handleMapListingClick = (listing) => {
    window.location.href = `/listing/${listing.id}`;
  };

  // NEW: Enhanced ListingCard with three listing types
  const ListingCard = ({ listing, compact = false, highlighted = false }) => {
    const isFavorited = favorites.includes(listing.id);
    
    // NEW: Get listing type styling
    const getListingTypeInfo = (type) => {
      switch(type) {
        case 'for_sale':
          return {
            color: 'bg-green-500 text-white',
            icon: ShoppingBag,
            label: 'For Sale'
          };
        case 'looking_for':
          return {
            color: 'bg-blue-500 text-white',
            icon: UserSearch,
            label: 'Looking For'
          };
        case 'give_away':
          return {
            color: 'bg-orange-500 text-white',
            icon: Gift,
            label: 'FREE'
          };
        default:
          return {
            color: 'bg-gray-500 text-white',
            icon: Target,
            label: 'Unknown'
          };
      }
    };

    const typeInfo = getListingTypeInfo(listing.listing_type);
    const TypeIcon = typeInfo.icon;
    
    if (compact) {
      return (
        <div className={`clay-card p-3 bg-white/60 hover:scale-[1.01] transition-all duration-300 group ${
          highlighted ? 'ring-2 ring-orange-400 bg-orange-50/60' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
              {listing.images && listing.images[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1 sm:mb-2">
                <div className="flex-1">
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="text-sm sm:text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1 group-hover:text-orange-600"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{listing.description}</p>
                </div>
                
                {/* NEW: Price display logic for three types */}
                {listing.listing_type === 'for_sale' && listing.price && (
                  <div className="text-right ml-2">
                    <p className="font-bold text-sm sm:text-base text-green-600">${listing.price}</p>
                    <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                  </div>
                )}
                {listing.listing_type === 'give_away' && (
                  <div className="text-right ml-2">
                    <p className="font-bold text-sm sm:text-base text-orange-600">FREE</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* NEW: Enhanced type badge */}
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                    <TypeIcon className="w-2 h-2" />
                    {typeInfo.label}
                  </span>
                  
                  {listing.organic && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <Leaf className="w-2 h-2" />
                      Organic
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {/* NEW: Distance display */}
                  {listing.distance && (
                    <span className="text-xs text-gray-500 mr-1">
                      {listing.distance} miles
                    </span>
                  )}
                  
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className={`p-1 rounded-lg ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500' : ''}`} />
                  </button>
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="px-2 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg text-xs font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link to={`/listing/${listing.id}`} className="block group">
        <div className={`clay-card bg-white/60 backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300 h-full flex flex-col ${
          highlighted ? 'ring-2 ring-orange-400 bg-orange-50/60' : ''
        }`}>
          <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
            {listing.images && listing.images[0] ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            )}
            
            {/* NEW: Enhanced type badge */}
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md ${typeInfo.color}`}>
                <TypeIcon className="w-2 h-2" />
                {typeInfo.label}
              </span>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1">
              {listing.organic && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <Leaf className="w-2 h-2" />
                  Organic
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(listing.id);
                }}
                className={`p-1 rounded-lg backdrop-blur-sm ${
                  isFavorited ? 'text-red-500 bg-white/80' : 'text-gray-400 bg-white/60'
                }`}
              >
                <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500' : ''}`} />
              </button>
            </div>
            
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Eye className="w-2 h-2" />
                <span>{listing.view_count || 0}</span>
              </div>
              {/* NEW: Distance indicator */}
              {listing.distance && (
                <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <MapPin className="w-2 h-2" />
                  <span>{listing.distance}mi</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-3 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{listing.category?.replace('_', ' ')}</p>
              </div>
              
              {/* NEW: Enhanced price display */}
              {listing.listing_type === 'for_sale' && listing.price && (
                <div className="text-right ml-2">
                  <p className="font-bold text-base sm:text-lg text-green-600">${listing.price}</p>
                  <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                </div>
              )}
              {listing.listing_type === 'give_away' && (
                <div className="text-right ml-2">
                  <p className="font-bold text-base sm:text-lg text-orange-600">FREE</p>
                  <p className="text-xs text-gray-500">Give Away</p>
                </div>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{listing.description}</p>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {listing.owner?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-xs">{listing.owner?.full_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2 h-2 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">(4.0)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">
                    {listing.location?.city && listing.location?.country 
                      ? `${listing.location.city}, ${listing.location.country}`
                      : 'Location not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}</span>
                </div>
              </div>
              
              {/* NEW: Dynamic button based on listing type */}
              <button className={`w-full py-2 font-semibold flex items-center justify-center gap-2 text-xs rounded-lg ${
                listing.listing_type === 'for_sale' 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                  : listing.listing_type === 'looking_for'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                  : 'bg-gradient-to-r from-orange-400 to-amber-400 text-white'
              }`}>
                <MessageSquare className="w-3 h-3" />
                {listing.listing_type === 'for_sale' && 'Contact Seller'}
                {listing.listing_type === 'looking_for' && 'Offer Help'}
                {listing.listing_type === 'give_away' && 'Claim Free Item'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // NEW: Enhanced FilterPanel with location features
  const FilterPanel = () => (
    <div className={`clay-card p-3 sm:p-4 bg-white/60 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="p-1 rounded-lg lg:hidden text-gray-600 hover:bg-gray-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* NEW: Near Me Toggle */}
        {userLocation?.latitude && userLocation?.longitude && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.near_me}
                onChange={(e) => handleNearMeToggle(e.target.checked)}
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
                  onChange={(e) => setFilters({...filters, radius: parseInt(e.target.value)})}
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
        
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange({...filters, category: e.target.value})}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        
        {/* NEW: Enhanced listing type filter */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Listing Type</label>
          <select
            value={filters.listing_type}
            onChange={(e) => handleFilterChange({...filters, listing_type: e.target.value})}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">All Types</option>
            <option value="for_sale">🛒 For Sale</option>
            <option value="looking_for">🔍 Looking For</option>
            <option value="give_away">🎁 Give Away (FREE)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Price Range</label>
          <select
            value={filters.price_range}
            onChange={(e) => handleFilterChange({...filters, price_range: e.target.value})}
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
        
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Location</label>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="City, State, or Country"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full text-xs p-2 pl-7 border border-gray-200 rounded-lg bg-white"
            />
          </div>
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.organic_only}
              onChange={(e) => handleFilterChange({...filters, organic_only: e.target.checked})}
              className="w-3 h-3 rounded border-gray-300"
            />
            <Leaf className="w-3 h-3 text-green-500" />
            <span className="text-xs font-medium text-gray-700">Organic Only</span>
          </label>
        </div>
        
        {/* NEW: Sort by distance option */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Sort By</label>
          <select
            value={filters.sort_by}
            onChange={(e) => handleFilterChange({...filters, sort_by: e.target.value})}
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
  );

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
              className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 border border-gray-200 rounded-lg ${viewMode === 'map' ? 'bg-orange-100 text-orange-600' : 'bg-white hover:bg-gray-50'}`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Item Search Input */}
<div className="flex-1 relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
  <input
    type="text"
    placeholder="Search for fresh produce, herbs, vegetables..."
    value={searchInput}
    onChange={(e) => handleSearchChange(e.target.value)}
    className="w-full text-sm p-2.5 pl-10 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
  />
  {isSearching && (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>
  )}
</div>

{/* Location Search Input */}
<div className="relative w-full sm:w-64">
  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
  <input
    type="text"
    placeholder="Search area: Stockholm, Malmö..."
    value={locationInput}
    onChange={(e) => handleLocationChange(e.target.value)}
    onFocus={() => setShowLocationSuggestions(true)}
    onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
    className="w-full text-sm p-2.5 pl-10 pr-8 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
  />
  {locationInput && (
    <button
      onClick={() => {
        setLocationInput('');
        setFilters(prev => ({...prev, location: ''}));
        setShowLocationSuggestions(false);
      }}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      <X className="w-4 h-4" />
    </button>
  )}
  
  {/* Location Suggestions Dropdown */}
  {showLocationSuggestions && locationSuggestions.length > 0 && (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
      {locationSuggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => handleLocationSelect(suggestion)}
          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
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


      </div>

      {/* Enhanced Results Info */}
      <div className="clay-card p-2 sm:p-3 mb-4 bg-white/60">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-600">
              {filteredListings.length} listings found
              {filters.search && ` for "${filters.search}"`}
              {searchLocation && ` in ${searchLocation}`}
              {filters.near_me && userLocation?.search_radius && ` within ${userLocation.search_radius} miles of your location`}
            </p>
            {viewMode === 'map' && (
              <p className="text-xs text-gray-500 mt-1">
                💡 Click on map markers to see detailed information about each listing
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {Object.values(filters).some(value => 
              value !== 'all' && value !== '' && value !== false && value !== 'created_date' && value !== 'desc' && value !== 25
            ) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Filters Active
              </span>
            )}
            {filters.near_me && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                📍 Near Me
              </span>
            )}
            {searchLocation && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                📍 {searchLocation}
              </span>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        /* Map View Layout */
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterPanel />
            
            {/* NEW: Enhanced Quick Stats */}
            <div className="clay-card p-3 mt-4 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:block">
              <h3 className="text-sm font-semibold mb-2 text-gray-900">Marketplace Stats</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Total Listings</span>
                  <span className="font-semibold text-xs">{listings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🛒 For Sale</span>
                  <span className="font-semibold text-xs text-green-600">{listings.filter(l => l.listing_type === 'for_sale').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🔍 Looking For</span>
                  <span className="font-semibold text-xs text-blue-600">{listings.filter(l => l.listing_type === 'looking_for').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🎁 Give Away</span>
                  <span className="font-semibold text-xs text-orange-600">{listings.filter(l => l.listing_type === 'give_away').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🌱 Organic</span>
                  <span className="font-semibold text-xs text-emerald-600">{listings.filter(l => l.organic).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map and List Split View */}
          <div className="lg:col-span-3 space-y-4">
            {/* Map */}
            <div className="clay-card p-4 bg-white/60">
              <MapView 
                listings={filteredListings}
                userLocation={userLocation}
                onListingHover={setHoveredListing}
                onListingClick={handleMapListingClick}
              />
            </div>
            
            {/* Listings List Below Map */}
            <div className="clay-card p-4 bg-white/60">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                Listings ({filteredListings.length})
              </h3>
              {filteredListings.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredListings.map(listing => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      compact={true}
                      highlighted={hoveredListing?.id === listing.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-gray-900">No listings found</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Grid/List View Layout */
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <FilterPanel />
            
            {/* NEW: Enhanced Quick Stats */}
            <div className="clay-card p-3 mt-4 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:block">
              <h3 className="text-sm font-semibold mb-2 text-gray-900">Marketplace Stats</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Total Listings</span>
                  <span className="font-semibold text-xs">{listings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🛒 For Sale</span>
                  <span className="font-semibold text-xs text-green-600">{listings.filter(l => l.listing_type === 'for_sale').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🔍 Looking For</span>
                  <span className="font-semibold text-xs text-blue-600">{listings.filter(l => l.listing_type === 'looking_for').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🎁 Give Away</span>
                  <span className="font-semibold text-xs text-orange-600">{listings.filter(l => l.listing_type === 'give_away').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">🌱 Organic</span>
                  <span className="font-semibold text-xs text-emerald-600">{listings.filter(l => l.organic).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Overlay */}
            {showFilters && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden">
                <div className="absolute right-0 top-0 h-full w-80 max-w-full">
                  <FilterPanel />
                </div>
              </div>
            )}

            {/* Listings Grid/List */}
            {filteredListings.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4' : 'space-y-3'}>
                {filteredListings.map(listing => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            ) : (
              <div className="clay-card p-6 sm:p-8 text-center bg-white/40">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-gray-900">No listings found</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {filters.search || filters.category !== 'all' || filters.listing_type !== 'all' || filters.near_me
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Be the first to create a listing in this marketplace!"
                  }
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(filters.search || filters.category !== 'all' || filters.listing_type !== 'all' || filters.near_me) && (
                    <button 
                      onClick={clearFilters}
                      className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  )}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;