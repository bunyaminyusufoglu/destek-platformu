import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Admin sayfalarında header gösterme
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Giriş yapmış kullanıcılar için header gösterme
  if (isAuthenticated) {
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
            <Nav.Link as={Link} to="/login" className="nav-link-custom">
              Giriş Yap
            </Nav.Link>
            <Nav.Link as={Link} to="/register" className="nav-link-custom">
              <Button size="sm" className="register-btn">
                Kayıt Ol
              </Button>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
