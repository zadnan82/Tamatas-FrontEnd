import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { 
  Plus, 
  ShoppingBag, 
  MessageSquare, 
  Star,
  Eye,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Heart,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
  Leaf,
  AlertCircle
} from 'lucide-react';
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
        icon: listing.listing_type === 'for_sale' ? ShoppingBag : MessageSquare,
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

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div className="clay-card p-3 bg-white/60 hover:scale-105 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-vibrant-green' : 'text-vibrant-red'}`}>
            {trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span className="font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="clay-text-title text-lg font-bold mb-1">{value}</div>
      <div className="clay-text-soft text-xs">{title}</div>
      {subtitle && (
        <div className="clay-text-soft text-xs mt-1">{subtitle}</div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const IconComponent = activity.icon;
    
    return (
      <div className="flex items-start gap-2 p-2 clay-card bg-white/40 hover:bg-white/60 transition-colors">
        <div className={`w-6 h-6 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <IconComponent className="w-3 h-3 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-xs">{activity.title}</h4>
          <p className="clay-text-soft text-xs mt-1 line-clamp-2">{activity.content}</p>
          <p className="clay-text-soft text-xs mt-1 flex items-center gap-1">
            <Clock className="w-2 h-2" />
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  };

  const ListingCard = ({ listing }) => (
    <div className="clay-card p-3 bg-white/60 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          {listing.images && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-vibrant-green to-vibrant-cyan flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h4 className="font-semibold text-sm line-clamp-1">{listing.title}</h4>
              <div className="flex items-center gap-1 mt-1">
                <span className={`clay-badge clay-badge-${listing.listing_type === 'for_sale' ? 'primary' : 'blue'} text-xs`}>
                  {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                </span>
                <span className={`clay-badge clay-badge-${listing.status === 'active' ? 'green' : 'gray'} text-xs`}>
                  {listing.status}
                </span>
                {listing.price && (
                  <span className="text-xs font-medium text-vibrant-green">${listing.price}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs clay-text-soft">
              <div className="flex items-center gap-1">
                <Eye className="w-2 h-2" />
                <span>{listing.view_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-2 h-2" />
                <span>{listing.favorites_count || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Link to={`/create-listing`} state={{ listing }}>
                <button className="clay-button p-1 rounded-lg">
                  <Edit className="w-3 h-3" />
                </button>
              </Link>
              <button 
                onClick={() => handleDelete(listing.id)}
                className="clay-button p-1 rounded-lg text-vibrant-red hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="clay-card p-6 text-center">
          <div className="clay-loading w-6 h-6 rounded-full mx-auto mb-3"></div>
          <p className="clay-text-soft">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Welcome Header */}
      <div className="clay-card p-4 bg-gradient-to-br from-vibrant-orange/20 to-vibrant-red/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="clay-text-title text-2xl font-bold mb-1">
              Welcome back, {user?.full_name || 'Farmer'}! 🌱
            </h1>
            <p className="clay-text-subtitle">Here's what's happening with your Fresh Trade account</p>
          </div>
          <div className="hidden md:block">
            <Link to="/create-listing">
              <button className="clay-button-primary px-4 py-2 font-semibold text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Listing
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="clay-grid clay-grid-4">
        <StatCard
          icon={ShoppingBag}
          title="Active Listings"
          value={stats.activeListings}
          subtitle={`${stats.totalListings} total`}
          trend={12}
          color="from-vibrant-green to-vibrant-cyan"
        />
        <StatCard
          icon={Eye}
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          subtitle="This month"
          trend={8}
          color="from-vibrant-blue to-vibrant-purple"
        />
        <StatCard
          icon={DollarSign}
          title="Completed"
          value={stats.completedTrades}
          subtitle="trades this month"
          trend={15}
          color="from-vibrant-orange to-vibrant-pink"
        />
        <StatCard
          icon={Star}
          title="Rating"
          value={stats.rating}
          subtitle="Based on reviews"
          color="from-vibrant-pink to-vibrant-red"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="clay-card p-4 bg-white/60">
            <div className="flex items-center justify-between mb-3">
              <h2 className="clay-text-title text-lg font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </h2>
              <Link to="/feeds" className="clay-text-soft hover:text-gray-700 text-xs font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="w-8 h-8 clay-text-soft mx-auto mb-2" />
                  <p className="clay-text-soft">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="clay-card p-4 bg-white/60">
            <h3 className="clay-text-title text-base font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/create-listing" className="clay-button w-full flex items-center gap-2 justify-start text-xs">
                <Plus className="w-3 h-3" />
                Create Listing
              </Link>
              <Link to="/messages" className="clay-button w-full flex items-center gap-2 justify-start text-xs">
                <MessageSquare className="w-3 h-3" />
                Messages
                {stats.messages > 0 && (
                  <span className="clay-badge clay-badge-green text-xs px-1 py-0.5 ml-auto">
                    {stats.messages}
                  </span>
                )}
              </Link>
              <Link to="/marketplace" className="clay-button w-full flex items-center gap-2 justify-start text-xs">
                <ShoppingBag className="w-3 h-3" />
                Marketplace
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="clay-card p-4 bg-gradient-to-br from-vibrant-purple/20 to-vibrant-blue/20">
            <h3 className="clay-text-title text-base font-semibold mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">For Sale</span>
                <span className="clay-text-soft text-xs">
                  {myListings.filter(l => l.listing_type === 'for_sale').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Looking For</span>
                <span className="clay-text-soft text-xs">
                  {myListings.filter(l => l.listing_type === 'looking_for').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Organic</span>
                <span className="clay-text-soft text-xs text-vibrant-green">
                  {myListings.filter(l => l.organic).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* My Listings */}
      <div className="clay-card p-4 bg-white/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="clay-text-title text-lg font-bold">My Recent Listings</h2>
          <Link to="/my-listings" className="clay-text-soft hover:text-gray-700 text-xs font-medium">
            View All →
          </Link>
        </div>
        
        {myListings.length > 0 ? (
          <div className="space-y-2">
            {myListings.slice(0, 3).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 clay-card rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h3 className="clay-text-title text-base font-semibold mb-2">No listings yet</h3>
            <p className="clay-text-soft mb-4">Create your first listing to get started!</p>
            <Link to="/create-listing">
              <button className="clay-button-primary px-4 py-2 font-semibold text-white flex items-center gap-2 mx-auto">
                <Plus className="w-3 h-3" />
                Create Your First Listing
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="clay-card p-4 bg-gradient-to-br from-vibrant-blue/20 to-vibrant-cyan/20">
        <h2 className="clay-text-title text-lg font-bold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-vibrant-blue" />
          Tips to Improve Success
        </h2>
        <div className="clay-grid clay-grid-2">
          <div className="clay-card p-3 bg-white/60">
            <h4 className="font-semibold mb-1 text-sm">📸 Add Quality Photos</h4>
            <p className="clay-text-soft text-xs">Listings with photos get 3x more views.</p>
          </div>
          <div className="clay-card p-3 bg-white/60">
            <h4 className="font-semibold mb-1 text-sm">💬 Respond Quickly</h4>
            <p className="clay-text-soft text-xs">Fast responses lead to more trades.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;