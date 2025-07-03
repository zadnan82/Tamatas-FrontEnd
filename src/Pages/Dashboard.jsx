import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myListings, setMyListings] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    messages: 0,
    rating: 0,
    totalViews: 0,
    totalRevenue: 0,
    completedTrades: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load real data from API
      const [listings, feeds, messages] = await Promise.all([
        apiClient.getMyListings(),
        apiClient.getFeeds(),
        apiClient.getMessages().catch(() => []) // Handle if messages fail
      ]);
      
      setMyListings(listings || []);
      
      // Calculate real stats from API data
      const activeListings = listings.filter(l => l.status === 'active');
      const totalViews = listings.reduce((sum, listing) => sum + (listing.view_count || 0), 0);
      const unreadMessages = messages.filter(m => !m.read && m.recipient_id === user.id).length;
      
      setStats({
        totalListings: listings.length,
        activeListings: activeListings.length,
        messages: unreadMessages,
        rating: 4.8, // TODO: Calculate from reviews when implemented
        totalViews: totalViews,
        totalRevenue: 0, // TODO: Calculate from completed trades
        completedTrades: listings.filter(l => l.status === 'completed').length
      });
      
      // Transform recent feeds into activity format
      const feedActivity = feeds.slice(0, 5).map(listing => ({
        id: listing.id,
        type: 'new_listing',
        title: 'New listing posted',
        content: listing.title,
        user: {
          name: listing.owner?.full_name || 'Anonymous User',
          location: listing.location ? `${listing.location.city}, ${listing.location.state}` : 'Unknown location'
        },
        timestamp: new Date(listing.created_date),
        icon: listing.listing_type === 'for_sale' ? '🛍️' : '🔍',
        color: listing.listing_type === 'for_sale' 
          ? 'from-green-400 to-emerald-400'
          : 'from-blue-400 to-cyan-400'
      }));
      
      setRecentActivity(feedActivity);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await apiClient.deleteListing(listingId);
        setMyListings(prev => prev.filter(l => l.id !== listingId));
        toast.success('Listing deleted successfully');
        // Reload stats
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
                <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">📍</span>
                <span className="truncate">{activity.user.location}</span>
              </div>
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
              <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">{listing.title}</h4>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${listing.listing_type === 'for_sale' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {listing.listing_type === 'for_sale' ? '🏷️ For Sale' : '🔍 Looking For'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {listing.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                </span>
                {listing.price && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold text-xs rounded-full">
                    💰 ${listing.price}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link to={`/create-listing`} state={{ listing }}>
                <button className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-300" title="Edit listing">
                  <span className="text-sm">✏️</span>
                </button>
              </Link>
              <button 
                onClick={() => handleDelete(listing.id)}
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
              <span className="text-sm">❤️</span>
              <span className="font-semibold">0 likes</span>
            </div>
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

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-6">
      {/* Welcome Header */}
      <div className="clay-card p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-red-400/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Welcome back, {user?.full_name || 'Farmer'}! 🌱
              </h1>
              <p className="text-sm sm:text-lg font-semibold text-gray-700">Here's what's happening with your Fresh Trade account</p>
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
          value={stats.activeListings}
          subtitle={`${stats.totalListings} total`}
          trend={12}
          gradient="from-green-400 to-emerald-500"
        />
        <StatCard
          icon="👁️"
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          subtitle="All time"
          trend={8}
          gradient="from-blue-400 to-cyan-500"
        />
        <StatCard
          icon="💰"
          title="Completed"
          value={stats.completedTrades}
          subtitle="Trades"
          trend={15}
          gradient="from-orange-400 to-pink-400"
        />
        <StatCard
          icon="⭐"
          title="Rating"
          value={stats.rating}
          subtitle="From reviews"
          gradient="from-pink-400 to-red-400"
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
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
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
                  {stats.messages > 0 && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      {stats.messages}
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

          {/* Quick Stats */}
          <div className="clay-card p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
            <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-lg sm:text-xl">📊</span>
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="text-sm">🏷️</span>
                  For Sale
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold rounded-full text-sm">
                  {myListings.filter(l => l.listing_type === 'for_sale').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/30">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="text-sm">🔍</span>
                  Looking For
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold rounded-full text-sm">
                  {myListings.filter(l => l.listing_type === 'looking_for').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold flex items-center gap-2">
                  <span className="text-sm">🌱</span>
                  Organic
                </span>
                <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold rounded-full text-sm">
                  {myListings.filter(l => l.organic).length}
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
          <Link to="/my-listings" className="text-gray-600 hover:text-green-600 text-sm font-bold transition-colors duration-300">
            View All →
          </Link>
        </div>
        
        {myListings.length > 0 ? (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {myListings.slice(0, 3).map(listing => (
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

      {/* Tips Section */}
      <div className="clay-card p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
        <h2 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 flex items-center gap-2">
          <span className="text-xl sm:text-2xl">💡</span>
          Tips to Improve Success
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">📸</div>
            <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Add Quality Photos</h4>
            <p className="text-xs sm:text-sm text-gray-600">Listings with photos get 3x more views and responses.</p>
          </div>
          <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">💬</div>
            <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Respond Quickly</h4>
            <p className="text-xs sm:text-sm text-gray-600">Fast responses lead to more successful trades.</p>
          </div>
          <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">🏷️</div>
            <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Fair Pricing</h4>
            <p className="text-xs sm:text-sm text-gray-600">Research market prices for competitive listings.</p>
          </div>
          <div className="clay-card p-4 sm:p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:animate-bounce">📝</div>
            <h4 className="text-sm sm:text-base font-black mb-2 sm:mb-3 text-gray-900">Detailed Descriptions</h4>
            <p className="text-xs sm:text-sm text-gray-600">Include variety, quantity, and growing methods.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;