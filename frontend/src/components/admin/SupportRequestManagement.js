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
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser
} from 'react-icons/fa';

const SupportRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editForm, setEditForm] = useState({});
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

  const handleEditRequest = (request) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      priority: request.priority || 'medium'
    });
    setShowEditModal(true);
  };

  const handleUpdateRequest = async () => {
    try {
      await adminAPI.updateSupportRequest(selectedRequest._id, editForm);
      setShowEditModal(false);
      fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talebi güncellenirken hata oluştu');
    }
  };

  const handleDeleteRequest = async () => {
    try {
      await adminAPI.deleteSupportRequest(selectedRequest._id);
      setShowDeleteModal(false);
      fetchRequests();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Destek talebi silinirken hata oluştu');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', icon: FaClock, text: 'Bekleyen' },
      active: { bg: 'info', icon: FaExclamationTriangle, text: 'Aktif' },
      completed: { bg: 'success', icon: FaCheckCircle, text: 'Tamamlanan' },
      cancelled: { bg: 'danger', icon: FaTrash, text: 'İptal Edilen' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge bg={config.bg}>
        <IconComponent className="me-1" />
        {config.text}
      </Badge>
    );
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
    request.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <option value="pending">Bekleyen</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlanan</option>
              <option value="cancelled">İptal Edilen</option>
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
                    <strong>{request.userId?.name}</strong>
                    <br />
                    <small className="text-muted">{request.userId?.email}</small>
                  </div>
                </div>
              </td>
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
                  <Button 
                    size="sm"
                    variant="outline-primary" 
                    onClick={() => handleEditRequest(request)}
                    title="Düzenle"
                  >
                    <FaEdit />
                  </Button>
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

      {/* Talep Düzenleme Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Destek Talebini Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Durum</Form.Label>
              <Form.Select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
              >
                <option value="pending">Bekleyen</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlanan</option>
                <option value="cancelled">İptal Edilen</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Öncelik</Form.Label>
              <Form.Select
                value={editForm.priority}
                onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            İptal
          </Button>
          <Button variant="primary" onClick={handleUpdateRequest}>
            Güncelle
          </Button>
        </Modal.Footer>
      </Modal>

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
                      <p>{selectedRequest.userId?.name}</p>
                      
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
              <p><strong>Kullanıcı:</strong> {selectedRequest.userId?.name}</p>
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
