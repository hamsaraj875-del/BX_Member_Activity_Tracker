import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Send MongoDB session cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token from localStorage for seamless cross-domain auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or unauthorized
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        // Optional: redirect or let AuthContext handle it
      }
    }
    return Promise.reject(error);
  }
);

export default api;
