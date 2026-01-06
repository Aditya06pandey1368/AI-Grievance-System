import axios from 'axios';

// 1. Create the Instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to your Node Server
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. The Interceptor (The Automatic ID Card Attacher)
// Before any request leaves the browser, this code runs.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // If we have a token, stick it in the header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;