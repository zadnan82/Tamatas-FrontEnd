import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../Components/ui/Button';
import { 
  User, 
  MapPin, 
  Star, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Award, 
  Package, 
  Heart,
  ArrowLeft,
  Shield,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { Pencil } from 'lucide-react';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';


const UserProfile = ({ userId, onBack, onNavigate }) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalReviews: 0,
    averageRating: 0,
    memberSince: null,
    lastActive: null
  });
 const [reviewsLoading, setReviewsLoading] = useState(false);
const [showReviewForm, setShowReviewForm] = useState(false);
const [selectedListingForReview, setSelectedListingForReview] = useState(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

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

  useEffect(() => {
  if (userId) {
    loadUserProfile();
  }
}, [userId]);
const LoadingSpinner = () => (
  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
);
const loadUserProfile = async () => {
  try {
    setLoading(true);
    setReviewsLoading(true);
    
    const [profileData, listings, reviews] = await Promise.all([
      apiClient.getUserProfile(userId),
      apiClient.getListings({ created_by: userId }).catch(() => []),
      // MODIFY THIS LINE - remove the conditional include_anonymous check
      apiClient.getUserReviews(userId).catch(() => [])
      // OR if you want to keep some control:
      // apiClient.getUserReviews(userId, { include_anonymous: true }).catch(() => [])
    ]);
    
    console.log('Reviews data:', reviews); // This will now show all reviews
    
    setProfile(profileData);
    setUserListings(listings);
    setUserReviews(reviews);
    
    // Rest of your function remains the same...
    const activeListings = listings.filter(l => l.status === 'active');
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    
    setStats({
      totalListings: listings.length,
      activeListings: activeListings.length,
      totalReviews: reviews.length,
      averageRating: avgRating,
      memberSince: profileData.created_date,
      lastActive: profileData.updated_date || profileData.created_date
    });
    
  } catch (error) {
    console.error('Error loading user profile:', error);
    toast.error('Failed to load user profile');
    if (onBack) onBack();
  } finally {
    setLoading(false);
    setReviewsLoading(false); // Don't forget this!
  }
};
const loadReviews = async (retries = 3) => {
  try {
    const reviews = await apiClient.getUserReviews(userId, {
      include_anonymous: currentUser?.id === userId
    });
    setUserReviews(reviews);
  } catch (error) {
    if (retries > 0) {
      setTimeout(() => loadReviews(retries - 1), 1000);
    } else {
      toast.error('Failed to load reviews');
      setUserReviews([]);
    }
  }
};

  const handleReviewSubmitted = (reviewData) => {
  setShowReviewForm(false);
  loadUserProfile(); // Refresh the profile to show the new review
};
  const handleMessageUser = () => {
    if (!currentUser) {
      toast.error('Please log in to send messages');
      if (onNavigate) onNavigate('/');
      return;
    }
    
    if (currentUser.id === userId) {
      toast.error('You cannot message yourself');
      return;
    }
    
    // Navigate to messages with pre-selected user
    if (onNavigate) onNavigate(`/messages?user=${userId}`);
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    
    const parts = [];
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.join(', ') || 'Location not specified';
  };

  const calculateDistance = () => {
    if (!currentUser?.latitude || !currentUser?.longitude || 
        !profile?.latitude || !profile?.longitude) {
      return null;
    }
    
    // Simple distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = (profile.latitude - currentUser.latitude) * Math.PI / 180;
    const dLon = (profile.longitude - currentUser.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(currentUser.latitude * Math.PI / 180) * Math.cos(profile.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const TabButton = ({ id, label, icon, count, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 text-white shadow-md' 
          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
          isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
const AnonymousToggle = () => (
  <div className="flex items-center gap-2 mb-4">
    <label 
      htmlFor="anonymous-toggle"
      className="text-sm font-medium text-gray-700"
    >
      Post as anonymous
    </label>
    <div className="relative inline-block w-10 mr-2 align-middle select-none">
      <input 
        type="checkbox" 
        id="anonymous-toggle"
        checked={isAnonymous}
        onChange={() => setIsAnonymous(!isAnonymous)}
        className="sr-only"
      />
      <div className={`block w-10 h-6 rounded-full ${isAnonymous ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAnonymous ? 'transform translate-x-4' : ''}`}></div>
    </div>
    {isAnonymous && (
      <span className="text-xs text-gray-500">
        Your name won't be shown
      </span>
    )}
  </div>
);
  const ListingCard = ({ listing }) => (
    <div 
      onClick={() => onNavigate && onNavigate(`/listing/${listing.id}`)}
      className="clay-card p-4 bg-white hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          {listing.images && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
              {listing.title}
            </h4>
            {listing.listing_type === 'give_away' ? (
              <span className="px-2 py-1 bg-green-500 text-white font-bold text-xs rounded-full">
                FREE
              </span>
            ) : listing.price ? (
              <span className="px-2 py-1 bg-orange-500 text-white font-bold text-xs rounded-full">
                ${listing.price}
              </span>
            ) : null}
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {listing.description || 'No description provided'}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{listing.view_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(listing.created_date)}</span>
            </div>
            {listing.organic && (
              <div className="flex items-center gap-1">
                <span className="text-green-600">🌱 Organic</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ReviewCard = ({ review }) => {
  return (
    <div className="clay-card p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">
              {review.is_anonymous ? 'Anonymous' : (review.reviewer?.full_name || 'User')}
            </span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(review.created_date)}
            </span>
          </div>
          
          {review.comment && (
            <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};

 if (loading) {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="clay-card p-12 text-center bg-white">
        <LoadingSpinner />
        <p className="text-gray-600 text-xl font-semibold">Loading user profile...</p>
      </div>
    </div>
  );
}

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="clay-card p-12 text-center bg-white">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Button onClick={onBack || (() => onNavigate && onNavigate('/marketplace'))}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const distance = calculateDistance();

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Back Button */}
      <button
        onClick={onBack || (() => onNavigate && onNavigate(-1))}
        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back</span>
      </button>

      {/* Profile Header */}
      <div className="clay-card p-6 bg-gradient-to-br from-white to-gray-50">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 flex-1">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden flex-shrink-0 mx-auto md:mx-0">
              {profile.profile_image ? (
                <img 
                  src={profile.profile_image} 
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {profile.full_name || profile.email?.split('@')[0] || 'User'}
                </h1>
                {profile.is_verified && (
                  <CheckCircle className="w-6 h-6 text-green-500" title="Verified User" />
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{formatLocation(profile.location)}</span>
                  {distance && (
                    <span className="text-orange-600 font-medium">
                      ({distance} miles away)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Member since {stats.memberSince ? new Date(stats.memberSince).getFullYear() : 'Unknown'}
                  </span>
                </div>
                
                {stats.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
                    <span>({stats.totalReviews} reviews)</span>
                  </div>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-700 max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          {currentUser && currentUser.id !== userId && (
            <div className="flex flex-col gap-3 md:flex-shrink-0">
              <Button
                onClick={handleMessageUser}
                icon={<MessageSquare />}
                className="w-full md:w-auto"
              >
                Send Message
              </Button>
              
              {profile.whatsapp_number && profile.show_whatsapp_on_listings && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://wa.me/${profile.whatsapp_number.replace(/[^\d]/g, '')}`, '_blank')}
                  icon={<Phone />}
                  className="w-full md:w-auto"
                >
                  WhatsApp
                </Button>
              )}

               <Button
      variant="outline"
      onClick={() => setShowReviewForm(true)}
      icon={<Pencil className="w-4 h-4" />}
      className="w-full md:w-auto"
    >
      Leave Review
    </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="clay-card p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.activeListings}</div>
          <div className="text-sm text-gray-600">Active Listings</div>
        </div>
        
        <div className="clay-card p-4 text-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        
        <div className="clay-card p-4 text-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalReviews}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        
        <div className="clay-card p-4 text-center bg-gradient-to-br from-orange-50 to-yellow-50">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.totalListings}</div>
          <div className="text-sm text-gray-600">Total Listings</div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="clay-card bg-white">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-2 flex-wrap">
            <TabButton
              id="listings"
              label="Listings"
              icon={<Package className="w-4 h-4" />}
              count={stats.activeListings}
              isActive={activeTab === 'listings'}
              onClick={setActiveTab}
            />
            <TabButton
              id="reviews"
              label="Reviews"
              icon={<Star className="w-4 h-4" />}
              count={stats.totalReviews}
              isActive={activeTab === 'reviews'}
              onClick={setActiveTab}
            />
            
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-4">
          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div>
              {userListings.length > 0 ? (
                <div className="space-y-4">
                  {userListings
                    .filter(listing => listing.status === 'active')
                    .map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Listings</h3>
                  <p className="text-gray-600">This user doesn't have any active listings at the moment.</p>
                </div>
              )}
            </div>
          )}

            
{activeTab === 'reviews' && (
  <div className="space-y-6">
    {reviewsLoading ? (
  <div className="text-center py-8">
    <LoadingSpinner />
    <p className="text-gray-600">Loading reviews...</p>
  </div>
    ) : (
      <>
        {showReviewForm ? (
          <ReviewForm
            reviewedUserId={userId}
            listingId={selectedListingForReview}
            onReviewSubmitted={() => {
              setShowReviewForm(false);
              loadUserProfile();
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        ) : (
          <>
            <ReviewList 
              reviews={userReviews} 
              onAddReview={() => setShowReviewForm(true)}
            />
            {currentUser && currentUser.id !== userId && (
              <div className="text-center">
                <Button
                  onClick={() => setShowReviewForm(true)}
                  icon={<Pencil className="w-4 h-4" />}
                >
                  Write a Review
                </Button>
              </div>
            )}
          </>
        )}
      </>
    )}
  </div>
)}
        </div>
      </div>

      {/* Trust & Safety Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Trust & Safety
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Safety Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Meet in public places for exchanges</li>
                <li>• Inspect produce before completing trades</li>
                <li>• Use the platform's messaging system</li>
                <li>• Report any suspicious behavior</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">User Verification</h4>
              <div className="flex items-center gap-2 text-sm">
                {profile.email && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Email verified</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Phone verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;