import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../config/api';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Textarea from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import StarRating from '../shared/StarRating';

export default function ReviewForm({ reviewedUserId, listingId, onReviewSubmitted, onCancel }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toggle for anonymous review
  const toggleAnonymous = () => {
    setIsAnonymous(!isAnonymous);
  };

  const handleSubmit = async () => {
  try {
    // Check for existing reviews first
    const existingReviews = await apiClient.getUserReviews(reviewedUserId, {
      reviewer_id: user.id // Add this parameter to your backend
    });

    if (existingReviews.length > 0) {
      toast.error("You've already reviewed this user");
      return;
    }

    // Rest of your submit logic...
    const response = await apiClient.createReview({
      reviewed_user_id: reviewedUserId,
      rating: rating,
      comment: comment.trim(),
      listing_id: listingId || null,
      is_anonymous: isAnonymous
    });

    console.log("Review submission successful:", response);
    toast.success("Review submitted successfully!");
    
    // Reset form and refresh data
    setRating(0);
    setComment("");
    setIsAnonymous(false);
    if (onReviewSubmitted) onReviewSubmitted();
    
  } catch (error) {
    console.error("Review submission failed:", error);
    
    // Parse different error formats
    let errorMessage = "Failed to submit review";
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message.includes("400")) {
      errorMessage = "Invalid review data - please check your inputs";
    } else if (error.message.includes("already exists")) {
      errorMessage = "You've already reviewed this user";
    } else if (error.message.includes("yourself")) {
      errorMessage = "You cannot review yourself";
    }
    
    toast.error(errorMessage);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating *</label>
          <StarRating 
            rating={rating} 
            onRatingChange={setRating}
            size="w-8 h-8"
            readonly={false}
          />
          <p className="text-xs text-gray-500 mt-1">
            {rating === 0 && "Select a rating"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Your Experience *</label>
          <Textarea
            placeholder="Share your experience with this seller..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Simple Toggle Button for Anonymous */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAnonymous}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              isAnonymous ? 'bg-orange-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnonymous ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-900">
            Post anonymously
          </span>
          {isAnonymous && (
            <span className="text-xs text-gray-500 ml-1">(Your name won't be shown)</span>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || rating === 0 || !comment.trim()}
            loading={submitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 border-t pt-3 mt-4">
          <p>• Reviews help build trust in our community</p>
          <p>• Be honest and constructive in your feedback</p>
          <p>• Reviews cannot be edited once submitted</p>
          {isAnonymous && (
            <p className="text-orange-600">• Anonymous reviews will not show your name</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}