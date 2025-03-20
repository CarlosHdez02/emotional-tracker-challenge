import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookie from 'js-cookie';
import axios from 'axios';
import APIService from '../services/api'; // Import API Service

// API URL
const API_URL = 'http://localhost:5050/api';
const apiService = new APIService(); 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); //  change to token
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Run on initial mount
  useEffect(() => {
    console.log("Auth provider mounted");
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log("Initializing auth...");
    
    
    let token = localStorage.getItem('terapia_token');
    try {
      token = token ? JSON.parse(token) : null;
    } catch (e) {
      token = null;
    }
    
    const cookieToken = Cookie.get('token');
    token = token || cookieToken;
    
    
    let savedUser = localStorage.getItem('terapia_user');
    try {
      savedUser = savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      savedUser = null;
    }
    
    console.log("Found token:", !!token);
    console.log("Found saved user:", !!savedUser);
    
    if (token) {
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      

      apiService.updateToken(token);
      
      try {
        console.log("Verifying token with API...");
      
        const res = await axios.get(`${API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log("Token verified successfully");
       
        setUser(res.data);
        
   
        localStorage.setItem('terapia_user', JSON.stringify(res.data));
        localStorage.setItem('terapia_token', JSON.stringify(token));
        
        // Ensure cookie is set
        if (!cookieToken) {
          Cookie.set('token', token);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        clearAuth();
      }
    } else if (savedUser) {
      console.log("Using saved user without token verification");
      
      setUser(savedUser);
    }
    
    setLoading(false);
  };


  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && user) {
          const refreshed = await refreshUserToken();
          if (refreshed) {

            const originalRequest = error.config;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [user]);

  // Clear all auth data
  const clearAuth = () => {
    // Clear localStorage
    localStorage.removeItem('terapia_user');
    localStorage.removeItem('terapia_token');
    
    // Clear cookie
    Cookie.remove('token');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear state
    setUser(null);
    
    // Reset API service token
    apiService.updateToken(null);
    
   
  };

  // Register user
  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/users/register`, userData);
    
    const newUser = res.data;
    const token = res.data.token;
    
    // Update state
    setUser(newUser);
    
    // Set axios default
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update APIService token
    apiService.updateToken(token);
    
    // Store in localStorage
    localStorage.setItem('terapia_user', JSON.stringify(newUser));
    localStorage.setItem('terapia_token', JSON.stringify(token));
    
    // Store in cookie
    Cookie.set('token', token);
    
    router.push('/dashboard');
  };

  // Login user
  const login = async (userData, rememberMe = false) => {
    const res = await axios.post(`${API_URL}/users/login`, userData);
    
    const userInfo = res.data.data || res.data;
    const token = userInfo.token;
    
    // Update state
    setUser(userInfo);
    
    // Set axios default
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update APIService token
    apiService.updateToken(token);
    
    // Store in localStorage
    localStorage.setItem('terapia_user', JSON.stringify(userInfo));
    localStorage.setItem('terapia_token', JSON.stringify(token));
    
    // Store in cookie with appropriate expiration
    if (rememberMe) {
      Cookie.set('token', token, { expires: 30 });
    } else {
      Cookie.set('token', token);
    }
    
    router.push('/dashboard');
  };

  // Logout user
  const logout = () => {
  
    clearAuth();
    router.push('/');
  };

  // Update password
  const updatePassword = async (passwordData) => {
    let token = localStorage.getItem('terapia_token');
    try {
      token = token ? JSON.parse(token) : null;
    } catch (e) {
      token = null;
    }
    
    token = token || Cookie.get('token');
    
    if (token && user) {
      try {
        const res = await axios.patch(
          `${API_URL}/users/change-password/${user._id}`,
          passwordData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        return res.data;
      } catch (error) {
        throw error;
      }
    }
    
    return null;
  };
  
  // Update profile
  const updateProfile = async (userData) => {
    let token = localStorage.getItem('terapia_token');
    try {
      token = token ? JSON.parse(token) : null;
    } catch (e) {
      token = null;
    }
    
    token = token || Cookie.get('token');
    
    if (token) {
      const res = await axios.put(`${API_URL}/users/profile`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedUser = res.data;
      
      // Update state
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('terapia_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    }
    
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};