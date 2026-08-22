import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        if (res.data.token) {
          localStorage.setItem('bx_token', res.data.token);
        }
        setUser(res.data.user);
        await checkAuth();
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.success) {
        if (res.data.token) {
          localStorage.setItem('bx_token', res.data.token);
        }
        setUser(res.data.user);
        await checkAuth();
        showToast('Registration successful! Welcome to BX Analytics.', 'success');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('bx_token');
      setUser(null);
      setProfile(null);
      showToast('Logged out successfully.', 'info');
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const isLead = user?.role === 'lead';
  const isStaff = isSuperAdmin || isLead;
  const isMember = user?.role === 'member';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        checkAuth,
        setUser,
        setProfile,
        isSuperAdmin,
        isLead,
        isStaff,
        isMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
