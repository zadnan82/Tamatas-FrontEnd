import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import Button from '../Components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { apiClient } from '../config/api';
import { CATEGORIES, PRICE_UNITS, TRADE_PREFERENCES } from '../utils/constants';
import { ArrowLeft, Save, Upload, X, DollarSign, MapPin, Gift, ShoppingBag, Search } from 'lucide-react';
import ImageUploader from '../Components/shared/ImageUploader';

const CreateListing = ({ listingToEdit, onNavigate, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tomatoes_peppers',
    listing_type: 'for_sale', // for_sale, looking_for, give_away
    price: '',
    price_unit: 'per_lb',
    quantity_available: '',
    trade_preference: 'both',
    images: [],
    harvest_date: '',
    organic: false,
    // Location is now mandatory and uses user's location by default
    location: {
      country: '',
      city: '',
      state: '',
      area: '',
      latitude: null,
      longitude: null
    },
    use_user_location: true // New: option to use user's location
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  useEffect(() => {
    // Initialize with user's location if available
    if (user?.location && user?.latitude && user?.longitude) {
      setFormData(prev => ({
        ...prev,
        location: {
          country: user.location.country || '',
          city: user.location.city || '',
          state: user.location.state || '',
          area: user.location.area || '',
          latitude: user.latitude,
          longitude: user.longitude
        }
      }));
    }

    // If editing, populate form
    if (listingToEdit) {
      setFormData(prev => ({
        ...prev,
        ...listingToEdit,
        price: listingToEdit.price || '',
        harvest_date: listingToEdit.harvest_date ? 
          listingToEdit.harvest_date.split('T')[0] : '',
        location: {
          country: listingToEdit.location?.country || prev.location.country,
          city: listingToEdit.location?.city || prev.location.city,
          state: listingToEdit.location?.state || prev.location.state,
          area: listingToEdit.location?.area || prev.location.area,
          latitude: listingToEdit.location?.latitude || prev.location.latitude,
          longitude: listingToEdit.location?.longitude || prev.location.longitude
        },
        images: listingToEdit.images || [],
        use_user_location: false // When editing, don't auto-use user location
      }));
    }
  }, [listingToEdit, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear price when switching to give_away
    if (name === 'listing_type' && value === 'give_away') {
      setFormData(prev => ({ ...prev, price: '' }));
    }
  };

  const handleUseUserLocation = () => {
    if (user?.location && user?.latitude && user?.longitude) {
      setFormData(prev => ({
        ...prev,
        location: {
          country: user.location.country || '',
          city: user.location.city || '',
          state: user.location.state || '',
          area: user.location.area || '',
          latitude: user.latitude,
          longitude: user.longitude
        },
        use_user_location: true
      }));
      toast.success('Using your profile location');
    } else {
      toast.error('Please set your location in your profile first');
      if (onNavigate) onNavigate('/profile');
    }
  };

  const searchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    try {
      // This would call your location search API if available
      // For now, we'll use a simple approach
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    } catch (error) {
      console.warn('Location search not available:', error);
    }
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title for your listing.');
      return;
    }

    // Validate location (now mandatory)
    if (!formData.location.country || !formData.location.city) {
      toast.error('Please provide at least country and city for your listing location.');
      return;
    }

    // Validate price for sale listings
    if (formData.listing_type === 'for_sale' && formData.trade_preference !== 'trade_only') {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Please enter a valid price for sale listings.');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for backend
      const listingData = {
        ...formData,
        // Ensure price is properly handled
        price: formData.listing_type === 'give_away' ? 0 : 
               (formData.price ? parseFloat(formData.price) : null),
        // Ensure location has required fields
        location: {
          country: formData.location.country,
          city: formData.location.city,
          state: formData.location.state || '',
          area: formData.location.area || '',
          latitude: formData.location.latitude,
          longitude: formData.location.longitude
        }
      };

      if (listingToEdit) {
        await apiClient.updateListing(listingToEdit.id, listingData);
        toast.success('Listing updated successfully!');
      } else {
        await apiClient.createListing(listingData);
        toast.success('Listing created successfully!');
      }
      
      if (onNavigate) {
        onNavigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving listing:', error);
      
      let errorMessage = 'Failed to save listing. Please try again.';
      if (error.message && !error.message.includes('[object Object]')) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if price should be shown
  const showPrice = formData.listing_type === 'for_sale' && formData.trade_preference !== 'trade_only';
  const isPriceRequired = formData.listing_type === 'for_sale' && formData.trade_preference !== 'trade_only';

  const formatLocationDisplay = () => {
    const parts = [];
    if (formData.location.area) parts.push(formData.location.area);
    if (formData.location.city) parts.push(formData.location.city);
    if (formData.location.state) parts.push(formData.location.state);
    if (formData.location.country) parts.push(formData.location.country);
    return parts.join(', ') || 'Location not set';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBack || (() => onNavigate && onNavigate(-1))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {listingToEdit ? 'Edit Listing' : 'Create New Listing'}
            </h1>
            <p className="text-gray-600">Share your fresh produce with the community</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Fresh Organic Tomatoes"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your product..."
                    rows={4}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      {CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Listing Type *</label>
                    <select
                      name="listing_type"
                      value={formData.listing_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="for_sale">🏷️ For Sale - Selling a product</option>
                      <option value="give_away">🎁 Give Away - Free to good home</option>
                      <option value="looking_for">🔍 Looking For - Need to buy/find</option>
                    </select>
                  </div>
                </div>

                {/* Listing Type Info */}
                <div className={`p-4 rounded-lg border ${
                  formData.listing_type === 'for_sale' ? 'bg-green-50 border-green-200' :
                  formData.listing_type === 'give_away' ? 'bg-purple-50 border-purple-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {formData.listing_type === 'for_sale' && <ShoppingBag className="w-5 h-5 text-green-600" />}
                    {formData.listing_type === 'give_away' && <Gift className="w-5 h-5 text-purple-600" />}
                    {formData.listing_type === 'looking_for' && <Search className="w-5 h-5 text-blue-600" />}
                    <span className="font-medium">
                      {formData.listing_type === 'for_sale' && 'Selling Product'}
                      {formData.listing_type === 'give_away' && 'Giving Away for Free'}
                      {formData.listing_type === 'looking_for' && 'Looking to Buy/Find'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {formData.listing_type === 'for_sale' && 'You\'re selling produce for money or trade.'}
                    {formData.listing_type === 'give_away' && 'You\'re giving away excess produce for free - great for building community!'}
                    {formData.listing_type === 'looking_for' && 'You\'re looking to buy or find specific produce from others.'}
                  </p>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Images (Required)</h3>
                <ImageUploader
                  existingImages={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* Pricing Section (for_sale only) */}
              {formData.listing_type === 'for_sale' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Pricing & Trade Options</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">How do you want to exchange?</label>
                    <select
                      name="trade_preference"
                      value={formData.trade_preference}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {TRADE_PREFERENCES.map(pref => (
                        <option key={pref.value} value={pref.value}>{pref.label}</option>
                      ))}
                    </select>
                  </div>

                  {showPrice && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Price {isPriceRequired && '*'}
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="e.g., 4.50"
                            required={isPriceRequired}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Per</label>
                        <select
                          name="price_unit"
                          value={formData.price_unit}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {PRICE_UNITS.map(unit => (
                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Give Away Message */}
              {formData.listing_type === 'give_away' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Free Community Sharing</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    This listing will be marked as FREE and help reduce food waste in your community. 
                    Great for excess garden produce or items that need to be used quickly!
                  </p>
                </div>
              )}

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Additional Details</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity Available</label>
                    <Input
                      name="quantity_available"
                      value={formData.quantity_available}
                      onChange={handleChange}
                      placeholder="e.g., 10 lbs, 20 pieces, 5 bags"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Harvest Date (optional)</label>
                    <Input
                      name="harvest_date"
                      type="date"
                      value={formData.harvest_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="organic"
                    name="organic"
                    checked={formData.organic}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="organic" className="text-sm font-medium">
                    🌱 Certified Organic
                  </label>
                </div>
              </div>

              {/* Location Section - Now Mandatory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location (Required)
                </h3>
                
                {/* Current Location Display */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Current listing location:</p>
                      <p className="text-sm text-gray-600">{formatLocationDisplay()}</p>
                    </div>
                    {user?.location && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUseUserLocation}
                      >
                        Use My Location
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country *</label>
                    <Input
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <Input
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder="e.g., Springfield"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">State/Province</label>
                    <Input
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      placeholder="e.g., Illinois"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Area/Neighborhood</label>
                    <Input
                      name="location.area"
                      value={formData.location.area}
                      onChange={handleChange}
                      placeholder="e.g., Downtown (optional)"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">Location Privacy</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your exact address is never shared. We only show general area and approximate distance to help users find local produce.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={onBack || (() => onNavigate && onNavigate('/dashboard'))}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  icon={<Save />}
                >
                  {isSubmitting ? 'Saving...' : (listingToEdit ? 'Update Listing' : 'Create Listing')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;