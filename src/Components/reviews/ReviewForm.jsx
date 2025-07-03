import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../config/api';
import { useToast } from '../ui/Toast';
import Button from '../ui/button';
import Textarea from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import StarRating from '../shared/StarRating';

export default function ReviewForm({ reviewedUserId, listingId, onReviewSubmitted, onCancel }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (reviewedUserId === user.id) {
      toast.error('You cannot review yourself');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        reviewed_user_id: reviewedUserId,
        rating: rating,
        comment: comment.trim(),
        listing_id: listingId || null
      };

      console.log('Submitting review:', reviewData);
      
      await apiClient.createReview(reviewData);
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // Reset form
      setRating(0);
      setComment('');
      
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
      
      // Handle specific error messages
      let errorMessage = 'Failed to submit review. Please try again.';
      
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = 'You have already reviewed this user for this listing.';
        } else if (error.message.includes('yourself')) {
          errorMessage = 'You cannot review yourself.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'User not found.';
        } else {
          errorMessage = error.message;
        }
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
          <label className="block text-sm font-medium mb-2">Rating</label>
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
          <label className="block text-sm font-medium mb-2">Your Experience</label>
          <Textarea
            placeholder="Share your experience with this seller... How was the quality of the produce? Was the transaction smooth? Would you buy from them again?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
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
        </div>
      </CardContent>
    </Card>
  );
}