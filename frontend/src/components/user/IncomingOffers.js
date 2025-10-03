import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner, Button, Modal } from 'react-bootstrap';
import { offerAPI, supportAPI } from '../../services/api';
import { FaDollarSign, FaClock } from 'react-icons/fa';

const IncomingOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Kullanıcının kendi taleplerini al
      const myRequests = await supportAPI.getMyRequests();
      const requestIds = myRequests.map(req => req._id);
      
      // Bu taleplere gelen teklifleri al
      const allOffers = [];
      for (const requestId of requestIds) {
        try {
          const requestOffers = await offerAPI.getRequestOffers(requestId);
          allOffers.push(...requestOffers);
        } catch (err) {
          console.error(`Teklifler yüklenemedi (${requestId}):`, err);
        }
      }
      
      setOffers(allOffers);
    } catch (err) {
      setError('Teklifler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
    window.scrollTo(0, 0);
  }, [loadOffers]);

  const handleAcceptOffer = async (offerId) => {
    try {
      setActionLoading(true);
      await offerAPI.acceptOffer(offerId);
      setShowModal(false);
      setSelectedOffer(null);
      await loadOffers(); // Listeyi yenile
    } catch (err) {
      setError('Teklif kabul edilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      setActionLoading(true);
      await offerAPI.rejectOffer(offerId);
      setShowModal(false);
      setSelectedOffer(null);
      await loadOffers(); // Listeyi yenile
    } catch (err) {
      setError('Teklif reddedilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const openOfferModal = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const getOfferStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Beklemede' },
      accepted: { variant: 'success', text: 'Kabul Edildi' },
      rejected: { variant: 'danger', text: 'Reddedildi' },
      cancelled: { variant: 'secondary', text: 'İptal' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Teklifler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Gelen Teklifler</h2>
          <Badge bg="info" className="fs-6">{offers.length} teklif</Badge>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Hata!</Alert.Heading>
            {error}
          </Alert>
        )}

        {offers.length === 0 && !error ? (
          <Alert variant="info">Henüz hiç teklif almadınız.</Alert>
        ) : (
          <Row>
            {offers.map((offer) => (
              <Col lg={6} xl={4} className="mb-4" key={offer._id}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold text-truncate" title={offer.supportRequest?.title}>
                      {offer.supportRequest?.title || 'Destek Talebi'}
                    </h6>
                    {getOfferStatusBadge(offer.status)}
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <small className="text-muted d-block">Uzman:</small>
                      <strong>{offer.expert?.name || 'Bilinmeyen'}</strong>
                    </div>
                    <p className="text-muted mb-3">
                      {offer.message?.length > 140 ? `${offer.message.substring(0, 140)}...` : offer.message}
                    </p>
                    <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
                      <span><FaDollarSign className="me-1" />{offer.proposedPrice}₺</span>
                      <span><FaClock className="me-1" />{offer.estimatedDuration}</span>
                      <span>📅 {formatDate(offer.createdAt)}</span>
                    </div>
                    {offer.status === 'pending' && (
                      <div className="d-flex gap-2">
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => openOfferModal(offer)}
                          className="flex-fill"
                        >
                          Kabul Et
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleRejectOffer(offer._id)}
                          disabled={actionLoading}
                        >
                          Reddet
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Teklif Detay Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Teklif Detayları</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOffer && (
              <div>
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Talep:</strong>
                    <p>{selectedOffer.supportRequest?.title}</p>
                  </Col>
                  <Col md={6}>
                    <strong>Uzman:</strong>
                    <p>{selectedOffer.expert?.name}</p>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Teklif Fiyatı:</strong>
                    <p className="text-success fs-5">{selectedOffer.proposedPrice}₺</p>
                  </Col>
                  <Col md={6}>
                    <strong>Tahmini Süre:</strong>
                    <p>{selectedOffer.estimatedDuration}</p>
                  </Col>
                </Row>
                <div className="mb-3">
                  <strong>Mesaj:</strong>
                  <p className="mt-2">{selectedOffer.message}</p>
                </div>
                <div className="mb-3">
                  <strong>Teklif Tarihi:</strong>
                  <p>{formatDate(selectedOffer.createdAt)}</p>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Kapat
            </Button>
            {selectedOffer?.status === 'pending' && (
              <>
                <Button 
                  variant="outline-danger" 
                  onClick={() => handleRejectOffer(selectedOffer._id)}
                  disabled={actionLoading}
                >
                  Reddet
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => handleAcceptOffer(selectedOffer._id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'İşleniyor...' : 'Kabul Et'}
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default IncomingOffers;
