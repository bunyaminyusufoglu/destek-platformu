import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hata mesajını temizle
    if (error) setError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <Row className="justify-content-center w-100">
          <Col md={6} lg={4}>
            <Card className="auth-card border-0 shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: 'white',
                      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                    }}>
                      🎓
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Hoş Geldiniz</h2>
                  <p className="text-muted mb-0">Destek Platformu'na giriş yapın</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">⚠️</span>
                        {error}
                      </div>
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium text-dark">E-posta Adresi</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="ornek@email.com"
                      className="auth-input border-0"
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium text-dark">Şifre</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Şifrenizi girin"
                      className="auth-input border-0"
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="auth-btn w-100 py-3 mb-3 text-white fw-bold"
                    disabled={loading}
                    style={{ fontSize: '16px' }}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="loading-spinner me-2"></div>
                        Giriş yapılıyor...
                      </div>
                    ) : (
                      'Giriş Yap'
                    )}
                  </Button>
                </Form>

                <div className="text-center pt-3 border-top">
                  <p className="text-muted mb-0">
                    Hesabınız yok mu?{' '}
                    <Link to="/register" className="auth-link fw-medium">
                      Hemen kayıt olun
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;