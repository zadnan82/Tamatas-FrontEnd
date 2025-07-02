import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import Button from '../Components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import ProfileImageUploader from '../components/shared/ProfileImageUploader.jsx';
import { Save, User } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    address: '',
    profile_image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
        profile_image: user.profile_image || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      await updateUser(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Image Section */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
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
              <div className="mt-6 text-center">
                <h3 className="font-semibold text-lg text-gray-900">
                  {formData.full_name || user?.email?.split('@')[0] || 'User'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {formData.bio && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {formData.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
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
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Contact Information
                  </h3>
                  
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
                      This helps other users find local produce near you
                    </p>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Account Summary
                  </h3>
                  
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
                      <div className="text-2xl font-bold text-orange-600">New</div>
                      <div className="text-sm text-gray-600">Member Since</div>
                    </div>
                  </div>
                </div>

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
                    type="submit" 
                    disabled={isSubmitting || isSavingImage}
                    loading={isSubmitting}
                    icon={<Save />}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;