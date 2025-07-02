import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImageUploader = ({ 
  existingImages = [], 
  onImagesChange, 
  maxImages = 3,
  singleImage = false, // New prop for profile images
  className = ''
}) => {
  const [images, setImages] = useState(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Cloudinary configuration - Replace with your actual values
  const CLOUDINARY_CLOUD_NAME = 'dr2knxtuq'; // Replace with your Cloudinary cloud name
  const UPLOAD_PRESET = 'tamatas_images'; // Create this preset in your Cloudinary dashboard
  
  // You can also get these from environment variables:
  // const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  // const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      // Generate unique public_id for better organization
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000);
      const folder = singleImage ? 'profiles' : 'listings';
      formData.append('public_id', `tamatas/${folder}/img_${randomId}_${timestamp}`);
      
      // Add transformation for optimization
      formData.append('transformation', 'c_limit,w_800,h_600,q_auto,f_auto');

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    });
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Image size must be less than 5MB');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadError('');
    setUploadProgress(0);

    if (!files.length) return;

    // For single image mode (profile), only take the first file
    const filesToUpload = singleImage ? [files[0]] : files;

    // Check if we're exceeding the limit
    const totalAfterUpload = singleImage ? 1 : images.length + filesToUpload.length;
    if (totalAfterUpload > maxImages) {
      setUploadError(`You can only upload a maximum of ${maxImages} image${maxImages > 1 ? 's' : ''}.`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrls = [];

      for (const file of filesToUpload) {
        try {
          // Validate each file
          validateImage(file);
          
          // Upload to Cloudinary
          const imageUrl = await uploadToCloudinary(file);
          uploadedUrls.push(imageUrl);
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          setUploadError(`Failed to upload ${file.name}: ${error.message}`);
          // Continue with other files if multiple, or break if single
          if (singleImage) break;
        }
      }

      if (uploadedUrls.length > 0) {
        let newImages;
        if (singleImage) {
          // For single image mode, replace the existing image
          newImages = [uploadedUrls[0]];
        } else {
          // For multiple images, add to existing
          newImages = [...images, ...uploadedUrls];
        }
        
        setImages(newImages);
        onImagesChange(newImages);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesChange(newImages);
    setUploadError(''); // Clear any existing errors
  };

  const removeAllImages = () => {
    setImages([]);
    onImagesChange([]);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render for single image mode (profile picture)
  if (singleImage) {
    const hasImage = images.length > 0;
    
    return (
      <div className={`space-y-4 ${className}`}>
        {hasImage ? (
          <div className="relative group">
            <div className="relative w-32 h-32 mx-auto">
              <img 
                src={images[0]} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-md"
              />
              <button
                type="button"
                onClick={() => removeImage(0)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="text-center mt-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload className="w-4 h-4" />
                Change Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <Upload className="w-4 h-4" />
              Upload Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {/* Progress bar for single image */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {uploadError && (
          <p className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-lg">{uploadError}</p>
        )}
        
        <p className="text-xs text-gray-500 text-center">
          Maximum size: 5MB • Supported: JPG, PNG, GIF, WebP
        </p>
      </div>
    );
  }

  // Render for multiple images mode (listings)
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img 
              src={url} 
              alt={`Upload ${index + 1}`} 
              className="w-full h-full object-cover rounded-lg border-2 border-gray-200" 
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              disabled={isUploading}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-center text-gray-500">Upload</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple={!singleImage}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Progress bar for multiple images */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Controls for multiple images */}
      {images.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {images.length} of {maxImages} image{maxImages > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={removeAllImages}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
            disabled={isUploading}
          >
            Remove All
          </button>
        </div>
      )}

      {uploadError && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{uploadError}</p>
      )}
      
      {images.length === 0 && (
        <p className="text-sm text-red-500 text-center">At least one image is required.</p>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        Maximum size: 5MB per image • Supported: JPG, PNG, GIF, WebP
      </p>
    </div>
  );
};

export default ImageUploader;