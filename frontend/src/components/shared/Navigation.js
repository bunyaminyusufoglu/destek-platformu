import React, { useState } from 'react';
import { Navbar, Nav, Container, Dropdown, Badge, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, isAdmin, isUser, isExpert } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getRoleBadge = () => {
    if (isAdmin) return <Badge bg="warning" className="ms-2">👑 Admin</Badge>;
    if (isUser) return <Badge bg="success" className="ms-2">👤 Kullanıcı</Badge>;
    if (isExpert) return <Badge bg="primary" className="ms-2">💼 Uzman</Badge>;
    return null;
  };

  const getNavigationItems = () => {
    const items = [
      { path: '/dashboard', label: '🏠 Dashboard', icon: '🏠' },
    ];

    // Kullanıcı ve Admin için
    if (isUser || isAdmin) {
      items.push(
        { path: '/support-requests', label: '📝 Destek Talepleri', icon: '📝' },
        { path: '/my-requests', label: '📋 Taleplerim', icon: '📋' }
      );
    }

    // Uzman ve Admin için
    if (isExpert || isAdmin) {
      items.push(
        { path: '/available-requests', label: '🔍 Açık Talepler', icon: '🔍' },
        { path: '/my-offers', label: '💼 Tekliflerim', icon: '💼' }
      );
    }

    // Admin için özel sayfalar
    if (isAdmin) {
      items.push(
        { path: '/admin/users', label: '👥 Kullanıcılar', icon: '👥' },
        { path: '/admin/analytics', label: '📊 Analitik', icon: '📊' },
        { path: '/admin/settings', label: '⚙️ Ayarlar', icon: '⚙️' }
      );
    }

    // Herkes için
    items.push(
      { path: '/messages', label: '💬 Mesajlar', icon: '💬' },
      { path: '/profile', label: '👤 Profil', icon: '👤' }
    );

    return items;
  };

  return (
    <>
      <Navbar expand="lg" className="navbar-custom" variant="dark">
        <Container fluid>
          {/* Logo/Brand */}
          <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
            <div className="brand-icon me-2">🎓</div>
            <div>
              <div className="brand-title">Destek Platformu</div>
              <small className="brand-subtitle">Öğrenci-Uzman Buluşması</small>
            </div>
          </Navbar.Brand>

          {/* Desktop Navigation */}
          <Navbar.Collapse className="justify-content-center">
            <Nav className="mx-auto">
              {getNavigationItems().map((item, index) => (
                <Nav.Link 
                  key={index} 
                  href={item.path}
                  className="nav-link-custom"
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </Nav.Link>
              ))}
            </Nav>
          </Navbar.Collapse>

          {/* User Menu */}
          <div className="d-flex align-items-center">
            {/* User Info */}
            <div className="user-info me-3 d-none d-lg-block">
              <div className="user-name">{user?.name}</div>
              {getRoleBadge()}
            </div>

            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" className="user-dropdown-toggle">
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="d-none d-md-inline ms-2">{user?.name}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown-menu">
                <Dropdown.Header>
                  <div className="text-center">
                    <div className="user-avatar-large mb-2">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="fw-bold">{user?.name}</div>
                    <div className="text-muted small">{user?.email}</div>
                    {getRoleBadge()}
                  </div>
                </Dropdown.Header>
                <Dropdown.Divider />
                
                <Dropdown.Item href="/profile">
                  <span className="me-2">👤</span> Profilim
                </Dropdown.Item>
                <Dropdown.Item href="/settings">
                  <span className="me-2">⚙️</span> Ayarlar
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <span className="me-2">🚪</span> Çıkış Yap
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Mobile Menu Toggle */}
            <Navbar.Toggle 
              aria-controls="mobile-menu" 
              className="d-lg-none ms-2"
              onClick={() => setShowMobileMenu(true)}
            />
          </div>
        </Container>
      </Navbar>

      {/* Mobile Menu Offcanvas */}
      <Offcanvas 
        show={showMobileMenu} 
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        className="mobile-menu-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <div className="d-flex align-items-center">
              <div className="brand-icon me-2">🎓</div>
              <div>
                <div className="brand-title">Destek Platformu</div>
                <small className="brand-subtitle">Menü</small>
              </div>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* User Info in Mobile */}
          <div className="mobile-user-info mb-4 p-3 bg-light rounded">
            <div className="text-center">
              <div className="user-avatar-large mb-2">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="fw-bold">{user?.name}</div>
              <div className="text-muted small">{user?.email}</div>
              {getRoleBadge()}
            </div>
          </div>

          {/* Mobile Navigation Items */}
          <Nav className="flex-column">
            {getNavigationItems().map((item, index) => (
              <Nav.Link 
                key={index} 
                href={item.path}
                className="mobile-nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="nav-icon me-3">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Nav.Link>
            ))}
            
            <hr className="my-3" />
            
            <Nav.Link 
              href="/profile"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon me-3">👤</span>
              <span className="nav-text">Profilim</span>
            </Nav.Link>
            
            <Nav.Link 
              href="/settings"
              className="mobile-nav-link"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="nav-icon me-3">⚙️</span>
              <span className="nav-text">Ayarlar</span>
            </Nav.Link>
            
            <Nav.Link 
              onClick={handleLogout}
              className="mobile-nav-link text-danger"
            >
              <span className="nav-icon me-3">🚪</span>
              <span className="nav-text">Çıkış Yap</span>
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navigation;
