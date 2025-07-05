import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../Components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import ProfileImageUploader from '../components/shared/ProfileImageUploader.jsx';
import { Save, User, MapPin, Phone, Mail, Shield, Globe } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Basic info
    full_name: '',
    bio: '',
    phone: '',
    address: '',
    profile_image: '',
    
    // Location info (v2.0)
    location: {
      country: '',
      city: '',
      state: '',
      area: ''
    },
    location_precision: 'city',
    search_radius: 25,
    
    // Contact preferences (v2.0)
    whatsapp_number: '',
    contact_preference: 'both',
    show_whatsapp_on_listings: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (user) {
      setFormData({
        // Basic info
        full_name: user.full_name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
        profile_image: user.profile_image || '',
        
        // Location info
        location: {
          country: user.location?.country || '',
          city: user.location?.city || '',
          state: user.location?.state || '',
          area: user.location?.area || ''
        },
        location_precision: user.location_precision || 'city',
        search_radius: user.search_radius || 25,
        
        // Contact preferences
        whatsapp_number: user.whatsapp_number || '',
        contact_preference: user.contact_preference || 'both',
        show_whatsapp_on_listings: user.show_whatsapp_on_listings || false
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
      }));
    }
  };

  // Handle immediate image save when user uploads new profile image
  const handleImageChange = async (imageUrl) => {
    setIsSavingImage(true);
    
    try {
      // Update form data immediately
      const updatedFormData = { ...formData, profile_image: imageUrl };
      setFormData(updatedFormData);
      
      // Save immediately to database via your backend API
      await updateUser({ profile_image: imageUrl });
      
      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Failed to update profile image:', error);
      toast.error('Failed to save profile image. Please try again.');
      
      // Revert the form data if save failed
      setFormData(prev => ({ ...prev, profile_image: formData.profile_image }));
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required location fields
      if (!formData.location.country || !formData.location.city) {
        toast.error('Country and city are required in your location');
        return;
      }
      
      await updateUser(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-orange-500 text-white shadow-md' 
          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const formatLocationDisplay = () => {
    const parts = [];
    if (formData.location.area) parts.push(formData.location.area);
    if (formData.location.city) parts.push(formData.location.city);
    if (formData.location.state) parts.push(formData.location.state);
    if (formData.location.country) parts.push(formData.location.country);
    return parts.join(', ') || 'Location not set';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="clay-card p-6 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="clay-text-title text-3xl font-bold mb-2">My Profile</h1>
            <p className="clay-text-subtitle">Manage your account settings and personal information</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ProfileImageUploader
                currentImageUrl={formData.profile_image}
                onImageChange={handleImageChange}
                size="large"
                disabled={isSavingImage}
              />
              
              {/* Show saving status */}
              {isSavingImage && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-blue-600 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Saving image...
                  </p>
                </div>
              )}
              
              {/* User Info Summary */}
              <div className="mt-6 text-center w-full">
                <h3 className="font-semibold text-lg text-gray-900">
                  {formData.full_name || user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                
                {/* Location Display */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 justify-center text-sm text-gray-600 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="text-xs text-gray-700">{formatLocationDisplay()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Search radius: {formData.search_radius} miles
                  </p>
                </div>
                
                {/* Contact Preferences */}
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 justify-center text-sm text-blue-600 mb-1">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Contact</span>
                  </div>
                  <p className="text-xs text-blue-700 capitalize">
                    {formData.contact_preference.replace('_', ' ')}
                  </p>
                  {formData.whatsapp_number && (
                    <p className="text-xs text-blue-600 mt-1">
                      WhatsApp: {formData.whatsapp_number}
                    </p>
                  )}
                </div>
                
                {formData.bio && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                    {formData.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              
              {/* Tab Navigation */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <TabButton
                  id="basic"
                  label="Basic Info"
                  icon={<User className="w-4 h-4" />}
                  isActive={activeTab === 'basic'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="location"
                  label="Location"
                  icon={<MapPin className="w-4 h-4" />}
                  isActive={activeTab === 'location'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="contact"
                  label="Contact"
                  icon={<Phone className="w-4 h-4" />}
                  isActive={activeTab === 'contact'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="privacy"
                  label="Privacy"
                  icon={<Shield className="w-4 h-4" />}
                  isActive={activeTab === 'privacy'}
                  onClick={setActiveTab}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                
                {/* Basic Information Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Basic Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Full Name
                      </label>
                      <Input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Bio
                      </label>
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself, your gardening experience, etc."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email address cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Address
                      </label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your address or general location"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This is separate from your trading location below
                      </p>
                    </div>
                  </div>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Trading Location
                    </h3>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900">Why we need your location</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Your location helps us connect you with nearby farmers and gardeners. 
                            We use this to show you relevant listings within your search radius.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Country *
                        </label>
                        <Input
                          name="location.country"
                          value={formData.location.country}
                          onChange={handleChange}
                          placeholder="e.g., United States"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          City *
                        </label>
                        <Input
                          name="location.city"
                          value={formData.location.city}
                          onChange={handleChange}
                          placeholder="e.g., New York"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          State/Province
                        </label>
                        <Input
                          name="location.state"
                          value={formData.location.state}
                          onChange={handleChange}
                          placeholder="e.g., New York"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Area/Neighborhood
                        </label>
                        <Input
                          name="location.area"
                          value={formData.location.area}
                          onChange={handleChange}
                          placeholder="e.g., Manhattan"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Search Radius
                      </label>
                      <select
                        name="search_radius"
                        value={formData.search_radius}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value={5}>5 miles</option>
                        <option value={10}>10 miles</option>
                        <option value={25}>25 miles</option>
                        <option value={50}>50 miles</option>
                        <option value={100}>100 miles</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        How far you're willing to travel for trades
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Location Precision
                      </label>
                      <select
                        name="location_precision"
                        value={formData.location_precision}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="city">City level</option>
                        <option value="neighborhood">Neighborhood level</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        How specific you want your location to be
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Contact Preferences
                    </h3>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-900">Contact Options</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Choose how other users can contact you about your listings. 
                            You can always use the built-in messaging system.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        WhatsApp Number
                      </label>
                      <Input
                        name="whatsapp_number"
                        type="tel"
                        value={formData.whatsapp_number}
                        onChange={handleChange}
                        placeholder="+1-555-123-4567"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Include country code (e.g., +1 for US)
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Contact Preference
                      </label>
                      <select
                        name="contact_preference"
                        value={formData.contact_preference}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="messages_only">Platform messages only</option>
                        <option value="whatsapp_only">WhatsApp only</option>
                        <option value="both">Both platform messages and WhatsApp</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="show_whatsapp_on_listings"
                        name="show_whatsapp_on_listings"
                        checked={formData.show_whatsapp_on_listings}
                        onChange={handleChange}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="show_whatsapp_on_listings" className="text-sm text-gray-700">
                        Show WhatsApp button on my listings
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 ml-7">
                      When enabled, buyers can contact you directly via WhatsApp
                    </p>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Privacy & Security
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications about new messages and trades</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Public Profile</h4>
                          <p className="text-sm text-gray-600">Allow other users to view your profile and listings</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Show Distance on Listings</h4>
                          <p className="text-sm text-gray-600">Display how far your listings are from other users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Privacy Note</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Your exact location is never shared publicly. We only show approximate 
                            distances and general area information to protect your privacy.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || isSavingImage}
                    loading={isSubmitting}
                    icon={<Save />}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Completed Trades</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {user?.created_date ? new Date(user.created_date).getFullYear() : 'New'}
              </div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;