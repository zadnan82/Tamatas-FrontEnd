import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Star,
  User,
  ShoppingBag,
  Search,
  Share2,
  Leaf,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Button from '../Components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ReviewForm from '../components/reviews/ReviewForm';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load listing with distance data
        const listingData = await apiClient.getListing(id);
        setListing(listingData);
        
        // Load owner profile
        if (listingData.created_by) {
          try {
            const ownerData = await apiClient.getUserProfile(listingData.created_by);
            setOwner(ownerData);
            
            // Load owner reviews
            const reviewsData = await apiClient.getUserReviews(listingData.created_by);
            setReviews(reviewsData || []);
          } catch (error) {
            console.error('Error loading owner:', error);
            setOwner({
              id: listingData.created_by,
              full_name: listingData.owner?.full_name || 'Private User'
            });
          }
        }
        
        // Check favorites
        if (user) {
          const favorites = await apiClient.getFavorites();
          setIsFavorited(favorites.some(fav => fav.listing_id === id));
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        toast.error(error.message || 'Failed to load listing');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorited) {
        await apiClient.removeFavorite(id);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await apiClient.addFavorite(id);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message || 'Failed to update favorites');
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast.error('Please sign in to contact sellers');
      return;
    }

    if (!listing?.created_by) {
      toast.error('Unable to contact seller');
      return;
    }

    navigate(`/messages?recipient=${listing.created_by}&listingId=${id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: listing.title,
        text: `Check out this listing: ${listing.title}`,
        url: window.location.href
      });
    } catch (err) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    if (listing?.created_by) {
      apiClient.getUserReviews(listing.created_by)
        .then(reviewsData => setReviews(reviewsData || []))
        .catch(error => console.error('Error reloading reviews:', error));
    }
    toast.success('Review submitted successfully!');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Button onClick={() => navigate('/marketplace')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
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
              <div className="aspect-square bg-gray-100 relative rounded-lg overflow-hidden">
                {listing.images?.length > 0 ? (
                  <>
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.images.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
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
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Listing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{listing.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant={listing.listing_type === 'for_sale' ? 'default' : 'secondary'}>
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
                {listing.organic && (
                  <Badge variant="outline" className="border-green-200 text-green-800">
                    <Leaf className="w-3 h-3 mr-1" />
                    Organic
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {listing.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-700">{listing.description}</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                {listing.price && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-xl font-bold">${listing.price}</p>
                    {listing.price_unit && (
                      <p className="text-sm text-gray-500">
                        {listing.price_unit.replace('per_', 'per ')}
                      </p>
                    )}
                  </div>
                )}
                {listing.harvest_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Harvest Date</p>
                      <p>{format(new Date(listing.harvest_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                )}
                {listing.location?.formatted_address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p>{listing.location.formatted_address}</p>
                    </div>
                  </div>
                )}
                {listing.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p>{listing.distance} miles away</p>
                    </div>
                  </div>
                )}
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
                <User className="w-4 h-4" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                to={`/user/${owner?.id}`}
                className="flex items-center gap-4 mb-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-primary transition-all">
                  {owner?.profile_image ? (
                    <img 
                      src={owner.profile_image} 
                      alt={owner.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium group-hover:text-primary group-hover:underline">
                    {owner?.full_name}
                    <ChevronRight className="w-4 h-4 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-500">
                        {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              <Button 
                onClick={handleContactSeller}
                className="w-full"
                disabled={!user || listing.created_by === user?.id}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {!user ? 'Sign in to Contact' : listing.created_by === user?.id ? 'Your Listing' : 'Contact Seller'}
              </Button>

              {user && listing.created_by !== user?.id && (
                <Button 
                  variant="outline"
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mt-2"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Leave Review
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
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
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map(review => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < review.rating 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-sm"
                      onClick={() => navigate(`/user/${owner?.id}#reviews`)}
                    >
                      View all reviews
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No reviews yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;