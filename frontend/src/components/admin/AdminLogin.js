import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaUserShield, FaLock, FaSignInAlt } from 'react-icons/fa';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Admin kimlik bilgilerini kontrol et
      if (credentials.email === 'admin@admin.com' && credentials.password === 'admin12345') {
        // Admin token'ı oluştur (base64 encoded)
        const adminToken = btoa(JSON.stringify({
          email: 'admin@admin.com',
          isAdmin: true,
          name: 'Admin',
          timestamp: Date.now()
        }));

        // Admin kullanıcı bilgileri
        const adminUser = {
          id: 'admin',
          name: 'Admin',
          email: 'admin@admin.com',
          isUser: true,
          isExpert: true,
          isAdmin: true
        };

        // LocalStorage'a kaydet (kullanıcı verisini etkilemeden)
        localStorage.setItem('adminToken', adminToken);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));

        // Admin paneline yönlendir
        window.location.href = '/admin/dashboard';
      } else {
        setError('Geçersiz admin kimlik bilgileri');
      }
    } catch (err) {
      setError('Giriş sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError(''); // Hata mesajını temizle
  };

  return (
    <div className="admin-login-page">
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <Row className="w-100">
          <Col md={6} lg={4} className="mx-auto">
            <Card className="admin-login-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="admin-icon mb-3">
                    <FaUserShield size={48} className="text-primary" />
                  </div>
                  <h3 className="admin-login-title">Admin Girişi</h3>
                  <p className="text-muted">Yönetici paneline erişim</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaUserShield className="me-2" />
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleInputChange}
                      placeholder="admin@admin.com"
                      required
                      className="admin-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FaLock className="me-2" />
                      Şifre
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      placeholder="Şifrenizi girin"
                      required
                      className="admin-input"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="admin-login-btn w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Giriş yapılıyor...
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Giriş Yap
                      </>
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Sadece yetkili yöneticiler bu sayfaya erişebilir
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .admin-login-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .admin-login-card {
          border: none;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }

        .admin-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white !important;
        }

        .admin-login-title {
          color: #2d3748;
          font-weight: 700;
          margin-bottom: 0;
        }

        .admin-input {
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .admin-input:focus {
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .admin-login-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          padding: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .admin-login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        .admin-login-btn:disabled {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
