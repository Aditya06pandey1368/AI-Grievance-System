import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check Login Status on Load
  useEffect(() => {
    const checkLoggedIn = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse user data");
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Save to LocalStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Server Error" 
      };
    }
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login'; // Force redirect
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);