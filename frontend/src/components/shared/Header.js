import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isHomeRoute = location.pathname === '/';

  // Admin sayfalarında ve dashboard'ta header gösterme
  if (isAdminRoute || isDashboardRoute) {
    return null;
  }

  // Giriş yapmış kullanıcılar için yalnızca ana sayfada header göster
  if (isAuthenticated && !isHomeRoute) {
    return null;
  }

  return (
    <Navbar expand="lg" className="main-header">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <img 
            src="/images/b15050.png" 
            alt="Destek Platformu" 
            className="brand-logo-img"
            width="150" 
            height="50"
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">
                  <Button size="sm" className="login-btn">
                    Panel
                  </Button>
                </Nav.Link>
                <Nav.Link
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="nav-link-custom"
                >
                  <Button size="sm" className="logout-btn">
                    Çıkış Yap
                  </Button>
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">
                  <Button size="sm" className="login-btn">
                    Giriş Yap
                  </Button>
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="nav-link-custom">
                  <Button size="sm" className="register-btn">
                    Kayıt Ol
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
