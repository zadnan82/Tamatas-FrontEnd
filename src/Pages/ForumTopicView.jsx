// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { useToast } from '../components/ui/Toast';
// import { apiClient } from '../config/api';
// import { 
//   ArrowLeft,
//   MessageSquare,
//   Eye,
//   Heart,
//   Pin,
//   Lock,
//   Reply,
//   Send,
//   Share2,
//   Bookmark,
//   MoreVertical,
//   Flag,
//   User,
//   Calendar,
//   Pencil,
//   Trash2,
//   Save
// } from 'lucide-react';
// import { formatDistanceToNow, format } from 'date-fns';

// const ForumTopicView = () => {
//   const { topicId } = useParams();
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const replyFormRef = useRef(null);
  
//   const [topic, setTopic] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newReply, setNewReply] = useState('');
//   const [replyingTo, setReplyingTo] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     if (topicId) {
//       loadTopicData();
//     }
//   }, [topicId]);

//   useEffect(() => {
//     if (replyingTo && replyFormRef.current) {
//       replyFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
//   }, [replyingTo]);

//   const loadTopicData = async () => {
//     try {
//       setLoading(true);
      
//       const [topicData, postsData] = await Promise.all([
//         apiClient.getForumTopic(topicId),
//         apiClient.getTopicPosts(topicId)
//       ]);

//       const topicObj = {
//         id: topicData.id,
//         title: topicData.title,
//         content: topicData.content,
//         category: topicData.category,
//         isPinned: topicData.is_pinned || false,
//         isLocked: topicData.is_locked || false,
//         views: topicData.view_count || 0,
//         createdDate: new Date(topicData.created_date),
//         author: {
//           id: topicData.created_by,
//           name: topicData.creator?.full_name || 'Anonymous',
//           avatar: topicData.creator?.profile_image,
//           joinDate: topicData.creator?.created_date,
//           isModerator: topicData.creator?.is_moderator || false
//         }
//       };

//       const postsArray = postsData.map(post => ({
//         id: post.id,
//         content: post.content,
//         createdDate: new Date(post.created_date),
//         updatedDate: post.updated_date ? new Date(post.updated_date) : null,
//         isEdited: !!post.updated_date,
//         author: {
//           id: post.created_by,
//           name: post.author?.full_name || 'Anonymous',
//           avatar: post.author?.profile_image,
//           joinDate: post.author?.created_date,
//           isModerator: post.author?.is_moderator || false
//         }
//       }));

//       setTopic(topicObj);
//       setPosts(postsArray);

//     } catch (error) {
//       console.error('Error loading topic:', error);
//       toast.error('Failed to load topic');
//       navigate('/forum');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReply = async (e) => {
//     e.preventDefault();
//     if (!newReply.trim() || !user) return;

//     try {
//       setSubmitting(true);

//       const replyData = {
//         topic_id: topicId,
//         content: newReply.trim(),
//         parent_post_id: replyingTo?.id || null
//       };

//       await apiClient.createForumPost(replyData);
      
//       setNewReply('');
//       setReplyingTo(null);
//       await loadTopicData();
      
//       toast.success('Reply posted successfully!');
      
//     } catch (error) {
//       console.error('Error posting reply:', error);
//       toast.error('Failed to post reply');
//     } finally {
//       setSubmitting(false);
//     }
//   };


//   // Add this simple test component to your ForumTopicView.jsx to test if clicks work

// const DebugThreeDots = () => {
//   const [showMenu, setShowMenu] = useState(false);
  
//   return (
//     <div style={{ 
//       position: 'fixed', 
//       top: '20px', 
//       right: '20px', 
//       zIndex: 9999,
//       backgroundColor: 'yellow',
//       padding: '20px',
//       border: '3px solid red'
//     }}>
//       <h3>DEBUG THREE DOTS TEST</h3>
//       <p>Menu visible: {showMenu ? 'YES' : 'NO'}</p>
      
