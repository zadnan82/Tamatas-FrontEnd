import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MapPin, 
  Calendar,
  Star,
  MessageSquare,
  ShoppingBag,
  Search,
  Leaf,
  Heart
} from "lucide-react";
import { format } from "date-fns";
import { getCategoryLabel } from "@/components/config/categories";

export default function ListingCard({ listing }) {
  const navigate = useNavigate();

  const handleContact = (e, listing) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(createPageUrl(`Messages?recipient=${listing.created_by}&listingId=${listing.id}&listingTitle=${encodeURIComponent(listing.title)}`));
  };

  const handleViewProfile = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    // This is just a placeholder; fetching user by email to get ID is needed.
    // For now, let's assume we can navigate directly if the page can handle email.
    // A better approach would be to have user ID available here.
    console.log("View profile:", userId);
    // navigate(createPageUrl(`UserProfile?email=${userId}`));
  };

  return (
    <Link to={createPageUrl(`ListingDetails?id=${listing.id}`)} className="block">
        <Card className="group hover:shadow-xl transition-all duration-300 border-green-100 bg-white/80 backdrop-blur-sm overflow-hidden h-full flex flex-col">
          <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 relative overflow-hidden">
            {listing.images && listing.images[0] ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
              </div>
            )}
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
            {listing.organic && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Organic
                </Badge>
              </div>
            )}
          </div>
          
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-700 transition-colors">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {getCategoryLabel(listing.category)}
                </p>
              </div>
              {listing.price && (
                <div className="text-right">
                  <p className="font-bold text-xl text-green-600">
                    ${listing.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    {listing.price_unit?.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-4 flex-grow flex flex-col justify-between">
            <p className="text-gray-600 text-sm line-clamp-2">
              {listing.description}
            </p>
            
            <div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {listing.location && (
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

                <div className="flex items-center justify-between pt-4 border-t border-green-100">
                    <p className="text-sm text-gray-600">by <span className="font-medium">{listing.created_by.split('@')[0]}</span></p>
                    <Button 
                        size="sm"
                        onClick={(e) => handleContact(e, listing)}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
    </Link>
  );
}