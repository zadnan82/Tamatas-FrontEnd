import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const LikeButton = ({ postId, initialCount = 0, initialLiked = false, onLikeChange, user, toast }) => {
  // Local state for this specific like button
  const [count, setCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(initialLiked);

  const handleClick = () => {
    if (!user) {
      toast?.error('Please sign in to like posts');
      return;
    }

    console.log(`=== LIKE BUTTON CLICKED ===`);
    console.log(`Post ID: ${postId}`);
    console.log(`Current state - Count: ${count}, Liked: ${isLiked}`);

    // Update local state
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? count + 1 : count - 1;

    setIsLiked(newIsLiked);
    setCount(Math.max(0, newCount));

    console.log(`New state - Count: ${newCount}, Liked: ${newIsLiked}`);

    // Show toast
    toast?.success(newIsLiked ? 'Post liked!' : 'Like removed');

    // Notify parent component if needed
    onLikeChange?.(postId, { count: newCount, isLiked: newIsLiked });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Debug info */}
      <div style={{
        fontSize: '10px',
        color: '#666',
        padding: '2px 6px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        marginRight: '8px'
      }}>
        ID:{postId} | {count} | {isLiked ? 'LIKED' : 'NOT LIKED'}
      </div>

      {/* Like button */}
      <button 
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 15px',
          border: isLiked ? '2px solid #ef4444' : '2px solid #9ca3af',
          backgroundColor: isLiked ? '#fee2e2' : '#ffffff',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        <Heart
          size={20}
          color={isLiked ? '#ef4444' : '#9ca3af'}
          fill={isLiked ? '#ef4444' : 'none'}
          strokeWidth={2}
        />
        <span style={{ color: isLiked ? '#ef4444' : '#6b7280' }}>
          {count} {isLiked ? 'Liked' : 'Like'}
        </span>
      </button>
    </div>
  );
};

export default LikeButton;