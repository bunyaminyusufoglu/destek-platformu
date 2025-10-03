import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { supportAPI, offerAPI } from '../../services/api';
import { FaUser, FaDollarSign, FaHandshake } from 'react-icons/fa';

const AvailableRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sendingOffer, setSendingOffer] = useState(false);

  const [offerForm, setOfferForm] = useState({
    message: '',
    proposedPrice: '',
    estimatedDuration: ''
  });

  const loadAvailableRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportAPI.getRequests();
      // Sadece açık talepleri göster
      setRequests(data.filter(req => req.status === 'open'));
    } catch (err) {
      setError('Talepler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

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
            {requests.length} açık talep
          </Badge>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Hata!</Alert.Heading>
            {error}
          </Alert>
        )}

        {requests.length === 0 && !error && (
          <Alert variant="info" className="mb-4">
            <Alert.Heading>Henüz açık talep yok</Alert.Heading>
            Şu anda değerlendirilmeyi bekleyen destek talebi bulunmamaktadır.
          </Alert>
        )}

        <Row>
          {requests.map((request) => (
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
