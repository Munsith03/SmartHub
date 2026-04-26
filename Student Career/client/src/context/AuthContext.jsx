import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { authAPI, profileAPI } from '../api';
import socket from '../utils/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // State from both implementations
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch profile function from second implementation
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const { data } = await profileAPI.get();
      setProfile(data.profile);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Initialize function from second implementation
  const initialize = useCallback(async () => {
    const accessToken = localStorage.getItem('accessToken');
    const bearerToken = localStorage.getItem('token');
    
    // Check both token storage methods
    const currentToken = accessToken || bearerToken;
    
    if (!currentToken) { 
      setLoading(false); 
      return; 
    }
    
    try {
      // Try to get user from /auth/me endpoint
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setToken(currentToken);
      await fetchProfile();
      
      // Connect socket if available
      if (socket && data.user?._id) {
        socket.connect();
        socket.emit('user_online', data.user._id);
      }
    } catch {
      // Fallback to old API if needed
      try {
        const res = await API.get('/auth/me');
        setUser(res.data.user);
        if (socket && res.data.user?._id) {
          socket.connect();
          socket.emit('user_online', res.data.user._id);
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => { initialize(); }, [initialize]);

  // Login function - supports both implementations
  const login = async (email, password, credentials = null) => {
    try {
      // If credentials object is passed (second implementation style)
      if (credentials) {
        const { data } = await authAPI.login(credentials);
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('token', data.accessToken); // Store in both for compatibility
        setToken(data.accessToken);
        setUser(data.user);
        await fetchProfile();
        
        if (socket && data.user?._id) {
          socket.connect();
          socket.emit('user_online', data.user._id);
        }
        return data;
      } 
      // If email and password are passed (first implementation style)
      else if (email && password) {
        const res = await API.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('accessToken', newToken); // Store in both for compatibility
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        
        if (socket && newUser._id) {
          socket.connect();
          socket.emit('user_online', newUser._id);
        }
        await fetchProfile();
        return newUser;
      }
    } catch (error) {
      throw error;
    }
  };

  // Register function - supports both implementations
  const register = async (data) => {
    try {
      // Check if it's the first implementation style (with email/password)
      if (data.email && data.password && !data.name) {
        const res = await API.post('/auth/register', data);
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        
        if (socket && newUser._id) {
          socket.connect();
          socket.emit('user_online', newUser._id);
        }
        await fetchProfile();
        return newUser;
      } 
      // Second implementation style
      else {
        const { data: responseData } = await authAPI.register(data);
        localStorage.setItem('accessToken', responseData.accessToken);
        localStorage.setItem('token', responseData.accessToken);
        setToken(responseData.accessToken);
        setUser(responseData.user);
        await fetchProfile();
        
        if (socket && responseData.user?._id) {
          socket.connect();
          socket.emit('user_online', responseData.user._id);
        }
        return responseData;
      }
    } catch (error) {
      throw error;
    }
  };

  // Logout function - combines both
  const logout = async () => {
    try { 
      await API.post('/auth/logout');
      await authAPI.logout();
    } catch(e) { 
      // ignore errors
    }
    
    if (socket) {
      socket.disconnect();
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  // Profile management functions
  const updateProfile = (updatedProfile) => setProfile(updatedProfile);
  const refreshProfile = fetchProfile;

  const completionPercentage = profile?.completionPercentage ?? 0;

  return (
    <AuthContext.Provider value={{ 
      // User and auth state
      user, 
      token,
      profile,
      loading, 
      profileLoading,
      completionPercentage,
      
      // Auth functions
      login, 
      register, 
      logout,
      
      // Profile functions
      updateProfile,
      refreshProfile,
      fetchProfile,
      
      // Helper
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}