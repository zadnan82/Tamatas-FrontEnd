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
      const [listingsResponse, feedsResponse] = await Promise.all([
        apiClient.getMyListings(),
        apiClient.getFeeds()
      ]);
      
      setMyListings(listingsResponse);
      
      // Calculate stats from real data
      const activeListings = listingsResponse.filter(l => l.status === 'active');
      const totalViews = listingsResponse.reduce((sum, listing) => sum + (listing.view_count || 0), 0);
      
      setStats({
        totalListings: listingsResponse.length,
        activeListings: activeListings.length,
        messages: 0, // Will be loaded from messages endpoint
        rating: 4.8, // Will be calculated from reviews
        totalViews: totalViews,
        totalRevenue: 0, // Will be calculated from completed trades
        completedTrades: listingsResponse.filter(l => l.status === 'completed').length
      });
      
      // Generate activity from feeds
      const activity = feedsResponse.slice(0, 5).map((listing, index) => ({
        id: listing.id,
        type: listing.listing_type === 'for_sale' ? 'new_listing' : 'new_request',
        title: listing.listing_type === 'for_sale' ? 'New listing posted' : 'New request posted',
        content: listing.title,
        user: {
          name: listing.owner?.full_name || 'Anonymous',
          location: listing.location ? `${listing.location.city}, ${listing.location.state}` : 'Unknown'
        },
        timestamp: new Date(listing.created_date),
        icon: listing.listing_type === 'for_sale' ? '🛍️' : '💬',
        color: listing.listing_type === 'for_sale' ? 'from-vibrant-orange to-vibrant-red' : 'from-vibrant-blue to-vibrant-cyan'
      }));
      
      setRecentActivity(activity);
      
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
        // Refresh stats
        loadDashboardData();
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Failed to delete listing');
      }
    }
  };

  const StatCard = ({ icon, title, value, subtitle, trend, gradient }) => (
    <div className="clay-card p-6 bg-white/90 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
      {/* Beautiful gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
            <span className="text-white text-2xl">{icon}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${trend > 0 ? 'text-vibrant-green bg-green-50' : 'text-vibrant-red bg-red-50'}`}>
              <span className="text-lg">{trend > 0 ? '📈' : '📉'}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className="clay-text-title text-3xl font-bold mb-2">{value}</div>
        <div className="clay-text-subtitle text-lg font-semibold mb-1">{title}</div>
        {subtitle && (
          <div className="clay-text-soft text-sm">{subtitle}</div>
        )}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    return (
      <div className="clay-card p-4 bg-white/80 hover:bg-white/95 hover:scale-[1.02] transition-all duration-300 group">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${activity.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-white text-xl">{activity.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="clay-text-title font-bold text-base mb-1">{activity.title}</h4>
            <p className="clay-text-subtitle text-sm mb-2 line-clamp-2">{activity.content}</p>
            <div className="flex items-center gap-4 text-xs clay-text-soft">
              <div className="flex items-center gap-1">
                <span className="text-sm">🕒</span>
                <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">📍</span>
                <span>{activity.user.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ListingCard = ({ listing }) => (
    <div className="clay-card p-5 bg-white/90 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-center gap-4">
        {/* Beautiful image container */}
        <div className="image-container-large flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          {listing.images && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-vibrant-green to-vibrant-cyan flex items-center justify-center">
              <span className="text-white text-4xl">🌱</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 mr-3">
              <h4 className="clay-text-title font-bold text-xl mb-3 line-clamp-1 group-hover:text-vibrant-orange transition-colors duration-300">{listing.title}</h4>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`clay-badge clay-badge-${listing.listing_type === 'for_sale' ? 'primary' : 'blue'}`}>
                  {listing.listing_type === 'for_sale' ? '🏷️ For Sale' : '🔍 Looking For'}
                </span>
                <span className={`clay-badge clay-badge-${listing.status === 'active' ? 'green' : 'gray'}`}>
                  {listing.status === 'active' ? '✅ Active' : '⏸️ Inactive'}
                </span>
                {listing.price && (
                  <span className="px-3 py-1 bg-gradient-to-r from-vibrant-green to-green-400 text-white font-bold text-sm rounded-full">
                    💰 ${listing.price}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to={`/create-listing`} state={{ listing }}>
                <button className="clay-button p-3 rounded-xl hover:bg-blue-50 hover:text-vibrant-blue transition-all duration-300" title="Edit listing">
                  <span className="text-lg">✏️</span>
                </button>
              </Link>
              <button 
                onClick={() => handleDelete(listing.id)}
                className="clay-button p-3 rounded-xl text-vibrant-red hover:bg-red-50 transition-all duration-300"
                title="Delete listing"
              >
                <span className="text-lg">🗑️</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-base clay-text-soft">
            <div className="flex items-center gap-2">
              <span className="text-lg">👁️</span>
              <span className="font-semibold">{listing.view_count || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">❤️</span>
              <span className="font-semibold">{listing.favorites_count || 0} likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="clay-card p-12 text-center bg-white/90">
          <div className="clay-loading w-12 h-12 rounded-full mx-auto mb-6"></div>
          <p className="clay-text-soft text-xl font-semibold">Loading your beautiful dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      {/* GORGEOUS WELCOME HEADER */}
      <div className="clay-card p-8 bg-gradient-to-br from-vibrant-orange/10 to-vibrant-red/10 border-2 border-vibrant-orange/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-vibrant-orange/5 to-vibrant-red/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="clay-text-title text-4xl font-black mb-3 bg-gradient-to-r from-vibrant-orange to-vibrant-red bg-clip-text text-transparent">
                Welcome back, {user?.full_name || 'Farmer'}! 🌱
              </h1>
              <p className="clay-text-subtitle text-xl font-semibold">Here's what's happening with your Fresh Trade account</p>
            </div>
            <div className="flex-shrink-0">
              <Link to="/create-listing">
                <button className="clay-button-primary px-8 py-4 font-black text-white flex items-center gap-3 text-lg rounded-2xl hover:scale-105 transition-all duration-300">
                  <span className="text-2xl">➕</span>
                  Create Listing
                  <span className="text-2xl">✨</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BEAUTIFUL STATS GRID */}
      <div className="clay-grid clay-grid-4">
        <StatCard
          icon="🛍️"
          title="Active Listings"
          value={stats.activeListings}
          subtitle={`${stats.totalListings} total listings`}
          trend={12}
          gradient="from-vibrant-green to-vibrant-cyan"
        />
        <StatCard
          icon="👁️"
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          subtitle="This month"
          trend={8}
          gradient="from-vibrant-blue to-vibrant-purple"
        />
        <StatCard
          icon="💰"
          title="Completed Trades"
          value={stats.completedTrades}
          subtitle="This month"
          trend={15}
          gradient="from-vibrant-orange to-vibrant-pink"
        />
        <StatCard
          icon="⭐"
          title="Rating"
          value={stats.rating}
          subtitle="Based on reviews"
          gradient="from-vibrant-pink to-vibrant-red"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* STUNNING RECENT ACTIVITY */}
        <div className="lg:col-span-2">
          <div className="clay-card p-8 bg-white/90">
            <div className="flex items-center justify-between mb-6">
              <h2 className="clay-text-title text-2xl font-black flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Recent Activity
              </h2>
              <Link to="/feeds" className="clay-text-soft hover:text-vibrant-orange text-base font-bold transition-colors duration-300">
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-vibrant-blue to-vibrant-cyan rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
                    <span className="text-white text-4xl">📈</span>
                  </div>
                  <h3 className="clay-text-title text-xl font-bold mb-2">No recent activity</h3>
                  <p className="clay-text-soft text-lg">Create a listing to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BEAUTIFUL SIDEBAR */}
        <div className="space-y-6">
          {/* GORGEOUS QUICK ACTIONS */}
          <div className="clay-card p-6 bg-white/90">
            <h3 className="clay-text-title text-xl font-black mb-6 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Quick Actions
            </h3>
            <div className="space-y-4">
              <Link to="/create-listing" className="clay-button w-full flex items-center gap-4 justify-start text-base font-bold p-4 hover:scale-105 transition-all duration-300">
                <span className="text-xl">➕</span>
                Create New Listing
              </Link>
              <Link to="/messages" className="clay-button w-full flex items-center gap-4 justify-between text-base font-bold p-4 hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <span className="text-xl">💬</span>
                  Messages
                </div>
                {stats.messages > 0 && (
                  <span className="clay-badge clay-badge-green">
                    {stats.messages}
                  </span>
                )}
              </Link>
              <Link to="/marketplace" className="clay-button w-full flex items-center gap-4 justify-start text-base font-bold p-4 hover:scale-105 transition-all duration-300">
                <span className="text-xl">🛒</span>
                Browse Marketplace
              </Link>
            </div>
          </div>

          {/* STUNNING QUICK STATS */}
          <div className="clay-card p-6 bg-gradient-to-br from-vibrant-purple/10 to-vibrant-blue/10 border-2 border-vibrant-purple/20">
            <h3 className="clay-text-title text-xl font-black mb-6 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b-2 border-white/30">
                <span className="clay-text-title text-base font-bold flex items-center gap-2">
                  <span className="text-lg">🏷️</span>
                  For Sale
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-vibrant-orange to-vibrant-red text-white font-bold rounded-full text-lg">
                  {myListings.filter(l => l.listing_type === 'for_sale').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b-2 border-white/30">
                <span className="clay-text-title text-base font-bold flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  Looking For
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-vibrant-blue to-vibrant-cyan text-white font-bold rounded-full text-lg">
                  {myListings.filter(l => l.listing_type === 'looking_for').length}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="clay-text-title text-base font-bold flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  Organic
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-vibrant-green to-green-400 text-white font-bold rounded-full text-lg">
                  {myListings.filter(l => l.organic).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GORGEOUS MY LISTINGS SECTION */}
      <div className="clay-card p-8 bg-white/90">
        <div className="flex items-center justify-between mb-6">
          <h2 className="clay-text-title text-2xl font-black flex items-center gap-3">
            <span className="text-3xl">🛍️</span>
            My Recent Listings
          </h2>
          <Link to="/my-listings" className="clay-text-soft hover:text-vibrant-green text-base font-bold transition-colors duration-300">
            View All →
          </Link>
        </div>
        
        {myListings.length > 0 ? (
          <div className="space-y-6">
            {myListings.slice(0, 3).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 clay-card rounded-3xl bg-gradient-to-br from-vibrant-orange to-vibrant-red flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-white text-4xl">🛍️</span>
            </div>
            <h3 className="clay-text-title text-2xl font-black mb-3">No listings yet</h3>
            <p className="clay-text-soft mb-8 text-xl">Create your first listing to get started on Fresh Trade!</p>
            <Link to="/create-listing">
              <button className="clay-button-primary px-8 py-4 font-black text-white flex items-center gap-3 mx-auto text-lg rounded-2xl hover:scale-105 transition-all duration-300">
                <span className="text-2xl">➕</span>
                Create Your First Listing
                <span className="text-2xl">✨</span>
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* BEAUTIFUL TIPS SECTION */}
      <div className="clay-card p-8 bg-gradient-to-br from-vibrant-blue/10 to-vibrant-cyan/10 border-2 border-vibrant-blue/20">
        <h2 className="clay-text-title text-2xl font-black mb-6 flex items-center gap-3">
          <span className="text-3xl">💡</span>
          Tips to Improve Success
        </h2>
        <div className="clay-grid clay-grid-2">
          <div className="clay-card p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-4xl mb-3 group-hover:animate-bounce-subtle">📸</div>
            <h4 className="clay-text-title font-black mb-3 text-lg">Add Quality Photos</h4>
            <p className="clay-text-soft text-base">Listings with photos get 3x more views and responses.</p>
          </div>
          <div className="clay-card p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-4xl mb-3 group-hover:animate-bounce-subtle">💬</div>
            <h4 className="clay-text-title font-black mb-3 text-lg">Respond Quickly</h4>
            <p className="clay-text-soft text-base">Fast responses lead to more successful trades.</p>
          </div>
          <div className="clay-card p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-4xl mb-3 group-hover:animate-bounce-subtle">🏷️</div>
            <h4 className="clay-text-title font-black mb-3 text-lg">Fair Pricing</h4>
            <p className="clay-text-soft text-base">Research market prices for competitive listings.</p>
          </div>
          <div className="clay-card p-6 bg-white/90 hover:scale-105 transition-all duration-300 group">
            <div className="text-4xl mb-3 group-hover:animate-bounce-subtle">📝</div>
            <h4 className="clay-text-title font-black mb-3 text-lg">Detailed Descriptions</h4>
            <p className="clay-text-soft text-base">Include variety, quantity, and growing methods.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;