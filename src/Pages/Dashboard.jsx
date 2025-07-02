import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import api from '../utils/api';
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
  const [analytics, setAnalytics] = useState({
    viewsThisWeek: [],
    popularCategories: [],
    revenueThisMonth: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock comprehensive dashboard data
      const mockListings = [
        {
          id: 1,
          title: 'Fresh Organic Tomatoes',
          category: 'tomatoes_peppers',
          listing_type: 'for_sale',
          status: 'active',
          price: 4.50,
          price_unit: 'per_lb',
          views: 156,
          favorites: 23,
          messages: 8,
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200']
        },
        {
          id: 2,
          title: 'Looking for Basil',
          category: 'herbs',
          listing_type: 'looking_for',
          status: 'active',
          views: 89,
          favorites: 12,
          messages: 5,
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          images: []
        },
        {
          id: 3,
          title: 'Heirloom Carrots',
          category: 'root_vegetables',
          listing_type: 'for_sale',
          status: 'sold',
          price: 3.25,
          price_unit: 'per_lb',
          views: 234,
          favorites: 34,
          messages: 12,
          created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          sold_date: new Date(Date.now() - 1000 * 60 * 60 * 24),
          images: ['https://images.unsplash.com/photo-1445282768818-728615cc910a?w=200']
        }
      ];

      const mockActivity = [
        {
          id: 1,
          type: 'new_message',
          title: 'New message received',
          description: 'Jane Gardener asked about your tomatoes',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          icon: MessageSquare,
          color: 'from-blue-400 to-cyan-500'
        },
        {
          id: 2,
          type: 'listing_viewed',
          title: 'Listing viewed',
          description: 'Your Fresh Organic Tomatoes was viewed 5 times',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          icon: Eye,
          color: 'from-green-400 to-emerald-500'
        },
        {
          id: 3,
          type: 'trade_completed',
          title: 'Trade completed',
          description: 'Successfully sold Heirloom Carrots to Chef Mike',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          icon: DollarSign,
          color: 'from-yellow-400 to-orange-500'
        },
        {
          id: 4,
          type: 'new_favorite',
          title: 'Listing favorited',
          description: '3 users added your tomatoes to favorites',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          icon: Heart,
          color: 'from-pink-400 to-rose-500'
        }
      ];

      const mockAnalytics = {
        viewsThisWeek: [
          { day: 'Mon', views: 45 },
          { day: 'Tue', views: 62 },
          { day: 'Wed', views: 38 },
          { day: 'Thu', views: 89 },
          { day: 'Fri', views: 72 },
          { day: 'Sat', views: 95 },
          { day: 'Sun', views: 58 }
        ],
        popularCategories: [
          { name: 'Tomatoes', count: 45, color: 'from-red-400 to-red-500' },
          { name: 'Herbs', count: 32, color: 'from-green-400 to-green-500' },
          { name: 'Leafy Greens', count: 28, color: 'from-emerald-400 to-emerald-500' },
          { name: 'Root Vegetables', count: 21, color: 'from-orange-400 to-orange-500' }
        ],
        revenueThisMonth: 245.50,
        growthRate: 15.3
      };
      
      setMyListings(mockListings);
      setRecentActivity(mockActivity);
      setAnalytics(mockAnalytics);
      setStats({
        totalListings: 5,
        activeListings: 3,
        messages: 12,
        rating: 4.8,
        totalViews: 485,
        totalRevenue: 892.75,
        completedTrades: 8
      });
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
        await api.deleteListing(listingId);
        setMyListings(prev => prev.filter(l => l.id !== listingId));
        toast.success('Listing deleted successfully');
      } catch (error) {
        toast.error('Failed to delete listing');
      }
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div className="clay-card p-6 bg-white/60 hover:scale-105 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span className="font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="clay-text-title text-2xl font-bold mb-1">{value}</div>
      <div className="clay-text-soft text-sm">{title}</div>
      {subtitle && (
        <div className="clay-text-soft text-xs mt-1">{subtitle}</div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const IconComponent = activity.icon;
    
    return (
      <div className="flex items-start gap-3 p-4 clay-card bg-white/40 hover:bg-white/60 transition-colors">
        <div className={`w-10 h-10 bg-gradient-to-br ${activity.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{activity.title}</h4>
          <p className="clay-text-soft text-xs mt-1">{activity.description}</p>
          <p className="clay-text-soft text-xs mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  };

  const ListingCard = ({ listing }) => (
    <div className="clay-card p-4 bg-white/60 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center gap-4">
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
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-sm line-clamp-1">{listing.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={listing.listing_type === 'for_sale' ? 'default' : 'secondary'} className="text-xs">
                  {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                </Badge>
                <Badge variant={listing.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {listing.status}
                </Badge>
                {listing.price && (
                  <span className="text-sm font-medium text-green-600">${listing.price}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs clay-text-soft">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{listing.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{listing.favorites}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{listing.messages}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Link to={`/create-listing`} state={{ listing }}>
                <button className="clay-button p-2 rounded-xl">
                  <Edit className="w-3 h-3" />
                </button>
              </Link>
              <button 
                onClick={() => handleDelete(listing.id)}
                className="clay-button p-2 rounded-xl text-red-500 hover:bg-red-50"
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
      <div className="max-w-7xl mx-auto">
        <div className="clay-card p-8 text-center">
          <div className="clay-loading w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="clay-card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="clay-text-title text-3xl font-bold mb-2">
              Welcome back, {user?.full_name || 'Farmer'}! 🌱
            </h1>
            <p className="clay-text-subtitle">Here's what's happening with your Fresh Trade account</p>
          </div>
          <div className="hidden md:block">
            <Link to="/create-listing">
              <button className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Listing
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
          subtitle={`${stats.totalListings} total listings`}
          trend={12}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          icon={Eye}
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          subtitle="This month"
          trend={8}
          color="from-blue-400 to-cyan-500"
        />
        <StatCard
          icon={DollarSign}
          title="Revenue"
          value={`$${stats.totalRevenue}`}
          subtitle={`${stats.completedTrades} completed trades`}
          trend={analytics.growthRate}
          color="from-yellow-400 to-orange-500"
        />
        <StatCard
          icon={Star}
          title="Rating"
          value={stats.rating}
          subtitle="Based on reviews"
          color="from-purple-400 to-violet-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="clay-card p-6 bg-white/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="clay-text-title text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </h2>
              <Link to="/feeds" className="clay-text-soft hover:text-gray-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.slice(0, 4).map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="clay-card p-6 bg-white/60">
            <h3 className="clay-text-title text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/create-listing" className="clay-button w-full flex items-center gap-3 justify-start">
                <Plus className="w-4 h-4" />
                Create Listing
              </Link>
              <Link to="/messages" className="clay-button w-full flex items-center gap-3 justify-start">
                <MessageSquare className="w-4 h-4" />
                Check Messages
                {stats.messages > 0 && (
                  <span className="clay-badge clay-badge-green text-xs px-2 py-1 ml-auto">
                    {stats.messages}
                  </span>
                )}
              </Link>
              <Link to="/marketplace" className="clay-button w-full flex items-center gap-3 justify-start">
                <ShoppingBag className="w-4 h-4" />
                Browse Marketplace
              </Link>
              <Link to="/profile" className="clay-button w-full flex items-center gap-3 justify-start">
                <Users className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="clay-card p-6 bg-gradient-to-br from-purple-50 to-violet-50">
            <h3 className="clay-text-title text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Popular Categories
            </h3>
            <div className="space-y-3">
              {analytics.popularCategories.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`}></div>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <span className="clay-text-soft text-sm">{category.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* My Listings */}
      <div className="clay-card p-6 bg-white/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="clay-text-title text-xl font-bold">My Recent Listings</h2>
          <Link to="/my-listings" className="clay-text-soft hover:text-gray-700 text-sm font-medium">
            View All →
          </Link>
        </div>
        
        {myListings.length > 0 ? (
          <div className="space-y-4">
            {myListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 clay-card rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h3 className="clay-text-title text-xl font-semibold mb-2">No listings yet</h3>
            <p className="clay-text-soft mb-6">Create your first listing to get started!</p>
            <Link to="/create-listing">
              <button className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Your First Listing
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Analytics Chart */}
      <div className="clay-card p-6 bg-white/60">
        <div className="flex items-center justify-between mb-6">
          <h2 className="clay-text-title text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Views This Week
          </h2>
          <div className="clay-badge clay-badge-green text-sm px-3 py-1">
            +{analytics.growthRate}% from last week
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2">
          {analytics.viewsThisWeek.map((day, index) => (
            <div key={day.day} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-t-lg clay-card transition-all duration-500 hover:scale-110"
                style={{ 
                  height: `${(day.views / Math.max(...analytics.viewsThisWeek.map(d => d.views))) * 200}px`,
                  minHeight: '20px'
                }}
              ></div>
              <div className="mt-2 text-center">
                <div className="font-semibold text-sm">{day.views}</div>
                <div className="clay-text-soft text-xs">{day.day}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips & Recommendations */}
      <div className="clay-card p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <h2 className="clay-text-title text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Tips to Improve Your Success
        </h2>
        <div className="clay-grid clay-grid-2">
          <div className="clay-card p-4 bg-white/60">
            <h4 className="font-semibold mb-2">📸 Add Quality Photos</h4>
            <p className="clay-text-soft text-sm">Listings with photos get 3x more views than those without.</p>
          </div>
          <div className="clay-card p-4 bg-white/60">
            <h4 className="font-semibold mb-2">💬 Respond Quickly</h4>
            <p className="clay-text-soft text-sm">Fast responses lead to more successful trades.</p>
          </div>
          <div className="clay-card p-4 bg-white/60">
            <h4 className="font-semibold mb-2">🌱 Mark as Organic</h4>
            <p className="clay-text-soft text-sm">Organic produce gets 40% more interest from buyers.</p>
          </div>
          <div className="clay-card p-4 bg-white/60">
            <h4 className="font-semibold mb-2">📍 Add Location Details</h4>
            <p className="clay-text-soft text-sm">Local buyers prefer detailed location information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;