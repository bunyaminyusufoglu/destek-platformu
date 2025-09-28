import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    skills: []
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, clearError } = useAuth();

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

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const addSkill = () => {
    if (skillsInput.trim() && !formData.skills.includes(skillsInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillsInput.trim()]
      }));
      setSkillsInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      // Role göre isUser ve isExpert ayarla
      registerData.isUser = formData.role === 'user';
      registerData.isExpert = formData.role === 'expert';
      registerData.isAdmin = false; // Admin sadece manuel olarak oluşturulur
      await register(registerData);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
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

      <Container className="d-flex align-items-start justify-content-center py-5" style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '120px' }}>
        <Row className="justify-content-center w-100">
          <Col md={9} lg={8} xl={7}>
            <Card className="modern-auth-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h1 className="modern-title mb-3">KAYIT OLUN</h1>
                  <p className="modern-subtitle">Destek Platformu'na kayıt olun</p>
                </div>

                {/* Toggle Buttons */}
                <div className="d-flex gap-2 mb-4">
                  <Link to="/login" className="modern-toggle-btn">
                    GİRİŞ YAPIN
                  </Link>
                  <Link to="/register" className="modern-toggle-btn active">
                    KAYIT OLUN
                  </Link>
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
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Adınız Soyadınız*"
                      className="modern-input"
                    />
                  </Form.Group>

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

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Şifreniz*"
                          minLength={6}
                          className="modern-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Şifrenizi Tekrar Giriniz*"
                          minLength={6}
                          className="modern-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium text-dark">Rol Seçimi *</Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="radio"
                        id="user"
                        name="role"
                        value="user"
                        checked={formData.role === 'user'}
                        onChange={handleChange}
                        label="👤 Kullanıcı"
                        className="fw-medium"
                      />
                      <Form.Check
                        type="radio"
                        id="expert"
                        name="role"
                        value="expert"
                        checked={formData.role === 'expert'}
                        onChange={handleChange}
                        label="💼 Uzman"
                        className="fw-medium"
                      />
                    </div>
                  </Form.Group>

                  {formData.role === 'expert' && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-medium text-dark">Yetenekleriniz</Form.Label>
                      <InputGroup className="mb-3">
                        <Form.Control
                          type="text"
                          value={skillsInput}
                          onChange={handleSkillsChange}
                          placeholder="Yetenek ekleyin (örn: JavaScript, React)"
                          className="auth-input border-0"
                          style={{ fontSize: '16px' }}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button 
                          variant="outline-primary" 
                          onClick={addSkill}
                          className="border-0"
                          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                        >
                          Ekle
                        </Button>
                      </InputGroup>
                      {formData.skills.length > 0 && (
                        <div className="d-flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <Badge 
                              key={index} 
                              className="skill-badge d-flex align-items-center gap-2 px-3 py-2"
                              style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '14px',
                                borderRadius: '20px'
                              }}
                            >
                              {skill}
                              <Button
                                variant="link"
                                size="sm"
                                className="text-white p-0"
                                onClick={() => removeSkill(skill)}
                                style={{textDecoration: 'none', fontSize: '16px', lineHeight: 1}}
                              >
                                ×
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Form.Group>
                  )}

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="modern-btn w-100 py-3 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="loading-spinner me-2"></div>
                        Kayıt oluşturuluyor...
                      </div>
                    ) : (
                      'Kayıt Ol'
                    )}
                  </Button>
                </Form>

                <div className="text-center pt-3">
                  <Link to="/login" className="modern-forgot-link">
                    Zaten hesabınız var mı? Giriş yapın
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

export default Register;