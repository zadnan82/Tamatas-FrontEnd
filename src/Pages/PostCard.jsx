import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Reply,
  Share2,
  Bookmark,
  MoreVertical,
  Flag
} from 'lucide-react';
import LikeButton from './LikeButton';

const PostCard = ({ 
  post, 
  isOriginalPost = false, 
  replyingTo, 
  setReplyingTo, 
  user, 
  topic, 
  toast,
  initialLikeCount = null,
  onLikeChange 
}) => {
  
  // Use either provided initial count or random for testing
  const likeCount = initialLikeCount !== null ? initialLikeCount : Math.floor(Math.random() * 15) + 1;
  
  console.log(`=== PostCard Rendering ===`);
  console.log(`Post ID: ${post.id}`);
  console.log(`Like Count: ${likeCount}`);
  console.log(`Is Original Post: ${isOriginalPost}`);

  return (
    <div className={`clay-card p-6 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 ${
      isOriginalPost ? 'border-l-4 border-green-500' : ''
    }`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-14 h-14 clay-card rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden">
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {post.author.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="mt-3 text-center">
            <p className="font-semibold text-sm">{post.author.name}</p>
            {isOriginalPost && (
              <div className="clay-badge clay-badge-green text-xs px-2 py-1 mt-1">
                Author
              </div>
            )}
            {post.author.joinDate && (
              <p className="clay-text-soft text-xs mt-1">
                Joined {format(new Date(post.author.joinDate), 'MMM yyyy')}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="clay-text-soft text-sm">
                Posted {formatDistanceToNow(post.createdDate, { addSuffix: true })}
              </span>
              {isOriginalPost && (
                <div className="clay-badge clay-badge-blue text-xs px-2 py-1">
                  Original Post
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button className="clay-button p-2 rounded-lg hover:bg-gray-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {replyingTo && post.id === replyingTo.id && (
            <div className="clay-card p-3 bg-blue-50 border-l-4 border-blue-400 mb-4">
              <p className="text-sm text-blue-800 font-medium">You're replying to this post</p>
            </div>
          )}

          <div className="prose prose-sm max-w-none mb-6">
            <p className="clay-text-content leading-relaxed whitespace-pre-wrap text-base">
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Use the separate LikeButton component */}
              <LikeButton
                postId={post.id}
                initialCount={likeCount}
                initialLiked={false}
                user={user}
                toast={toast}
                onLikeChange={onLikeChange}
              />

              {user && !topic?.isLocked && (
                <button 
                  onClick={() => setReplyingTo(replyingTo?.id === post.id ? null : post)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    replyingTo?.id === post.id
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'clay-button hover:bg-blue-50 hover:text-blue-600 border-2 border-transparent'
                  }`}
                >
                  <Reply className="w-4 h-4" />
                  <span className="font-medium text-sm">Reply</span>
                </button>
              )}

              <button className="flex items-center gap-2 clay-button px-4 py-2 rounded-lg hover:bg-gray-50 border-2 border-transparent">
                <Share2 className="w-4 h-4" />
                <span className="font-medium text-sm">Share</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="clay-button p-2 rounded-lg hover:bg-yellow-50 hover:text-yellow-600">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="clay-button p-2 rounded-lg hover:bg-red-50 hover:text-red-600">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;