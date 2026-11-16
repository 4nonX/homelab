import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post('/api/auth/register', { email, username, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Portfolio API
export const portfolioAPI = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/portfolio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyPortfolio: async () => {
    const response = await api.get('/api/portfolio/me');
    return response.data;
  },

  updatePortfolio: async (data: any) => {
    const response = await api.patch('/api/portfolio/me', data);
    return response.data;
  },

  getPublicPortfolio: async (username: string) => {
    const response = await axios.get(`${API_URL}/api/portfolio/${username}`);
    return response.data;
  },

  listPortfolios: async (limit = 20, offset = 0) => {
    const response = await axios.get(`${API_URL}/api/portfolios?limit=${limit}&offset=${offset}`);
    return response.data;
  },
};

// Contact API
export const contactAPI = {
  sendMessage: async (username: string, data: any) => {
    const response = await axios.post(`${API_URL}/api/contact/${username}`, data);
    return response.data;
  },

  getMessages: async () => {
    const response = await api.get('/api/contact/messages');
    return response.data;
  },
};

export default api;
