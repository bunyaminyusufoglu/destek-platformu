import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Card, Row, Col, Spinner, Alert, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserTie, 
  FaUserShield, 
  FaTicketAlt, 
  FaComments, 
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog,
  FaClipboardList,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Hata!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div>
      <Container fluid className="py-4">
        {error && (
          <Alert variant="danger" className="mb-4">
            <Alert.Heading>Hata!</Alert.Heading>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xs={6} md={3} className="mb-3">
            <Card as={Link} to="/admin/users" className="h-100 border-0 shadow-sm text-decoration-none" style={{ cursor: 'pointer' }}>
              <Card.Body className="text-center">
                <FaUsers className="display-6 text-primary mb-2" />
                <h3 className="h4 mb-1">{stats.users.total}</h3>
                <p className="text-muted mb-0">Toplam Kullanıcı</p>
                <small className="text-success">+{stats.users.recent} son 30 gün</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={6} md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaUserTie className="display-6 text-success mb-2" />
                <h3 className="h4 mb-1">{stats.users.experts}</h3>
                <p className="text-muted mb-0">Uzman</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={6} md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaUserShield className="display-6 text-warning mb-2" />
                <h3 className="h4 mb-1">{stats.users.admins}</h3>
                <p className="text-muted mb-0">Admin</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={6} md={3} className="mb-3">
            <Card as={Link} to="/admin/requests" className="h-100 border-0 shadow-sm text-decoration-none" style={{ cursor: 'pointer' }}>
              <Card.Body className="text-center">
                <FaTicketAlt className="display-6 text-info mb-2" />
                <h3 className="h4 mb-1">{stats.requests.total}</h3>
                <p className="text-muted mb-0">Toplam Talep</p>
                <small className="text-success">+{stats.requests.recent} son 30 gün</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Destek Talepleri Durumu */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <FaClipboardList className="me-2" />
                  Destek Talepleri Durumu
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={3}>
                    <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                      <FaClock className="text-warning mb-2" size={24} />
                      <h4 className="text-warning">{stats.requests.pending}</h4>
                      <small className="text-muted">Bekleyen</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                      <FaExclamationTriangle className="text-info mb-2" size={24} />
                      <h4 className="text-info">{stats.requests.active}</h4>
                      <small className="text-muted">Aktif</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                      <FaCheckCircle className="text-success mb-2" size={24} />
                      <h4 className="text-success">{stats.requests.completed}</h4>
                      <small className="text-muted">Tamamlanan</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                      <FaComments className="text-primary mb-2" size={24} />
                      <h4 className="text-primary">{stats.messages.total}</h4>
                      <small className="text-muted">Toplam Mesaj</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Hızlı İşlemler */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Hızlı İşlemler</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex gap-3 flex-wrap">
                  <Button 
                    variant="primary" 
                    className="flex-fill flex-md-grow-0"
                    as={Link}
                    to="/admin/users"
                  >
                    <FaUsers className="me-2" />
                    Kullanıcı Yönetimi
                  </Button>
                  <Button 
                    variant="success" 
                    className="flex-fill flex-md-grow-0"
                    as={Link}
                    to="/admin/requests"
                  >
                    <FaClipboardList className="me-2" />
                    Destek Talepleri
                  </Button>
                  <Button 
                    variant="info" 
                    className="flex-fill flex-md-grow-0"
                    onClick={fetchStats}
                  >
                    <FaChartLine className="me-2" />
                    İstatistikleri Yenile
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    className="flex-fill flex-md-grow-0"
                  >
                    <FaCog className="me-2" />
                    Sistem Ayarları
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;