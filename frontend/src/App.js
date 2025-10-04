import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/shared/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/shared/Dashboard';
import Messages from './components/shared/Messages';
import Settings from './components/shared/Settings';
import AvailableRequests from './components/expert/AvailableRequests';
import MyOffers from './components/expert/MyOffers';
import IncomingOffers from './components/user/IncomingOffers';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/shared/Layout';
import AdminLayout from './components/admin/AdminLayout';
import SupportRequestForm from './components/user/SupportRequestForm';
import MyRequests from './components/user/MyRequests';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportRequestManagement from './components/admin/SupportRequestManagement';
import AdminLogin from './components/admin/AdminLogin';
import AdminAuthProvider from './components/admin/AdminAuthProvider';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

// Public Route Component (sadece giriş yapmamış kullanıcılar)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-request" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <SupportRequestForm />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-requests" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyRequests />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/available-requests" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <AvailableRequests />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-offers" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyOffers />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/incoming-offers" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <IncomingOffers />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={<AdminLogin />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/requests" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <SupportRequestManagement />
                  </AdminLayout>
                </AdminProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;