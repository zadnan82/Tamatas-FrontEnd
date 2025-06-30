import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import api from '../utils/api';
import { CATEGORIES, getCategoryLabel, formatPrice } from '../utils/constants';
import { 
  Search, 
  MapPin, 
  Leaf, 
  ShoppingBag, 
  MessageSquare,
  Calendar
} from 'lucide-react';

const Marketplace = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    listing_type: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadListings = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with real API call
      const mockListings = [
        {
          id: 1,
          title: 'Fresh Organic Tomatoes',
          description: 'Vine-ripened heirloom tomatoes from our organic farm.',
          category: 'tomatoes_peppers',
          listing_type: 'for_sale',
          price: 4.50,
          price_unit: 'per_lb',
          organic: true,
          images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'],
          location: { city: 'Springfield', state: 'IL' },
          created_by: { full_name: 'John Farmer' },
          created_date: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Fresh Basil Leaves',
          description: 'Aromatic sweet basil, perfect for pesto.',
          category: 'herbs',
          listing_type: 'for_sale',
          price: 3.00,
          price_unit: 'per_bag',
          organic: true,
          images: ['https://images.unsplash.com/photo-1618375569909-3c8616cf5ecf?w=500'],
          location: { city: 'Madison', state: 'WI' },
          created_by: { full_name: 'Jane Gardener' },
          created_date: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Looking for Fresh Strawberries',
          description: 'Restaurant looking for 10+ lbs of fresh strawberries.',
          category: 'berries',
          listing_type: 'looking_for',
          location: { city: 'Chicago', state: 'IL' },
          created_by: { full_name: 'Chef Mike' },
          created_date: new Date().toISOString()
        }
      ];
      
      // Apply filters
      let filtered = mockListings;
      if (filters.category !== 'all') {
        filtered = filtered.filter(l => l.category === filters.category);
      }
      if (filters.listing_type !== 'all') {
        filtered = filtered.filter(l => l.listing_type === filters.listing_type);
      }
      if (filters.search) {
        filtered = filtered.filter(l => 
          l.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          l.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setListings(filtered);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const ListingCard = ({ listing }) => (
    <Link to={`/listing/${listing.id}`}>
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
          {listing.images && listing.images[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{listing.title}</h3>
            {listing.price && (
              <div className="text-right">
                <p className="font-bold text-green-600">${listing.price}</p>
                <p className="text-xs text-gray-500">{listing.price_unit?.replace('per_', '')}</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={listing.listing_type === 'for_sale' ? 'default' : 'secondary'}>
                {listing.listing_type === 'for_sale' ? 'For Sale' : 'Looking For'}
              </Badge>
              {listing.organic && (
                <Badge variant="outline" className="text-xs">
                  <Leaf className="w-3 h-3 mr-1" />
                  Organic
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{listing.location?.city}, {listing.location?.state}</span>
            </div>
            <span className="text-sm text-gray-500">by {listing.created_by?.full_name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh Marketplace</h1>
          <p className="text-gray-600">Discover fresh produce from local farmers and gardeners</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={filters.listing_type}
                onChange={(e) => setFilters({...filters, listing_type: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">All Types</option>
                <option value="for_sale">For Sale</option>
                <option value="looking_for">Looking For</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? "Loading..." : `${listings.length} listings found`}
          </p>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({ category: 'all', search: '', listing_type: 'all' })}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Marketplace;