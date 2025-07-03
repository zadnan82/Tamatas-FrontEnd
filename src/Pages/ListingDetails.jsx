import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import Button from '../Components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ReviewForm from '../Components/reviews/ReviewForm';
import ReviewList from '../Components/reviews/ReviewList';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Star,
  User,
  Phone,
  Mail,
  Eye,
  Clock,
  Leaf,
  ShoppingBag,
  Search,
  Share2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { getCategoryLabel } from '../utils/constants';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [listing, setListing] = useState(null);
  const [owner, setOwner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      loadListingDetails();
    }
  }, [id]);

  const loadListingDetails = async () => {
    try {
      setLoading(true);
      
      // Load listing details from real database
      const listingData = await apiClient.getListing(id);
      setListing(listingData);
      
      // Load owner profile if available
      if (listingData.created_by) {
        try {
          const ownerData = await apiClient.getUserProfile(listingData.created_by);
          setOwner(ownerData);
          
          // Load owner reviews
          const reviewsData = await apiClient.getUserReviews(listingData.created_by);
          setReviews(reviewsData || []);
        } catch (error) {
          console.error('Error loading owner data:', error);
          // Set fallback owner data from listing
          setOwner({
            id: listingData.created_by,
            full_name: listingData.owner?.full_name || 'Unknown User',
            email: listingData.owner?.email || '',
            profile_image: listingData.owner?.profile_image || null,
            bio: listingData.owner?.bio || '',
            address: listingData.owner?.address || ''
          });
        }
      }
      
      // Check if favorited (only if user is logged in)
      if (user) {
        try {
          const favorites = await apiClient.getFavorites();
          setIsFavorited(favorites.some(fav => fav.listing_id === id));
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
      
    } catch (error) {
      console.error('Error loading listing details:', error);
      toast.error('Failed to load listing details');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorited) {
        // Find and remove the favorite
        const favorites = await apiClient.getFavorites();
        const favorite = favorites.find(fav => fav.listing_id === id);
        if (favorite) {
          await apiClient.removeFromFavorites(favorite.id);
          setIsFavorited(false);
          toast.success('Removed from favorites');
        }
      } else {
        await apiClient.addToFavorites(id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast.error('Please sign in to contact sellers');
      return;
    }

    if (!listing || !listing.created_by) {
      toast.error('Unable to contact seller');
      return;
    }

    // Navigate to messages with pre-filled data
    const messageParams = new URLSearchParams({
      recipient: listing.created_by,
      listingId: listing.id,
      listingTitle: listing.title
    });
    
    navigate(`/messages?${messageParams.toString()}`);
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    // Reload reviews
    if (listing?.created_by) {
      apiClient.getUserReviews(listing.created_by)
        .then(reviewsData => setReviews(reviewsData || []))
        .catch(error => console.error('Error reloading reviews:', error));
    }
    toast.success('Review submitted successfully!');
  };

  const handleShare = async () => {
    const shareData = {
      title: listing.title,
      text: `Check out this fresh produce: ${listing.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-video bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
          <p className="text-gray-600 mb-6">This listing may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate('/marketplace')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" onClick={handleToggleFavorite}>
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden rounded-t-lg">
                {listing.images && listing.images.length > 0 ? (
                  <>
                    <img 
                      src={listing.images[currentImageIndex]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {listing.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === 0 ? listing.images.length - 1 : prev - 1
                          )}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === listing.images.length - 1 ? 0 : prev + 1
                          )}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          →
                        </button>
                        
                        {/* Image indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {listing.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                      <Leaf className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4">
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
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      <Leaf className="w-3 h-3 mr-1" />
                      Organic
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listing Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{listing.title}</CardTitle>
                  <p className="text-gray-600 mb-2">{getCategoryLabel(listing.category)}</p>
                  
                  {listing.price && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-green-700">Price</span>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">${listing.price}</p>
                          <p className="text-sm text-gray-500">{listing.price_unit?.replace('per_', 'per ')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {listing.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-4 py-4 border-t border-gray-100">
                {listing.quantity_available && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-600">Quantity:</span>
                    <span>{listing.quantity_available}</span>
                  </div>
                )}
                
                {listing.harvest_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Harvested:</span>
                    <span>{format(new Date(listing.harvest_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                
                {listing.location?.city && listing.location?.state && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Location:</span>
                    <span>{listing.location.city}, {listing.location.state}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-600">Posted:</span>
                  <span>{formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-600">Views:</span>
                  <span>{listing.view_count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden">
                  {owner?.profile_image ? (
                    <img 
                      src={owner.profile_image} 
                      alt={owner.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {owner?.full_name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{owner?.full_name || 'Unknown User'}</h3>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(averageRating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                  {owner?.address && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {owner.address}
                    </p>
                  )}
                </div>
              </div>
              
              {owner?.bio && (
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{owner.bio}</p>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={handleContactSeller}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  disabled={!user || listing.created_by === user?.id}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {!user ? 'Sign in to Contact' : 
                   listing.created_by === user?.id ? 'Your Listing' : 'Contact Seller'}
                </Button>
                
                {user && listing.created_by !== user?.id && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowReviewForm(true)}
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Reviews ({reviews.length})
                </span>
                {averageRating > 0 && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-500">{averageRating.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">out of 5</div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showReviewForm ? (
                <ReviewForm
                  reviewedUserId={listing.created_by}
                  onReviewSubmitted={handleReviewSubmitted}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <ReviewList reviews={reviews} />
              )}
            </CardContent>
          </Card>

          {/* Related Listings */}
          <Card>
            <CardHeader>
              <CardTitle>More from this seller</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 text-center py-4">
                Loading other listings...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;