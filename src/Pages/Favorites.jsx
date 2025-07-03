import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  Heart, 
  HeartOff, 
  ShoppingBag, 
  Search, 
  MapPin, 
  Calendar, 
  Leaf, 
  User, 
  MessageSquare, 
  Filter,
  Grid,
  List,
  Trash2,
  Share2,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getCategoryLabel } from '../utils/constants';

const Favorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterFavorites();
  }, [favorites, searchTerm, categoryFilter, typeFilter]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Load real favorites from API
      const favoritesData = await apiClient.getFavorites();
      setFavorites(favoritesData || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const filterFavorites = () => {
    let filtered = favorites;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(fav =>
        fav.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.listing?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.listing?.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(fav => fav.listing?.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(fav => fav.listing?.listing_type === typeFilter);
    }

    setFilteredFavorites(filtered);
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await apiClient.removeFromFavorites(favoriteId);
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

  const toggleSelection = (favoriteId) => {
    setSelectedItems(prev => 
      prev.includes(favoriteId)
        ? prev.filter(id => id !== favoriteId)
        : [...prev, favoriteId]
    );
  };

  const removeSelectedFavorites = async () => {
    try {
      // Remove multiple favorites
      await Promise.all(
        selectedItems.map(favoriteId => apiClient.removeFromFavorites(favoriteId))
      );
      
      setFavorites(prev => prev.filter(fav => !selectedItems.includes(fav.id)));
      setSelectedItems([]);
      toast.success(`Removed ${selectedItems.length} items from favorites`);
    } catch (error) {
      console.error('Error removing favorites:', error);
      toast.error('Failed to remove favorites');
    }
  };

  const shareListings = () => {
    const selectedListings = favorites.filter(fav => selectedItems.includes(fav.id));
    const listingTitles = selectedListings.map(fav => fav.listing?.title || 'Untitled').join(', ');
    
    if (navigator.share) {
      navigator.share({
        title: 'Check out these Fresh Trade listings',
        text: `Found some great produce: ${listingTitles}`,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(`Check out these Fresh Trade listings: ${listingTitles} - ${window.location.origin}`);
      toast.success('Copied to clipboard!');
    }
  };

  const FavoriteCard = ({ favorite, compact = false }) => {
    const { listing } = favorite;
    
    if (!listing) {
      return null; // Handle case where listing might be deleted
    }
    
    if (compact) {
      return (
        <div className="clay-card p-4 bg-white/60 hover:scale-[1.02] transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedItems.includes(favorite.id)}
              onChange={() => toggleSelection(favorite.id)}
              className="w-4 h-4 rounded border-gray-300"
            />
            
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              {listing.images && listing.images[0] ? (
                <img 
                  src={listing.images[0]} 
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <Link 
                  to={`/listing/${listing.id}`}
                  className="clay-text-title text-lg font-semibold hover:text-green-600 transition-colors line-clamp-1 group-hover:text-green-600"
                >
                  {listing.title}
                </Link>
                {listing.price && (
                  <div className="text-right ml-4">
                    <p className="font-bold text-green-600">${listing.price}</p>
                    <p className="text-xs clay-text-soft">{listing.price_unit?.replace('per_', '')}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-2">
                <Badge variant={listing.listing_type === 'for_sale' ? 'default' : 'secondary'} className="text-xs">
                  {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                </Badge>
                {listing.organic && (
                  <Badge className="clay-badge-green text-xs">
                    <Leaf className="w-3 h-3 mr-1" />
                    Organic
                  </Badge>
                )}
                {listing.status === 'completed' && (
                  <Badge className="clay-badge text-xs bg-gray-200 text-gray-600">
                    Completed
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="clay-text-soft text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location?.city && listing.location?.state 
                    ? `${listing.location.city}, ${listing.location.state}`
                    : 'Location not specified'
                  }
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="clay-button p-2 rounded-xl text-red-500 hover:bg-red-50"
                  >
                    <HeartOff className="w-4 h-4" />
                  </button>
                  <Link 
                    to={`/listing/${listing.id}`}
                    className="clay-button p-2 rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="clay-card bg-white/60 overflow-hidden hover:scale-[1.02] transition-all duration-300 group h-full flex flex-col">
        <div className="relative">
          <input
            type="checkbox"
            checked={selectedItems.includes(favorite.id)}
            onChange={() => toggleSelection(favorite.id)}
            className="absolute top-3 left-3 w-4 h-4 rounded border-gray-300 z-10"
          />
          
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
            <div className="absolute top-3 right-3">
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
            {listing.organic && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Organic
                </Badge>
              </div>
            )}
            {listing.status === 'completed' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="clay-badge text-white bg-gray-800 px-4 py-2 text-sm font-semibold">
                  COMPLETED
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <Link 
                to={`/listing/${listing.id}`}
                className="clay-text-title text-lg font-semibold hover:text-green-600 transition-colors line-clamp-2 group-hover:text-green-600"
              >
                {listing.title}
              </Link>
              <p className="clay-text-soft text-sm line-clamp-2 mt-1">{listing.description}</p>
            </div>
            {listing.price && (
              <div className="text-right ml-4">
                <p className="font-bold text-xl text-green-600">${listing.price}</p>
                <p className="text-xs clay-text-soft">{listing.price_unit?.replace('per_', '')}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 clay-card rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {listing.owner?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{listing.owner?.full_name || 'Anonymous User'}</p>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="clay-text-soft text-xs">(4.0)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between text-sm clay-text-soft mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {listing.location?.city && listing.location?.state 
                    ? `${listing.location.city}, ${listing.location.state}`
                    : 'Location not specified'
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{formatDistanceToNow(new Date(favorite.created_date), { addSuffix: true })}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => removeFavorite(favorite.id)}
                className="clay-button flex-1 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
              >
                <HeartOff className="w-4 h-4" />
                Remove
              </button>
              <Link 
                to={`/listing/${listing.id}`}
                className="clay-button-primary flex-1 text-white flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'tomatoes_peppers', label: 'Tomatoes & Peppers' },
    { value: 'herbs', label: 'Herbs' },
    { value: 'berries', label: 'Berries' },
    { value: 'root_vegetables', label: 'Root Vegetables' },
    { value: 'leafy_greens', label: 'Leafy Greens' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="clay-card p-8 text-center">
          <div className="clay-loading w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="clay-card p-6 mb-6 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="clay-text-title text-3xl font-bold mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              My Favorites
            </h1>
            <p className="clay-text-subtitle">
              {favorites.length} saved listing{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="clay-button p-3 rounded-xl"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={shareListings}
                  className="clay-button px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share ({selectedItems.length})
                </button>
                <button
                  onClick={removeSelectedFavorites}
                  className="clay-button px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove ({selectedItems.length})
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 clay-text-soft w-4 h-4" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="clay-input pl-10 w-full"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="clay-input"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="clay-input"
          >
            <option value="all">All Types</option>
            <option value="for_sale">For Sale</option>
            <option value="looking_for">Looking For</option>
          </select>
        </div>
      </div>

      {/* Favorites Grid/List */}
      {filteredFavorites.length > 0 ? (
        <div className={viewMode === 'grid' ? 'clay-grid clay-grid-3' : 'space-y-4'}>
          {filteredFavorites.map(favorite => (
            <FavoriteCard 
              key={favorite.id} 
              favorite={favorite} 
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      ) : (
        <div className="clay-card p-12 text-center bg-white/40">
          <div className="w-16 h-16 clay-card rounded-2xl bg-gradient-to-br from-red-300 to-red-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h3 className="clay-text-title text-xl font-semibold mb-2">
            {favorites.length === 0 ? 'No favorites yet' : 'No matching favorites'}
          </h3>
          <p className="clay-text-soft mb-6">
            {favorites.length === 0 
              ? "Start browsing the marketplace and save listings you're interested in!"
              : "Try adjusting your search or filters to find what you're looking for."
            }
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              to="/marketplace"
              className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Marketplace
            </Link>
            {favorites.length > 0 && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setTypeFilter('all');
                }}
                className="clay-button px-6 py-3 font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {favorites.length > 0 && (
        <div className="clay-card p-6 mt-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="clay-text-title text-lg font-semibold mb-4">Your Favorites Summary</h3>
          <div className="clay-grid clay-grid-4">
            <div className="text-center">
              <div className="clay-text-title text-2xl font-bold text-green-600">
                {favorites.filter(f => f.listing?.listing_type === 'for_sale').length}
              </div>
              <div className="clay-text-soft text-sm">For Sale</div>
            </div>
            <div className="text-center">
              <div className="clay-text-title text-2xl font-bold text-blue-600">
                {favorites.filter(f => f.listing?.listing_type === 'looking_for').length}
              </div>
              <div className="clay-text-soft text-sm">Looking For</div>
            </div>
            <div className="text-center">
              <div className="clay-text-title text-2xl font-bold text-emerald-600">
                {favorites.filter(f => f.listing?.organic).length}
              </div>
              <div className="clay-text-soft text-sm">Organic</div>
            </div>
            <div className="text-center">
              <div className="clay-text-title text-2xl font-bold text-gray-600">
                {favorites.filter(f => f.listing?.status === 'active').length}
              </div>
              <div className="clay-text-soft text-sm">Still Available</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;