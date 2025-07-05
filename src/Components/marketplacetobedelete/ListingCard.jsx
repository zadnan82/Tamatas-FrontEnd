import React from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import Badge from "../ui/badge";
import Button from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { 
  MapPin, 
  Calendar,
  Star,
  MessageSquare,
  ShoppingBag,
  Search,
  Leaf,
  Heart,
  Eye,
  Clock,
  User
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { getCategoryLabel } from "../../utils/constants";

export default function ListingCard({ listing, onToggleFavorite, isFavorited }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContact = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Please sign in to contact sellers');
      return;
    }
    
    if (listing.created_by === user.id) {
      alert('This is your own listing');
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

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onToggleFavorite) {
      onToggleFavorite(listing.id);
    }
  };

  // Extract owner info from listing data
  const ownerName = listing.owner?.full_name || 
                   listing.created_by_name || 
                   listing.created_by?.split('@')[0] || 
                   'Anonymous User';
  
  const ownerAvatar = listing.owner?.profile_image || 
                     listing.created_by_avatar || 
                     null;

  return (
    <Link to={`/listing/${listing.id}`} className="block group">
      <Card className="group hover:shadow-xl transition-all duration-300 border-green-100 bg-white/80 backdrop-blur-sm overflow-hidden h-full flex flex-col">
        <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
          {listing.images && listing.images.length > 0 && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback icon when no image */}
          <div className="w-full h-full flex items-center justify-center" style={{ display: listing.images?.[0] ? 'none' : 'flex' }}>
            <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="absolute top-3 left-3">
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
          
          <div className="absolute top-3 right-3 flex gap-2">
            {listing.organic && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                <Leaf className="w-3 h-3 mr-1" />
                Organic
              </Badge>
            )}
            
            {user && (
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${
                  isFavorited ? 'text-red-500 bg-white/80' : 'text-gray-400 bg-white/60 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
              </button>
            )}
          </div>
          
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Eye className="w-3 h-3" />
              <span>{listing.view_count || 0}</span>
            </div>
          </div>
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                {listing.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {getCategoryLabel(listing.category)}
              </p>
            </div>
            {listing.price && (
              <div className="text-right ml-3">
                <p className="font-bold text-xl text-green-600">
                  ${listing.price}
                </p>
                <p className="text-xs text-gray-500">
                  {listing.price_unit?.replace('per_', '')}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4 flex-grow flex flex-col justify-between">
          <div>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">
              {listing.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              {listing.location?.city && listing.location?.state && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.location.city}, {listing.location.state}</span>
                </div>
              )}
              {listing.harvest_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(listing.harvest_date), 'MMM d')}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            {/* Owner info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden">
                {ownerAvatar ? (
                  <img 
                    src={ownerAvatar} 
                    alt={ownerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {ownerName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{ownerName}</p>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs">(4.0)</span>
                </div>
              </div>
            </div>
            
            {/* Footer with timestamp and contact button */}
            <div className="flex items-center justify-between pt-3 border-t border-green-100">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}</span>
              </div>
              
              <Button 
                size="sm"
                onClick={handleContact}
                disabled={!user || listing.created_by === user?.id}
                className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {!user ? 'Sign in' : listing.created_by === user?.id ? 'Your listing' : 'Contact'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}