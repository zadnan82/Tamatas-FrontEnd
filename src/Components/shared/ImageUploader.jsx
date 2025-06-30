import React, { useState } from 'react';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function ImageUploader({ existingImages = [], onImagesChange, maxImages = 3 }) {
  const [images, setImages] = useState(existingImages);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls = [];
    for (const file of files) {
      try {
        const result = await UploadFile({ file });
        uploadedUrls.push(result.file_url);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("There was an error uploading a file. Please try again.");
      }
    }
    
    const newImages = [...images, ...uploadedUrls];
    setImages(newImages);
    onImagesChange(newImages);
    setIsUploading(false);
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img src={url} alt={`listing image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-center text-gray-500">Upload</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      {images.length === 0 && <p className="text-sm text-red-500">At least one image is required.</p>}
    </div>
  );
}