import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { supportAPI } from '../../services/api';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMyRequests = useCallback(async () => {
    try {
      setLoading(true);
      const allRequests = await supportAPI.getRequests();
      const myRequests = allRequests.filter(req => req.user._id === user.id);
      setRequests(myRequests);
    } catch (err) {
      setError(err.response?.data?.message || 'Talepler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

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
      open: { variant: 'success', text: 'Açık' },
      assigned: { variant: 'primary', text: 'Atanmış' },
      in_progress: { variant: 'warning', text: 'Devam Ediyor' },
      completed: { variant: 'secondary', text: 'Tamamlandı' },
      cancelled: { variant: 'danger', text: 'İptal' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      try {
        await supportAPI.deleteRequest(requestId);
        setRequests(requests.filter(req => req._id !== requestId));
      } catch (err) {
        setError(err.response?.data?.message || 'Talep silinirken hata oluştu');
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>📋 Destek Taleplerim</h2>
            <Button variant="primary" href="/support-request-form">
              📝 Yeni Talep Oluştur
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {requests.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <div className="display-1 mb-3">📝</div>
                <h4>Henüz destek talebiniz yok</h4>
                <p className="text-muted">İlk destek talebinizi oluşturmak için butona tıklayın.</p>
                <Button variant="primary" href="/support-request-form">
                  📝 Yeni Talep Oluştur
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {requests.map((request) => (
                <Col md={6} lg={4} key={request._id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">{request.title}</h6>
                      {getStatusBadge(request.status)}
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted small mb-3">
                        {request.description.substring(0, 100)}...
                      </p>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">💰 Bütçe:</small>
                          <strong>{request.budget}₺</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">📅 Teslim:</small>
                          <small>{formatDate(request.deadline)}</small>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-muted">💼 Teklifler:</small>
                          <Badge bg="info">{request.offerCount}</Badge>
                        </div>
                      </div>

                      {request.skills && request.skills.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">Yetenekler:</small>
                          <div className="d-flex flex-wrap gap-1">
                            {request.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} bg="light" text="dark" className="small">
                                {skill}
                              </Badge>
                            ))}
                            {request.skills.length > 3 && (
                              <Badge bg="light" text="dark" className="small">
                                +{request.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </Card.Body>
                    <Card.Footer className="bg-transparent">
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          href={`/support-requests/${request._id}`}
                          className="flex-fill"
                        >
                          👁️ Görüntüle
                        </Button>
                        {request.status === 'open' && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteRequest(request._id)}
                          >
                            🗑️ Sil
                          </Button>
                        )}
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MyRequests;
