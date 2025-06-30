
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Listing } from "@/entities/all";
import ImageUploader from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, DollarSign } from "lucide-react";
import { createPageUrl } from "@/utils";
import { CATEGORIES } from "@/components/config/categories";

export default function CreateListingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const listingToEdit = location.state?.listing;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    listing_type: "for_sale",
    price: "",
    price_unit: "per_lb",
    quantity_available: "",
    trade_preference: "both",
    images: [],
    harvest_date: "",
    organic: false,
    location: { city: "", state: "" },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listingToEdit) {
      setFormData({
        ...listingToEdit,
        price: listingToEdit.price || "",
        harvest_date: listingToEdit.harvest_date ? listingToEdit.harvest_date.split('T')[0] : "",
      });
    }
  }, [listingToEdit]);

  const showPrice = formData.trade_preference !== 'trade_only' && formData.listing_type === 'for_sale';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [name]: value }
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSave = { ...formData, price: parseFloat(formData.price) || null };
      
      // Add mock geodata for map demonstration if it doesn't exist
      if (dataToSave.location.city && !dataToSave.location.latitude) {
        // Generate random-ish but plausible coordinates in the US for demo purposes
        dataToSave.location.latitude = 34 + Math.random() * 10;
        dataToSave.location.longitude = -118 + Math.random() * 38;
      }

      if (listingToEdit) {
        await Listing.update(listingToEdit.id, dataToSave);
      } else {
        await Listing.create(dataToSave);
      }
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("Failed to save listing. Please check the form and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>{listingToEdit ? "Edit Listing" : "Create New Listing"}</CardTitle>
          </div>
          <CardDescription>Provide details about the product you want to sell, trade, or find.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Product Details</h3>
              <div>
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g., Fresh Organic Tomatoes"/>
              </div>
              <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe your product, its condition, quantity, etc." />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                   <div>
                      <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
                      <Select name="category" onValueChange={(value) => handleSelectChange('category', value)} value={formData.category} required>
                          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                          <SelectContent>
                              {CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                   <div>
                      <Label htmlFor="listing_type">I am...</Label>
                      <Select name="listing_type" onValueChange={(value) => handleSelectChange('listing_type', value)} value={formData.listing_type} required>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="for_sale">Selling a product</SelectItem>
                              <SelectItem value="looking_for">Looking for a product</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
            </div>
            
            {/* Section 2: Images */}
             <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Product Images</h3>
                <div>
                    <Label htmlFor="images">Images (up to 3, at least 1 required) <span className="text-red-500">*</span></Label>
                    <ImageUploader existingImages={formData.images} onImagesChange={handleImagesChange} />
                </div>
            </div>
            
            {/* Section 3: Pricing & Trade */}
            {formData.listing_type === 'for_sale' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Pricing & Trade Options</h3>
              <div>
                <Label>How do you want to exchange?</Label>
                <Select name="trade_preference" onValueChange={(value) => handleSelectChange('trade_preference', value)} value={formData.trade_preference}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="both">Sell or Trade</SelectItem>
                        <SelectItem value="sale_only">Sell for Money Only</SelectItem>
                        <SelectItem value="trade_only">Trade for Goods Only</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {showPrice && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="pl-10" placeholder="e.g., 4.50" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price_unit">Per</Label>
                  <Select name="price_unit" onValueChange={(value) => handleSelectChange('price_unit', value)} value={formData.price_unit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="per_lb">Pound (lb)</SelectItem>
                          <SelectItem value="per_kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="per_piece">Piece</SelectItem>
                          <SelectItem value="per_dozen">Dozen</SelectItem>
                          <SelectItem value="per_bag">Bag</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>
              )}
            </div>
            )}
            
            {/* Section 4: Quantity and Harvest */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Quantity & Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quantity_available">Quantity Available</Label>
                  <Input id="quantity_available" name="quantity_available" value={formData.quantity_available} onChange={handleChange} placeholder="e.g., 10 lbs or 20 pieces" />
                </div>
                <div>
                  <Label htmlFor="harvest_date">Harvest Date (optional)</Label>
                  <Input id="harvest_date" name="harvest_date" type="date" value={formData.harvest_date} onChange={handleChange} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="organic" name="organic" checked={formData.organic} onCheckedChange={(checked) => handleCheckboxChange('organic', checked)} />
                <Label htmlFor="organic">Organic</Label>
              </div>
            </div>

            {/* Section 5: Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={formData.location.city} onChange={handleLocationChange} placeholder="e.g., Springfield" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={formData.location.state} onChange={handleLocationChange} placeholder="e.g., IL" />
                </div>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : (listingToEdit ? 'Save Changes' : 'Publish Listing')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
