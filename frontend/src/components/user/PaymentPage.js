import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaDollarSign, FaClock, FaUser, FaCreditCard, FaCheck } from 'react-icons/fa';
import { offerAPI } from '../../services/api';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // URL'den offer ID'sini al
  const offerId = new URLSearchParams(location.search).get('offerId');
  const isValidObjectId = typeof offerId === 'string' && /^[a-fA-F0-9]{24}$/.test(offerId || '');
  

  const loadOfferDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Teklif detaylarını API'den al
      const offerData = await offerAPI.getOfferById(offerId);
      
      if (!offerData) {
        throw new Error('API\'den boş veri döndü');
      }
      
      setOffer(offerData);
    } catch (err) {
      console.error('Teklif detayları yüklenemedi:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Teklif detayları yüklenirken hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    if (!offerId || !isValidObjectId) {
      setError('Teklif bilgisi bulunamadı veya kimlik formatı geçersiz.');
      setLoading(false);
      return;
    }

    loadOfferDetails();
  }, [offerId, loadOfferDetails, isValidObjectId]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');
      
      // Ödeme işlemi simülasyonu (gerçek uygulamada burada payment gateway API'si çağrılır)
      console.log('Ödeme işlemi başlatılıyor...', {
        amount: offer.proposedPrice,
        paymentMethod,
        offerId
      });
      
      // Ödeme işlemi simülasyonu (2 saniye bekle)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ödeme başarılı olduğunu varsayıyoruz
      console.log('Ödeme başarılı, teklif kabul ediliyor...');
      
      // Teklifi kabul et
      await offerAPI.acceptOffer(offerId);
      
      setSuccess('Ödeme başarıyla tamamlandı! Teklif kabul edildi ve mesajlaşma başlatıldı.');
      
      // 3 saniye sonra mesajlaşma sayfasına yönlendir
      setTimeout(() => {
        navigate('/messages');
      }, 3000);
      
    } catch (err) {
      console.error('Ödeme hatası:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Ödeme işlemi sırasında hata oluştu';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancel = () => {
    navigate('/incoming-offers');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Teklif bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Hata!</Alert.Heading>
          Teklif bilgileri bulunamadı.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/incoming-offers')}>
          Tekliflerime Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="text-center mb-4">
            <h2>Ödeme Sayfası</h2>
            <p className="text-muted">Teklifi kabul etmek için ödeme yapın</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Hata!</Alert.Heading>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4">
              <Alert.Heading>Başarılı!</Alert.Heading>
              {success}
            </Alert>
          )}

          <Row>
            {/* Teklif Detayları */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Teklif Detayları</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Proje:</strong>
                    <p className="mb-0">{offer.supportRequest.title}</p>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Uzman:</strong>
                    <p className="mb-0">
                      <FaUser className="me-2" />
                      {offer.expert.name}
                    </p>
                  </div>

                  <div className="mb-3">
                    <strong>Tahmini Süre:</strong>
                    <p className="mb-0">
                      <FaClock className="me-2" />
                      {offer.estimatedDuration}
                    </p>
                  </div>

                  <div className="mb-3">
                    <strong>Teklif Tarihi:</strong>
                    <p className="mb-0">{formatDate(offer.createdAt)}</p>
                  </div>

                  <div className="mb-3">
                    <strong>Teklif Mesajı:</strong>
                    <p className="text-muted small">{offer.message}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Ödeme Bilgileri */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Ödeme Bilgileri</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    <h4 className="text-success">
                      <FaDollarSign className="me-2" />
                      {offer.proposedPrice}₺
                    </h4>
                    <p className="text-muted">Teklif edilen fiyat</p>
                  </div>

                  <div className="mb-4">
                    <h6>Ödeme Yöntemi</h6>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="creditCard"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="creditCard">
                        <FaCreditCard className="me-2" />
                        Kredi Kartı
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="bankTransfer"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="bankTransfer">
                        Banka Havalesi
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'credit_card' && (
                    <div className="mb-4">
                      <h6>Kredi Kartı Bilgileri</h6>
                      <div className="mb-3">
                        <label className="form-label">Kart Numarası</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          pattern="[0-9\s]{13,19}"
                          required
                        />
                      </div>
                      <Row>
                        <Col>
                          <label className="form-label">Son Kullanma</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="MM/YY"
                            maxLength="5"
                            pattern="(0[1-9]|1[0-2])\/([0-9]{2})"
                            required
                          />
                        </Col>
                        <Col>
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="123"
                            maxLength="3"
                            pattern="[0-9]{3}"
                            required
                          />
                        </Col>
                      </Row>
                      <div className="mt-2">
                        <small className="text-muted">
                          <i className="fa fa-lock me-1"></i>
                          Kart bilgileriniz güvenli şekilde işlenir
                        </small>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="mb-4">
                      <Alert variant="info">
                        <h6>Banka Havale Bilgileri</h6>
                        <p className="mb-1"><strong>Banka:</strong> İş Bankası</p>
                        <p className="mb-1"><strong>IBAN:</strong> TR12 0006 4000 0011 2345 6789 01</p>
                        <p className="mb-1"><strong>Alıcı:</strong> Destek Platformu</p>
                        <p className="mb-0"><strong>Açıklama:</strong> Teklif #{offerId}</p>
                      </Alert>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <FaCheck className="me-2" />
                          Ödemeyi Tamamla ve Teklifi Kabul Et
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      disabled={processing}
                    >
                      İptal Et
                    </Button>
                  </div>

                  <div className="mt-3">
                    <Alert variant="warning" className="small">
                      <strong>Önemli:</strong> Ödeme tamamlandıktan sonra teklif otomatik olarak kabul edilecek ve mesajlaşma başlatılacaktır. Bu işlem geri alınamaz.
                    </Alert>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
