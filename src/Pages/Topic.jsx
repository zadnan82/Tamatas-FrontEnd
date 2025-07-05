import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../config/api';
import { 
  ArrowLeft,
  MessageSquare,
  Eye,
  Heart,
  Pin,
  Lock,
  Reply,
  Send,
  MoreVertical,
  Flag,
  User,
  Calendar,
  Leaf,
  TrendingUp,
  Users,
  HelpCircle,
  Pencil,
  Trash2,
  Save,
  Share2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const Topic = () => {
  console.log('🚀 Topic.jsx loaded - UPDATED VERSION with working three dots menu');
  
  const { topicId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [sending, setSending] = useState(false);

  // Add likes state management
  const [likes, setLikes] = useState({});

  useEffect(() => {
    if (topicId) {
      loadTopic();
      loadPosts();
    }
  }, [topicId]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      const topicData = await apiClient.getForumTopic(topicId);
      
      console.log('=== TOPIC API RESPONSE ===');
      console.log('topicData:', topicData);
      console.log('like_count:', topicData.like_count);
      console.log('user_liked:', topicData.user_liked);
      console.log('========================');
      
      // Process topic data for UI
      const processedTopic = {
        id: topicData.id,
        title: topicData.title,
        content: topicData.content,
        category: topicData.category,
        isPinned: topicData.is_pinned || false,
        isLocked: topicData.is_locked || false,
        views: topicData.view_count || 0,
        likes: topicData.like_count || 0,
        createdDate: new Date(topicData.created_date),
        author: {
          id: topicData.created_by,
          name: topicData.creator?.full_name || 'Anonymous User',
          avatar: topicData.creator?.profile_image,
          reputation: topicData.creator?.reputation || 0,
          joinDate: topicData.creator?.created_date ? new Date(topicData.creator.created_date) : null,
          isModerator: topicData.creator?.is_moderator || false
        }
      };

      setTopic(processedTopic);

      // Initialize topic likes
      setLikes(prev => ({
        ...prev,
        [`topic-${topicData.id}`]: {
          count: topicData.like_count || 0,
          isLiked: topicData.is_liked || false
        }
      }));

    } catch (error) {
      console.error('Error loading topic:', error);
      toast.error('Failed to load topic');
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const postsData = await apiClient.getTopicPosts(topicId);

      console.log('=== POSTS API RESPONSE ===');
      console.log('postsData:', postsData);
      if (postsData.length > 0) {
        console.log('first post like_count:', postsData[0].like_count);
        console.log('first post user_liked:', postsData[0].user_liked);
      }
      console.log('========================');
      
      // Process posts data for UI
      const processedPosts = postsData.map(post => ({
        id: post.id,
        content: post.content,
        createdDate: new Date(post.created_date),
        updatedDate: post.updated_date ? new Date(post.updated_date) : null,
        isEdited: !!post.updated_date,
        parentPostId: post.parent_post_id,
        author: {
          id: post.created_by,
          name: post.author?.full_name || 'Anonymous User',
          avatar: post.author?.profile_image,
          reputation: post.author?.reputation || 0,
          joinDate: post.author?.created_date ? new Date(post.author.created_date) : null,
          isModerator: post.author?.is_moderator || false
        },
        likes: post.like_count || 0,
        isLiked: post.is_liked || false
      }));

      setPosts(processedPosts);

      // Initialize posts likes
      const newLikes = {};
      processedPosts.forEach(post => {
        newLikes[`post-${post.id}`] = {
          count: post.likes,
          isLiked: post.isLiked
        };
      });
      
      setLikes(prev => ({
        ...prev,
        ...newLikes
      }));

    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  // Add like handler
  const handleLike = async (postId, isTopicPost = false) => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    const likeKey = isTopicPost ? `topic-${postId}` : `post-${postId}`;
    
    console.log('Like clicked:', { postId, isTopicPost, likeKey });
    
    // Make API call to persist the like
    try {
      if (isTopicPost) {
        const response = await apiClient.toggleTopicLike(postId);
        // Update state with server response
        setLikes(prev => ({
          ...prev,
          [likeKey]: {
            count: response.like_count,
            isLiked: response.liked
          }
        }));
      } else {
        const response = await apiClient.togglePostLike(postId);
        // Update state with server response
        setLikes(prev => ({
          ...prev,
          [likeKey]: {
            count: response.like_count,
            isLiked: response.liked
          }
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
      
      // Revert the like state if API call fails
      setLikes(prev => {
        const currentLike = prev[likeKey];
        return {
          ...prev,
          [likeKey]: {
            count: currentLike.isLiked ? currentLike.count - 1 : currentLike.count + 1,
            isLiked: !currentLike.isLiked
          }
        };
      });
      
      toast.error('Failed to update like');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user || sending) return;

    try {
      setSending(true);
      
      const postData = {
        topic_id: topicId,
        content: newPost.trim(),
        parent_post_id: replyingTo?.id || null
      };

      await apiClient.createForumPost(postData);
      
      // Clear form and reload posts
      setNewPost('');
      setReplyingTo(null);
      await loadPosts();
      
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to post reply');
    } finally {
      setSending(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    const categoryMap = {
      gardening_tips: { name: 'Gardening Tips', icon: Leaf, color: 'from-green-400 to-emerald-500' },
      trading_ideas: { name: 'Trading Ideas', icon: TrendingUp, color: 'from-blue-400 to-cyan-500' },
      general_discussion: { name: 'General Discussion', icon: Users, color: 'from-purple-400 to-violet-500' },
      site_feedback: { name: 'Site Feedback', icon: HelpCircle, color: 'from-orange-400 to-red-500' }
    };
    return categoryMap[categoryId] || { name: 'General', icon: MessageSquare, color: 'from-gray-400 to-gray-500' };
  };

  // ENHANCED POST CARD WITH WORKING THREE DOTS MENU
  const PostCard = ({ post, isReply = false, isTopicPost = false }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef(null);

    const likeKey = isTopicPost ? `topic-${post.id}` : `post-${post.id}`;
    const postLikes = likes[likeKey] || { count: post.likes || 0, isLiked: post.isLiked || false };

    // Close menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setShowMenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const canEdit = user && (user.id === post.author.id || user.is_moderator);
    const canDelete = user && (user.id === post.author.id || user.is_moderator);

    const handleEdit = async () => {
      if (!editContent.trim()) {
        toast.error('Content cannot be empty');
        return;
      }

      try {
        if (isTopicPost) {
          // Update topic
          await apiClient.updateForumTopic(post.id, { 
            content: editContent.trim() 
          });
          toast.success('Topic updated successfully!');
        } else {
          // Update post
          await apiClient.updateForumPost(post.id, { 
            content: editContent.trim() 
          });
          toast.success('Post updated successfully!');
        }
        
        setIsEditing(false);
        setShowMenu(false);
        
        // Refresh data
        if (isTopicPost) {
          loadTopic(); // Refresh topic
        }
        loadPosts(); // Refresh posts
      } catch (error) {
        console.error('Error updating:', error);
        toast.error(isTopicPost ? 'Failed to update topic' : 'Failed to update post');
      }
    };

    const handleDelete = async () => {
      const itemType = isTopicPost ? 'topic' : 'post';
      if (!window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.${isTopicPost ? ' This will delete the entire discussion and all replies!' : ''}`)) {
        return;
      }

      try {
        setIsDeleting(true);
        
        if (isTopicPost) {
          // Delete entire topic
          await apiClient.deleteForumTopic(post.id);
          toast.success('Topic deleted successfully!');
          // Navigate back to forum
          navigate('/forum');
        } else {
          // Delete post
          await apiClient.deleteForumPost(post.id);
          toast.success('Post deleted successfully!');
          // Refresh posts
          loadPosts();
        }
        
        setShowMenu(false);
      } catch (error) {
        console.error('Error deleting:', error);
        toast.error(isTopicPost ? 'Failed to delete topic' : 'Failed to delete post');
      } finally {
        setIsDeleting(false);
      }
    };

    const handleReport = () => {
      const reason = prompt('Please describe why you are reporting this post:');
      if (reason && reason.trim()) {
        toast.success('Post reported. Thank you for helping keep our community safe.');
        setShowMenu(false);
        console.log('Reported post:', post.id, 'Reason:', reason);
      }
    };

    if (isDeleting) {
      return (
        <div className="clay-card p-6 bg-red-50 border border-red-200">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-red-700">Deleting post...</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`clay-card p-6 bg-white/60 backdrop-blur-sm ${isReply ? 'ml-8 mt-4' : ''}`}>
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 clay-card rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden">
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {post.author.name.charAt(0)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{post.author.name}</span>
                {isTopicPost && (
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                    OP
                  </span>
                )}
                {post.author.isModerator && (
                  <div className="clay-badge clay-badge-purple text-xs px-2 py-1">
                    Moderator
                  </div>
                )}
                <span className="clay-text-soft text-xs">•</span>
                <span className="clay-text-soft text-xs">
                  {post.author.reputation} reputation
                </span>
                {post.author.joinDate && (
                  <>
                    <span className="clay-text-soft text-xs">•</span>
                    <span className="clay-text-soft text-xs">
                      Joined {format(post.author.joinDate, 'MMM yyyy')}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="clay-text-soft text-xs">
                  {formatDistanceToNow(post.createdDate, { addSuffix: true })}
                  {post.isEdited && <span className="ml-1 italic">(edited)</span>}
                </span>
                
                {/* WORKING THREE DOTS MENU */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => {
                      console.log('🔥 Three dots clicked!', { 
                        postId: post.id, 
                        showMenu, 
                        user: user?.email,
                        canEdit,
                        canDelete 
                      });
                      setShowMenu(!showMenu);
                    }}
                    className="clay-button p-1 rounded-lg hover:bg-gray-200 transition-colors"
                    style={{ 
                      backgroundColor: showMenu ? '#fee2e2' : 'transparent',
                      border: showMenu ? '2px solid #ef4444' : '1px solid transparent'
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {canEdit && (
                        <button
                          onClick={() => {
                            console.log('🔥 Edit clicked!', { isTopicPost, postId: post.id });
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          {isTopicPost ? 'Edit Topic' : 'Edit Post'}
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isTopicPost ? 'Delete Topic' : 'Delete Post'}
                        </button>
                      )}
                      
                      {user && user.id !== post.author.id && (
                        <button
                          onClick={handleReport}
                          className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                        >
                          <Flag className="w-4 h-4" />
                          Report Post
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/forum/topic/${topicId}#post-${post.id}`);
                          toast.success('Post link copied to clipboard!');
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="mb-4">
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Edit your post..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      disabled={!editContent.trim()}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isTopicPost ? 'Save Topic' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(post.content);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="clay-text-content leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              )}
            </div>
            
            {/* Post Actions */}
            {!isEditing && (
              <div className="flex items-center gap-4">
                {/* WORKING LIKE BUTTON */}
                <button 
                  onClick={() => handleLike(post.id, isTopicPost)}
                  className={`flex items-center gap-1 transition-colors ${
                    postLikes.isLiked 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'clay-text-soft hover:text-red-600'
                  }`}
                >
                  <Heart 
                    className="w-4 h-4" 
                    fill={postLikes.isLiked ? 'currentColor' : 'none'}
                  />
                  <span className="text-sm font-medium">{postLikes.count}</span>
                </button>
                
                {user && !isReply && (
                  <button 
                    onClick={() => setReplyingTo(post)}
                    className="flex items-center gap-1 clay-text-soft hover:text-blue-600 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span className="text-sm">Reply</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="clay-card p-8 text-center">
          <div className="clay-loading w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="clay-card p-8 text-center">
          <h2 className="clay-text-title text-xl font-semibold mb-2">Topic not found</h2>
          <p className="clay-text-soft mb-4">The topic you're looking for doesn't exist.</p>
          <Link to="/forum" className="clay-button-primary px-6 py-3 font-semibold text-white">
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(topic.category);
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="max-w-4xl mx-auto">
     

      {/* Header */}
      <div className="clay-card p-6 mb-6 bg-gradient-to-br from-white/80 to-white/60">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/forum"
            className="clay-button p-2 rounded-xl flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Link>
          
          <div className={`w-8 h-8 bg-gradient-to-br ${categoryInfo.color} rounded-xl flex items-center justify-center`}>
            <CategoryIcon className="w-4 h-4 text-white" />
          </div>
          
          <div className="clay-badge text-xs px-3 py-1">
            {categoryInfo.name}
          </div>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {topic.isPinned && <Pin className="w-5 h-5 text-orange-500" />}
              {topic.isLocked && <Lock className="w-5 h-5 text-gray-500" />}
              <h1 className="clay-text-title text-2xl font-bold">{topic.title}</h1>
            </div>
            
            <div className="flex items-center gap-4 clay-text-soft text-sm">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By {topic.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(topic.createdDate, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{topic.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{posts.length} replies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Post */}
      <div className="mb-6">
        <PostCard 
          post={{
            id: topic.id,
            content: topic.content,
            createdDate: topic.createdDate,
            author: topic.author,
            likes: topic.likes,
            isLiked: false,
            isEdited: false
          }} 
          isTopicPost={true}
        />
      </div>

      {/* Posts */}
      <div className="space-y-4 mb-6">
        {postsLoading ? (
          <div className="clay-card p-8 text-center">
            <div className="clay-loading w-6 h-6 rounded-full mx-auto mb-2"></div>
            <p className="clay-text-soft text-sm">Loading replies...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="clay-card p-8 text-center bg-white/40">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="clay-text-title text-lg font-semibold mb-2">No replies yet</h3>
            <p className="clay-text-soft">Be the first to contribute to this discussion!</p>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {user && !topic.isLocked ? (
        <div className="clay-card p-6 bg-white/60">
          {replyingTo && (
            <div className="clay-card p-4 bg-blue-50 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Replying to {replyingTo.author.name}
                </span>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-blue-700 line-clamp-2">
                {replyingTo.content}
              </p>
            </div>
          )}
          
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block clay-text-soft text-sm font-medium mb-2">
                Your Reply
              </label>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="clay-input w-full h-32 resize-none"
                placeholder="Share your thoughts..."
                disabled={sending}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="clay-text-soft text-xs">
                Be respectful and constructive in your responses
              </p>
              <button
                type="submit"
                disabled={!newPost.trim() || sending}
                className="clay-button-primary px-6 py-3 font-semibold text-white flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post Reply
              </button>
            </div>
          </form>
        </div>
      ) : topic.isLocked ? (
        <div className="clay-card p-6 bg-red-50 text-center">
          <Lock className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="clay-text-soft">This topic is locked and no longer accepting replies.</p>
        </div>
      ) : (
        <div className="clay-card p-6 bg-gray-50 text-center">
          <p className="clay-text-soft mb-4">You need to be logged in to reply to this topic.</p>
          <Link to="/login" className="clay-button-primary px-6 py-3 font-semibold text-white">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default Topic;