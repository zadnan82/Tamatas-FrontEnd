// src/config/api.js - Fixed version
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  
  USERS: {
    UPDATE_ME: '/users/me',
    PROFILE: (userId) => `/users/${userId}`,
    REVIEWS: (userId) => `/users/${userId}/reviews`,
  },
  
  LISTINGS: {
    BASE: '/listings',
    CREATE: '/listings',
    MY_LISTINGS: '/listings/my',
    FEEDS: '/listings/feeds',
    BY_ID: (id) => `/listings/${id}`,
    UPDATE: (id) => `/listings/${id}`,
    DELETE: (id) => `/listings/${id}`,
  },
  
  MESSAGES: {
    BASE: '/messages',
    CONVERSATION: (userId) => `/messages/conversations/${userId}`,
    MARK_READ: (messageId) => `/messages/${messageId}/read`,
  },
  
  REVIEWS: {
    BASE: '/reviews',
    USER_REVIEWS: (userId) => `/reviews/user/${userId}`,
  },
  
  FAVORITES: {
    BASE: '/favorites',
    DELETE: (favoriteId) => `/favorites/${favoriteId}`,
  },
  
  FORUM: {
    TOPICS: '/forum/topics',
    TOPIC_BY_ID: (topicId) => `/forum/topics/${topicId}`,
    POSTS: '/forum/posts',
    TOPIC_POSTS: (topicId) => `/forum/topics/${topicId}/posts`,
  },
  
  UPLOAD: {
    IMAGE: '/upload/image',
    IMAGES: '/upload/images',
  },
  
  CONTACT: {
    BASE: '/contact',
  },
};

class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      console.log(`Making ${config.method || 'GET'} request to:`, url);
      if (config.body) {
        console.log('Request body:', config.body);
      }
      
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const textData = await response.text();
            errorData = { detail: textData || `HTTP ${response.status} ${response.statusText}` };
          }
          console.log('Error response data:', errorData);
        } catch (jsonError) {
          console.log('Could not parse error response:', jsonError);
          errorData = { detail: `Request failed with status ${response.status} ${response.statusText}` };
        }
        
        // Create a proper Error object with the error data
        const error = new Error('API Request Failed');
        error.status = response.status;
        error.data = errorData;
        
        // Handle different error formats
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // FastAPI validation errors
            error.message = errorData.detail.map(err => {
              const location = err.loc ? err.loc.join('.') : 'unknown field';
              const message = err.msg || 'validation error';
              return `${location}: ${message}`;
            }).join(', ');
          } else {
            error.message = errorData.detail;
          }
        } else if (errorData.message) {
          error.message = errorData.message;
        } else if (errorData.error) {
          error.message = errorData.error;
        } else {
          error.message = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw error;
      }

      // Handle successful responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log('Success response data:', responseData);
        return responseData;
      }
      
      return response;
    } catch (error) {
      console.error('API Request Error Details:', {
        url,
        method: config.method || 'GET',
        error: error.message,
        status: error.status,
        data: error.data
      });
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const formData = new FormData();
    formData.append('username', email); // FastAPI OAuth2 uses 'username'
    formData.append('password', password);
    
    const response = await fetch(`${this.baseURL}${API_CONFIG.AUTH.LOGIN}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }
    
    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(userData) {
    const data = await this.request(API_CONFIG.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    
    return data;
  }

  async getCurrentUser() {
    return this.request(API_CONFIG.AUTH.ME);
  }

  logout() {
    this.setToken(null);
  }

  // Listing methods with better validation
  async createListing(listingData) {
    // Validate required fields before sending
    const requiredFields = ['title', 'category', 'listing_type', 'images'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'images') {
        return !listingData[field] || listingData[field].length === 0;
      }
      return !listingData[field] || listingData[field].trim() === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Helper function to format date for backend
    const formatDateForBackend = (dateString) => {
      if (!dateString) return null;
      
      // If it's already a full datetime, return as is
      if (dateString.includes('T')) return dateString;
      
      // If it's just a date (YYYY-MM-DD), add time component
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return `${dateString}T00:00:00`;
      }
      
      return dateString;
    };

    // Clean up the data
    const cleanData = {
      title: listingData.title.trim(),
      description: listingData.description || '',
      category: listingData.category,
      subcategory: listingData.subcategory || null,
      listing_type: listingData.listing_type,
      price: listingData.price || null,
      price_unit: listingData.price_unit || 'per_lb',
      quantity_available: listingData.quantity_available || '',
      trade_preference: listingData.trade_preference || 'both',
      images: listingData.images,
      status: 'active',
      harvest_date: formatDateForBackend(listingData.harvest_date),
      organic: Boolean(listingData.organic),
      location: {
        city: listingData.location?.city || '',
        state: listingData.location?.state || '',
        latitude: listingData.location?.latitude || null,
        longitude: listingData.location?.longitude || null
      },
      view_count: 0
    };

    console.log('Sending cleaned listing data:', cleanData);

    return this.request(API_CONFIG.LISTINGS.CREATE, {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }

  async getListings(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.append(key, value);
      }
    });
    
    const query = params.toString();
    const endpoint = query ? `${API_CONFIG.LISTINGS.BASE}?${query}` : API_CONFIG.LISTINGS.BASE;
    return this.request(endpoint);
  }

  async getMyListings() {
    return this.request(API_CONFIG.LISTINGS.MY_LISTINGS);
  }

  async updateListing(id, updates) {
    return this.request(API_CONFIG.LISTINGS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteListing(id) {
    return this.request(API_CONFIG.LISTINGS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Add other methods as needed...
}

// Create and export API client instance
export const apiClient = new ApiClient();
export default API_CONFIG;