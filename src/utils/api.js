class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(email, password, full_name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
    this.setToken(data.token);
    return data;
  }

  logout() {
    this.clearToken();
  }

  // User methods
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateProfile(updates) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  // Listings methods
  async getListings(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value);
      }
    });
    return this.request(`/listings?${params}`);
  }

  async getListing(id) {
    return this.request(`/listings/${id}`);
  }

  async createListing(listingData) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async updateListing(id, updates) {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteListing(id) {
    return this.request(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Messages methods
  async getMessages() {
    return this.request('/messages');
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Reviews methods
  async getUserReviews(userId) {
    return this.request(`/reviews/user/${userId}`);
  }

  async createReview(reviewData) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Favorites methods
  async getFavorites() {
    return this.request('/favorites');
  }

  async addToFavorites(listingId) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId }),
    });
  }

  async removeFromFavorites(favoriteId) {
    return this.request(`/favorites/${favoriteId}`, {
      method: 'DELETE',
    });
  }

  // Forum methods
  async getForumTopics(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/forum/topics?${params}`);
  }

  async getForumTopic(id) {
    return this.request(`/forum/topics/${id}`);
  }

  async createForumTopic(topicData) {
    return this.request('/forum/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  }

  async createForumPost(postData) {
    return this.request('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Upload method
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

export default new ApiService();