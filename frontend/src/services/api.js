import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send MongoDB session cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
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
