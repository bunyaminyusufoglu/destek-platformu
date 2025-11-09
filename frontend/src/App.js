import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/shared/Header';
import HomePage from './components/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/shared/Dashboard';
import Messages from './components/shared/Messages';
import Settings from './components/shared/Settings';
import AvailableRequests from './components/expert/AvailableRequests';
import MyOffers from './components/expert/MyOffers';
import IncomingOffers from './components/user/IncomingOffers';
import PaymentPage from './components/user/PaymentPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/shared/Layout';
import AdminLayout from './components/admin/AdminLayout';
import SupportRequestForm from './components/user/SupportRequestForm';
import MyRequests from './components/user/MyRequests';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import SupportRequestManagement from './components/admin/SupportRequestManagement';
import Reports from './components/admin/Reports';
import AdminSettings from './components/admin/AdminSettings';
import AdminLogin from './components/admin/AdminLogin';
import AdminAuthProvider from './components/admin/AdminAuthProvider';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import OfferApproval from './components/admin/OfferApproval';
import SupportRequestApproval from './components/admin/SupportRequestApproval';
import { settingsAPI } from './services/api';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading && (location.pathname === '/login' || location.pathname === '/register')) {
    return children;
  }

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  useEffect(() => {
    const applySeo = async () => {
      try {
        const data = await settingsAPI.getPublic();
        const seo = data?.seo || {};
        if (seo.title) document.title = seo.title;
        const ensureMeta = (name) => {
          let el = document.querySelector(`meta[name="${name}"]`);
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
          }
          return el;
        };
        if (seo.description !== undefined) {
          const meta = ensureMeta('description');
          meta.setAttribute('content', seo.description || '');
        }
        if (seo.keywords !== undefined) {
          const meta = ensureMeta('keywords');
          const keywords = Array.isArray(seo.keywords) ? seo.keywords.join(', ') : (seo.keywords || '');
          meta.setAttribute('content', keywords);
        }
        if (seo.robots !== undefined) {
          const meta = ensureMeta('robots');
          meta.setAttribute('content', seo.robots || 'index, follow');
        }
      } catch (e) {
      }
    };
    applySeo();
  }, []);

  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
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
              path="/payment" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <PaymentPage />
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
            <Route 
              path="/admin/reports" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <Reports />
                  </AdminLayout>
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/request-approvals" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <SupportRequestApproval />
                  </AdminLayout>
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/offers" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <OfferApproval />
                  </AdminLayout>
                </AdminProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </AdminProtectedRoute>
              } 
            />
            
            {/* Default Route */}
            <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;