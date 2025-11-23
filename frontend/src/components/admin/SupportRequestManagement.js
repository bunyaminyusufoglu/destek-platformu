import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { 
  Card,
  Container,
  Table, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Spinner, 
  Alert, 
  Badge,
  Pagination,
} from 'react-bootstrap';
import { 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser
} from 'react-icons/fa';
import { getStatusDisplay, supportRequestStatusMap, paymentStatusMap } from '../../utils/statusLabels';

const SupportRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllSupportRequests(currentPage, 10, statusFilter || null);
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talepleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDeleteRequest = async () => {
    try {
      await adminAPI.deleteSupportRequest(selectedRequest._id);
      setShowDeleteModal(false);
      fetchRequests();
      setError(null);
      setSuccess('Destek talebi silindi.');
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talebi silinirken hata oluştu');
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessingId(requestId);
      setError(null);
      setSuccess('');
      await adminAPI.approveSupportRequest(requestId);
      setSuccess('Destek talebi onaylandı.');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Onay sırasında hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingId(requestId);
      setError(null);
      setSuccess('');
      await adminAPI.rejectSupportRequest(requestId);
      setSuccess('Destek talebi reddedildi.');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Reddetme sırasında hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const { variant, text } = getStatusDisplay(supportRequestStatusMap, status);
    const iconMap = {
      pending: <FaClock />,
      admin_approved: <FaCheckCircle />,
      admin_rejected: <FaExclamationTriangle />,
      open: <FaCheckCircle />,
      assigned: <FaCheckCircle />,
      in_progress: <FaExclamationTriangle />,
      completed: <FaCheckCircle />,
      cancelled: <FaTrash />,
    };
    const icon = iconMap[status] || null;
    return (
      <Badge bg={variant} className="d-inline-flex align-items-center gap-1">
        {icon}
        {text}
      </Badge>
    );
  };

  const getAdminApprovalBadge = (approvalStatus) => {
    const { variant, text } = getStatusDisplay(paymentStatusMap, approvalStatus);
    return <Badge bg={variant}>{text}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { bg: 'success', text: 'Düşük' },
      medium: { bg: 'warning', text: 'Orta' },
      high: { bg: 'danger', text: 'Yüksek' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;

    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const filteredRequests = requests.filter(request => 
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && requests.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <Container fluid className="py-4">
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
            <Alert.Heading>Hata!</Alert.Heading>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2>Destek Talepleri Yönetimi</h2>
              <Button variant="outline-primary" onClick={fetchRequests}>
                <FaSearch className="me-2" />
                Yenile
              </Button>
            </div>
          </Col>
        </Row>

        {/* Filtreler ve Arama */}
        <Row className="mb-4">
          <Col md={4}>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="pending">Onay Bekliyor</option>
              <option value="admin_approved">Admin Onaylı</option>
              <option value="admin_rejected">Admin Reddedildi</option>
              <option value="open">Açık</option>
              <option value="assigned">Atandı</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Başlık, açıklama veya kullanıcı adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <div className="d-flex gap-2">
              <Badge bg="info" className="p-2">
                Toplam: {pagination.total} talep
              </Badge>
            </div>
          </Col>
        </Row>

        {/* Destek Talepleri Tablosu */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Destek Talepleri Listesi</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
        <thead>
          <tr>
            <th>Başlık</th>
            <th>Kullanıcı</th>
            <th>Admin Onayı</th>
            <th>Durum</th>
            <th>Öncelik</th>
            <th>Oluşturulma</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((request) => (
            <tr key={request._id}>
              <td>
                <div className="d-flex align-items-center">
                  <FaTicketAlt className="text-primary me-2" />
                  <div>
                    <strong>{request.title}</strong>
                    <br />
                    <small className="text-muted">
                      {request.description.substring(0, 50)}...
                    </small>
                  </div>
                </div>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <FaUser className="text-secondary me-2" />
                  <div>
                    <strong>{request.user?.name}</strong>
                    <br />
                    <small className="text-muted">{request.user?.email}</small>
                  </div>
                </div>
              </td>
              <td>{getAdminApprovalBadge(request.adminApprovalStatus)}</td>
              <td>{getStatusBadge(request.status)}</td>
              <td>{getPriorityBadge(request.priority)}</td>
              <td>{new Date(request.createdAt).toLocaleDateString('tr-TR')}</td>
              <td>
                <div className="d-flex gap-1">
                  <Button 
                    size="sm"
                    variant="outline-info" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailModal(true);
                    }}
                    title="Detayları Gör"
                  >
                    <FaEye />
                  </Button>
                  {request.adminApprovalStatus === 'pending' && (
                    <>
                      <Button 
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(request._id)}
                        disabled={processingId === request._id}
                        title="Onayla"
                      >
                        ✔
                      </Button>
                      <Button 
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(request._id)}
                        disabled={processingId === request._id}
                        title="Reddet"
                      >
                        ✖
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm"
                    variant="outline-danger" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDeleteModal(true);
                    }}
                    title="Sil"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sayfalama */}
        {pagination.pages > 1 && (
          <Row className="mt-4">
            <Col>
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.Prev 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                  {[...Array(pagination.pages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    disabled={currentPage === pagination.pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </Pagination>
              </div>
            </Col>
          </Row>
        )}
      </Container>



      {/* Talep Detayları Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Destek Talebi Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <Row>
                <Col md={8}>
                  <h5>{selectedRequest.title}</h5>
                  <p className="text-muted">{selectedRequest.description}</p>
                </Col>
                <Col md={4}>
                  <Card>
                    <Card.Body>
                      <h6>Durum</h6>
                      <p>{getStatusBadge(selectedRequest.status)}</p>
                      
                      <h6>Öncelik</h6>
                      <p>{getPriorityBadge(selectedRequest.priority)}</p>
                      
                      <h6>Kullanıcı</h6>
                      <p>{selectedRequest.user?.name}</p>
                      
                      <h6>Oluşturulma</h6>
                      <p>{new Date(selectedRequest.createdAt).toLocaleString('tr-TR')}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Destek Talebini Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Dikkat!</strong> Bu işlem geri alınamaz. 
            Destek talebi ve tüm ilişkili veriler kalıcı olarak silinecek.
          </Alert>
          {selectedRequest && (
            <div>
              <p><strong>Başlık:</strong> {selectedRequest.title}</p>
              <p><strong>Kullanıcı:</strong> {selectedRequest.user?.name}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDeleteRequest}>
            Talebi Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupportRequestManagement;
