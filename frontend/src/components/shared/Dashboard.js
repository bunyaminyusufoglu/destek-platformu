import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supportAPI, offerAPI, messageAPI } from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    myRequests: 0,
    myOffers: 0,
    unreadMessages: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentOffers, setRecentOffers] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Kullanıcıya göre istatistikleri hesapla
      if (user.isUser) {
        // Sadece kendi taleplerini getir
        const myRequests = await supportAPI.getMyRequests();
        setRecentRequests(myRequests.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalRequests: myRequests.length,
          myRequests: myRequests.length
        }));
      } else {
        // Uzman/Admin için tüm talepleri getir
        const requests = await supportAPI.getRequests();
        setRecentRequests(requests.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalRequests: requests.length,
          myRequests: 0
        }));
      }

      // Eğer uzman veya admin ise tekliflerini getir
      if (user.isExpert || user.isAdmin) {
        const offers = await offerAPI.getMyOffers();
        setRecentOffers(offers.slice(0, 5));
        setStats(prev => ({
          ...prev,
          myOffers: offers.length
        }));
      }

      // Konuşmaları getir ve okunmamış mesaj sayısını hesapla
      const conversations = await messageAPI.getMyConversations();
      const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
      setStats(prev => ({
        ...prev,
        unreadMessages: unreadCount
      }));

    } catch (err) {
      setError(err.response?.data?.message || 'Dashboard verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [user.isUser, user.isExpert, user.isAdmin]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    // Sayfa yüklendiğinde en üste scroll et
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
          {user.isUser ? (
            // Kullanıcı için sadece kendi talepleri
            <Col xs={6} md={3} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-6 text-primary mb-2">📝</div>
                  <h3 className="h4 mb-1">{stats.myRequests}</h3>
                  <p className="text-muted mb-0">Taleplerim</p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            // Uzman/Admin için tüm talepler
            <>
              <Col xs={6} md={3} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <div className="display-6 text-primary mb-2">📋</div>
                    <h3 className="h4 mb-1">{stats.totalRequests}</h3>
                    <p className="text-muted mb-0">Toplam Talep</p>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col xs={6} md={3} className="mb-3">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center">
                    <div className="display-6 text-success mb-2">📝</div>
                    <h3 className="h4 mb-1">{stats.myRequests}</h3>
                    <p className="text-muted mb-0">Benim Taleplerim</p>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}

          {(user.isExpert || user.isAdmin) && (
            <Col xs={6} md={3} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className="display-6 text-warning mb-2">💼</div>
                  <h3 className="h4 mb-1">{stats.myOffers}</h3>
                  <p className="text-muted mb-0">Gönderdiğim Teklifler</p>
                </Card.Body>
              </Card>
            </Col>
          )}

          <Col xs={6} md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <div className="display-6 text-info mb-2">💬</div>
                <h3 className="h4 mb-1">{stats.unreadMessages}</h3>
                <p className="text-muted mb-0">Okunmamış Mesaj</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Requests */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">
                  {user.isUser ? '📋 Son Taleplerim' : '📋 Son Destek Talepleri'}
                </h5>
              </Card.Header>
              <Card.Body>
                {recentRequests.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    {user.isUser ? 'Henüz destek talebiniz bulunmuyor.' : 'Henüz destek talebi bulunmuyor.'}
                  </p>
                ) : (
                  <div className="list-group list-group-flush">
                    {recentRequests.map((request) => (
                      <div key={request._id} className="list-group-item border-0 px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{request.title}</h6>
                            <p className="text-muted mb-2 small">
                              {request.description.substring(0, 100)}...
                            </p>
                            <div className="d-flex align-items-center gap-3">
                              {!user.isUser && (
                                <small className="text-muted">
                                  👤 {request.user.name}
                                </small>
                              )}
                              <small className="text-muted">
                                💰 {request.budget}₺
                              </small>
                              <small className="text-muted">
                                📅 {formatDate(request.deadline)}
                              </small>
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <div className="text-end">
                            <small className="text-muted">
                              {request.offerCount} teklif
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Offers (Only for Experts and Admins) */}
        {(user.isExpert || user.isAdmin) && (
          <Row>
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                  <h5 className="mb-0">💼 Son Tekliflerim</h5>
                </Card.Header>
                <Card.Body>
                  {recentOffers.length === 0 ? (
                    <p className="text-muted text-center py-4">Henüz teklif göndermediniz.</p>
                  ) : (
                    <div className="list-group list-group-flush">
                      {recentOffers.map((offer) => (
                        <div key={offer._id} className="list-group-item border-0 px-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{offer.supportRequest.title}</h6>
                              <p className="text-muted mb-2 small">
                                {offer.message.substring(0, 100)}...
                              </p>
                              <div className="d-flex align-items-center gap-3">
                                <small className="text-muted">
                                  💰 {offer.proposedPrice}₺
                                </small>
                                <small className="text-muted">
                                  ⏱️ {offer.estimatedDuration}
                                </small>
                                {getOfferStatusBadge(offer.status)}
                              </div>
                            </div>
                            <div className="text-end">
                              <small className="text-muted">
                                {formatDate(offer.createdAt)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Quick Actions */}
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">⚡ Hızlı İşlemler</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex gap-3 flex-wrap">
                  {(user.isUser || user.isAdmin) && (
                    <Button 
                      variant="primary" 
                      className="flex-fill flex-md-grow-0"
                      as={Link}
                      to="/create-request"
                    >
                      📝 Yeni Destek Talebi Oluştur
                    </Button>
                  )}
                  {(user.isExpert || user.isAdmin) && (
                    <Button variant="success" className="flex-fill flex-md-grow-0">
                      🔍 Açık Talepleri Görüntüle
                    </Button>
                  )}
                  {user.isAdmin && (
                    <Button variant="warning" className="flex-fill flex-md-grow-0">
                      👑 Admin Paneli
                    </Button>
                  )}
                  <Button variant="info" className="flex-fill flex-md-grow-0" as={Link} to="/messages">
                    💬 Mesajlarım
                  </Button>
                  <Button variant="outline-secondary" className="flex-fill flex-md-grow-0" as={Link} to="/settings">
                    👤 Profilimi Düzenle
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

export default Dashboard;
