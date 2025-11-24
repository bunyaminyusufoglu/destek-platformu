import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa yüklendiğinde kullanıcı bilgisini kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const adminToken = localStorage.getItem('adminToken');
        
        // Token süresi dolmuş mu kontrol et (JWT exp)
        const isTokenExpired = (jwtToken) => {
          try {
            const base64Url = jwtToken.split('.')[1];
            if (!base64Url) return true;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
            if (!payload?.exp) return false; // exp yoksa süresiz varsay
            const nowInSeconds = Math.floor(Date.now() / 1000);
            return payload.exp < nowInSeconds;
          } catch {
            return true;
          }
        };

        if (token && userData) {
          if (!isTokenExpired(token)) {
            setUser(JSON.parse(userData));
          } else {
            // Sadece kullanıcı token'ı geçersizse temizle
            localStorage.removeItem('token');
            // Admin oturumu varsa adminUser bilgisini koru
            if (!adminToken) {
              localStorage.removeItem('user');
            }
          }
        } else {
          // Kullanıcı token'ı yoksa müdahale etme; admin oturumu olabilir
          if (token && !userData) {
            localStorage.removeItem('token');
          }
        }
      } catch (err) {
        localStorage.removeItem('token');
        // Admin oturumu varsa user bilgisini silme
        if (!localStorage.getItem('adminToken')) {
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Kayıt ol
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register(userData);
      
      // Başarılı kayıt sonrası otomatik giriş yap
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Kayıt sırasında hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Giriş yap
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login(credentials);
      
      if (response && response.token && response.user) {
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        throw new Error('Geçersiz yanıt formatı');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Giriş sırasında hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Profil güncelle
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.updateProfile(profileData);
      
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Profil güncellenirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştir
  const changePassword = async (passwordData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.changePassword(passwordData);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Şifre değiştirilirken hata oluştu';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Hata temizle
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAuthenticated: !!user,
    isUser: user?.isUser || false,
    isExpert: user?.isExpert || false,
    isAdmin: user?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
