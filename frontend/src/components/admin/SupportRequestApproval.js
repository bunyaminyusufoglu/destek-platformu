import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Table, Badge, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaClock, FaCalendar } from 'react-icons/fa';
import { adminAPI } from '../../services/api';

const SupportRequestApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminAPI.getPendingSupportRequests(pagination.page, pagination.limit);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (err) {
      setError('Destek talepleri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadPendingRequests();
  }, [pagination.page, loadPendingRequests]);

  const handleApprove = async (requestId) => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      await adminAPI.approveSupportRequest(requestId);
      setSuccess('Destek talebi onaylandı.');
      loadPendingRequests();
      setShowModal(false);
    } catch (err) {
      setError('Destek talebi onaylanırken hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      await adminAPI.rejectSupportRequest(requestId);
      setSuccess('Destek talebi reddedildi.');
      loadPendingRequests();
      setShowModal(false);
    } catch (err) {
      setError('Destek talebi reddedilirken hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const showRequestDetails = (request) => {
    setSelectedRequest(request);
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
        <h2>Destek Talebi Onayları</h2>
        <Badge bg="warning" className="fs-6">
          <FaClock className="me-1" />
          {pagination.total} Bekleyen Talep
        </Badge>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      {requests.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaClock size={48} className="text-muted mb-3" />
            <h5 className="text-muted">Bekleyen destek talebi bulunmuyor</h5>
            <p className="text-muted">Onay bekleyen destek talebi olmadığında bu mesaj görünür.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Header>
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-0">Bekleyen Destek Talepleri</h5>
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
                  <th>Talep Sahibi</th>
                  <th>Başlık</th>
                  <th>Bütçe</th>
                  <th>Son Tarih</th>
                  <th>Oluşturulma</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <div>
                        <div className="fw-bold">{request.user.name}</div>
                        <small className="text-muted">{request.user.email}</small>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold">{request.title}</div>
                      <small className="text-muted">
                        {request.description?.substring(0, 50)}...
                      </small>
                    </td>
                    <td>
                      <Badge bg="success" className="fs-6">
                        {formatPrice(request.budget)}
                      </Badge>
                    </td>
                    <td>
                      <small>{formatDate(request.deadline)}</small>
                    </td>
                    <td>
                      <small>{formatDate(request.createdAt)}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => showRequestDetails(request)}
                          disabled={processing}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApprove(request._id)}
                          disabled={processing}
                        >
                          <FaCheck />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(request._id)}
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

      {/* Request Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Destek Talebi Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Talep Sahibi</h6>
                  <p><strong>Ad:</strong> {selectedRequest.user.name}</p>
                  <p><strong>E-posta:</strong> {selectedRequest.user.email}</p>
                </Col>
                <Col md={6}>
                  <h6>Talep Bilgileri</h6>
                  <p><strong>Başlık:</strong> {selectedRequest.title}</p>
                  <p><strong>Bütçe:</strong> {formatPrice(selectedRequest.budget)}</p>
                  <p><strong>Son Tarih:</strong> {formatDate(selectedRequest.deadline)}</p>
                </Col>
              </Row>
              
              <h6>Açıklama</h6>
              <div className="border rounded p-3 bg-light mb-3">
                {selectedRequest.description}
              </div>

              {selectedRequest.skills && selectedRequest.skills.length > 0 && (
                <div className="mb-3">
                  <h6>Gerekli Yetenekler</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedRequest.skills.map((skill, index) => (
                      <Badge key={index} bg="info">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <small className="text-muted">
                    <FaCalendar className="me-1" />
                    Oluşturulma: {formatDate(selectedRequest.createdAt)}
                  </small>
                </div>
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
            onClick={() => handleReject(selectedRequest._id)}
            disabled={processing}
          >
            <FaTimes className="me-1" />
            Reddet
          </Button>
          <Button
            variant="success"
            onClick={() => handleApprove(selectedRequest._id)}
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

export default SupportRequestApproval;
