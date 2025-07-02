import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import api from '../utils/api';
import { CATEGORIES, PRICE_UNITS, TRADE_PREFERENCES } from '../utils/constants';
import { ArrowLeft, Save, Upload, X, DollarSign } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (listingToEdit) {
      setFormData({
        ...listingToEdit,
        price: listingToEdit.price || '',
        harvest_date: listingToEdit.harvest_date ? listingToEdit.harvest_date.split('T')[0] : '',
        // Ensure location object exists with default values
        location: {
          city: listingToEdit.location?.city || '',
          state: listingToEdit.location?.state || ''
        },
        // Ensure images array exists
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 3) {
      toast.error('You can only upload a maximum of 3 images.');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => api.uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(result => result.url);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSave = { 
        ...formData, 
        price: parseFloat(formData.price) || null 
      };

      if (listingToEdit) {
        await api.updateListing(listingToEdit.id, dataToSave);
        toast.success('Listing updated successfully!');
      } else {
        await api.createListing(dataToSave);
        toast.success('Listing created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error('Failed to save listing. Please try again.');
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
            <p className="text-gray-600">Share what you're selling or looking for</p>
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

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images (Required)</h3>
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={image} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-32 object-cover rounded-lg" 
                      />
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
                      {uploading ? (
                        <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full"></div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="mt-1 text-sm text-gray-500">Upload Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
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

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
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