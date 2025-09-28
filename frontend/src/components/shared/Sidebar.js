import React, { useState } from 'react';
import { Nav, Badge, Offcanvas, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout, isAdmin, isUser, isExpert } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  const getRoleBadge = () => {
    if (isAdmin) return <Badge bg="warning" className="ms-2">👑 Admin</Badge>;
    if (isUser) return <Badge bg="success" className="ms-2">👤 Kullanıcı</Badge>;
    if (isExpert) return <Badge bg="primary" className="ms-2">💼 Uzman</Badge>;
    return null;
  };

  const getNavigationItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    ];

    // Kullanıcı için sadece kendi talepleri
    if (isUser) {
      items.push(
        { path: '/my-requests', label: 'Taleplerim', icon: '📋' }
      );
    }
    
    // Admin için tüm talepler ve kendi talepleri
    if (isAdmin) {
      items.push(
        { path: '/support-requests', label: 'Tüm Talepler', icon: '📝' },
        { path: '/my-requests', label: 'Taleplerim', icon: '📋' }
      );
    }

    // Uzman ve Admin için
    if (isExpert || isAdmin) {
      items.push(
        { path: '/available-requests', label: 'Açık Talepler', icon: '🔍' },
        { path: '/my-offers', label: 'Tekliflerim', icon: '💼' }
      );
    }

    // Admin için özel sayfalar
    if (isAdmin) {
      items.push(
        { path: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
        { path: '/admin/analytics', label: 'Analitik', icon: '📊' },
        { path: '/admin/settings', label: 'Ayarlar', icon: '⚙️' }
      );
    }

    // Herkes için
    items.push(
      { path: '/messages', label: 'Mesajlar', icon: '💬' }
    );

    return items;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar d-none d-lg-block">
        <div className="sidebar-header">
          <div className="user-section">
            <div className="user-avatar">
              {user?.name
                ?.split(" ")
                .map(word => word.charAt(0).toUpperCase())
                .slice(0, 2)
                .join("")}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">
                {getRoleBadge()}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <Nav className="flex-column sidebar-nav">
            {getNavigationItems().map((item, index) => (
              <Nav.Link 
                key={index} 
                onClick={() => handleNavigation(item.path)}
                className={`sidebar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Nav.Link>
            ))}
            
            <Nav.Link 
              onClick={() => handleNavigation('/settings')}
              className="sidebar-nav-link"
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Ayarlar</span>
            </Nav.Link>
            
            <Nav.Link 
              onClick={handleLogout}
              className="sidebar-nav-link logout-link"
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Çıkış Yap</span>
            </Nav.Link>
          </Nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="mobile-header d-lg-none">
        <div className="mobile-header-content">
          <div className="user-section">
            <div className="user-avatar">
              {user?.name
                ?.split(" ")
                .map(word => word.charAt(0).toUpperCase())
                .slice(0, 2)
                .join("")}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">
                {getRoleBadge()}
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline-light" 
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(true)}
          >
            ☰
          </Button>
        </div>
      </div>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas 
        show={showMobileMenu} 
        onHide={() => setShowMobileMenu(false)}
        placement="start"
        className="mobile-sidebar-offcanvas"
      >
        <Offcanvas.Header className="sidebar-header" closeButton>
          <Offcanvas.Title>
            <div className="user-section">
              <div className="user-avatar">
                {user?.name
                  ?.split(" ")
                  .map(word => word.charAt(0).toUpperCase())
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">
                  {getRoleBadge()}
                </div>
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="sidebar-content">
          {/* Mobile Navigation Items */}
          <Nav className="flex-column sidebar-nav">
            {getNavigationItems().map((item, index) => (
              <Nav.Link 
                key={index} 
                onClick={() => handleNavigation(item.path)}
                className={`sidebar-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Nav.Link>
            ))}
            
            <Nav.Link 
              onClick={() => handleNavigation('/settings')}
              className="sidebar-nav-link"
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Ayarlar</span>
            </Nav.Link>
            
            <Nav.Link 
              onClick={handleLogout}
              className="sidebar-nav-link logout-link"
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-text">Çıkış Yap</span>
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
