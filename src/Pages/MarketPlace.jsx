import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { CATEGORIES, getCategoryLabel } from '../utils/constants';
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
      const response = await apiClient.getListings(filters);
      setListings(response);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await apiClient.getFavorites();
      setFavorites(response.map(fav => fav.listing_id));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Apply local filters that might not be handled by API
    if (filters.search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location?.state?.toLowerCase().includes(filters.location.toLowerCase())
      );
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
        // Find favorite ID and remove
        const favResponse = await apiClient.getFavorites();
        const favorite = favResponse.find(fav => fav.listing_id === listingId);
        if (favorite) {
          await apiClient.removeFromFavorites(favorite.id);
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

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    try {
      setLoading(true);
      const response = await apiClient.getListings(newFilters);
      setListings(response);
    } catch (error) {
      console.error('Error applying filters:', error);
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
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
    handleFilterChange(defaultFilters);
  };

  const ListingCard = ({ listing, compact = false }) => {
    const isFavorited = favorites.includes(listing.id);
    
    if (compact) {
      return (
        <div className="clay-card p-3 bg-white/60 hover:scale-[1.01] transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              {listing.images && listing.images[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-vibrant-green to-vibrant-cyan flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="clay-text-title text-base font-semibold hover:text-vibrant-orange transition-colors line-clamp-1 group-hover:text-vibrant-orange"
                  >
                    {listing.title}
                  </Link>
                  <p className="clay-text-soft text-xs line-clamp-1 mt-1">{listing.description}</p>
                </div>
                {listing.price && (
                  <div className="text-right ml-3">
                    <p className="font-bold text-lg text-vibrant-green">${listing.price}</p>
                    <p className="text-xs clay-text-soft">{listing.price_unit?.replace('per_', '')}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`clay-badge clay-badge-${listing.listing_type === 'for_sale' ? 'primary' : 'blue'} text-xs`}>
                    {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                  </span>
                  {listing.organic && (
                    <span className="clay-badge clay-badge-green text-xs">
                      <Leaf className="w-2 h-2 mr-1" />
                      Organic
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className={`clay-button p-1 rounded-lg ${isFavorited ? 'text-vibrant-red' : 'clay-text-soft'}`}
                  >
                    <Heart className={`w-3 h-3 ${isFavorited ? 'fill-vibrant-red' : ''}`} />
                  </button>
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="clay-button-primary px-3 py-1 rounded-lg text-white text-xs font-medium"
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
          <div className="aspect-video bg-gradient-to-br from-vibrant-green/20 to-vibrant-cyan/20 relative overflow-hidden">
            {listing.images && listing.images[0] ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-vibrant-green to-vibrant-cyan rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
            
            <div className="absolute top-2 left-2">
              <span className={`clay-badge clay-badge-${
                listing.listing_type === 'for_sale' ? 'primary' : 'blue'
              } text-xs shadow-md`}>
                {listing.listing_type === 'for_sale' ? (
                  <>
                    <ShoppingBag className="w-2 h-2 mr-1" />
                    For Sale
                  </>
                ) : (
                  <>
                    <Search className="w-2 h-2 mr-1" />
                    Looking For
                  </>
                )}
              </span>
            </div>
            
            <div className="absolute top-2 right-2 flex gap-1">
              {listing.organic && (
                <span className="clay-badge clay-badge-green text-xs">
                  <Leaf className="w-2 h-2 mr-1" />
                  Organic
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(listing.id);
                }}
                className={`clay-button p-1 rounded-lg backdrop-blur-sm ${
                  isFavorited ? 'text-vibrant-red bg-white/80' : 'clay-text-soft bg-white/60'
                }`}
              >
                <Heart className={`w-3 h-3 ${isFavorited ? 'fill-vibrant-red' : ''}`} />
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
                <h3 className="font-bold text-base clay-text-title group-hover:text-vibrant-orange transition-colors line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-xs clay-text-soft mt-1">{getCategoryLabel(listing.category)}</p>
              </div>
              {listing.price && (
                <div className="text-right ml-3">
                  <p className="font-bold text-lg text-vibrant-green">${listing.price}</p>
                  <p className="text-xs clay-text-soft">{listing.price_unit?.replace('per_', '')}</p>
                </div>
              )}
            </div>
            
            <p className="clay-text-soft text-xs line-clamp-2 mb-3 leading-relaxed">{listing.description}</p>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 clay-card rounded-lg bg-gradient-to-br from-vibrant-blue to-vibrant-cyan flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {listing.owner?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-xs">{listing.owner?.full_name || 'Anonymous'}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2 h-2 ${i < 4 ? 'text-vibrant-orange fill-vibrant-orange' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="clay-text-soft text-xs">(4.0)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs clay-text-soft mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
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
              
              <button className="clay-button-primary w-full py-2 font-semibold text-white flex items-center justify-center gap-2 text-xs">
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
    <div className={`clay-card p-4 bg-white/60 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="clay-text-title text-base font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="clay-button text-xs px-2 py-1 rounded-lg"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="clay-button p-1 rounded-lg lg:hidden"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block clay-text-soft text-xs font-medium mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange({...filters, category: e.target.value})}
            className="clay-input w-full text-xs"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block clay-text-soft text-xs font-medium mb-1">Type</label>
          <select
            value={filters.listing_type}
            onChange={(e) => handleFilterChange({...filters, listing_type: e.target.value})}
            className="clay-input w-full text-xs"
          >
            <option value="all">All Types</option>
            <option value="for_sale">For Sale</option>
            <option value="looking_for">Looking For</option>
          </select>
        </div>
        
        <div>
          <label className="block clay-text-soft text-xs font-medium mb-1">Price Range</label>
          <select
            value={filters.price_range}
            onChange={(e) => handleFilterChange({...filters, price_range: e.target.value})}
            className="clay-input w-full text-xs"
          >
            <option value="all">Any Price</option>
            <option value="0-5">$0 - $5</option>
            <option value="5-10">$5 - $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20+">$20+</option>
          </select>
        </div>
        
        <div>
          <label className="block clay-text-soft text-xs font-medium mb-1">Location</label>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 clay-text-soft w-3 h-3" />
            <input
              type="text"
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="clay-input pl-8 w-full text-xs"
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
            <Leaf className="w-3 h-3 text-vibrant-green" />
            <span className="clay-text-soft text-xs font-medium">Organic Only</span>
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="clay-card p-6 text-center">
          <div className="clay-loading w-6 h-6 rounded-full mx-auto mb-3"></div>
          <p className="clay-text-soft">Loading fresh produce...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="clay-card p-4 mb-4 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="clay-text-title text-xl font-bold mb-1">Fresh Marketplace</h1>
            <p className="clay-text-subtitle text-xs">Discover fresh produce from local farmers and gardeners</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="clay-button p-2 rounded-lg"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
            <input
              type="text"
              placeholder="Search for fresh produce, herbs, vegetables..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="clay-input pl-10 w-full text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange({...filters, sort_by: e.target.value})}
              className="clay-input text-xs"
            >
              <option value="created_date">Most Recent</option>
              <option value="view_count">Most Popular</option>
              <option value="price">Price: Low to High</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="clay-button px-3 py-2 rounded-lg flex items-center gap-1 lg:hidden text-xs"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="clay-card p-3 mb-4 bg-white/60">
        <div className="flex items-center justify-between">
          <p className="clay-text-soft text-xs">
            {filteredListings.length} listings found
            {filters.search && ` for "${filters.search}"`}
          </p>
          
          <div className="flex items-center gap-2">
            {Object.values(filters).some(value => 
              value !== 'all' && value !== '' && value !== false && value !== 'created_date'
            ) && (
              <span className="clay-badge clay-badge-blue text-xs px-2 py-1">
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
          <div className="clay-card p-3 mt-4 bg-gradient-to-br from-vibrant-green/20 to-vibrant-cyan/20 hidden lg:block">
            <h3 className="clay-text-title text-sm font-semibold mb-2">Marketplace Stats</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="clay-text-soft text-xs">Total Listings</span>
                <span className="font-semibold text-xs">{listings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-xs">For Sale</span>
                <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'for_sale').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-xs">Looking For</span>
                <span className="font-semibold text-xs">{listings.filter(l => l.listing_type === 'looking_for').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="clay-text-soft text-xs">Organic</span>
                <span className="font-semibold text-xs text-vibrant-green">{listings.filter(l => l.organic).length}</span>
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
            <div className={viewMode === 'grid' ? 'clay-grid clay-grid-2 xl:grid-cols-3' : 'space-y-3'}>
              {filteredListings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          ) : (
            <div className="clay-card p-8 text-center bg-white/40">
              <div className="w-12 h-12 clay-card rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="clay-text-title text-base font-semibold mb-2">No listings found</h3>
              <p className="clay-text-soft mb-4 text-xs">
                {filters.search || filters.category !== 'all' || filters.listing_type !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Be the first to create a listing in this marketplace!"
                }
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {(filters.search || filters.category !== 'all' || filters.listing_type !== 'all') && (
                  <button 
                    onClick={clearFilters}
                    className="clay-button px-4 py-2 font-semibold text-xs"
                  >
                    Clear Filters
                  </button>
                )}
                {user && (
                  <Link 
                    to="/create-listing"
                    className="clay-button-primary px-4 py-2 font-semibold text-white flex items-center gap-1 text-xs"
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