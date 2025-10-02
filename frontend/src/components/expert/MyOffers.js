import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { offerAPI } from '../../services/api';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await offerAPI.getMyOffers();
      setOffers(Array.isArray(data) ? data : data?.offers || []);
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
          <h2>Tekliflerim</h2>
          <Badge bg="info" className="fs-6">{offers.length} teklif</Badge>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Hata!</Alert.Heading>
            {error}
          </Alert>
        )}

        {offers.length === 0 && !error ? (
          <Alert variant="info">Henüz teklif göndermediniz.</Alert>
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
                    <p className="text-muted mb-3">
                      {offer.message?.length > 140 ? `${offer.message.substring(0, 140)}...` : offer.message}
                    </p>
                    <div className="d-flex flex-wrap gap-3 small text-muted">
                      <span>💰 {offer.proposedPrice}₺</span>
                      <span>⏱️ {offer.estimatedDuration}</span>
                      <span>📅 {formatDate(offer.createdAt)}</span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default MyOffers;

