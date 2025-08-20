import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 30000, // Increased from 10000 to 30000 (30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔗 API Request:', config.method?.toUpperCase(), config.url, config.data || '');
    return config;
  },
  (error) => {
    console.error('🔗 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('🔗 API Response:', response.status, response.config.url, response.data ? 'Data received' : 'No data');
    return response;
  },
  (error) => {
    console.error('🔗 API Response Error:', error.response?.status, error.config?.url, error.response?.data || error.message);
    // Only log out on 401 (unauthorized) errors, not 404 (not found) errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  createProfile: (profileData) => api.post('/profile', profileData),
  updateProfile: (updates) => api.patch('/profile', updates),
  getOnboardingQuestions: () => api.get('/profile/onboarding-questions'),
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: (params) => api.get('/recommendations', { params }),
  getSimilarPerfumes: (perfumeId, params) => 
    api.get(`/recommendations/similar/${perfumeId}`, { params }),
  submitFeedback: (feedback) => api.post('/recommendations/feedback', feedback),
  getHistory: (params) => api.get('/recommendations/history', { params }),
};

// Perfumes API
export const perfumesAPI = {
  search: (params) => api.get('/perfumes/search', { params }),
  getById: (id) => api.get(`/perfumes/${id}`),
  getPopular: (params) => api.get('/perfumes/popular/list', { params }),
  getByBrand: (brand, params) => api.get(`/perfumes/brand/${brand}`, { params }),
  getByFamily: (family, params) => api.get(`/perfumes/family/${family}`, { params }),
  getByNote: (note, params) => api.get(`/perfumes/notes/${note}`, { params }),
  getBrands: () => api.get('/perfumes/brands/list'),
  getFamilies: () => api.get('/perfumes/families/list'),
};

// Shelf API
export const shelfAPI = {
  getSavedPerfumes: (params) => api.get('/shelf', { params }),
  addToShelf: (perfumeData) => api.post('/shelf', perfumeData),
  updateSavedPerfume: (shelfId, updates) => api.put(`/shelf/${shelfId}`, updates),
  removeFromShelf: (shelfId) => api.delete(`/shelf/${shelfId}`),
  getStats: () => api.get('/shelf/stats'),
  searchSaved: (params) => api.get('/shelf/search', { params }),
  getSavedById: (shelfId) => api.get(`/shelf/${shelfId}`),
};

export default api;
