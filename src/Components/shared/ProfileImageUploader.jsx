import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, User, Loader2, Camera } from 'lucide-react';

const ProfileImageUploader = ({ 
  currentImageUrl = '', 
  onImageChange, 
  className = '',
  size = 'large', // 'small', 'medium', 'large'
  disabled = false // New prop to disable during saving
}) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Cloudinary configuration - Updated with your cloud name
  const CLOUDINARY_CLOUD_NAME = 'dr2knxtuq'; // Your actual cloud name
  const UPLOAD_PRESET = 'tamatas_profiles'; // This preset must exist and be unsigned

  // Size configurations
  const sizeConfig = {
    small: { width: 'w-16 h-16', text: 'text-xs' },
    medium: { width: 'w-24 h-24', text: 'text-sm' },
    large: { width: 'w-32 h-32', text: 'text-base' }
  };

  const config = sizeConfig[size] || sizeConfig.large;

  useEffect(() => {
    setImageUrl(currentImageUrl);
  }, [currentImageUrl]);

  const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      // Generate unique public_id for profile images
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000);
      formData.append('public_id', `tamatas/profiles/user_${randomId}_${timestamp}`);

      console.log('Uploading to Cloudinary with:');
      console.log('Cloud name:', CLOUDINARY_CLOUD_NAME);
      console.log('Upload preset:', UPLOAD_PRESET);
      console.log('File size:', file.size);
      console.log('File type:', file.type);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        console.log('Upload response status:', xhr.status);
        console.log('Upload response:', xhr.responseText);
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload successful:', response.secure_url);
            resolve(response.secure_url);
          } catch (error) {
            console.error('Error parsing response:', error);
            reject(new Error('Invalid response from server'));
          }
        } else {
          let errorMessage = `Upload failed: ${xhr.status} ${xhr.statusText}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse.error && errorResponse.error.message) {
              errorMessage = errorResponse.error.message;
            }
            console.error('Cloudinary error response:', errorResponse);
          } catch (e) {
            console.error('Raw error response:', xhr.responseText);
          }
          reject(new Error(errorMessage));
        }
      });

      xhr.addEventListener('error', () => {
        console.error('Network error during upload');
        reject(new Error('Network error during upload'));
      });

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      console.log('Uploading to URL:', uploadUrl);
      
      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    console.log('Validating file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
    });

    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }

    console.log('File validation passed');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadProgress(0);
    setIsUploading(true);

    try {
      // Validate the image
      validateImage(file);
      
      // Upload to Cloudinary
      const uploadedUrl = await uploadToCloudinary(file);
      
      // Update local state
      setImageUrl(uploadedUrl);
      
      // Notify parent component
      onImageChange(uploadedUrl);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Test function to check if preset exists
  const testPreset = async () => {
    try {
      const testFormData = new FormData();
      // Create a minimal test file (1x1 transparent PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      testFormData.append('file', blob, 'test.png');
      testFormData.append('upload_preset', UPLOAD_PRESET);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: testFormData
      });
      
      console.log('Preset test response:', response.status);
      if (response.status === 200) {
        console.log('✅ Upload preset is working correctly');
        const result = await response.json();
        console.log('Test upload result:', result.secure_url);
      } else {
        const errorText = await response.text();
        console.log('❌ Upload preset test failed:', errorText);
      }
    } catch (error) {
      console.log('❌ Preset test error:', error);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    onImageChange('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = !!imageUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Debug Information - Remove this in production */}
      <div className="bg-gray-100 p-3 rounded-lg text-xs">
        <div><strong>Debug Info:</strong></div>
        <div>Cloud Name: {CLOUDINARY_CLOUD_NAME}</div>
        <div>Upload Preset: {UPLOAD_PRESET}</div>
        <button 
          onClick={testPreset}
          className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Test Preset
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Image Display */}
        <div className={`${config.width} relative group`}>
          {hasImage ? (
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
              />
              
              {/* Remove button - only show on hover and when not uploading */}
              {!isUploading && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg transform hover:scale-110"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {/* Upload overlay - show on hover */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <label className="cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="w-full h-full border-4 border-dashed border-gray-300 rounded-full bg-gray-50 flex items-center justify-center group-hover:border-orange-400 group-hover:bg-orange-50 transition-colors duration-200">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : (
                <User className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" />
              )}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="w-full max-w-xs mt-3">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Upload Button */}
        {!hasImage && !isUploading && !disabled && (
          <label className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 ${config.text} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Upload className="w-4 h-4" />
            Upload Photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading || disabled}
            />
          </label>
        )}

        {/* Change Photo Button (when image exists) */}
        {hasImage && !isUploading && !disabled && (
          <label className={`inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 ${config.text} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Camera className="w-4 h-4" />
            Change Photo
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isUploading || disabled}
            />
          </label>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="w-full max-w-xs">
            <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-lg">
              {uploadError}
            </p>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Maximum size: 5MB<br />
          Supported: JPG, PNG, GIF, WebP
        </p>
      </div>
    </div>
  );
};

export default ProfileImageUploader;