import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    myListings: [],
    recentActivity: [],
    messages: [],
    stats: {
      activeListings: 0,
      totalListings: 0,
      totalViews: 0,
      unreadMessages: 0,
      completedTrades: 0,
      averageRating: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatDistanceToNow = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y ago`;
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [myListings, feeds, messages, reviews] = await Promise.all([
        apiClient.getMyListings().catch(err => {
          console.warn('Failed to load my listings:', err);
          return [];
        }),
        apiClient.getFeeds().catch(err => {
          console.warn('Failed to load feeds:', err);
          return [];
        }),
        apiClient.getMessages().catch(err => {
          console.warn('Failed to load messages:', err);
          return [];
        }),
        apiClient.getUserReviews(user.id).catch(err => {
          console.warn('Failed to load reviews:', err);
          return [];
        })
      ]);
      
      // Calculate real stats
      const activeListings = myListings.filter(l => l.status === 'active');
      const completedListings = myListings.filter(l => l.status === 'completed');
      const totalViews = myListings.reduce((sum, listing) => sum + (listing.view_count || 0), 0);
      const unreadMessages = messages.filter(m => !m.read && m.recipient_id === user.id).length;
      
      // Calculate average rating
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      // Transform recent feeds into activity format (real data only)
      const recentActivity = feeds.slice(0, 8).map(listing => {
        const isMyListing = listing.created_by === user.id;
        
        return {
          id: listing.id,
          type: isMyListing ? 'my_listing_viewed' : 'new_listing_nearby',
          title: isMyListing ? 'Your listing got views' : 'New listing nearby',
          content: listing.title,
          listing: listing,
          user: {
            name: listing.owner?.full_name || 'Anonymous User',
            location: formatUserLocation(listing.location),
            id: listing.created_by
          },
          timestamp: listing.created_date,
          icon: getActivityIcon(listing.listing_type, isMyListing),
          color: getActivityColor(listing.listing_type, isMyListing)
        };
      });
      
      setDashboardData({
        myListings,
        recentActivity,
        messages,
        stats: {
          activeListings: activeListings.length,
          totalListings: myListings.length,
          totalViews,
          unreadMessages,
          completedTrades: completedListings.length,
          averageRating
        }
      });
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatUserLocation = (location) => {
    if (!location) return 'Unknown location';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ') || 'Unknown location';
  };

  const getActivityIcon = (listingType, isMyListing) => {
    if (isMyListing) return '👁️';
    
    switch (listingType) {
      case 'for_sale': return '🛍️';
      case 'give_away': return '🎁';
      case 'looking_for': return '🔍';
      default: return '🌱';
    }
  };

  const getActivityColor = (listingType, isMyListing) => {
    if (isMyListing) return 'from-blue-400 to-cyan-400';
    
    switch (listingType) {
      case 'for_sale': return 'from-green-400 to-emerald-400';
      case 'give_away': return 'from-purple-400 to-pink-400';
      case 'looking_for': return 'from-orange-400 to-red-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await apiClient.deleteListing(listingId);
        
        // Update local state
        setDashboardData(prev => ({
          ...prev,
          myListings: prev.myListings.filter(l => l.id !== listingId)
        }));
        
        toast.success('Listing deleted successfully');
        
        // Reload dashboard to refresh stats
        loadDashboardData();
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Failed to delete listing');
      }
    }
  };

  const StatCard = ({ icon, title, value, subtitle, trend, gradient }) => (
    <div className="clay-card p-3 sm:p-4 bg-white/90 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
            <span className="text-white text-base sm:text-lg">{icon}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              <span className="text-sm">{trend > 0 ? '📈' : '📉'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">{value}</div>
        <div className="text-sm sm:text-base font-semibold mb-0.5 text-gray-700">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-600">{subtitle}</div>
        )}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    return (
      <div className="clay-card p-3 sm:p-4 bg-white/80 hover:bg-white/95 hover:scale-[1.01] transition-all duration-300 group">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-white text-sm sm:text-base">{activity.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{activity.title}</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-1 line-clamp-2">{activity.content}</p>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <span className="text-xs">🕒</span>
                <span>{formatDistanceToNow(activity.timestamp)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">📍</span>
                <span className="truncate">{activity.user.location}</span>
              </div>
              {activity.listing?.price && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">💰</span>
                  <span>${activity.listing.price}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ListingCard = ({ listing }) => (
    <div className="clay-card p-3 sm:p-4 bg-white/90 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          {listing.images && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <span className="text-white text-xl">🌱</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 mr-2">
              <Link to={`/listing/${listing.id}`}>
                <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">
                  {listing.title}
                </h4>
              </Link>
              
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  listing.listing_type === 'for_sale' ? 'bg-green-100 text-green-800' : 
                  listing.listing_type === 'give_away' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {listing.listing_type === 'for_sale' ? '🏷️ For Sale' : 
                   listing.listing_type === 'give_away' ? '🎁 Give Away' :
                   '🔍 Looking For'}
                </span>
                
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {listing.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                </span>
                
                {listing.price && listing.listing_type !== 'give_away' && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold text-xs rounded-full">
                    💰 ${listing.price}
                  </span>
                )}
                
                {listing.listing_type === 'give_away' && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-xs rounded-full">
                    🎁 FREE
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link 
                to="/create-listing" 
                state={{ listing }}
                className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                title="Edit listing"
              >
                <span className="text-sm">✏️</span>
              </Link>
              <button 
                onClick={() => handleDeleteListing(listing.id)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-300"
                title="Delete listing"
              >
                <span className="text-sm">🗑️</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="text-sm">👁️</span>
              <span className="font-semibold">{listing.view_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm">🕒</span>
              <span className="font-semibold">{formatDistanceToNow(listing.created_date)}</span>
            </div>
            {listing.organic && (
              <div className="flex items-center gap-1">
                <span className="text-sm">🌱</span>
                <span className="font-semibold text-green-600">Organic</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        <div className="clay-card p-6 sm:p-12 text-center bg-white/90">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 sm:border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3 sm:mb-6"></div>
          <p className="text-gray-600 text-sm sm:text-xl font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        <div className="clay-card p-6 sm:p-12 text-center bg-white/90">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-6">
      {/* Welcome Header */}
      <div className="clay-card p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-red-400/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'Farmer'}! 🌱
              </h1>
              <p className="text-sm sm:text-lg font-semibold text-gray-700">Here's what's happening with your Fresh Trade account</p>
              {user?.location && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  📍 {formatUserLocation(user.location)} • Search radius: {user.search_radius || 25} miles
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <Link to="/create-listing">
                <button className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 rounded-lg hover:scale-105 transition-all duration-300">
                  <span className="text-lg">➕</span>
                  Create Listing
                  <span className="text-lg">✨</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon="🛍️"
          title="Active Listings"
          value={dashboardData.stats.activeListings}
          subtitle={`${dashboardData.stats.totalListings} total`}
          gradient="from-green-400 to-emerald-500"
        />
        <StatCard
          icon="👁️"
          title="Total Views"
          value={dashboardData.stats.totalViews.toLocaleString()}
          subtitle="All time"
          gradient="from-blue-400 to-cyan-500"
        />
        <StatCard
          icon="💬"
          title="Messages"
          value={dashboardData.stats.unreadMessages}
          subtitle="Unread"
          gradient="from-purple-400 to-pink-400"
        />
        <StatCard
          icon="⭐"
          title="Rating"
          value={dashboardData.stats.averageRating > 0 ? dashboardData.stats.averageRating.toFixed(1) : '—'}
          subtitle="From reviews"
          gradient="from-orange-400 to-red-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="clay-card p-4 sm:p-6 lg:p-8 bg-white/90">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <span className="text-xl sm:text-2xl">⚡</span>
                Recent Activity
              </h2>
              <Link to="/feeds" className="text-gray-600 hover:text-orange-600 text-sm font-bold transition-colors duration-300">
                View All →
              </Link>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-white text-xl sm:text-2xl">📈</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-gray-900">No recent activity</h3>
                  <p className="text-sm sm:text-base text-gray-600">Create a listing to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="clay-card p-4 sm:p-6 bg-white/90">
            <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-lg sm:text-xl">✨</span>
              Quick Actions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <Link to="/create-listing" className="block w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 text-sm font-bold text-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-base sm:text-lg">➕</span>
                  Create New Listing
                </div>
              </Link>
              <Link to="/messages" className="block w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 text-sm font-bold text-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg">💬</span>
                    Messages
                  </div>
                  {dashboardData.stats.unreadMessages > 0 && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      {dashboardData.stats.unreadMessages}
                    </span>
                  )}
                </div>
              </Link>
              <Link to="/marketplace" className="block w-full p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300 text-sm font-bold text-gray-800">
                <div className="flex items-center gap-3">
                  <span className="text-base sm:text-lg">🛒</span>
                  Browse Marketplace
                </div>
              </Link>
            </div>
          </div>

          {/* Listing Type Stats */}
          <div className="clay-card p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
            <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-lg sm:text-xl">📊</span>
              My Listings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="text-sm">🏷️</span>
                  For Sale
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-full text-sm">
                  {dashboardData.myListings.filter(l => l.listing_type === 'for_sale').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="text-sm">🎁</span>
                  Give Away
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-full text-sm">
                  {dashboardData.myListings.filter(l => l.listing_type === 'give_away').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="text-sm">🔍</span>
                  Looking For
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold rounded-full text-sm">
                  {dashboardData.myListings.filter(l => l.listing_type === 'looking_for').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="text-sm">🌱</span>
                  Organic
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-full text-sm">
                  {dashboardData.myListings.filter(l => l.organic).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="clay-card p-4 sm:p-6 lg:p-8 bg-white/90">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🛍️</span>
            My Recent Listings
          </h2>
          <Link to="/marketplace?my_listings=true" className="text-gray-600 hover:text-green-600 text-sm font-bold transition-colors duration-300">
            View All →
          </Link>
        </div>
        
        {dashboardData.myListings.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {dashboardData.myListings.slice(0, 3).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 clay-card rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-white text-2xl sm:text-3xl">🛍️</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black mb-2 sm:mb-3 text-gray-900">No listings yet</h3>
            <p className="text-gray-600 mb-4 sm:mb-8 text-sm sm:text-lg">Create your first listing to get started on Fresh Trade!</p>
            <Link to="/create-listing">
              <button className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-400 to-red-400 text-white font-black flex items-center gap-2 mx-auto text-sm sm:text-base rounded-lg hover:scale-105 transition-all duration-300">
                <span className="text-lg sm:text-xl">➕</span>
                Create Your First Listing
                <span className="text-lg sm:text-xl">✨</span>
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section - Only show if user has few listings */}
      {dashboardData.myListings.length < 3 && (
        <div className="clay-card p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <h2 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">💡</span>
            Tips to Get Started
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">📸</div>
              <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Add Quality Photos</h4>
              <p className="text-xs sm:text-sm text-gray-600">Listings with photos get 3x more views and responses.</p>
            </div>
            <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">📍</div>
              <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Set Your Location</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                {user?.location 
                  ? `You're set in ${formatUserLocation(user.location)}! This helps nearby users find you.`
                  : 'Complete your profile location to connect with nearby farmers.'
                }
              </p>
            </div>
            <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">💬</div>
              <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Respond Quickly</h4>
              <p className="text-xs sm:text-sm text-gray-600">Fast responses lead to more successful trades.</p>
            </div>
            <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">🎁</div>
              <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Try Give Away</h4>
              <p className="text-xs sm:text-sm text-gray-600">Start with free items to build trust and get reviews.</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Info - Show if user hasn't set location properly */}
      {(!user?.location || !user?.latitude || !user?.longitude) && (
        <div className="clay-card p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl">📍</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Your Location Setup</h3>
              <p className="text-gray-700 mb-4">
                To get the most out of Fresh Trade, please set your location in your profile. 
                This helps us connect you with nearby farmers and gardeners.
              </p>
              <Link to="/profile">
                <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:scale-105 transition-all duration-300">
                  Complete Profile →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;