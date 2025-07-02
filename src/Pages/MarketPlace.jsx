import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import api from '../utils/api';
import { CATEGORIES, getCategoryLabel, formatPrice } from '../utils/constants';
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
  Map,
  Star,
  Eye,
  Clock,
  User,
  TrendingUp,
  SlidersHorizontal,
  X,
  Plus  // Add this line
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
    sort_by: 'recent'
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadListings();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, filters]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Mock comprehensive listings data
      const mockListings = [
        {
          id: 1,
          title: 'Fresh Organic Tomatoes',
          description: 'Vine-ripened heirloom tomatoes from our organic farm. Perfect for salads and cooking. Grown without chemicals.',
          category: 'tomatoes_peppers',
          listing_type: 'for_sale',
          price: 4.50,
          price_unit: 'per_lb',
          quantity_available: '20 lbs available',
          organic: true,
          images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'],
          location: { city: 'Springfield', state: 'IL', latitude: 39.7817, longitude: -89.6501 },
          owner: {
            id: 2,
            name: 'John Farmer',
            avatar: '/placeholder-avatar.jpg',
            rating: 4.8,
            total_reviews: 23
          },
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 2),
          status: 'active',
          views: 156,
          favorites_count: 23
        },
        {
          id: 2,
          title: 'Fresh Basil Leaves',
          description: 'Aromatic sweet basil, perfect for pesto and Italian cooking. Harvested this morning.',
          category: 'herbs',
          listing_type: 'for_sale',
          price: 3.00,
          price_unit: 'per_bag',
          quantity_available: '10 bags available',
          organic: true,
          images: ['https://images.unsplash.com/photo-1618375569909-3c8616cf5ecf?w=500'],
          location: { city: 'Madison', state: 'WI', latitude: 43.0731, longitude: -89.4012 },
          owner: {
            id: 3,
            name: 'Jane Gardener',
            avatar: '/placeholder-avatar.jpg',
            rating: 4.9,
            total_reviews: 45
          },
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 6),
          status: 'active',
          views: 89,
          favorites_count: 12
        },
        {
          id: 3,
          title: 'Looking for Fresh Strawberries',
          description: 'Restaurant looking for 10+ lbs of fresh strawberries for our dessert menu. Premium prices paid.',
          category: 'berries',
          listing_type: 'looking_for',
          quantity_available: '10+ lbs needed',
          location: { city: 'Chicago', state: 'IL', latitude: 41.8781, longitude: -87.6298 },
          owner: {
            id: 4,
            name: 'Chef Mike',
            avatar: '/placeholder-avatar.jpg',
            rating: 4.7,
            total_reviews: 67
          },
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 12),
          status: 'active',
          views: 234,
          favorites_count: 45
        },
        {
          id: 4,
          title: 'Heirloom Carrots - Purple & Orange',
          description: 'Beautiful heirloom carrots in purple and orange varieties. Sweet and crunchy, grown in rich soil.',
          category: 'root_vegetables',
          listing_type: 'for_sale',
          price: 2.75,
          price_unit: 'per_lb',
          quantity_available: '15 lbs available',
          organic: false,
          images: ['https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500'],
          location: { city: 'Portland', state: 'OR', latitude: 45.5152, longitude: -122.6784 },
          owner: {
            id: 5,
            name: 'Sarah Green',
            avatar: '/placeholder-avatar.jpg',
            rating: 4.6,
            total_reviews: 12
          },
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 24),
          status: 'active',
          views: 67,
          favorites_count: 8
        },
        {
          id: 5,
          title: 'Organic Spinach - Baby Leaves',
          description: 'Tender baby spinach leaves, perfect for salads. Certified organic and pesticide-free.',
          category: 'leafy_greens',
          listing_type: 'for_sale',
          price: 5.50,
          price_unit: 'per_bag',
          quantity_available: '8 bags available',
          organic: true,
          images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'],
          location: { city: 'Seattle', state: 'WA', latitude: 47.6062, longitude: -122.3321 },
          owner: {
            id: 6,
            name: 'Green Valley Farm',
            avatar: '/placeholder-avatar.jpg',
            rating: 4.9,
            total_reviews: 89
          },
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 36),
          status: 'active',
          views: 123,
          favorites_count: 34
        },
        {
          id: 6,
          title: 'Need: Fresh Mint for Restaurant',
          description: 'High-end restaurant needs fresh mint daily. Looking for reliable supplier with consistent quality.',
          category: 'herbs',
          listing_type: 'looking_for',
          quantity_available: 'Daily supply needed',
          location: { city: 'San Francisco', state: 'CA', latitude: 37.7749, longitude: -122.4194 },
          owner: {
            id: 7,
            name: 'Bay Area Bistro',
            avatar: '/placeholder-avatar.jpg',
            rating: 4.8,
            total_reviews: 156
          },
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 48),
          status: 'active',
          views: 178,
          favorites_count: 67
        }
      ];
      
      setListings(mockListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      // Mock user favorites
      setFavorites([1, 3, 5]); // listing IDs
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.owner.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }

    // Type filter
    if (filters.listing_type !== 'all') {
      filtered = filtered.filter(listing => listing.listing_type === filters.listing_type);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location.state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Organic filter
    if (filters.organic_only) {
      filtered = filtered.filter(listing => listing.organic);
    }

    // Price range filter
    if (filters.price_range !== 'all') {
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

    // Sort listings
    filtered.sort((a, b) => {
      switch (filters.sort_by) {
        case 'recent':
          return new Date(b.created_date) - new Date(a.created_date);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          return (b.views + b.favorites_count) - (a.views + a.favorites_count);
        case 'rating':
          return b.owner.rating - a.owner.rating;
        default:
          return new Date(b.created_date) - new Date(a.created_date);
      }
    });

    setFilteredListings(filtered);
  };

  const toggleFavorite = async (listingId) => {
    try {
      const isFavorited = favorites.includes(listingId);
      if (isFavorited) {
        setFavorites(prev => prev.filter(id => id !== listingId));
        toast.success('Removed from favorites');
      } else {
        setFavorites(prev => [...prev, listingId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      search: '',
      listing_type: 'all',
      location: '',
      organic_only: false,
      price_range: 'all',
      sort_by: 'recent'
    });
  };

  const ListingCard = ({ listing, compact = false }) => {
    const isFavorited = favorites.includes(listing.id);
    
    if (compact) {
      return (
        <div className="clay-card p-4 bg-white/60 hover:scale-[1.01] transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              {listing.images && listing.images[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="clay-text-title text-lg font-semibold hover:text-green-600 transition-colors line-clamp-1 group-hover:text-green-600"
                  >
                    {listing.title}
                  </Link>
                  <p className="clay-text-soft text-sm line-clamp-1 mt-1">{listing.description}</p>
                </div>
                {listing.price && (
                  <div className="text-right ml-4">
                    <p className="font-bold text-xl text-green-600">${listing.price}</p>
                    <p className="text-xs clay-text-soft">{listing.price_unit?.replace('per_', '')}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={listing.listing_type === 'for_sale' ? 'default' : 'secondary'} className="text-xs">
                    {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                  </Badge>
                  {listing.organic && (
                    <Badge className="clay-badge-green text-xs">
                      <Leaf className="w-3 h-3 mr-1" />
                      Organic
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className={`clay-button p-2 rounded-xl ${isFavorited ? 'text-red-500' : 'clay-text-soft'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
                  </button>
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="clay-button-primary px-4 py-2 rounded-xl text-white text-sm font-medium"
                  >
                    View Details
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
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
              </div>
            )}
            
            <div className="absolute top-3 left-3">
              <Badge className={`${
                listing.listing_type === 'for_sale' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white border-0 shadow-md`}>
                {listing.listing_type === 'for_sale' ? (
                  <>
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    For Sale
                  </>
                ) : (
                  <>
                    <Search className="w-3 h-3 mr-1" />
                    Looking For
                  </>
                )}
              </Badge>
            </div>
            
            <div className="absolute top-3 right-3 flex gap-2">
              {listing.organic && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Organic
                </Badge>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(listing.id);
                }}
                className={`clay-button p-2 rounded-xl backdrop-blur-sm ${
                  isFavorited ? 'text-red-500 bg-white/80' : 'clay-text-soft bg-white/60'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
              </button>
            </div>
            
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Eye className="w-3 h-3" />
                <span>{listing.views}</span>
              </div>
              <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                <Heart className="w-3 h-3" />
                <span>{listing.favorites_count}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{getCategoryLabel(listing.category)}</p>
              </div>
              {listing.price && (
                <div className="text-right ml-4">
                  <p className="font-bold text-xl text-green-600">${listing.price}</p>
                  <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{listing.description}</p>
            
            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 clay-card rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {listing.owner.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{listing.owner.name}</p>
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(listing.owner.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="clay-text-soft text-xs">({listing.owner.total_reviews})</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm clay-text-soft mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location.city}, {listing.location.state}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDistanceToNow(listing.created_date, { addSuffix: true })}</span>
                </div>
              </div>
              
              <button className="clay-button-primary w-full py-3 font-semibold text-white flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const FilterPanel = () => (
    <div className={`clay-card p-6 bg-white/60 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="clay-text-title text-lg font-semibold">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="clay-button text-sm px-3 py-1 rounded-lg"
          >
            Clear All
          </button>
          <button
            onClick={() => setShowFilters(false)}
            className="clay-button p-2 rounded-lg lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block clay-text-soft text-sm font-medium mb-2">Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="clay-input w-full"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block clay-text-soft text-sm font-medium mb-2">Type</label>
          <select
            value={filters.listing_type}
            onChange={(e) => setFilters({...filters, listing_type: e.target.value})}
            className="clay-input w-full"
          >
            <option value="all">All Types</option>
            <option value="for_sale">For Sale</option>
            <option value="looking_for">Looking For</option>
          </select>
        </div>
        
        <div>
          <label className="block clay-text-soft text-sm font-medium mb-2">Price Range</label>
          <select
            value={filters.price_range}
            onChange={(e) => setFilters({...filters, price_range: e.target.value})}
            className="clay-input w-full"
          >
            <option value="all">Any Price</option>
            <option value="0-5">$0 - $5</option>
            <option value="5-10">$5 - $10</option>
            <option value="10-20">$10 - $20</option>
            <option value="20+">$20+</option>
          </select>
        </div>
        
        <div>
          <label className="block clay-text-soft text-sm font-medium mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
            <input
              type="text"
              placeholder="City or State"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="clay-input pl-10 w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.organic_only}
              onChange={(e) => setFilters({...filters, organic_only: e.target.checked})}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Leaf className="w-4 h-4 text-green-500" />
            <span className="clay-text-soft text-sm font-medium">Organic Only</span>
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="clay-card p-8 text-center">
          <div className="clay-loading w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading fresh produce...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="clay-card p-3 mb-3 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="clay-text-title text-lg font-bold mb-1">Fresh Marketplace</h1>
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
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
            <input
              type="text"
              placeholder="Search for fresh produce, herbs, vegetables..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="clay-input pl-8 w-full text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filters.sort_by}
              onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
              className="clay-input text-xs"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="clay-button px-2 py-2 rounded-lg flex items-center gap-1 lg:hidden text-xs"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="clay-card p-2 mb-3 bg-white/60">
        <div className="flex items-center justify-between">
          <p className="clay-text-soft text-xs">
            {loading ? "Loading..." : `${filteredListings.length} listings found`}
            {filters.search && ` for "${filters.search}"`}
          </p>
          
          <div className="flex items-center gap-1">
            {Object.values(filters).some(value => 
              value !== 'all' && value !== '' && value !== false && value !== 'recent'
            ) && (
              <div className="clay-badge clay-badge-blue text-xs px-2 py-0.5">
                Filters Active
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-3">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterPanel />
          
          {/* Quick Stats */}
          <div className="clay-card p-3 mt-3 bg-gradient-to-br from-green-50 to-emerald-50 hidden lg:block">
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
            <div className={viewMode === 'grid' ? 'clay-grid clay-grid-2 xl:grid-cols-3' : 'space-y-2'}>
              {filteredListings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  compact={viewMode === 'list'}
                />
              ))}
            </div>
          ) : (
            <div className="clay-card p-6 text-center bg-white/40">
              <div className="w-12 h-12 clay-card rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-2">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="clay-text-title text-sm font-semibold mb-1">No listings found</h3>
              <p className="clay-text-soft mb-3 text-xs">
                {filters.search || filters.category !== 'all' || filters.listing_type !== 'all'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Be the first to create a listing in this marketplace!"
                }
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {(filters.search || filters.category !== 'all' || filters.listing_type !== 'all') && (
                  <button 
                    onClick={clearFilters}
                    className="clay-button px-3 py-2 font-semibold text-xs"
                  >
                    Clear Filters
                  </button>
                )}
                {user && (
                  <Link 
                    to="/create-listing"
                    className="clay-button-primary px-3 py-2 font-semibold text-white flex items-center gap-1 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Create Listing
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Load More */}
          {filteredListings.length > 0 && filteredListings.length >= 20 && (
            <div className="text-center mt-4">
              <button className="clay-button px-4 py-2 font-semibold text-xs">
                Load More Listings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Featured Categories */}
      {filteredListings.length > 0 && (
        <div className="clay-card p-3 mt-4 bg-gradient-to-br from-blue-50 to-cyan-50">
          <h2 className="clay-text-title text-sm font-bold mb-2">Popular Categories</h2>
          <div className="clay-grid clay-grid-2 md:clay-grid-4">
            {CATEGORIES.slice(1, 5).map(category => {
              const count = listings.filter(l => l.category === category.value).length;
              return (
                <button
                  key={category.value}
                  onClick={() => setFilters({...filters, category: category.value})}
                  className="clay-card p-2 text-center hover:scale-105 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-xs mb-0.5">{category.label}</h3>
                  <p className="clay-text-soft text-xs">{count} listings</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;