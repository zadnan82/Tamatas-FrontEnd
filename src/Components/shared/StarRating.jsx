import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, onRatingChange, readonly = false, size = "w-5 h-5" }) {
  const handleStarClick = (starIndex) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 hover:text-yellow-200'
          } ${
            readonly ? 'cursor-default' : 'cursor-pointer'
          } transition-colors duration-200`}
          onClick={() => handleStarClick(star)}
        />
      ))}
    </div>
  );
}