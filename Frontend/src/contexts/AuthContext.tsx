import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import axios from 'axios';

// Define types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  clearanceLevel?: string;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate a session ID
  const generateSessionId = () => {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Attempting to login with email: ${email}`);
      console.log("API URL:", import.meta.env.VITE_API_URL || 'Environment variable not set');
      
      // Try multiple approaches to handle different deployment scenarios
      let res;
      let loginSuccessful = false;
      let error;
      
      // Approach 1: Standard API call through service
      try {
        console.log("Trying standard API login");
        res = await authAPI.login({ email, password });
        loginSuccessful = true;
      } catch (err) {
        console.warn("Standard login approach failed:", err);
        error = err;
      }
      
      // Approach 2: Direct API call with full production URL if first attempt failed
      if (!loginSuccessful) {
        try {
          const apiUrl = 'https://shadowshield-backend.onrender.com';
          console.log("Trying direct URL approach:", `${apiUrl}/api/auth/login`);
          res = await axios.post(`${apiUrl}/api/auth/login`, { email, password }, {
            headers: { 'Content-Type': 'application/json' }
          });
          loginSuccessful = true;
        } catch (err) {
          console.warn("Direct URL approach failed:", err);
          error = err;
        }
      }
      
      // If all approaches failed, throw the last error
      if (!loginSuccessful) {
        throw error;
      }
      
      console.log("Login API response:", res.data);
      
      const { token, user } = res.data;
      
      // Generate a session ID
      const generatedSessionId = generateSessionId();
      console.log("Generated session ID:", generatedSessionId);
      
      // Store token, user ID, and session ID in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('sessionId', generatedSessionId);
      
      setToken(token);
      setUser(user);
      setSessionId(generatedSessionId);
      
      console.log("Login successful. User:", user);
      
    } catch (error: any) {
      console.error('Login failed:', error);
      // Add more debug information for errors
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      const { token, user } = res.data;
      
      // Generate a session ID
      const generatedSessionId = generateSessionId();
      
      // Store token, user ID, and session ID in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id); // Add this line
      localStorage.setItem('sessionId', generatedSessionId);
      
      setToken(token);
      setUser(user);
      setSessionId(generatedSessionId);
      
      console.log("Registration successful:", user);
      console.log("Session ID:", generatedSessionId);
      
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed, but continuing with local logout:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('userId'); // Add this line
      localStorage.removeItem('sessionId');
      setToken(null);
      setUser(null);
      setSessionId(null);
      setIsLoading(false);
      
      console.log("Logout successful");
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const res = await authAPI.updateProfile(data);
      setUser({ ...user, ...res.data.user });
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('token');
      const storedSessionId = localStorage.getItem('sessionId');
      const storedUserId = localStorage.getItem('userId'); // Add this line
      
      if (storedToken && storedUserId) { // Check for both token and userId
        setToken(storedToken);
        
        // If there's no session ID stored, generate one
        const sessionIdToUse = storedSessionId || generateSessionId();
        if (!storedSessionId) {
          localStorage.setItem('sessionId', sessionIdToUse);
        }
        setSessionId(sessionIdToUse);
        
        try {
          // Get user profile with the token
          const res = await authAPI.getProfile();
          setUser(res.data.data || res.data);
          console.log("User profile loaded:", res.data.data || res.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clear invalid token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('userId'); // Add this line
          localStorage.removeItem('sessionId');
          setToken(null);
          setSessionId(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionId,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;