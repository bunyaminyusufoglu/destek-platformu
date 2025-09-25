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
    role: 'student',
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
      // Role göre isStudent ve isExpert ayarla
      registerData.isStudent = formData.role === 'student';
      registerData.isExpert = formData.role === 'expert';
      await register(registerData);
      // TODO: Dashboard yönlendirmesi
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
        <Row className="justify-content-center w-100">
          <Col md={8} lg={6}>
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
                      🚀
                    </div>
                  </div>
                  <h2 className="fw-bold text-dark mb-2">Kayıt Olun</h2>
                  <p className="text-muted mb-0">Destek Platformu'na katılın ve başlayın</p>
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
                    <Form.Label className="fw-medium text-dark">Ad Soyad</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Adınız ve soyadınız"
                      className="auth-input border-0"
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Group>

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

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium text-dark">Şifre</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="En az 6 karakter"
                          minLength={6}
                          className="auth-input border-0"
                          style={{ fontSize: '16px' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium text-dark">Şifre Tekrar</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Şifrenizi tekrar girin"
                          minLength={6}
                          className="auth-input border-0"
                          style={{ fontSize: '16px' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium text-dark">Rol Seçimi *</Form.Label>
                    <div className="d-flex gap-4">
                      <Form.Check
                        type="radio"
                        id="student"
                        name="role"
                        value="student"
                        checked={formData.role === 'student'}
                        onChange={handleChange}
                        label="🎓 Öğrenci"
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
                    className="auth-btn w-100 py-3 mb-3 text-white fw-bold"
                    disabled={loading}
                    style={{ fontSize: '16px' }}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="loading-spinner me-2"></div>
                        Kayıt oluşturuluyor...
                      </div>
                    ) : (
                      'Hesap Oluştur'
                    )}
                  </Button>
                </Form>

                <div className="text-center pt-3 border-top">
                  <p className="text-muted mb-0">
                    Zaten hesabınız var mı?{' '}
                    <Link to="/login" className="auth-link fw-medium">
                      Giriş yapın
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

export default Register;