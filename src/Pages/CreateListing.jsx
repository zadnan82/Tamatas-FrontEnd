// Temporary debug version - replace your CreateListing.jsx with this to debug the issue

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import Button from '../Components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { apiClient } from '../config/api';
import { CATEGORIES, PRICE_UNITS, TRADE_PREFERENCES } from '../utils/constants';
import { ArrowLeft, Save, Upload, X, DollarSign, Loader2 } from 'lucide-react';

const CreateListing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const listingToEdit = location.state?.listing;

  // Debug: Log the backend URL
  console.log('Backend URL:', apiClient.baseURL);

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

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await fetch(`${apiClient.baseURL}/health`);
      console.log('Health check response:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('Health check data:', data);
      }
    } catch (error) {
      console.error('Backend connection test failed:', error);
    }
  };

  useEffect(() => {
    testBackendConnection();
    
    if (listingToEdit) {
      setFormData({
        ...listingToEdit,
        price: listingToEdit.price || '',
        harvest_date: listingToEdit.harvest_date ? listingToEdit.harvest_date.split('T')[0] : '',
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
    console.log('Form field changed:', { name, value, type, checked });
    
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

  // Mock image upload for testing
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files.length);
    
    // For debugging, just add mock URLs
    const mockUrls = files.map((file, index) => 
      `https://res.cloudinary.com/dr2knxtuq/image/upload/v1234567890/tamatas/listings/test_${index}.jpg`
    );
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...mockUrls]
    }));
    
    toast.success(`Added ${files.length} mock image(s) for testing`);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Raw form data:', formData);
    
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
      // Clean up the data before sending - EXACTLY match your Pydantic model
      const dataToSave = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        category: formData.category,
        subcategory: formData.subcategory || '',
        listing_type: formData.listing_type,
        price: formData.price ? parseFloat(formData.price) : null,
        price_unit: formData.price_unit || 'per_lb',
        quantity_available: formData.quantity_available?.trim() || '',
        trade_preference: formData.trade_preference || 'both',
        images: formData.images,
        status: 'active',
        harvest_date: formData.harvest_date || null,
        organic: Boolean(formData.organic),
        location: {
          city: formData.location?.city?.trim() || '',
          state: formData.location?.state?.trim() || '',
          latitude: null,
          longitude: null
        },
        view_count: 0
      };

      console.log('=== CLEANED DATA TO SEND ===');
      console.log(JSON.stringify(dataToSave, null, 2));
      
      // Validate the data structure
      console.log('=== DATA VALIDATION ===');
      console.log('Title type:', typeof dataToSave.title, 'Value:', dataToSave.title);
      console.log('Description type:', typeof dataToSave.description, 'Value:', dataToSave.description);
      console.log('Category type:', typeof dataToSave.category, 'Value:', dataToSave.category);
      console.log('Listing type:', typeof dataToSave.listing_type, 'Value:', dataToSave.listing_type);
      console.log('Price type:', typeof dataToSave.price, 'Value:', dataToSave.price);
      console.log('Price unit type:', typeof dataToSave.price_unit, 'Value:', dataToSave.price_unit);
      console.log('Images type:', typeof dataToSave.images, 'Length:', dataToSave.images.length);
      console.log('Organic type:', typeof dataToSave.organic, 'Value:', dataToSave.organic);
      console.log('Location type:', typeof dataToSave.location, 'Value:', dataToSave.location);
      
      // Test with a minimal payload first
      const minimalData = {
        title: formData.title.trim(),
        category: formData.category,
        listing_type: formData.listing_type,
        images: formData.images
      };
      
      console.log('=== TESTING WITH MINIMAL DATA ===');
      console.log(JSON.stringify(minimalData, null, 2));

      if (listingToEdit) {
        await apiClient.updateListing(listingToEdit.id, dataToSave);
        toast.success('Listing updated successfully!');
      } else {
        console.log('=== CALLING CREATE LISTING ===');
        const result = await apiClient.createListing(dataToSave);
        console.log('=== LISTING CREATION SUCCESS ===');
        console.log('Result:', result);
        toast.success('Listing created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.data) {
        console.error('Error data:', error.data);
      }
      
      if (error.status) {
        console.error('HTTP status:', error.status);
      }
      
      // Better error handling
      let errorMessage = 'Failed to save listing. Please try again.';
      
      if (error.message && error.message !== '[object Object]') {
        errorMessage = error.message;
      } else if (error.data) {
        try {
          errorMessage = JSON.stringify(error.data, null, 2);
        } catch {
          errorMessage = 'Backend validation error - check console for details';
        }
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
              {listingToEdit ? 'Edit Listing' : 'Create New Listing (DEBUG MODE)'}
            </h1>
            <p className="text-gray-600">Debug version with detailed logging</p>
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

              {/* Images Section - Simplified for debugging */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images (Required) - Mock Upload for Testing</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm">Mock Image {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.images.length < 3 && (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="mt-1 text-sm text-gray-500">Add Mock Image</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                
                {formData.images.length === 0 && (
                  <p className="text-sm text-red-500">At least one image is required.</p>
                )}
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

              {/* Debug Info */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Debug Info:</h4>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(formData, null, 2)}
                </pre>
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