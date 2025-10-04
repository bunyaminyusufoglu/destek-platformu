import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const user = localStorage.getItem('user');
      
      if (adminToken && user) {
        try {
          const tokenData = JSON.parse(atob(adminToken));
          const userData = JSON.parse(user);
          
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
  };

  const login = (userData) => {
    setAdminUser(userData);
    setIsAdminAuthenticated(true);
  };

  const logout = () => {
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
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
