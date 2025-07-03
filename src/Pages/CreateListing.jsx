import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import Button from '../Components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { apiClient } from '../config/api';
import { CATEGORIES, PRICE_UNITS, TRADE_PREFERENCES } from '../utils/constants';
import { ArrowLeft, Save, Upload, X, DollarSign } from 'lucide-react';
import ImageUploader from '../Components/shared/ImageUploader';

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const listingToEdit = location.state?.listing;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tomatoes_peppers',
    listing_type: 'for_sale',
    price: '',
    price_unit: 'per_lb',
    quantity_available: '',
    trade_preference: 'both',
    images: [],
    harvest_date: '',
    organic: false,
    location: { city: '', state: '' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listingToEdit) {
      setFormData({
        ...listingToEdit,
        price: listingToEdit.price || '',
        harvest_date: listingToEdit.harvest_date ? 
          listingToEdit.harvest_date.split('T')[0] : '', // Convert back to date format for input
        location: {
          city: listingToEdit.location?.city || '',
          state: listingToEdit.location?.state || ''
        },
        images: listingToEdit.images || []
      });
    }
  }, [listingToEdit]);

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

    setIsSubmitting(true);
    
    try {
      if (listingToEdit) {
        await apiClient.updateListing(listingToEdit.id, formData);
        toast.success('Listing updated successfully!');
      } else {
        const result = await apiClient.createListing(formData);
        toast.success('Listing created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving listing:', error);
      
      let errorMessage = 'Failed to save listing. Please try again.';
      if (error.message && error.message !== '[object Object]') {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showPrice = formData.trade_preference !== 'trade_only' && formData.listing_type === 'for_sale';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      {CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select
                      name="listing_type"
                      value={formData.listing_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      <option value="for_sale">Selling a product</option>
                      <option value="looking_for">Looking for a product</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images (Required)</h3>
                <ImageUploader
                  existingImages={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={3}
                  disabled={isSubmitting}
                />
              </div>

              {/* Pricing (only for for_sale) */}
              {formData.listing_type === 'for_sale' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing & Trade Options</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">How do you want to exchange?</label>
                    <select
                      name="trade_preference"
                      value={formData.trade_preference}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    >
                      {TRADE_PREFERENCES.map(pref => (
                        <option key={pref.value} value={pref.value}>{pref.label}</option>
                      ))}
                    </select>
                  </div>

                  {showPrice && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            name="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="e.g., 4.50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Per</label>
                        <select
                          name="price_unit"
                          value={formData.price_unit}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
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

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity Available</label>
                    <Input
                      name="quantity_available"
                      value={formData.quantity_available}
                      onChange={handleChange}
                      placeholder="e.g., 10 lbs, 20 pieces"
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
                    className="rounded"
                  />
                  <label htmlFor="organic" className="text-sm font-medium">Organic</label>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <Input
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      placeholder="e.g., Springfield"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <Input
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      placeholder="e.g., IL"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : (listingToEdit ? 'Update Listing' : 'Create Listing')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;