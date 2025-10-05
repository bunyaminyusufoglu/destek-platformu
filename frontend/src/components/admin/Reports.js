import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { adminAPI } from '../../services/api';
import { 
  FaChartLine, 
  FaUsers, 
  FaTicketAlt, 
  FaHandshake, 
  FaComments,
  FaDownload,
  FaCalendarAlt,
  FaTrophy,
  FaTags,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAPI.getReports(selectedPeriod);
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Raporlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'warning', icon: <FaExclamationTriangle />, text: 'Açık' },
      assigned: { variant: 'info', icon: <FaClock />, text: 'Atanmış' },
      in_progress: { variant: 'primary', icon: <FaClock />, text: 'Devam Ediyor' },
      completed: { variant: 'success', icon: <FaCheckCircle />, text: 'Tamamlandı' },
      cancelled: { variant: 'danger', icon: <FaExclamationTriangle />, text: 'İptal' }
    };
    
    const config = statusConfig[status] || statusConfig.open;
    return (
      <span className={`badge bg-${config.variant} d-flex align-items-center gap-1`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Raporlar yükleniyor...</p>
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
          <Button variant="outline-danger" onClick={fetchReports}>
            Tekrar Dene
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!reports) return null;

  return (
    <div>
      <Container fluid className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2>📊 Raporlar</h2>
                <p className="text-muted mb-0">
                  Tarih Aralığı: {formatDate(reports.dateRange.startDate)} - {formatDate(reports.dateRange.endDate)}
                </p>
              </div>
              <div className="d-flex gap-3 align-items-center">
                <ButtonGroup>
                  <Button 
                    variant={selectedPeriod === '7d' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedPeriod('7d')}
                  >
                    Son 7 Gün
                  </Button>
                  <Button 
                    variant={selectedPeriod === '30d' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedPeriod('30d')}
                  >
                    Son 30 Gün
                  </Button>
                  <Button 
                    variant={selectedPeriod === '90d' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedPeriod('90d')}
                  >
                    Son 90 Gün
                  </Button>
                  <Button 
                    variant={selectedPeriod === '1y' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedPeriod('1y')}
                  >
                    Son 1 Yıl
                  </Button>
                </ButtonGroup>
                <Button variant="success">
                  <FaDownload className="me-2" />
                  Raporu İndir
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Özet Kartları */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaUsers className="display-6 text-primary mb-2" />
                <h3 className="h4 mb-1">{reports.summary.users.new}</h3>
                <p className="text-muted mb-0">Yeni Kullanıcılar</p>
                <small className="text-success">
                  +{reports.summary.users.newExperts} uzman
                </small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaTicketAlt className="display-6 text-warning mb-2" />
                <h3 className="h4 mb-1">{reports.summary.requests.new}</h3>
                <p className="text-muted mb-0">Yeni Talepler</p>
                <small className="text-info">
                  %{reports.summary.requests.completionRate} tamamlanma
                </small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaHandshake className="display-6 text-success mb-2" />
                <h3 className="h4 mb-1">{reports.summary.offers.new}</h3>
                <p className="text-muted mb-0">Yeni Teklifler</p>
                <small className="text-success">
                  %{reports.summary.offers.acceptanceRate} kabul oranı
                </small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FaComments className="display-6 text-info mb-2" />
                <h3 className="h4 mb-1">{reports.summary.messages.new}</h3>
                <p className="text-muted mb-0">Yeni Mesajlar</p>
                <small className="text-muted">
                  {reports.summary.messages.total} toplam
                </small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Aylık Trend Grafiği */}
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <FaChartLine className="me-2" />
                  Aylık Trend Analizi
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Ay</th>
                        <th className="text-center">Kullanıcılar</th>
                        <th className="text-center">Talepler</th>
                        <th className="text-center">Teklifler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.charts.monthlyData.map((month, index) => (
                        <tr key={index}>
                          <td><strong>{month.month}</strong></td>
                          <td className="text-center">
                            <span className="badge bg-primary">{month.users}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-warning">{month.requests}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-success">{month.offers}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* En Aktif Uzmanlar */}
          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <FaTrophy className="me-2" />
                  En Aktif Uzmanlar
                </h5>
              </Card.Header>
              <Card.Body>
                {reports.charts.topExperts.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {reports.charts.topExperts.map((expert, index) => (
                      <div key={expert._id} className="list-group-item px-0 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-medium">{expert.name}</div>
                            <small className="text-muted">{expert.email}</small>
                          </div>
                          <div className="text-end">
                            <div className="fw-medium">{expert.totalOffers} teklif</div>
                            <small className="text-success">{formatCurrency(expert.totalEarnings)}</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center">Henüz veri yok</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Talep Kategorileri */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <FaTags className="me-2" />
                  Popüler Talep Kategorileri
                </h5>
              </Card.Header>
              <Card.Body>
                {reports.charts.requestCategories.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {reports.charts.requestCategories.map((category, index) => (
                      <div key={index} className="list-group-item px-0 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-secondary me-2">{category._id}</span>
                            <span className="fw-medium">{category.count} talep</span>
                          </div>
                          <small className="text-muted">
                            Ort. {formatCurrency(category.avgBudget)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center">Henüz veri yok</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Talep Durumları */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <FaCheckCircle className="me-2" />
                  Talep Durum Dağılımı
                </h5>
              </Card.Header>
              <Card.Body>
                {reports.charts.completionRates.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {reports.charts.completionRates.map((status, index) => (
                      <div key={index} className="list-group-item px-0 border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {getStatusBadge(status._id)}
                          </div>
                          <span className="fw-medium">{status.count} talep</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center">Henüz veri yok</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Detaylı İstatistikler */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  <FaCalendarAlt className="me-2" />
                  Detaylı İstatistikler
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center mb-3">
                    <div className="border-end">
                      <h6 className="text-muted">Toplam Kullanıcılar</h6>
                      <h4 className="text-primary">{reports.summary.users.totalUsers}</h4>
                      <small className="text-success">+{reports.summary.users.new} yeni</small>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <div className="border-end">
                      <h6 className="text-muted">Toplam Talepler</h6>
                      <h4 className="text-warning">{reports.summary.requests.total}</h4>
                      <small className="text-success">+{reports.summary.requests.new} yeni</small>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <div className="border-end">
                      <h6 className="text-muted">Toplam Teklifler</h6>
                      <h4 className="text-success">{reports.summary.offers.total}</h4>
                      <small className="text-success">+{reports.summary.offers.new} yeni</small>
                    </div>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <h6 className="text-muted">Toplam Mesajlar</h6>
                    <h4 className="text-info">{reports.summary.messages.total}</h4>
                    <small className="text-success">+{reports.summary.messages.new} yeni</small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Reports;
