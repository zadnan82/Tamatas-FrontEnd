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
  Share2,
  Bookmark,
  MoreVertical,
  Flag,
  User,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

// Add this at the very top to track component loading
console.log('🔥 ForumTopicView component file loaded');

const ForumTopicView = () => {
  console.log('🔥 ForumTopicView component instantiated');
  
  const { topicId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const replyFormRef = useRef(null);
  
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Very simple test state
  const [testCounter, setTestCounter] = useState(0);

  console.log('🔥 Component state initialized', { topicId, user: user?.email, loading });

  useEffect(() => {
    console.log('🔥 useEffect triggered with topicId:', topicId);
    if (topicId) {
      loadTopicData();
    }
  }, [topicId]);

  useEffect(() => {
    if (replyingTo && replyFormRef.current) {
      replyFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [replyingTo]);

  const loadTopicData = async () => {
    try {
      console.log('🔥 Starting loadTopicData...');
      setLoading(true);
      
      const [topicData, postsData] = await Promise.all([
        apiClient.getForumTopic(topicId),
        apiClient.getTopicPosts(topicId)
      ]);

      console.log('🔥 API Data received:', { topicData, postsData });

      const topicObj = {
        id: topicData.id,
        title: topicData.title,
        content: topicData.content,
        category: topicData.category,
        isPinned: topicData.is_pinned || false,
        isLocked: topicData.is_locked || false,
        views: topicData.view_count || 0,
        createdDate: new Date(topicData.created_date),
        author: {
          id: topicData.created_by,
          name: topicData.creator?.full_name || 'Anonymous',
          avatar: topicData.creator?.profile_image,
          joinDate: topicData.creator?.created_date,
          isOnline: false
        }
      };

      const postsArray = postsData.map(post => ({
        id: post.id,
        content: post.content,
        createdDate: new Date(post.created_date),
        author: {
          id: post.created_by,
          name: post.author?.full_name || 'Anonymous',
          avatar: post.author?.profile_image,
          joinDate: post.author?.created_date,
          isOnline: Math.random() > 0.5
        }
      }));

      console.log('🔥 Setting state:', { topicObj, postsArray });
      setTopic(topicObj);
      setPosts(postsArray);

    } catch (error) {
      console.error('🔥 Error loading topic:', error);
      toast.error('Failed to load topic');
      navigate('/forum');
    } finally {
      console.log('🔥 Setting loading to false');
      setLoading(false);
    }
  };

  const handleTestClick = () => {
    console.log('🔥 Test button clicked! Current counter:', testCounter);
    setTestCounter(prev => {
      const newValue = prev + 1;
      console.log('🔥 Setting counter to:', newValue);
      return newValue;
    });
    toast.success(`Test clicked! Count: ${testCounter + 1}`);
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim() || !user) return;

    try {
      setSubmitting(true);

      const replyData = {
        topic_id: topicId,
        content: newReply.trim(),
        parent_post_id: replyingTo?.id || null
      };

      await apiClient.createForumPost(replyData);
      
      setNewReply('');
      setReplyingTo(null);
      await loadTopicData();
      
      toast.success('Reply posted successfully!');
      
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  // ULTRA SIMPLE LIKE COMPONENT
  const UltraSimpleLike = ({ postId }) => {
    console.log('🔥 UltraSimpleLike rendering for post:', postId);
    
    const [localCount, setLocalCount] = useState(5);
    const [localLiked, setLocalLiked] = useState(false);

    const handleClick = () => {
      console.log('🔥 UltraSimpleLike clicked for post:', postId);
      console.log('🔥 Before click:', { localCount, localLiked });
      
      setLocalCount(prev => localLiked ? prev - 1 : prev + 1);
      setLocalLiked(prev => !prev);
      
      console.log('🔥 After state update calls made');
      toast.success('Like clicked!');
    };

    console.log('🔥 UltraSimpleLike current state:', { localCount, localLiked });

    return (
      <div style={{ 
        border: '2px solid red', 
        padding: '10px', 
        margin: '5px',
        backgroundColor: localLiked ? '#ffeeee' : '#ffffff'
      }}>
        <div style={{ fontSize: '12px', marginBottom: '5px' }}>
          Post: {postId} | Count: {localCount} | Liked: {localLiked ? 'YES' : 'NO'}
        </div>
        
        {/* CLICKABLE DIV instead of button with Heart inside */}
        <div
          onClick={handleClick}
          style={{
            padding: '12px 16px',
            backgroundColor: localLiked ? '#ff4444' : '#ffffff',
            border: '3px solid #ff4444',
            borderRadius: '6px',
            cursor: 'pointer',
            color: localLiked ? 'white' : '#ff4444',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            userSelect: 'none'
          }}
        >
          {/* Heart as decoration, not clickable */}
          <span style={{ fontSize: '16px' }}>
            {localLiked ? '❤️' : '🤍'}
          </span>
          <span>{localCount} {localLiked ? 'Liked' : 'Like'}</span>
        </div>
        
        {/* BACKUP: Simple text button */}
        <button 
          onClick={handleClick}
          style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#00aa00',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          BACKUP BUTTON: {localCount}
        </button>
      </div>
    );
  };

  const SimplePostCard = ({ post, isOriginalPost = false }) => {
    console.log('🔥 SimplePostCard rendering for post:', post.id);
    
    return (
      <div style={{
        border: '1px solid #ddd',
        padding: '15px',
        margin: '10px 0',
        borderRadius: '8px',
        backgroundColor: isOriginalPost ? '#f0f8ff' : '#ffffff'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>
          {post.author.name} {isOriginalPost && '(Original Author)'}
        </h4>
        <p style={{ margin: '0 0 15px 0' }}>{post.content}</p>
        
        <UltraSimpleLike postId={post.id} />
      </div>
    );
  };

  console.log('🔥 About to render, current state:', { loading, topic, posts, testCounter });

  if (loading) {
    console.log('🔥 Rendering loading state');
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="clay-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="clay-text-soft">Loading discussion...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    console.log('🔥 Rendering no topic state');
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="clay-card p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="clay-text-title text-xl font-semibold mb-2">Topic not found</h2>
          <p className="clay-text-soft mb-6">This discussion doesn't exist or has been removed.</p>
          <Link to="/forum" className="clay-button-primary px-6 py-3 font-semibold text-white">
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  console.log('🔥 Rendering main content');

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* SUPER OBVIOUS DIAGNOSTIC SECTION */}
      <div style={{
        backgroundColor: '#ff0000',
        color: 'white',
        padding: '20px',
        marginBottom: '20px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        <h2>🔥 DIAGNOSTIC MODE ACTIVE 🔥</h2>
        <p>Component is rendering! Current time: {new Date().toLocaleTimeString()}</p>
        <p>Test Counter: {testCounter}</p>
        <p>Topic ID: {topicId}</p>
        <p>Topic Title: {topic?.title}</p>
        <p>Posts Count: {posts.length}</p>
        <p>User: {user?.email || 'Not logged in'}</p>
        
        <button 
          onClick={handleTestClick}
          style={{
            backgroundColor: 'white',
            color: 'red',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          TEST BUTTON - Click me! (Count: {testCounter})
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Link 
          to="/forum"
          className="clay-button px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-white/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>
        <span className="clay-text-soft">•</span>
        <span className="clay-text-soft text-sm capitalize">{topic.category.replace('_', ' ')}</span>
      </div>

      <div className="clay-card p-8 mb-6 bg-gradient-to-br from-white/90 to-white/70">
        <h1 className="clay-text-title text-3xl font-bold mb-4 leading-tight">
          {topic.title}
        </h1>
        
        <div className="flex items-center gap-6 clay-text-soft">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>By {topic.author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(topic.createdDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{topic.views} views</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{posts.length} replies</span>
          </div>
        </div>
      </div>

      {/* Original Post */}
      <div className="mb-6">
        <SimplePostCard 
          post={{
            id: topic.id,
            content: topic.content,
            createdDate: topic.createdDate,
            author: topic.author
          }} 
          isOriginalPost={true}
        />
      </div>

      {/* Replies */}
      <div className="space-y-4 mb-8">
        {posts.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="clay-text-title text-xl font-semibold">
                {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
              </h2>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            
            {posts.map((post) => (
              <SimplePostCard key={post.id} post={post} />
            ))}
          </>
        ) : (
          <div className="clay-card p-12 text-center bg-white/60">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="clay-text-title text-lg font-semibold mb-2">No replies yet</h3>
            <p className="clay-text-soft">Be the first to join this discussion!</p>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {user && !topic.isLocked ? (
        <div ref={replyFormRef} className="clay-card p-6 bg-white/90 backdrop-blur-sm">
          <form onSubmit={handleReply}>
            <div className="mb-4">
              <label className="block clay-text-soft text-sm font-medium mb-3">
                Share your thoughts
              </label>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                className="clay-input w-full h-32 resize-none text-base"
                placeholder="Write your reply here... Be respectful and constructive."
                disabled={submitting}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="clay-text-soft text-xs">
                🤝 Remember to be respectful and follow community guidelines
              </p>
              <button
                type="submit"
                disabled={!newReply.trim() || submitting}
                className="clay-button-primary px-8 py-3 font-semibold text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : topic.isLocked ? (
        <div className="clay-card p-8 bg-red-50 text-center border-l-4 border-red-400">
          <Lock className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-red-800 mb-2">Discussion Locked</h3>
          <p className="text-red-700">This topic is locked and no longer accepting new replies.</p>
        </div>
      ) : (
        <div className="clay-card p-8 bg-gray-50 text-center">
          <User className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">Join the Discussion</h3>
          <p className="clay-text-soft mb-4">Sign in to participate in this conversation.</p>
          <Link to="/auth" className="clay-button-primary px-6 py-3 font-semibold text-white">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

console.log('🔥 ForumTopicView component definition complete');

export default ForumTopicView;