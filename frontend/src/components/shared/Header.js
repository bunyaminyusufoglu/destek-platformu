import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated } = useAuth();

  // Giriş yapmış kullanıcılar için header gösterme
  if (isAuthenticated) {
    return null;
  }

  return (
    <Navbar expand="lg" className="main-header">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <div className="brand-icon">🎯</div>
          <div className="brand-text">
            <div className="brand-title">Destek Platformu</div>
            <div className="brand-subtitle">Yardım Al, Yardım Et</div>
          </div>
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
