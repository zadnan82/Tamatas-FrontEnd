import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  TrendingUp, 
  Clock, 
  Heart, 
  MessageSquare, 
  User, 
  MapPin, 
  Leaf,
  Star,
  Eye,
  ShoppingBag,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Feeds = () => {
  const { toast } = useToast();
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeeds();
  }, [filter]);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      
      // Load real feeds from database
      const feedData = await apiClient.getFeeds();
      
      // Transform listings into feed format
      const feedItems = feedData.map(listing => ({
        id: listing.id,
        type: 'new_listing',
        title: 'New listing posted',
        content: listing.title,
        user: {
          name: listing.owner?.full_name || 'Anonymous User',
          avatar: listing.owner?.profile_image || null,
          location: listing.location ? `${listing.location.city}, ${listing.location.state}` : 'Unknown location'
        },
        listing: {
          id: listing.id,
          title: listing.title,
          price: listing.price,
          image: listing.images && listing.images[0] ? listing.images[0] : null,
          category: listing.category,
          organic: listing.organic,
          listing_type: listing.listing_type
        },
        timestamp: new Date(listing.created_date),
        interactions: { 
          likes: 0, // Will be implemented with likes system
          comments: 0, // Will be implemented with comments system
          views: listing.view_count || 0 
        }
      }));

      // Apply filter
      let filteredFeeds = feedItems;
      if (filter !== 'all') {
        filteredFeeds = feedItems.filter(feed => feed.type === filter);
      }
      
      setFeeds(filteredFeeds);
    } catch (error) {
      console.error('Error loading feeds:', error);
      toast.error('Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeeds();
    setRefreshing(false);
    toast.success('Feeds refreshed!');
  };

  const getTypeIcon = (type) => {
    const icons = {
      new_listing: ShoppingBag,
      trade_completed: Heart,
      review_posted: Star,
      community_milestone: TrendingUp,
      new_user: User,
      seasonal_tip: Leaf
    };
    return icons[type] || Clock;
  };

  const getTypeColor = (type, listingType = null) => {
    if (type === 'new_listing' && listingType) {
      return listingType === 'for_sale' 
        ? 'from-green-400 to-emerald-500'
        : 'from-blue-400 to-cyan-500';
    }
    
    const colors = {
      new_listing: 'from-green-400 to-emerald-500',
      trade_completed: 'from-pink-400 to-rose-500',
      review_posted: 'from-yellow-400 to-orange-500',
      community_milestone: 'from-purple-400 to-violet-500',
      new_user: 'from-blue-400 to-cyan-500',
      seasonal_tip: 'from-teal-400 to-green-500'
    };
    return colors[type] || 'from-gray-400 to-gray-500';
  };

  const FeedCard = ({ feed }) => {
    const TypeIcon = getTypeIcon(feed.type);
    const typeColor = getTypeColor(feed.type, feed.listing?.listing_type);
    
    return (
      <div className={`clay-card p-6 ${feed.featured ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-white/60'} backdrop-blur-sm group hover:scale-[1.02] transition-all duration-300`}>
        {feed.featured && (
          <div className="clay-badge clay-badge-purple text-xs px-3 py-1 mb-4 inline-block">
            ✨ Featured
          </div>
        )}
        
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${typeColor} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <TypeIcon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="clay-text-title text-lg font-semibold">{feed.title}</h3>
              <span className="clay-text-soft text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(feed.timestamp, { addSuffix: true })}
              </span>
            </div>
            
            {feed.user && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 clay-card rounded-xl overflow-hidden">
                  {feed.user.avatar ? (
                    <img 
                      src={feed.user.avatar} 
                      alt={feed.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {feed.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{feed.user.name}</p>
                  {feed.user.location && (
                    <p className="clay-text-soft text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {feed.user.location}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <p className="clay-text-soft mb-4 leading-relaxed">{feed.content}</p>
            
            {/* Listing Card */}
            {feed.listing && (
              <Link to={`/listing/${feed.listing.id}`}>
                <div className="clay-card p-4 bg-white/80 mb-4 hover:bg-white/90 transition-colors">
                  <div className="flex items-center gap-3">
                    {feed.listing.image ? (
                      <img 
                        src={feed.listing.image} 
                        alt={feed.listing.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{feed.listing.title}</h4>
                      {feed.listing.price && (
                        <p className="text-green-600 font-bold">${feed.listing.price}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs px-2 py-1 ${
                          feed.listing.listing_type === 'for_sale' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {feed.listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                        </Badge>
                        {feed.listing.organic && (
                          <div className="clay-badge clay-badge-green text-xs px-2 py-1">
                            <Leaf className="w-3 h-3 mr-1" />
                            Organic
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Interactions */}
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 clay-text-soft hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">{feed.interactions.likes}</span>
              </button>
              <button className="flex items-center gap-2 clay-text-soft hover:text-blue-500 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">{feed.interactions.comments}</span>
              </button>
              {feed.interactions.views > 0 && (
                <div className="flex items-center gap-2 clay-text-soft">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">{feed.interactions.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filters = [
    { value: 'all', label: 'All Activity', icon: TrendingUp },
    { value: 'new_listing', label: 'New Listings', icon: ShoppingBag },
    { value: 'trade_completed', label: 'Trades', icon: Heart },
    { value: 'review_posted', label: 'Reviews', icon: Star },
    { value: 'new_user', label: 'New Members', icon: User }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="clay-card p-8 text-center mb-8">
          <div className="clay-loading w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading your personalized feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="clay-card p-6 mb-8 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="clay-text-title text-3xl font-bold mb-2">Activity Feed</h1>
            <p className="clay-text-subtitle">Stay updated with your local food community</p>
          </div>
          <button 
            onClick={handleRefresh}
            className={`clay-button p-3 rounded-xl ${refreshing ? 'clay-animate-pulse' : ''}`}
            disabled={refreshing}
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filterOption) => {
            const FilterIcon = filterOption.icon;
            return (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`clay-nav-item flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                  filter === filterOption.value ? 'active' : ''
                }`}
              >
                <FilterIcon className="w-4 h-4" />
                {filterOption.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Items */}
      <div className="space-y-6">
        {feeds.length > 0 ? (
          feeds.map(feed => (
            <FeedCard key={feed.id} feed={feed} />
          ))
        ) : (
          <div className="clay-card p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="clay-text-title text-xl font-semibold mb-2">No activity found</h3>
            <p className="clay-text-soft mb-6">
              {filter === 'all' 
                ? "Your feed is empty. Start by creating a listing or browse the marketplace!"
                : `No ${filters.find(f => f.value === filter)?.label.toLowerCase()} found.`
              }
            </p>
            <Link 
              to="/create-listing"
              className="clay-button-primary px-6 py-3 font-semibold text-white inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Create Your First Listing
            </Link>
          </div>
        )}
      </div>

      {/* Load More */}
      {feeds.length > 0 && (
        <div className="text-center mt-8">
          <button 
            onClick={loadFeeds}
            className="clay-button px-8 py-3 font-semibold"
          >
            Load More Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default Feeds;