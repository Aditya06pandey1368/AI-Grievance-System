import axios from 'axios';

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to your Node Server
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor (Attaches Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (Handles Token Expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend says "Unauthorized" (401), wipe data and redirect
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optional: Redirect to login only if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;