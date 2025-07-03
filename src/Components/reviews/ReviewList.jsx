import React from 'react'; 
import Card, { CardContent } from '../ui/Card';
import { Avatar, AvatarFallback} from '../../components/ui/avatar';
import StarRating from '../shared/StarRating';
import { format } from 'date-fns';

export default function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>
                  {review.created_by?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-semibold">
                    {review.created_by?.split('@')[0] || 'Anonymous User'}
                  </p>
                  <StarRating rating={review.rating} readonly />
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.created_date), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}