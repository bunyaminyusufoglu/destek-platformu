import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/shared/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/shared/Dashboard';
import Messages from './components/shared/Messages';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/shared/Layout';
import SupportRequestForm from './components/user/SupportRequestForm';
import MyRequests from './components/user/MyRequests';

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
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Messages />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;