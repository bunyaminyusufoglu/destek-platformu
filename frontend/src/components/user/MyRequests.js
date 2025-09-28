import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { supportAPI } from '../../services/api';

const MyRequests = () => {
  const { } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    skills: [],
    category: '',
    priority: 'medium'
  });
  const [skillsInput, setSkillsInput] = useState('');

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

  const loadMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportAPI.getMyRequests();
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talepleriniz yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyRequests();
  }, [loadMyRequests]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'success', text: 'Açık', icon: '🔓' },
      assigned: { variant: 'primary', text: 'Atanmış', icon: '👤' },
      in_progress: { variant: 'warning', text: 'Devam Ediyor', icon: '⚡' },
      completed: { variant: 'secondary', text: 'Tamamlandı', icon: '✅' },
      cancelled: { variant: 'danger', text: 'İptal', icon: '❌' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status, icon: '❓' };
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <span>{config.icon}</span>
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { variant: 'success', text: 'Düşük', icon: '🟢' },
      medium: { variant: 'warning', text: 'Orta', icon: '🟡' },
      high: { variant: 'danger', text: 'Yüksek', icon: '🔴' }
    };
    
    const config = priorityConfig[priority] || { variant: 'secondary', text: priority, icon: '⚪' };
    return (
      <Badge bg={config.variant} className="d-flex align-items-center gap-1">
        <span>{config.icon}</span>
        {config.text}
      </Badge>
    );
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setEditFormData({
      title: request.title,
      description: request.description,
      budget: request.budget.toString(),
      deadline: new Date(request.deadline).toISOString().split('T')[0],
      skills: request.skills || [],
      category: request.category,
      priority: request.priority
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const addSkill = () => {
    if (skillsInput.trim() && !editFormData.skills.includes(skillsInput.trim())) {
      setEditFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillsInput.trim()]
      }));
      setSkillsInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        ...editFormData,
        budget: parseFloat(editFormData.budget),
        deadline: new Date(editFormData.deadline)
      };

      await supportAPI.updateRequest(editingRequest._id, updateData);
      setShowEditModal(false);
      loadMyRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talebi güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (requestId) => {
    if (window.confirm('Bu destek talebini silmek istediğinizden emin misiniz?')) {
      try {
        await supportAPI.deleteRequest(requestId);
        loadMyRequests();
      } catch (err) {
        setError(err.response?.data?.message || 'Destek talebi silinirken hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Destek talepleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requests">
      <Container className="p-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">📋 Destek Taleplerim</h2>
                <p className="text-muted mb-0">Oluşturduğunuz destek taleplerini yönetin</p>
              </div>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/create-request'}
              >
                ➕ Yeni Talep Oluştur
              </Button>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            <div className="d-flex align-items-center">
              <span className="me-2">⚠️</span>
              {error}
            </div>
          </Alert>
        )}

        {requests.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <div className="display-1 text-muted mb-3">📝</div>
              <h4 className="text-muted mb-3">Henüz destek talebiniz yok</h4>
              <p className="text-muted mb-4">İlk destek talebinizi oluşturmak için aşağıdaki butona tıklayın.</p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/create-request'}
              >
                🚀 İlk Talebimi Oluştur
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {requests.map((request) => (
              <Col lg={6} xl={4} key={request._id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="mb-1">{request.title}</h5>
                        <div className="d-flex gap-2 flex-wrap">
                          {getStatusBadge(request.status)}
                          {getPriorityBadge(request.priority)}
                        </div>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body className="d-flex flex-column">
                    <div className="flex-grow-1">
                      <p className="text-muted mb-3">
                        {request.description.substring(0, 120)}
                        {request.description.length > 120 && '...'}
                      </p>
                      
                      <div className="mb-3">
                        <small className="text-muted d-block">📂 Kategori</small>
                        <Badge bg="light" text="dark" className="mb-2">
                          {request.category}
                        </Badge>
                      </div>

                      {request.skills && request.skills.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted d-block">🛠️ Gerekli Yetenekler</small>
                          <div className="d-flex flex-wrap gap-1">
                            {request.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} bg="info" className="small">
                                {skill}
                              </Badge>
                            ))}
                            {request.skills.length > 3 && (
                              <Badge bg="secondary" className="small">
                                +{request.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <small className="text-muted d-block">💰 Bütçe</small>
                          <strong className="text-success">{request.budget}₺</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">📅 Teslim</small>
                          <strong>{formatDate(request.deadline)}</strong>
                        </div>
                      </div>

                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">💼 Teklifler</small>
                          <strong className="text-primary">{request.offerCount || 0}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">📅 Oluşturulma</small>
                          <small>{formatDate(request.createdAt)}</small>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-top">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="flex-fill"
                          onClick={() => handleEdit(request)}
                        >
                          ✏️ Düzenle
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="flex-fill"
                          onClick={() => handleDelete(request._id)}
                        >
                          🗑️ Sil
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>✏️ Destek Talebini Düzenle</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Başlık *</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Kategori *</Form.Label>
                    <Form.Select
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Açıklama *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bütçe (₺) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="budget"
                      value={editFormData.budget}
                      onChange={handleEditChange}
                      required
                      min="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teslim Tarihi *</Form.Label>
                    <Form.Control
                      type="date"
                      name="deadline"
                      value={editFormData.deadline}
                      onChange={handleEditChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Öncelik</Form.Label>
                    <Form.Select
                      name="priority"
                      value={editFormData.priority}
                      onChange={handleEditChange}
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Gerekli Yetenekler</Form.Label>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control
                    type="text"
                    value={skillsInput}
                    onChange={handleSkillsChange}
                    placeholder="Yetenek ekleyin"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button variant="outline-primary" onClick={addSkill}>
                    Ekle
                  </Button>
                </div>
                {editFormData.skills.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {editFormData.skills.map((skill, index) => (
                      <Badge key={index} bg="primary" className="d-flex align-items-center gap-2">
                        {skill}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-white p-0"
                          onClick={() => removeSkill(skill)}
                          style={{textDecoration: 'none', fontSize: '12px'}}
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              İptal
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              💾 Güncelle
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default MyRequests;
