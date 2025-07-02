import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
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
      
      // Mock favorites data
      const mockFavorites = [
        {
          id: 1,
          listing: {
            id: 1,
            title: 'Fresh Organic Tomatoes',
            description: 'Vine-ripened heirloom tomatoes from our organic farm. Perfect for salads and cooking.',
            category: 'tomatoes_peppers',
            listing_type: 'for_sale',
            price: 4.50,
            price_unit: 'per_lb',
            organic: true,
            images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
            location: { city: 'Springfield', state: 'IL' },
            owner: {
              name: 'John Farmer',
              avatar: '/placeholder-avatar.jpg',
              rating: 4.8
            },
            created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
            status: 'active'
          },
          favorited_date: new Date(Date.now() - 1000 * 60 * 60 * 24)
        },
        {
          id: 2,
          listing: {
            id: 2,
            title: 'Fresh Basil Leaves',
            description: 'Aromatic sweet basil, perfect for pesto and Italian cooking.',
            category: 'herbs',
            listing_type: 'for_sale',
            price: 3.00,
            price_unit: 'per_bag',
            organic: true,
            images: ['https://images.unsplash.com/photo-1618375569909-3c8616cf5ecf?w=400'],
            location: { city: 'Madison', state: 'WI' },
            owner: {
              name: 'Jane Gardener',
              avatar: '/placeholder-avatar.jpg',
              rating: 4.9
            },
            created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
            status: 'active'
          },
          favorited_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
        },
        {
          id: 3,
          listing: {
            id: 3,
            title: 'Looking for Fresh Strawberries',
            description: 'Restaurant looking for 10+ lbs of fresh strawberries for our dessert menu.',
            category: 'berries',
            listing_type: 'looking_for',
            location: { city: 'Chicago', state: 'IL' },
            owner: {
              name: 'Chef Mike',
              avatar: '/placeholder-avatar.jpg',
              rating: 4.7
            },
            created_date: new Date(Date.now() - 1000 * 60 * 60 * 24),
            status: 'active'
          },
          favorited_date: new Date(Date.now() - 1000 * 60 * 60 * 12)
        },
        {
          id: 4,
          listing: {
            id: 4,
            title: 'Heirloom Carrots',
            description: 'Purple and orange heirloom carrots, grown without chemicals.',
            category: 'root_vegetables',
            listing_type: 'for_sale',
            price: 2.75,
            price_unit: 'per_lb',
            organic: false,
            images: ['https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400'],
            location: { city: 'Portland', state: 'OR' },
            owner: {
              name: 'Sarah Green',
              avatar: '/placeholder-avatar.jpg',
              rating: 4.6
            },
            created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
            status: 'sold'
          },
          favorited_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6)
        }
      ];
      
      setFavorites(mockFavorites);
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
        fav.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.listing.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(fav => fav.listing.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(fav => fav.listing.listing_type === typeFilter);
    }

    setFilteredFavorites(filtered);
  };

  const removeFavorite = async (favoriteId) => {
    try {
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
    const listingTitles = selectedListings.map(fav => fav.listing.title).join(', ');
    
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
                {listing.status === 'sold' && (
                  <Badge className="clay-badge text-xs bg-gray-200 text-gray-600">
                    Sold
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="clay-text-soft text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location.city}, {listing.location.state}
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
            {listing.status === 'sold' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="clay-badge text-white bg-gray-800 px-4 py-2 text-sm font-semibold">
                  SOLD
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
                {listing.owner.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{listing.owner.name}</p>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < Math.floor(listing.owner.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="clay-text-soft text-xs">({listing.owner.rating})</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between text-sm clay-text-soft mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{listing.location.city}, {listing.location.state}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>{formatDistanceToNow(favorite.favorited_date, { addSuffix: true })}</span>
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
                {favorites.filter(f => f.listing.listing_type === 'for_sale').length}
              </div>
              <div className="clay-text-soft text-sm">For Sale</div>
            </div>
            <div className="text-center">
              <div className="clay-text-title text-2xl font-bold text-blue-600">
                {favorites.filter(f => f.listing.listing_type === 'looking_for').length}
              </div>
              <div className="clay-text-soft text-sm">Looking For</div>
            </div>
            <div className="text-center">
              <div className="clay-text-title text-2xl font-bold text-emerald-600">
                {favorites.filter(f => f.listing.organic).length}
              </div>
              <div className="clay-text-soft text-sm">Organic</div>
            </div>
            <div className="text-center">
              <div className="clay-text-title text-2xl font-bold text-gray-600">
                {favorites.filter(f => f.listing.status === 'active').length}
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