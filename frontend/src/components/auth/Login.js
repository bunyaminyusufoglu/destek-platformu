import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaExclamationTriangle } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, clearError, error: authError } = useAuth();

  // Not: Oturum açıkken login sayfasında otomatik yönlendirmeyi kaldırdık;
  // yalnızca başarılı girişten sonra yönlendirme yapılacak.

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
    clearError();

    try {
      await login(formData);
      
      // Başarılı giriş sonrası kısa bir bekleme ve yönlendirme
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (err) {
      const errorMessage = err.message || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-container">
      {/* Mountain Background */}
      <div className="mountain-background">
        <div className="sky-gradient">
          <div className="stars"></div>
        </div>
        <div className="mountains">
          <div className="mountain mountain-1"></div>
          <div className="mountain mountain-2"></div>
          <div className="mountain mountain-3"></div>
        </div>
      </div>

      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '120px' }}>
        <Row className="justify-content-center w-100">
          <Col md={7} lg={6} xl={5}>
            <Card className="modern-auth-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h1 className="modern-title mb-3">GİRİŞ YAPIN</h1>
                  <p className="modern-subtitle">Destek Platformu'na giriş yapın</p>
                </div>

                {/* Toggle Buttons */}
                <div className="d-flex gap-2 mb-4">
                  <Link to="/login" className="modern-toggle-btn active">
                    GİRİŞ YAPIN
                  </Link>
                  <Link to="/register" className="modern-toggle-btn">
                    KAYIT OLUN
                  </Link>
                </div>

                <Form onSubmit={handleSubmit}>
                  {(error || authError) && (
                    <Alert variant="danger" className="mb-3">
                      <div className="d-flex align-items-center">
                        <FaExclamationTriangle className="me-2" />
                        {error || authError}
                      </div>
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Email Adresiniz*"
                      className="modern-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Şifreniz*"
                      className="modern-input"
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="modern-btn w-100 py-3 mb-3"
                    disabled={loading}
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

                <div className="text-center pt-3">
                  <Link to="/forgot-password" className="modern-forgot-link">
                    Şifrenizi mi unuttunuz?
                  </Link>
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