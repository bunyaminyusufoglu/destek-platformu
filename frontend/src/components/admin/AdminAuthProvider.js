import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAdminAuth = useCallback(() => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const storedAdminUser = localStorage.getItem('adminUser');
      
      if (adminToken && storedAdminUser) {
        try {
          const tokenData = JSON.parse(atob(adminToken));
          const userData = JSON.parse(storedAdminUser);
          
          // Token'ın geçerli olup olmadığını kontrol et (24 saat)
          const tokenAge = Date.now() - tokenData.timestamp;
          const tokenValid = tokenAge < 24 * 60 * 60 * 1000; // 24 saat
          
          if (tokenValid && userData.isAdmin) {
            setAdminUser(userData);
            setIsAdminAuthenticated(true);
          } else {
            // Token geçersiz, temizle
            logout();
          }
        } catch (tokenError) {
          console.error('Token parse error:', tokenError);
          logout();
        }
      }
    } catch (error) {
      console.error('Admin auth check error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const login = (userData) => {
    setAdminUser(userData);
    setIsAdminAuthenticated(true);
  };

  const logout = () => {
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const value = {
    isAdminAuthenticated,
    adminUser,
    loading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
