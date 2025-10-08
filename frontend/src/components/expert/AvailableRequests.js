import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form, InputGroup, Collapse } from 'react-bootstrap';
import { supportAPI, offerAPI } from '../../services/api';
import { 
  FaUser, 
  FaDollarSign, 
  FaHandshake, 
  FaSearch, 
  FaFilter, 
  FaTimes,
  FaTag,
  FaSortAmountDown
} from 'react-icons/fa';

const AvailableRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sendingOffer, setSendingOffer] = useState(false);
  
  // Filtreleme ve arama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'newest', // newest, oldest, budget_high, budget_low
    skills: []
  });
  const [skillInput, setSkillInput] = useState('');

  const [offerForm, setOfferForm] = useState({
    message: '',
    proposedPrice: '',
    estimatedDuration: ''
  });

  // Kategori ve öncelik seçenekleri
  const categories = [
    'Web Geliştirme', 'Mobil Uygulama', 'Veritabanı', 'UI/UX Tasarım',
    'Sistem Yönetimi', 'Güvenlik', 'E-ticaret', 'API Geliştirme', 'DevOps', 'Diğer'
  ];

  const priorities = [
    { value: '', label: 'Tümü' },
    { value: 'low', label: 'Düşük', color: 'success' },
    { value: 'medium', label: 'Orta', color: 'warning' },
    { value: 'high', label: 'Yüksek', color: 'danger' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'oldest', label: 'En Eski' },
    { value: 'budget_high', label: 'Bütçe (Yüksek)' },
    { value: 'budget_low', label: 'Bütçe (Düşük)' }
  ];

  const loadAvailableRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportAPI.getRequests();
      // Sadece açık talepleri göster
      const openRequests = data.filter(req => req.status === 'open');
      setRequests(openRequests);
      setFilteredRequests(openRequests);
    } catch (err) {
      setError('Talepler yüklenirken hata oluştu');
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
        request.user?.name?.toLowerCase().includes(searchLower) ||
        (request.skills && request.skills.some(skill => 
          skill.toLowerCase().includes(searchLower)
        ))
      );
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

    // Yetenek filtresi
    if (filters.skills.length > 0) {
      filtered = filtered.filter(request => 
        request.skills && filters.skills.every(skill => 
          request.skills.some(requestSkill => 
            requestSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
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
    loadAvailableRequests();
    // Sayfa yüklendiğinde en üste scroll et
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadAvailableRequests]);

  const handleShowModal = (request) => {
    setSelectedRequest(request);
    setOfferForm({ message: '', proposedPrice: '', estimatedDuration: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setOfferForm({ message: '', proposedPrice: '', estimatedDuration: '' });
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !offerForm.message.trim() || !offerForm.proposedPrice || !offerForm.estimatedDuration.trim()) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setSendingOffer(true);
      await offerAPI.createOffer({
        supportRequestId: selectedRequest._id,
        message: offerForm.message.trim(),
        proposedPrice: parseFloat(offerForm.proposedPrice),
        estimatedDuration: offerForm.estimatedDuration.trim()
      });

      alert('Teklifiniz başarıyla gönderildi!');
      handleCloseModal();
    } catch (err) {
      console.error('Teklif gönderme hatası:', err);
      alert('Teklif gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSendingOffer(false);
    }
  };

  // Filtreleri temizleme fonksiyonu
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      priority: '',
      minBudget: '',
      maxBudget: '',
      sortBy: 'newest',
      skills: []
    });
    setSkillInput('');
  };

  // Yetenek ekleme fonksiyonu
  const addSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  // Yetenek silme fonksiyonu
  const removeSkill = (skillToRemove) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // Aktif filtre sayısını hesapla
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.priority) count++;
    if (filters.minBudget || filters.maxBudget) count++;
    if (filters.skills.length > 0) count++;
    return count;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPriorityBadge = (priority) => {
    const config = {
      low: { variant: 'success', text: 'Düşük' },
      medium: { variant: 'warning', text: 'Orta' },
      high: { variant: 'danger', text: 'Yüksek' }
    };
    const { variant, text } = config[priority] || { variant: 'secondary', text: priority };
    return <Badge bg={variant}>{text}</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Açık talepler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Açık Destek Talepleri</h2>
          <Badge bg="info" className="fs-6">
            {filteredRequests.length} talep gösteriliyor
            {filteredRequests.length !== requests.length && ` (${requests.length} toplam)`}
          </Badge>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Hata!</Alert.Heading>
            {error}
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
                    placeholder="Başlık, açıklama, kullanıcı adı veya yetenek ara..."
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
                      <FaSortAmountDown className="me-1" />
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

                  <Col md={3}>
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

                  <Col md={3}>
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

                <Row className="mt-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Yetenek Filtresi</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          placeholder="Yetenek ekle (örn: React, Node.js)"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button variant="outline-primary" onClick={addSkill}>
                          Ekle
                        </Button>
                      </div>
                      {filters.skills.length > 0 && (
                        <div className="mt-2 d-flex flex-wrap gap-1">
                          {filters.skills.map((skill, index) => (
                            <Badge key={index} bg="primary" className="d-flex align-items-center gap-1">
                              {skill}
                              <FaTimes
                                style={{ cursor: 'pointer', fontSize: '0.7em' }}
                                onClick={() => removeSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                      <FaTimes className="me-1" />
                      Filtreleri Temizle
                    </Button>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </Card.Body>
        </Card>

        {filteredRequests.length === 0 && !loading && (
          <Alert variant="info" className="mb-4">
            <Alert.Heading>
              {searchTerm || getActiveFiltersCount() > 0 ? 'Arama sonucu bulunamadı' : 'Henüz açık talep yok'}
            </Alert.Heading>
            {searchTerm || getActiveFiltersCount() > 0 
              ? 'Arama kriterlerinizi değiştirerek tekrar deneyin.'
              : 'Şu anda değerlendirilmeyi bekleyen destek talebi bulunmamaktadır.'
            }
          </Alert>
        )}

        <Row>
          {filteredRequests.map((request) => (
            <Col lg={6} xl={4} className="mb-4" key={request._id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-0 fw-bold text-truncate" title={request.title}>
                      {request.title}
                    </h6>
                    {getPriorityBadge(request.priority || 'medium')}
                  </div>
                </Card.Header>
                <Card.Body className="d-flex flex-column">
                  <p className="text-muted mb-3 flex-grow-1" style={{ minHeight: '60px' }}>
                    {request.description.length > 150 
                      ? `${request.description.substring(0, 150)}...` 
                      : request.description}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <small className="text-muted">
                          <strong><FaUser className="me-1" />Talep Eden:</strong><br />
                          {request.user.name}
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted">
                          <strong><FaDollarSign className="me-1" />Bütçe:</strong><br />
                          {request.budget}₺
                        </small>
                      </div>
                    </div>
                    
                    <div className="row g-2 mb-3">
                      <div className="col-12">
                        <small className="text-muted">
                          <strong>📅 Teslim:</strong> {formatDate(request.deadline)}
                        </small>
                      </div>
                    </div>

                    {request.skills && request.skills.length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted d-block mb-2"><strong>Gerekli Yetenekler:</strong></small>
                        <div className="d-flex flex-wrap gap-1">
                          {request.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} bg="secondary" className="small">
                              {skill}
                            </Badge>
                          ))}
                          {request.skills.length > 3 && (
                            <Badge bg="outline-secondary" className="small">
                              +{request.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="d-grid gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => {/* Talep detayını göster */}}
                    >
                      Detayları Gör
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleShowModal(request)}
                    >
                      <FaHandshake className="me-2" />
                      Teklif Ver
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Teklif Gönderme Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Teklif Gönder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div className="mb-3 p-3 bg-light rounded">
              <h6 className="mb-2">{selectedRequest.title}</h6>
              <p className="text-muted small mb-0">
                {selectedRequest.user.name} • {selectedRequest.budget}₺ • Teslim: {formatDate(selectedRequest.deadline)}
              </p>
            </div>
          )}
          
          <Form onSubmit={handleOfferSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Teklif Mesajınız</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Projeniz hakkındaki görüşlerinizi, yaklaşımınızı ve deneyiminizi açıklayın..."
                value={offerForm.message}
                onChange={(e) => setOfferForm(prev => ({ ...prev, message: e.target.value }))}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Teklif Fiyatı (₺)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="1500"
                    min="1"
                    value={offerForm.proposedPrice}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, proposedPrice: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Tahmini Süre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="2 hafta"
                    value={offerForm.estimatedDuration}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="outline-secondary" onClick={handleCloseModal}>
                İptal
              </Button>
              <Button type="submit" variant="success" disabled={sendingOffer}>
                {sendingOffer ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Teklifi Gönder'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AvailableRequests;
