import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import Button from '../Components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ArrowLeft, MapPin, Calendar, Heart, MessageSquare } from 'lucide-react';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setListing({
        id: 1,
        title: 'Fresh Organic Tomatoes',
        description: 'Vine-ripened heirloom tomatoes from our organic farm. Perfect for salads and cooking.',
        category: 'tomatoes_peppers',
        listing_type: 'for_sale',
        price: 4.50,
        price_unit: 'per_lb',
        organic: true,
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'],
        location: { city: 'Springfield', state: 'IL' },
        created_by: { full_name: 'John Farmer' },
        created_date: new Date().toISOString()
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse max-w-5xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-video bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h1>
          <Button onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full aspect-video object-cover rounded-lg"
            />
          </div>

          <div>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2">For Sale</Badge>
                    <CardTitle className="text-3xl">{listing.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Heart className="w-6 h-6" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">{listing.description}</p>
                
                {listing.price && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-700">Price</span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${listing.price}</p>
                        <p className="text-sm text-gray-500">{listing.price_unit?.replace('per_', 'per ')}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{listing.location.city}, {listing.location.state}</span>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seller Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{listing.created_by.full_name}</p>
                      </div>
                      <Button>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Seller
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;