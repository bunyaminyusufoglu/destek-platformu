import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { supportAPI } from '../../services/api';

const SupportRequestForm = () => {
  const { } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    skills: [],
    category: '',
    priority: 'medium'
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Web Geliştirme',
    'Mobil Uygulama',
    'Veritabanı',
    'UI/UX Tasarım',
    'Sistem Yönetimi',
    'Güvenlik',
    'E-ticaret',
    'API Geliştirme',
    'DevOps',
    'Diğer'
  ];

  const priorities = [
    { value: 'low', label: 'Düşük', color: 'success' },
    { value: 'medium', label: 'Orta', color: 'warning' },
    { value: 'high', label: 'Yüksek', color: 'danger' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
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
    setSuccess('');

    try {
      const requestData = {
        ...formData,
        budget: parseFloat(formData.budget),
        deadline: new Date(formData.deadline)
      };

      await supportAPI.createRequest(requestData);
      setSuccess('Destek talebiniz başarıyla oluşturuldu!');
      
      // Formu temizle
      setFormData({
        title: '',
        description: '',
        budget: '',
        deadline: '',
        skills: [],
        category: '',
        priority: 'medium'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talebi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-request-form">
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h4 className="mb-0">📝 Yeni Destek Talebi Oluştur</h4>
                <p className="text-muted mb-0 mt-2">Projenizi detaylı bir şekilde açıklayın, uzmanlar size yardımcı olmaya hazır!</p>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <div className="d-flex align-items-center">
                        <span className="me-2">⚠️</span>
                        {error}
                      </div>
                    </Alert>
                  )}

                  {success && (
                    <Alert variant="success" className="mb-4">
                      <div className="d-flex align-items-center">
                        <span className="me-2">✅</span>
                        {success}
                      </div>
                    </Alert>
                  )}

                  {/* Başlık */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Proje Başlığı *</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Projenizin kısa ve açıklayıcı başlığını yazın"
                      className="form-control-lg"
                    />
                  </Form.Group>

                  {/* Kategori */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Kategori *</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="form-select-lg"
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {/* Öncelik */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Öncelik Seviyesi</Form.Label>
                    <div className="d-flex gap-3">
                      {priorities.map((priority) => (
                        <Form.Check
                          key={priority.value}
                          type="radio"
                          id={priority.value}
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={handleChange}
                          label={
                            <span className={`badge bg-${priority.color} text-white`}>
                              {priority.label}
                            </span>
                          }
                          className="fw-medium"
                        />
                      ))}
                    </div>
                  </Form.Group>

                  {/* Açıklama */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Proje Açıklaması *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      placeholder="Projenizi detaylı bir şekilde açıklayın. Hangi teknolojiler kullanılacak, ne yapmak istiyorsunuz, özel gereksinimler var mı?"
                      className="form-control-lg"
                    />
                    <Form.Text className="text-muted">
                      Minimum 50 karakter, maksimum 2000 karakter
                    </Form.Text>
                  </Form.Group>

                  {/* Bütçe ve Tarih */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Bütçe (₺) *</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            required
                            min="100"
                            max="100000"
                            placeholder="1000"
                            className="form-control-lg"
                          />
                          <InputGroup.Text>₺</InputGroup.Text>
                        </InputGroup>
                        <Form.Text className="text-muted">
                          Minimum 100₺, maksimum 100.000₺
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Teslim Tarihi *</Form.Label>
                        <Form.Control
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleChange}
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="form-control-lg"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Gerekli Yetenekler */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Gerekli Yetenekler</Form.Label>
                    <InputGroup className="mb-3">
                      <Form.Control
                        type="text"
                        value={skillsInput}
                        onChange={handleSkillsChange}
                        placeholder="Yetenek ekleyin (örn: React, Node.js, Python)"
                        className="form-control-lg"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={addSkill}
                        className="btn-lg"
                      >
                        Ekle
                      </Button>
                    </InputGroup>
                    {formData.skills.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="badge bg-primary d-flex align-items-center gap-2 px-3 py-2"
                            style={{ fontSize: '14px' }}
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
                          </span>
                        ))}
                      </div>
                    )}
                  </Form.Group>

                  {/* Gönder Butonu */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Button 
                      variant="outline-secondary" 
                      size="lg" 
                      className="me-md-2"
                      onClick={() => window.history.back()}
                    >
                      İptal
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={loading}
                      className="px-5"
                    >
                      {loading ? (
                        <div className="d-flex align-items-center">
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Yükleniyor...</span>
                          </div>
                          Oluşturuluyor...
                        </div>
                      ) : (
                        '🚀 Destek Talebi Oluştur'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SupportRequestForm;
