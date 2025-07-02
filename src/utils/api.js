// Legacy API file - now just re-exports the new API client for compatibility
import { apiClient } from '../config/api';

// Export the main API client as default for backward compatibility
export default apiClient;

// Also export individual methods for convenience
export const {
  login,
  register,
  logout,
  getCurrentUser,
  updateProfile,
  getUserProfile,
  getUserReviews,
  getListings,
  getMyListings,
  getFeeds,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMessages,
  sendMessage,
  getConversation,
  markMessageRead,
  createReview,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  getForumTopics,
  getForumTopic,
  createForumTopic,
  createForumPost,
  getTopicPosts,
  uploadImage,
  uploadImages,
  sendContact
} = apiClient;