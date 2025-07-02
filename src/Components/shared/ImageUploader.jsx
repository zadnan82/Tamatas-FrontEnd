import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

const ImageUploader = ({ 
  existingImages = [], 
  onImagesChange, 
  maxImages = 3,
  singleImage = false,
  className = '',
  disabled = false
}) => {
  const [images, setImages] = useState(existingImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Cloudinary configuration - Replace with your actual values
  const CLOUDINARY_CLOUD_NAME = 'dr2knxtuq'; // Your actual cloud name
  const UPLOAD_PRESET = singleImage ? 'tamatas_profiles' : 'tamatas_images'; // Different presets for different use cases
  
  const uploadToCloudinary = async (file, fileId) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      // Generate unique public_id for better organization
      const timestamp = Date.now();
      const randomId = Math.floor(Math.random() * 1000);
      const folder = singleImage ? 'profiles' : 'listings';
      formData.append('public_id', `tamatas/${folder}/img_${randomId}_${timestamp}`);
      
      // Set folder for organization (allowed with unsigned uploads)
      formData.append('folder', `tamatas/${folder}`);

      console.log('Uploading to Cloudinary:', {
        cloudName: CLOUDINARY_CLOUD_NAME,
        preset: UPLOAD_PRESET,
        folder: `tamatas/${folder}`,
        fileName: file.name
      });

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: progress
          }));
        }
      });

      xhr.addEventListener('load', () => {
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
      
      xhr.open('POST', uploadUrl);
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
    setUploadProgress({});

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
      const failedUploads = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const fileId = `file_${Date.now()}_${i}`;
        
        try {
          // Validate each file
          validateImage(file);
          
          // Set initial progress
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: 0
          }));
          
          // Upload to Cloudinary
          const imageUrl = await uploadToCloudinary(file, fileId);
          uploadedUrls.push(imageUrl);
          
          // Remove progress tracking for this file
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
          
        } catch (error) {
          console.error('Error uploading file:', file.name, error);
          failedUploads.push({ fileName: file.name, error: error.message });
          
          // Remove progress tracking for failed file
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
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

      // Show error for failed uploads
      if (failedUploads.length > 0) {
        const errorMessage = failedUploads.map(f => `${f.fileName}: ${f.error}`).join('; ');
        setUploadError(errorMessage);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
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

  // Calculate total upload progress
  const progressValues = Object.values(uploadProgress);
  const averageProgress = progressValues.length > 0 
    ? progressValues.reduce((sum, progress) => sum + progress, 0) / progressValues.length 
    : 0;

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
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(0)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {!disabled && (
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
                    disabled={isUploading || disabled}
                  />
                </label>
              </div>
            )}
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
            
            {!disabled && (
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <Upload className="w-4 h-4" />
                Upload Photo
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading || disabled}
                />
              </label>
            )}
          </div>
        )}

        {/* Progress bar for single image */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        )}

        {uploadError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
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
      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-300 flex items-center justify-center" 
            style={{ width: `${averageProgress}%` }}
          >
            <span className="text-white text-xs font-bold">
              {Math.round(averageProgress)}%
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img 
              src={url} 
              alt={`Upload ${index + 1}`} 
              className="w-full h-full object-cover rounded-lg border-2 border-gray-200" 
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        {images.length < maxImages && !disabled && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin mb-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
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
              disabled={isUploading || disabled}
            />
          </label>
        )}
      </div>

      {/* Controls for multiple images */}
      {images.length > 0 && !disabled && (
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
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}
      
      {images.length === 0 && !disabled && (
        <p className="text-sm text-red-500 text-center">At least one image is required.</p>
      )}
      
      <p className="text-xs text-gray-500 text-center">
        Maximum size: 5MB per image • Supported: JPG, PNG, GIF, WebP
        {isUploading && " • Images are being optimized automatically"}
      </p>
    </div>
  );
};

export default ImageUploader;