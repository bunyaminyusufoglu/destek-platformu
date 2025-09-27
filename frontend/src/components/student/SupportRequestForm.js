import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { supportAPI } from '../../services/api';

const SupportRequestForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    skills: []
  });
  const [skillsInput, setSkillsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        skills: []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talebi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">📝 Yeni Destek Talebi Oluştur</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-3">
                  <div className="d-flex align-items-center">
                    <span className="me-2">⚠️</span>
                    {error}
                  </div>
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-3">
                  <div className="d-flex align-items-center">
                    <span className="me-2">✅</span>
                    {success}
                  </div>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Başlık *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Destek talebinizin başlığını girin"
                    className="border-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Açıklama *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Projenizi detaylı olarak açıklayın..."
                    className="border-2"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Bütçe (₺) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="0"
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Teslim Tarihi *</Form.Label>
                      <Form.Control
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Gerekli Yetenekler</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control
                      type="text"
                      value={skillsInput}
                      onChange={handleSkillsChange}
                      placeholder="Yetenek ekleyin (örn: JavaScript, React)"
                      className="border-2"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={addSkill}
                      className="border-2"
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
                          style={{ fontSize: '14px', borderRadius: '20px' }}
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

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-3 fw-bold"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Oluşturuluyor...
                    </div>
                  ) : (
                    '📝 Destek Talebi Oluştur'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SupportRequestForm;
