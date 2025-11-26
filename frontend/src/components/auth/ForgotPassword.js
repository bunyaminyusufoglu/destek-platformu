import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { authAPI } from '../../services/api';
import { FaExclamationTriangle, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Backend'den gelen hata mesajını al
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Bir hata oluştu';
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
                  <FaEnvelope size={48} className="mb-3" style={{ color: 'var(--color-primary)' }} />
                  <h1 className="modern-title mb-3">ŞİFRENİZİ Mİ UNUTTUNUZ?</h1>
                  <p className="modern-subtitle">
                    {success 
                      ? 'Şifre sıfırlama maili gönderildi. Lütfen email adresinizi kontrol edin.'
                      : 'Email adresinizi girin, size şifre sıfırlama linki gönderelim.'
                    }
                  </p>
                </div>

                {!success ? (
                  <>
                    <Form onSubmit={handleSubmit}>
                      {error && (
                        <Alert variant="danger" className="mb-3">
                          <div className="d-flex align-items-center">
                            <FaExclamationTriangle className="me-2" />
                            {error}
                          </div>
                        </Alert>
                      )}

                      <Form.Group className="mb-4">
                        <Form.Control
                          type="email"
                          name="email"
                          value={email}
                          onChange={handleChange}
                          required
                          placeholder="Email Adresiniz*"
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
                            Gönderiliyor...
                          </div>
                        ) : (
                          'Şifre Sıfırlama Maili Gönder'
                        )}
                      </Button>
                    </Form>
                  </>
                ) : (
                  <Alert variant="success" className="mb-3">
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="me-2" />
                      Şifre sıfırlama maili başarıyla gönderildi. Lütfen email adresinizi kontrol edin.
                    </div>
                  </Alert>
                )}

                <div className="text-center pt-3">
                  <Link to="/login" className="modern-forgot-link">
                    Giriş sayfasına dön
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

export default ForgotPassword;