//       <button
//         onClick={() => {
//           console.log('🔥 DEBUG: Button clicked!');
//           alert('Button clicked!');
//           setShowMenu(!showMenu);
//         }}
//         style={{
//           padding: '10px',
//           backgroundColor: 'blue',
//           color: 'white',
//           border: 'none',
//           cursor: 'pointer'
//         }}
//       >
//         CLICK ME (Three Dots Test)
//       </button>
      
//       {showMenu && (
//         <div style={{
//           position: 'absolute',
//           top: '100%',
//           right: '0',
//           width: '200px',
//           backgroundColor: 'green',
//           color: 'white',
//           padding: '10px',
//           border: '2px solid black'
//         }}>
//           <p>MENU IS VISIBLE!</p>
//           <button 
//             onClick={() => {
//               console.log('🔥 Menu item clicked!');
//               alert('Menu item clicked!');
//               setShowMenu(false);
//             }}
//             style={{ backgroundColor: 'red', color: 'white', padding: '5px' }}
//           >
//             Test Menu Item
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Add this to your JSX return, just before the closing </div>:
//  <DebugThreeDots />
//   // Simple Like Component
//   const PostLikeButton = ({ postId }) => {
//     const [localCount, setLocalCount] = useState(Math.floor(Math.random() * 10));
//     const [localLiked, setLocalLiked] = useState(false);

//     const handleClick = async () => {
//       if (!user) {
//         toast.error('Please log in to like posts');
//         return;
//       }

//       try {
//         const result = await apiClient.togglePostLike(postId);
//         setLocalCount(result.like_count);
//         setLocalLiked(result.liked);
//         toast.success(result.liked ? 'Post liked!' : 'Like removed');
//       } catch (error) {
//         console.error('Error toggling like:', error);
//         toast.error('Failed to update like');
//       }
//     };

//     return (
//       <button
//         onClick={handleClick}
//         className={`flex items-center gap-1 transition-colors ${
//           localLiked 
//             ? 'text-red-500 hover:text-red-600' 
//             : 'text-gray-500 hover:text-red-500'
//         }`}
//         title={user ? (localLiked ? 'Unlike' : 'Like') : 'Login to like'}
//       >
//         <Heart className={`w-4 h-4 ${localLiked ? 'fill-current' : ''}`} />
//         <span className="text-sm font-medium">{localCount}</span>
//       </button>
//     );
//   };

//   // Enhanced Post Card with Three Dots Menu
//   const EnhancedPostCard = ({ post, isOriginalPost = false }) => {
//     const [showMenu, setShowMenu] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [editContent, setEditContent] = useState(post.content);
//     const [isDeleting, setIsDeleting] = useState(false);
//     const menuRef = useRef(null);

//     // Close menu when clicking outside
//     useEffect(() => {
//       const handleClickOutside = (event) => {
//         if (menuRef.current && !menuRef.current.contains(event.target)) {
//           setShowMenu(false);
//         }
//       };

//       document.addEventListener('mousedown', handleClickOutside);
//       return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const canEdit = user && (user.id === post.author.id || user.is_moderator);
//     const canDelete = user && (user.id === post.author.id || user.is_moderator);

//     const handleEdit = async () => {
//       if (!editContent.trim()) {
//         toast.error('Content cannot be empty');
//         return;
//       }

//       try {
//         await apiClient.updateForumPost(post.id, { content: editContent.trim() });
        
//         setIsEditing(false);
//         setShowMenu(false);
//         toast.success('Post updated successfully!');
        
//         // Refresh the topic data
//         loadTopicData();
//       } catch (error) {
//         console.error('Error updating post:', error);
//         toast.error('Failed to update post');
//       }
//     };

//     const handleDelete = async () => {
//       if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
//         return;
//       }

//       try {
//         setIsDeleting(true);
        
//         await apiClient.deleteForumPost(post.id);
        
//         setShowMenu(false);
//         toast.success('Post deleted successfully!');
        
