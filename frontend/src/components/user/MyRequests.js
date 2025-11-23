import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form, InputGroup, Collapse } from 'react-bootstrap';
import { supportAPI } from '../../services/api';
import { 
  FaFileAlt, 
  FaExclamationTriangle, 
  FaEdit, 
  FaTrash, 
  FaTools, 
  FaDollarSign, 
  FaHandshake,
  FaSearch,
  FaFilter,
  FaTimes,
  FaTag
} from 'react-icons/fa';
import { getStatusDisplay, supportRequestStatusMap } from '../../utils/statusLabels';

const MyRequests = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
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

  // Filtreleme ve arama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'newest' // newest, oldest, budget_high, budget_low
  });

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
    { value: '', label: 'Tümü' },
    { value: 'low', label: 'Düşük', color: 'success' },
    { value: 'medium', label: 'Orta', color: 'warning' },
    { value: 'high', label: 'Yüksek', color: 'danger' }
  ];

  const statuses = [
    { value: '', label: 'Tümü' },
    { value: 'open', label: 'Açık', color: 'success' },
    { value: 'assigned', label: 'Atanmış', color: 'primary' },
    { value: 'in_progress', label: 'Devam Ediyor', color: 'warning' },
    { value: 'completed', label: 'Tamamlandı', color: 'secondary' },
    { value: 'cancelled', label: 'İptal', color: 'danger' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'oldest', label: 'En Eski' },
    { value: 'budget_high', label: 'Bütçe (Yüksek)' },
    { value: 'budget_low', label: 'Bütçe (Düşük)' }
  ];

  const loadMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportAPI.getMyRequests();
      setRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talepleriniz yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtreleme ve arama fonksiyonu
  const applyFilters = useCallback(() => {
    let filtered = [...requests];

    // Arama terimi filtresi
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        (request.skills && request.skills.some(skill => 
          skill.toLowerCase().includes(searchLower)
        ))
      );
    }

    // Durum filtresi
    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status);
    }

    // Kategori filtresi
    if (filters.category) {
      filtered = filtered.filter(request => request.category === filters.category);
    }

    // Öncelik filtresi
    if (filters.priority) {
      filtered = filtered.filter(request => request.priority === filters.priority);
    }

    // Bütçe filtresi
    if (filters.minBudget) {
      filtered = filtered.filter(request => request.budget >= parseInt(filters.minBudget));
    }
    if (filters.maxBudget) {
      filtered = filtered.filter(request => request.budget <= parseInt(filters.maxBudget));
    }

    // Sıralama
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'budget_high':
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      case 'budget_low':
        filtered.sort((a, b) => a.budget - b.budget);
        break;
      default:
        break;
    }

    setFilteredRequests(filtered);
  }, [requests, searchTerm, filters]);

  // Filtreler değiştiğinde otomatik filtreleme
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
    const { variant, text } = getStatusDisplay(supportRequestStatusMap, status);
    const iconMap = {
      open: '🔓',
      assigned: <FaTools />,
      in_progress: <FaTools />,
      completed: '✅',
      cancelled: '❌',
    };
    const icon = iconMap[status] || '❓';
    return (
      <Badge bg={variant} className="d-flex align-items-center gap-1">
        <span>{icon}</span>
        {text}
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

  // Filtreleri temizleme fonksiyonu
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      category: '',
      priority: '',
      minBudget: '',
      maxBudget: '',
      sortBy: 'newest'
    });
  };

  // Aktif filtre sayısını hesapla
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status) count++;
    if (filters.category) count++;
    if (filters.priority) count++;
    if (filters.minBudget || filters.maxBudget) count++;
    return count;
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
                <h2 className="mb-1"><FaFileAlt className="me-2" />Destek Taleplerim</h2>
                <p className="text-muted mb-0">Oluşturduğunuz destek taleplerini yönetin</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Badge bg="info" className="fs-6">
                  {filteredRequests.length} talep gösteriliyor
                  {filteredRequests.length !== requests.length && ` (${requests.length} toplam)`}
                </Badge>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={() => window.location.href = '/create-request'}
                >
                  ➕ Yeni Talep Oluştur
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="me-2" />
              {error}
            </div>
          </Alert>
        )}

        {/* Arama ve Filtreleme Bölümü */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <FaSearch className="me-2" />
                Gelişmiş Arama ve Filtreleme
              </h6>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-1" />
                Filtreler {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Button>
            </div>
          </Card.Header>
          
          {/* Arama Kutusu */}
          <Card.Body>
            <Row>
              <Col md={8}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Başlık, açıklama veya yetenek ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      <FaTimes />
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Filtreler */}
            <Collapse in={showFilters}>
              <div className="mt-3 pt-3 border-top">
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Durum</Form.Label>
                      <Form.Select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      >
                        {statuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label><FaTag className="me-1" />Kategori</Form.Label>
                      <Form.Select
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Öncelik</Form.Label>
                      <Form.Select
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={3} className="d-flex align-items-end">
                    <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                      <FaTimes className="me-1" />
                      Filtreleri Temizle
                    </Button>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><FaDollarSign className="me-1" />Min. Bütçe</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="0"
                        value={filters.minBudget}
                        onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><FaDollarSign className="me-1" />Max. Bütçe</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="∞"
                        value={filters.maxBudget}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>

        {filteredRequests.length === 0 && !loading && (
          <Alert variant="info" className="mb-4">
            <Alert.Heading>
              {searchTerm || getActiveFiltersCount() > 0 ? 'Arama sonucu bulunamadı' : 'Henüz destek talebiniz yok'}
            </Alert.Heading>
            {searchTerm || getActiveFiltersCount() > 0 
              ? 'Arama kriterlerinizi değiştirerek tekrar deneyin.'
              : 'İlk destek talebinizi oluşturmak için aşağıdaki butona tıklayın.'
            }
          </Alert>
        )}

        {requests.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <FaFileAlt className="display-1 text-muted mb-3" />
              <h4 className="text-muted mb-3">Henüz destek talebiniz yok</h4>
              <p className="text-muted mb-4">İlk destek talebinizi oluşturmak için aşağıdaki butona tıklayın.</p>
              <Button 
                variant="primary" 
                size="md"
                onClick={() => window.location.href = '/create-request'}
              >
                🚀 İlk Talebimi Oluştur
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {filteredRequests.map((request) => (
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
                          <small className="text-muted d-block"><FaTools className="me-1" />Gerekli Yetenekler</small>
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
                          <small className="text-muted d-block"><FaDollarSign className="me-1" />Bütçe</small>
                          <strong className="text-success">{request.budget}₺</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">📅 Teslim</small>
                          <strong>{formatDate(request.deadline)}</strong>
                        </div>
                      </div>

                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block"><FaHandshake className="me-1" />Teklifler</small>
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
                          <FaEdit className="me-1" />
                          Düzenle
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="flex-fill"
                          onClick={() => handleDelete(request._id)}
                        >
                          <FaTrash className="me-1" />
                          Sil
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
            <Modal.Title><FaEdit className="me-2" />Destek Talebini Düzenle</Modal.Title>
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
