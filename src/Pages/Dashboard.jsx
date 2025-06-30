import React, { useState, useEffect } from "react";
import { Listing, User, Message, Review } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ShoppingBag, 
  MessageSquare, 
  Star,
  TrendingUp,
  Package,
  Users,
  Calendar,
  Edit, // Added Edit icon
  Trash2 // Added Trash2 icon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate hook
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Dashboard() {
  const [myListings, setMyListings] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    completedTrades: 0,
    averageRating: 0
  });
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load user's listings
      const listings = await Listing.filter({ created_by: user.email }, '-created_date', 10);
      setMyListings(listings);

      // Load recent messages
      const messages = await Message.filter({ recipient_id: user.id }, '-created_date', 5);
      setRecentMessages(messages);

      // Load reviews for this user
      const reviews = await Review.filter({ reviewed_user_id: user.id }, '-created_date', 5);
      setMyReviews(reviews);

      // Calculate stats
      const activeListings = listings.filter(l => l.status === 'active').length;
      const completedTrades = user.total_trades || 0;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      setStats({
        totalListings: listings.length,
        activeListings,
        completedTrades,
        averageRating: avgRating
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleEdit = (listing) => {
    navigate(createPageUrl("CreateListing"), { state: { listing } });
  };
  
  const handleDelete = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await Listing.delete(listingId);
        loadDashboardData(); // Refresh data after deletion
      } catch (error) {
        console.error("Failed to delete listing", error);
        alert("Could not delete the listing.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">Manage your listings and trades</p>
          </div>
          <Link to={createPageUrl("CreateListing")}>
            <Button className="bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New Listing
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Listings</CardTitle>
              <Package className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeListings}</div>
              <p className="text-xs text-gray-500 mt-1">of {stats.totalListings} total</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Trades</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.completedTrades}</div>
              <p className="text-xs text-green-600 mt-1">+2 this month</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
              <Star className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= stats.averageRating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New Messages</CardTitle>
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {recentMessages.filter(m => !m.read).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">unread messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Recent Listings */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-gray-900">My Recent Listings</CardTitle>
                <Link to={createPageUrl("MyListings")}>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {myListings.slice(0, 5).map((listing) => (
                <div key={listing.id} className="p-4 rounded-xl bg-green-50/50 dark:bg-gray-800 border border-green-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{listing.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={listing.listing_type === 'for_sale' ? 'default' : 'secondary'} className="text-xs">
                          {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          listing.status === 'active' ? 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800' : 'text-gray-500'
                        }`}>
                          {listing.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(listing)}>
                            <Edit className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
              {myListings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No listings yet</p>
                  <p className="text-sm">Create your first listing to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMessages.slice(0, 5).map((message) => (
                <div key={message.id} className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New message received</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(message.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  {!message.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
              
              {myReviews.slice(0, 2).map((review) => (
                <div key={review.id} className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50/50 border border-yellow-100">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New review received</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {recentMessages.length === 0 && myReviews.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Your activity will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}