//         // Refresh the topic data
//         loadTopicData();
//       } catch (error) {
//         console.error('Error deleting post:', error);
//         toast.error('Failed to delete post');
//       } finally {
//         setIsDeleting(false);
//       }
//     };

//     const handleReport = () => {
//       const reason = prompt('Please describe why you are reporting this post:');
//       if (reason && reason.trim()) {
//         toast.success('Post reported. Thank you for helping keep our community safe.');
//         setShowMenu(false);
        
//         // You can implement actual reporting API here
//         console.log('Reported post:', post.id, 'Reason:', reason);
//       }
//     };

//     const formatPostTime = (date) => {
//       const now = new Date();
//       const postDate = new Date(date);
//       const diffInHours = (now - postDate) / (1000 * 60 * 60);
      
//       if (diffInHours < 1) {
//         const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
//         return `${diffInMinutes}m ago`;
//       } else if (diffInHours < 24) {
//         return `${Math.floor(diffInHours)}h ago`;
//       } else {
//         return format(postDate, 'MMM dd, yyyy');
//       }
//     };

//     if (isDeleting) {
//       return (
//         <div className="clay-card p-6 bg-red-50 border border-red-200">
//           <div className="flex items-center justify-center">
//             <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-3"></div>
//             <span className="text-red-700">Deleting post...</span>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className={`clay-card p-6 ${
//         isOriginalPost 
//           ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200' 
//           : 'bg-white'
//       }`}>
//         {/* Post Header */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex items-center gap-3">
//             {/* Avatar */}
//             <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
//               {post.author.avatar ? (
//                 <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
//               ) : (
//                 <User className="w-6 h-6 text-white" />
//               )}
//             </div>
            
//             {/* Author Info */}
//             <div>
//               <h4 className="font-semibold text-gray-900 flex items-center gap-2">
//                 {post.author.name}
//                 {isOriginalPost && (
//                   <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
//                     OP
//                   </span>
//                 )}
//                 {post.author.isModerator && (
//                   <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
//                     MOD
//                   </span>
//                 )}
//               </h4>
//               <p className="text-sm text-gray-500">
//                 {formatPostTime(post.createdDate)}
//                 {post.isEdited && <span className="ml-2 italic">(edited)</span>}
//               </p>
//             </div>
//           </div>

//           {/* Three Dots Menu */}
//           <div className="relative" ref={menuRef}>
//             <button
//               onClick={() => {
//                 console.log('🔥 Three dots clicked!', { showMenu, postId: post.id, user: user?.email });
//                 setShowMenu(!showMenu);
//               }}
//               className="p-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-red-500"
//               title="Post options"
//               style={{ backgroundColor: showMenu ? '#ffeeee' : 'white' }}
//             >
//               <MoreVertical className="w-4 h-4 text-gray-500" />
//             </button>

//             {/* Dropdown Menu */}
//             {showMenu && (
//               <div 
//                 className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
//                 style={{ 
//                   backgroundColor: 'red', 
//                   border: '3px solid blue',
//                   minHeight: '200px'
//                 }}
//               >
//                 <div className="p-4 text-white font-bold">
//                   DEBUG MENU VISIBLE!
//                   <br />Post: {post.id}
//                   <br />User: {user?.email || 'Not logged in'}
//                   <br />Can Edit: {canEdit ? 'YES' : 'NO'}
//                   <br />Can Delete: {canDelete ? 'YES' : 'NO'}
//                 </div>
                
//                 {canEdit && (
//                   <button
//                     onClick={() => {
//                       console.log('🔥 Edit clicked!');
//                       setIsEditing(true);
//                       setShowMenu(false);
//                     }}
//                     className="w-full px-4 py-2 text-left text-sm text-white hover:bg-red-600 flex items-center gap-2"
//                   >
//                     <Pencil className="w-4 h-4" />
//                     Edit Post
//                   </button>
//                 )}
                
