import React, { useState, useEffect } from 'react';
import { User } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUploader from '@/components/shared/ImageUploader';
import { Save } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    address: '',
    phone: '',
    profile_image: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setFormData({
          full_name: currentUser.full_name || '',
          bio: currentUser.bio || '',
          address: currentUser.address || '',
          phone: currentUser.phone || '',
          profile_image: currentUser.profile_image || '',
        });
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (images) => {
    // ImageUploader returns an array, we only want one for profile
    setFormData({ ...formData, profile_image: images[0] || '' });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await User.updateMyUserData(formData);
      alert("Profile updated successfully!");
    } catch(error) {
      console.error("Failed to update profile", error);
      alert("An error occurred while updating your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Card className="max-w-2xl mx-auto bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Edit Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Profile Image</Label>
              <ImageUploader 
                existingImages={formData.profile_image ? [formData.profile_image] : []}
                onImagesChange={handleImageChange}
                maxImages={1}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}