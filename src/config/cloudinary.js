// src/config/cloudinary.js
// Cloudinary configuration for Tamatas app

export const CLOUDINARY_CONFIG = {
  // Replace with your actual Cloudinary cloud name
  CLOUD_NAME: 'dr2knxtuq', // Your existing cloud name
  
  // Upload presets (these need to be created in your Cloudinary dashboard)
  UPLOAD_PRESETS: {
    LISTINGS: 'tamatas_images',    // For listing images
    PROFILES: 'tamatas_profiles',  // For profile pictures
  },
  
  // Transformation settings
  TRANSFORMATIONS: {
    LISTING_THUMB: 'c_fill,w_300,h_200,q_auto,f_auto',
    LISTING_LARGE: 'c_limit,w_800,h_600,q_auto,f_auto',
    PROFILE_SMALL: 'c_fill,w_150,h_150,q_auto,f_auto,g_face',
    PROFILE_LARGE: 'c_fill,w_400,h_400,q_auto,f_auto,g_face',
  },
  
  // File validation
  VALIDATION: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    MAX_FILES_LISTING: 3,
    MAX_FILES_PROFILE: 1,
  }
};

// Upload function with better error handling
export const uploadToCloudinary = async (file, preset = 'tamatas_images', folder = 'general') => {
  return new Promise((resolve, reject) => {
    // Validate file before upload
    if (!CLOUDINARY_CONFIG.VALIDATION.ALLOWED_FORMATS.some(format => 
      file.type.includes(format))) {
      reject(new Error('Invalid file format. Please use JPG, PNG, GIF, or WebP.'));
      return;
    }

    if (file.size > CLOUDINARY_CONFIG.VALIDATION.MAX_FILE_SIZE) {
      reject(new Error('File too large. Maximum size is 5MB.'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    
    // Generate unique public_id
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    formData.append('public_id', `tamatas/${folder}/img_${randomId}_${timestamp}`);
    
    // Add folder organization
    formData.append('folder', `tamatas/${folder}`);

    const xhr = new XMLHttpRequest();
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            width: response.width,
            height: response.height,
            format: response.format,
            bytes: response.bytes
          });
        } catch (error) {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error?.message || 'Upload failed'));
        } catch (e) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
};

// Helper function to generate optimized image URLs
export const getOptimizedImageUrl = (publicId, transformation = 'c_auto,q_auto,f_auto') => {
  if (!publicId) return null;
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) return null;
  const parts = cloudinaryUrl.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  if (uploadIndex === -1) return null;
  
  // Get everything after the transformation part
  const pathAfterUpload = parts.slice(uploadIndex + 1);
  // Remove version if present (starts with 'v' followed by numbers)
  const filteredPath = pathAfterUpload.filter(part => !/^v\d+$/.test(part));
  
  return filteredPath.join('/').replace(/\.[^/.]+$/, ''); // Remove file extension
};

/*
========================================
CLOUDINARY SETUP INSTRUCTIONS
========================================

1. Create Upload Presets in Cloudinary Dashboard:
   
   Go to Settings > Upload > Upload presets
   
   Create preset "tamatas_images" for listings:
   - Signing Mode: Unsigned
   - Folder: tamatas/listings
   - Upload Manipulations (IMPORTANT - Add these transformations):
     * Click "Edit" next to the preset
     * Go to "Upload Manipulations" tab
     * Add transformation: 
       - Resize: Limit
       - Width: 800
       - Height: 600
       - Quality: Auto
       - Format: Auto (f_auto)
   - Allowed formats: jpg, png, gif, webp
   - Max file size: 5000000 (5MB in bytes)
   
   Create preset "tamatas_profiles" for profile pictures:
   - Signing Mode: Unsigned  
   - Folder: tamatas/profiles
   - Upload Manipulations (IMPORTANT - Add these transformations):
     * Click "Edit" next to the preset
     * Go to "Upload Manipulations" tab
     * Add transformation:
       - Resize: Fill
       - Width: 400
       - Height: 400
       - Gravity: Face (for better cropping)
       - Quality: Auto
       - Format: Auto (f_auto)
   - Allowed formats: jpg, png, gif, webp
   - Max file size: 5000000 (5MB in bytes)

   CRITICAL: The transformations MUST be configured in the upload preset's 
   "Upload Manipulations" section, NOT passed as parameters during upload.
   Unsigned uploads don't allow transformation parameters in the request.

2. Update Environment Variables:
   
   Create .env file in your project root:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=dr2knxtuq
   VITE_CLOUDINARY_LISTINGS_PRESET=tamatas_images
   VITE_CLOUDINARY_PROFILES_PRESET=tamatas_profiles
   ```

3. Security Setup (Optional but Recommended):
   
   In Cloudinary Dashboard > Settings > Security:
   - Add your domain to "Allowed upload domains"
   - Enable "Restrict uploads by URL"
   - Set up "Allowed upload endpoints" if needed

4. Upload Preset Configuration Details:
   
   For each preset, make sure to configure:
   
   Basic Settings:
   - Mode: Unsigned
   - Folder: tamatas/[listings|profiles]
   - Use filename or externally defined Public ID: Yes
   - Unique filename: No (we generate our own)
   
   Media Analysis:
   - Resource type: Auto
   - Type: Upload
   - Access mode: Public
   
   Upload Manipulations (THIS IS KEY):
   - Add your transformations here
   - These will be applied automatically during upload
   - Much more efficient than client-side transformations
   
   Upload Control:
   - Allowed formats: jpg, png, gif, webp
   - Max file size: 5000000 bytes
   - Max image width: 2000 (optional)
   - Max image height: 2000 (optional)

5. Testing the Setup:
   
   Test with a simple upload:
   ```javascript
   const testUpload = async () => {
     const formData = new FormData();
     // Add your test file here
     formData.append('file', yourTestFile);
     formData.append('upload_preset', 'tamatas_images');
     formData.append('folder', 'tamatas/listings');
     
     try {
       const response = await fetch(
         'https://api.cloudinary.com/v1_1/dr2knxtuq/image/upload',
         {
           method: 'POST',
           body: formData
         }
       );
       const result = await response.json();
       console.log('Upload successful:', result);
     } catch (error) {
       console.error('Upload failed:', error);
     }
   };
   ```

6. Common Issues and Solutions:
   
   Error: "Transformation parameter is not allowed":
   - Solution: Move transformations to upload preset settings
   - Don't include transformation parameters in the upload request
   
   Error: "Invalid upload preset":
   - Solution: Check preset name spelling and ensure it exists
   - Make sure the preset is set to "Unsigned" mode
   
   Error: "Upload preset must be whitelisted":
   - Solution: In Settings > Security, add the preset to allowed presets
   
   Error: "File too large":
   - Solution: Check max file size in preset settings
   - Ensure file is under 5MB

7. Folder Structure in Cloudinary:
   ```
   tamatas/
   ├── listings/
   │   ├── img_1234_1640995200000.jpg (auto-optimized)
   │   └── img_5678_1640995300000.png (auto-optimized)
   ├── profiles/
   │   ├── img_9012_1640995400000.jpg (auto-optimized, face-cropped)
   │   └── img_3456_1640995500000.png (auto-optimized, face-cropped)
   └── temp/ (for temporary uploads)
   ```

8. Performance Benefits:
   
   - Images are automatically optimized during upload
   - No need for client-side processing
   - Consistent image sizes and quality
   - Faster page loading with optimized images
   - CDN delivery worldwide

========================================
*/

export default CLOUDINARY_CONFIG;