//                 {canDelete && (
//                   <button
//                     onClick={() => {
//                       console.log('🔥 Delete clicked!');
//                       if (window.confirm('Delete this post?')) {
//                         console.log('🔥 Delete confirmed!');
//                         toast.success('Delete would happen here!');
//                       }
//                       setShowMenu(false);
//                     }}
//                     className="w-full px-4 py-2 text-left text-sm text-white hover:bg-red-600 flex items-center gap-2"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                     Delete Post (DEBUG)
//                   </button>
//                 )}
                
//                 <button
//                   onClick={() => {
//                     console.log('🔥 Copy link clicked!');
//                     navigator.clipboard.writeText(`${window.location.origin}/forum/topic/${topicId}#post-${post.id}`);
//                     toast.success('Post link copied to clipboard!');
//                     setShowMenu(false);
//                   }}
//                   className="w-full px-4 py-2 text-left text-sm text-white hover:bg-red-600 flex items-center gap-2"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   Copy Link (DEBUG)
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Post Content */}
//         <div id={`post-${post.id}`}>
//           {isEditing ? (
//             <div className="space-y-3">
//               <textarea
//                 value={editContent}
//                 onChange={(e) => setEditContent(e.target.value)}
//                 className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 placeholder="Edit your post..."
//               />
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleEdit}
//                   disabled={!editContent.trim()}
//                   className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                 >
//                   <Save className="w-4 h-4" />
//                   Save Changes
//                 </button>
//                 <button
//                   onClick={() => {
//                     setIsEditing(false);
//                     setEditContent(post.content);
//                   }}
//                   className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="prose prose-sm max-w-none">
//               <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
//                 {post.content}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Post Actions */}
//         {!isEditing && (
//           <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
//             <div className="flex items-center gap-4">
//               {/* Like Button */}
//               <PostLikeButton postId={post.id} />
              
//               {/* Reply Button */}
//               <button
//                 onClick={() => setReplyingTo(post)}
//                 className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition-colors"
//               >
//                 <Reply className="w-4 h-4" />
//                 <span className="text-sm font-medium">Reply mmmmmmmmmmmmmmmmmmmm</span>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="clay-card p-12 text-center">
//           <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="clay-text-soft">Loading discussion...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!topic) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="clay-card p-12 text-center">
//           <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h2 className="clay-text-title text-xl font-semibold mb-2">Topic not found</h2>
//           <p className="clay-text-soft mb-6">This discussion doesn't exist or has been removed.</p>
//           <Link to="/forum" className="clay-button-primary px-6 py-3 font-semibold text-white">
//             Back to Forum
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       {/* Navigation */}
//       <div className="flex items-center gap-3 mb-6">
//         <Link 
//           to="/forum"
//           className="clay-button px-4 py-2 rounded-xl flex items-center gap-2 font-medium hover:bg-white/80"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Forum
//         </Link>
//         <span className="clay-text-soft">•</span>
//         <span className="clay-text-soft text-sm capitalize">{topic.category.replace('_', ' ')}</span>
//       </div>

//       {/* Topic Header */}
//       <div className="clay-card p-8 mb-6 bg-gradient-to-br from-white/90 to-white/70">
//         <div className="flex items-start justify-between mb-4">
//           <h1 className="clay-text-title text-3xl font-bold leading-tight flex-1">
//             {topic.title}
//           </h1>
          
//           <div className="flex gap-2 ml-4">
//             {topic.isPinned && (
//               <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
//                 <Pin className="w-4 h-4" />
//                 Pinned
//               </div>
//             )}
//             {topic.isLocked && (
//               <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
//                 <Lock className="w-4 h-4" />
//                 Locked
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div className="flex items-center gap-6 clay-text-soft">
//           <div className="flex items-center gap-2">
//             <User className="w-4 h-4" />
//             <span>By {topic.author.name}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Calendar className="w-4 h-4" />
//             <span>{format(topic.createdDate, 'MMM dd, yyyy')}</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <Eye className="w-4 h-4" />
//             <span>{topic.views} views</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <MessageSquare className="w-4 h-4" />
//             <span>{posts.length} replies</span>
//           </div>
//         </div>
//       </div>

