import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Table, Badge, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaClock } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const OfferApproval = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const loadPendingOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getPendingOffers(pagination.page, pagination.limit);
      setOffers(data.offers);
      setPagination(data.pagination);
    } catch (err) {
      setError('Teklifler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadPendingOffers();
  }, [loadPendingOffers]);

  const handleApprove = async (offerId) => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      await adminAPI.approveOffer(offerId);
      setSuccess('Teklif onaylandı.');
      loadPendingOffers();
      setShowModal(false);
    } catch (err) {
      setError('Teklif onaylanırken hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (offerId) => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      await adminAPI.rejectOffer(offerId);
      setSuccess('Teklif reddedildi.');
      loadPendingOffers();
      setShowModal(false);
    } catch (err) {
      setError('Teklif reddedilirken hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const showOfferDetails = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Teklif Onayları</h2>
        <Badge bg="warning" className="fs-6">
          <FaClock className="me-1" />
          {pagination.total} Bekleyen Teklif
        </Badge>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      {offers.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaClock size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Bekleyen teklif bulunmuyor</h5>
            <p className="text-muted">Onay bekleyen teklif olmadığında bu mesaj görünür.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header>
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-0">Bekleyen Teklifler</h5>
              </Col>
              <Col xs="auto">
                <Badge bg="primary">{pagination.page}/{pagination.pages} Sayfa</Badge>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Uzman</th>
                  <th>Talep</th>
                  <th>Fiyat</th>
                  <th>Süre</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer._id}>
                    <td>
                      <div>
                        <div className="fw-bold">{offer.expert.name}</div>
                        <small className="text-muted">{offer.expert.email}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-bold">{offer.supportRequest.title}</div>
                        <small className="text-muted">
                          Talep Sahibi: {offer.supportRequest.user.name}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge bg="success" className="fs-6">
                        {formatPrice(offer.proposedPrice)}
                      </Badge>
                    </td>
                    <td>{offer.estimatedDuration}</td>
                    <td>
                      <small>{formatDate(offer.createdAt)}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => showOfferDetails(offer)}
                          disabled={processing}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(offer._id)}
                          disabled={processing}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(offer._id)}
                          disabled={processing}
                        >
                          <FaTimes />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Offer Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Teklif Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOffer && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Uzman Bilgileri</h6>
                  <p><strong>Ad:</strong> {selectedOffer.expert.name}</p>
                  <p><strong>E-posta:</strong> {selectedOffer.expert.email}</p>
                  <p><strong>Yetenekler:</strong> {selectedOffer.expert.skills?.join(', ')}</p>
                </Col>
                <Col md={6}>
                  <h6>Talep Bilgileri</h6>
                  <p><strong>Başlık:</strong> {selectedOffer.supportRequest.title}</p>
                  <p><strong>Bütçe:</strong> {formatPrice(selectedOffer.supportRequest.budget)}</p>
                  <p><strong>Son Tarih:</strong> {formatDate(selectedOffer.supportRequest.deadline)}</p>
                  <p><strong>Talep Sahibi:</strong> {selectedOffer.supportRequest.user.name}</p>
                </Col>
              </Row>
              
              <h6>Teklif Detayları</h6>
              <p><strong>Önerilen Fiyat:</strong> {formatPrice(selectedOffer.proposedPrice)}</p>
              <p><strong>Tahmini Süre:</strong> {selectedOffer.estimatedDuration}</p>
              <p><strong>Mesaj:</strong></p>
              <div className="border rounded p-3 bg-light">
                {selectedOffer.message}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Kapat
          </Button>
          <Button
            variant="danger"
            onClick={() => handleReject(selectedOffer._id)}
            disabled={processing}
          >
            <FaTimes className="me-1" />
            Reddet
          </Button>
          <Button
            variant="success"
            onClick={() => handleApprove(selectedOffer._id)}
            disabled={processing}
          >
            <FaCheck className="me-1" />
            Onayla
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OfferApproval;
