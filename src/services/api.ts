import axios from 'axios';

// API client with HTTP-only cookie support
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  withCredentials: true, // Include HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;