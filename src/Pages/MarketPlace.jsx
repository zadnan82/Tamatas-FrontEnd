import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    listing_type: 'all',
    location: '',
    organic_only: false,
    price_range: 'all',
    sort_by: 'created_date'
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);

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
    loadListings();
    if (user) {
      loadFavorites();
    }
  }, [user]);

  useEffect(() => {
    filterListings();
  }, [listings, filters]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Load real listings from database
      const data = await apiClient.getListings({
        skip: 0,
        limit: 100,
        ...filters
      });
      
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
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
    let filtered = [...listings];

    if (filters.search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }

    if (filters.listing_type !== 'all') {
      filtered = filtered.filter(listing => listing.listing_type === filters.listing_type);
    }

    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location?.state?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.organic_only) {
      filtered = filtered.filter(listing => listing.organic);
    }

    if (filters.price_range !== 'all' && filters.price_range) {
      filtered = filtered.filter(listing => {
        if (!listing.price) return filters.price_range === 'free';
        const price = listing.price;
        switch (filters.price_range) {
          case '0-5': return price <= 5;
          case '5-10': return price > 5 && price <= 10;
          case '10-20': return price > 10 && price <= 20;
          case '20+': return price > 20;
          default: return true;
        }
      });
    }

    // Apply sorting
    switch (filters.sort_by) {
      case 'price':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'view_count':
        filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'created_date':
      default:
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
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
        // Find the favorite to remove
        const favoritesData = await apiClient.getFavorites();
        const favoriteToRemove = favoritesData.find(fav => fav.listing_id === listingId);
        if (favoriteToRemove) {
          await apiClient.removeFromFavorites(favoriteToRemove.id);
          setFavorites(prev => prev.filter(id => id !== listingId));
          toast.success('Removed from favorites');
        }
      } else {
        await apiClient.addToFavorites(listingId);
        setFavorites(prev => [...prev, listingId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Reload listings with new filters
    loadListings();
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: 'all',
      search: '',
      listing_type: 'all',
      location: '',
      organic_only: false,
      price_range: 'all',
      sort_by: 'created_date'
    };
    setFilters(defaultFilters);
  };

  const ListingCard = ({ listing, compact = false }) => {
    const isFavorited = favorites.includes(listing.id);
    
    if (compact) {
      return (
        <div className="clay-card p-3 bg-white/60 hover:scale-[1.01] transition-all duration-300 group">
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
                {listing.price && (
                  <div className="text-right ml-2">
                    <p className="font-bold text-sm sm:text-base text-green-600">${listing.price}</p>
                    <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    listing.listing_type === 'for_sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                  </span>
                  {listing.organic && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <Leaf className="w-2 h-2" />
                      Organic
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
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
        <div className="clay-card bg-white/60 backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300 h-full flex flex-col">
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
            
            <div className="absolute top-2 left-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                listing.listing_type === 'for_sale' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {listing.listing_type === 'for_sale' ? (
                  <>
                    <ShoppingBag className="w-2 h-2" />
                    For Sale
                  </>
                ) : (
                  <>
                    <Search className="w-2 h-2" />
                    Looking For
                  </>
                )}
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
              {listing.price && (
                <div className="text-right ml-2">
                  <p className="font-bold text-base sm:text-lg text-green-600">${listing.price}</p>
                  <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
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
                    {listing.location?.city && listing.location?.state 
                      ? `${listing.location.city}, ${listing.location.state}`
                      : 'Location not specified'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}</span>
                </div>
              </div>
              
              <button className="w-full py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white font-semibold flex items-center justify-center gap-2 text-xs rounded-lg">
                <MessageSquare className="w-3 h-3" />
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

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
        
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-700">Type</label>
          <select
            value={filters.listing_type}
            onChange={(e) => handleFilterChange({...filters, listing_type: e.target.value})}
            className="w-full text-xs p-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">All Types</option>
            <option value="for_sale">For Sale</option>
            <option value="looking_for">Looking For</option>
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
              placeholder="City or State"
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
            <p className="text-xs sm:text-sm text-gray-600">Discover fresh produce from local farmers and gardeners</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for fresh produce, herbs, vegetables..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="w-full text-sm p-2.5 pl-10 border border-gray-200 rounded-lg bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange({...filters, sort_by: e.target.value})}
              className="text-xs p-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="created_date">Most Recent</option>
              <option value="view_count">Most Popular</option>
              <option value="price">Price: Low to High</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white flex items-center gap-1 lg:hidden text-xs"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="clay-card p-2 sm:p-3 mb-4 bg-white/60">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            {filteredListings.length} listings found
            {filters.search && ` for "${filters.search}"`}
          </p>
          
          <div className="flex items-center gap-2">
            {Object.values(filters).some(value => 
              value !== 'all' && value !== '' && value !== false && value !== 'created_date'
            ) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Filters Active
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterPanel />
          
          {/* Quick Stats */}
          <div className="clay-card p-3 mt-4 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:block">
            <h3 className="text-sm font-semibold mb-2 text-gray-900">Marketplace Stats</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Total Listings</span>
                <span className="font-semibold text-xs">{listings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">For Sale</span>
                <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'for_sale').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Looking For</span>
                <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'looking_for').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Organic</span>
                <span className="font-semibold text-xs text-green-600">{listings.filter(l => l.organic).length}</span>
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

          {/* Listings Grid */}
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
                {filters.search || filters.category !== 'all' || filters.listing_type !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Be the first to create a listing in this marketplace!"
                }
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {(filters.search || filters.category !== 'all' || filters.listing_type !== 'all') && (
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
    </div>
  );
};

export default Marketplace;