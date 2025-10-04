import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthProvider';

const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAdminAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="text-muted">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return isAdminAuthenticated ? children : <Navigate to="/admin" replace />;
};

export default AdminProtectedRoute;