//       {/* Original Post */}
//       <div className="mb-6">
//         <EnhancedPostCard 
//           post={{
//             id: topic.id,
//             content: topic.content,
//             createdDate: topic.createdDate,
//             author: topic.author,
//             isEdited: false
//           }} 
//           isOriginalPost={true}
//         />
//       </div>

//       {/* Replies */}
//       <div className="space-y-4 mb-8">
//         {posts.length > 0 ? (
//           <>
//             <div className="flex items-center gap-3 mb-4">
//               <h2 className="clay-text-title text-xl font-semibold">
//                 {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
//               </h2>
//               <div className="flex-1 h-px bg-gray-200"></div>
//             </div>
            
//             {posts.map((post) => (
//               <EnhancedPostCard key={post.id} post={post} />
//             ))}
//           </>
//         ) : (
//           <div className="clay-card p-12 text-center bg-white/60">
//             <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//             <h3 className="clay-text-title text-lg font-semibold mb-2">No replies yet</h3>
//             <p className="clay-text-soft">Be the first to join this discussion!</p>
//           </div>
//         )}
//       </div>

//       {/* Reply Form */}
//       {user && !topic.isLocked ? (
//         <div ref={replyFormRef} className="clay-card p-6 bg-white/90 backdrop-blur-sm">
//           {replyingTo && (
//             <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
//               <p className="text-sm text-blue-700">
//                 <strong>Replying to {replyingTo.author.name}:</strong>
//               </p>
//               <p className="text-sm text-blue-600 italic mt-1">
//                 "{replyingTo.content.substring(0, 100)}..."
//               </p>
//               <button
//                 onClick={() => setReplyingTo(null)}
//                 className="text-xs text-blue-500 hover:text-blue-700 mt-2"
//               >
//                 Cancel reply
//               </button>
//             </div>
//           )}
          
//           <form onSubmit={handleReply}>
//             <div className="mb-4">
//               <label className="block clay-text-soft text-sm font-medium mb-3">
//                 {replyingTo ? `Reply to ${replyingTo.author.name}` : 'Share your thoughts'}
//               </label>
//               <textarea
//                 value={newReply}
//                 onChange={(e) => setNewReply(e.target.value)}
//                 className="clay-input w-full h-32 resize-none text-base"
//                 placeholder="Write your reply here... Be respectful and constructive."
//                 disabled={submitting}
//                 required
//               />
//             </div>
            
//             <div className="flex items-center justify-between">
//               <p className="clay-text-soft text-xs">
//                 🤝 Remember to be respectful and follow community guidelines
//               </p>
//               <button
//                 type="submit"
//                 disabled={!newReply.trim() || submitting}
//                 className="clay-button-primary px-8 py-3 font-semibold text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {submitting ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Posting...
//                   </>
//                 ) : (
//                   <>
//                     <Send className="w-4 h-4" />
//                     Post Reply
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       ) : topic.isLocked ? (
//         <div className="clay-card p-8 bg-red-50 text-center border-l-4 border-red-400">
//           <Lock className="w-8 h-8 text-red-500 mx-auto mb-3" />
//           <h3 className="font-semibold text-red-800 mb-2">Discussion Locked</h3>
//           <p className="text-red-700">This topic is locked and no longer accepting new replies.</p>
//         </div>
//       ) : (
//         <div className="clay-card p-8 bg-gray-50 text-center">
//           <User className="w-8 h-8 text-gray-400 mx-auto mb-3" />
//           <h3 className="font-semibold text-gray-700 mb-2">Join the Discussion</h3>
//           <p className="clay-text-soft mb-4">Sign in to participate in this conversation.</p>
//           <Link to="/auth" className="clay-button-primary px-6 py-3 font-semibold text-white">
//             Sign In
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ForumTopicView;