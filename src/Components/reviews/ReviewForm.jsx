import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Review } from '@/entities/all';
import StarRating from '@/components/shared/StarRating';

export default function ReviewForm({ reviewedUserId, onReviewSubmitted, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      alert('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      await Review.create({
        reviewed_user_id: reviewedUserId,
        rating: rating,
        comment: comment.trim()
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
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
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Your Experience</label>
          <Textarea
            placeholder="Share your experience with this seller..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}