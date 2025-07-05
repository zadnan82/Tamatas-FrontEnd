// src/components/marketplace/ListingCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Leaf, 
  Eye, 
  MapPin, 
  Clock, 
  Star, 
  MessageSquare,
  ShoppingBag,
  UserSearch,
  Gift,
  Target
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ListingCard = ({ listing, compact = false, highlighted = false, favorites = [], onToggleFavorite }) => {
  const isFavorited = favorites.includes(listing.id);
  
  const getListingTypeInfo = (type) => {
    switch(type) {
      case 'for_sale':
        return {
          color: 'bg-green-500 text-white',
          icon: ShoppingBag,
          label: 'For Sale'
        };
      case 'looking_for':
        return {
          color: 'bg-blue-500 text-white',
          icon: UserSearch,
          label: 'Looking For'
        };
      case 'give_away':
        return {
          color: 'bg-orange-500 text-white',
          icon: Gift,
          label: 'FREE'
        };
      default:
        return {
          color: 'bg-gray-500 text-white',
          icon: Target,
          label: 'Unknown'
        };
    }
  };

  const typeInfo = getListingTypeInfo(listing.listing_type);
  const TypeIcon = typeInfo.icon;
  
  if (compact) {
    return (
      <div className={`clay-card p-3 bg-white/60 hover:scale-[1.01] transition-all duration-300 group ${
        highlighted ? 'ring-2 ring-orange-400 bg-orange-50/60' : ''
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
            {listing.images && listing.images[0] ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1 sm:mb-2">
              <div className="flex-1">
                <Link 
                  to={`/listing/${listing.id}`}
                  className="text-sm sm:text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1 group-hover:text-orange-600"
                >
                  {listing.title}
                </Link>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{listing.description}</p>
              </div>
              
              {/* Price display logic for three types */}
              {listing.listing_type === 'for_sale' && listing.price && (
                <div className="text-right ml-2">
                  <p className="font-bold text-sm sm:text-base text-green-600">${listing.price}</p>
                  <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
                </div>
              )}
              {listing.listing_type === 'give_away' && (
                <div className="text-right ml-2">
                  <p className="font-bold text-sm sm:text-base text-orange-600">FREE</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                  <TypeIcon className="w-2 h-2" />
                  {typeInfo.label}
                </span>
                
                {listing.organic && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <Leaf className="w-2 h-2" />
                    Organic
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {listing.distance && (
                  <span className="text-xs text-gray-500 mr-1">
                    {listing.distance} miles
                  </span>
                )}
                
                <button
                  onClick={() => onToggleFavorite(listing.id)}
                  className={`p-1 rounded-lg ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
                >
                  <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500' : ''}`} />
                </button>
                <Link 
                  to={`/listing/${listing.id}`}
                  className="px-2 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg text-xs font-medium"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/listing/${listing.id}`} className="block group">
      <div className={`clay-card bg-white/60 backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300 h-full flex flex-col ${
        highlighted ? 'ring-2 ring-orange-400 bg-orange-50/60' : ''
      }`}>
        <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
          {listing.images && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-200 rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          )}
          
          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md ${typeInfo.color}`}>
              <TypeIcon className="w-2 h-2" />
              {typeInfo.label}
            </span>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-1">
            {listing.organic && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <Leaf className="w-2 h-2" />
                Organic
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(listing.id);
              }}
              className={`p-1 rounded-lg backdrop-blur-sm ${
                isFavorited ? 'text-red-500 bg-white/80' : 'text-gray-400 bg-white/60'
              }`}
            >
              <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500' : ''}`} />
            </button>
          </div>
          
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
              <Eye className="w-2 h-2" />
              <span>{listing.view_count || 0}</span>
            </div>
            {listing.distance && (
              <div className="flex items-center gap-1 text-white text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                <MapPin className="w-2 h-2" />
                <span>{listing.distance}mi</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                {listing.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{listing.category?.replace('_', ' ')}</p>
            </div>
            
            {/* Enhanced price display */}
            {listing.listing_type === 'for_sale' && listing.price && (
              <div className="text-right ml-2">
                <p className="font-bold text-base sm:text-lg text-green-600">${listing.price}</p>
                <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
              </div>
            )}
            {listing.listing_type === 'give_away' && (
              <div className="text-right ml-2">
                <p className="font-bold text-base sm:text-lg text-orange-600">FREE</p>
                <p className="text-xs text-gray-500">Give Away</p>
              </div>
            )}
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{listing.description}</p>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {listing.owner?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-xs">{listing.owner?.full_name || 'Anonymous'}</p>
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-2 h-2 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs">(4.0)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {listing.location?.city && listing.location?.country 
                    ? `${listing.location.city}, ${listing.location.country}`
                    : 'Location not specified'
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(listing.created_date), { addSuffix: true })}</span>
              </div>
            </div>
            
            {/* Dynamic button based on listing type */}
            <button className={`w-full py-2 font-semibold flex items-center justify-center gap-2 text-xs rounded-lg ${
              listing.listing_type === 'for_sale' 
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white'
                : listing.listing_type === 'looking_for'
                ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                : 'bg-gradient-to-r from-orange-400 to-amber-400 text-white'
            }`}>
              <MessageSquare className="w-3 h-3" />
              {listing.listing_type === 'for_sale' && 'Contact Seller'}
              {listing.listing_type === 'looking_for' && 'Offer Help'}
              {listing.listing_type === 'give_away' && 'Claim Free Item'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;