import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUniversity, FaCheck, FaCopy } from 'react-icons/fa';
import { offerAPI, paymentsAPI } from '../../services/api';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [eligible, setEligible] = useState(false);
  const bankAccounts = [
    { bank: 'Ziraat Bankası', iban: 'TR12 0001 0000 0000 0000 0000 01' },
    { bank: 'İş Bankası', iban: 'TR34 0006 4000 0011 2345 6789 01' },
    { bank: 'Garanti BBVA', iban: 'TR56 0006 2000 0022 3344 5566 77' },
    { bank: 'Akbank', iban: 'TR78 0004 6000 0001 2345 6789 00' },
    { bank: 'Yapı Kredi', iban: 'TR90 0006 7010 0000 1234 5678 90' },
  ];

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

      // Ödeme talebi oluşturma uygunluğu: admin tarafından onaylanmış ve beklemede olmalı
      const isEligible = offerData?.adminApprovalStatus === 'approved' && offerData?.status === 'admin_approved';
      setEligible(isEligible);
      if (!isEligible) {
        setError('Bu teklif için ödeme talebi oluşturmak için önce teklifin admin tarafından onaylanması gerekir.');
      }
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

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (e) {
      // ignore
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      setError('');

      if (!eligible) {
        setError('Teklif henüz admin tarafından onaylanmadı. Lütfen önce teklif onayını bekleyin.');
        return;
      }

      // Ödeme talebi oluştur
      await paymentsAPI.createPaymentRequest(offerId);

      setSuccess('Ödeme talebiniz alındı. Admin onayı sonrası sohbet başlayacaktır.');

      // 3 saniye sonra mesajlaşma sayfasına yönlendir
      setTimeout(() => {
        navigate('/incoming-offers');
      }, 3000);

    } catch (err) {
      console.error('Ödeme hatası:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Ödeme talebi oluşturulurken hata oluştu';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // no-op (detaylar kaldırıldı)

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
            {/* Ödeme Bilgileri */}
            <Col md={12}>
              <Card className="h-100">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Banka IBAN Bilgileri</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <span className="fw-semibold">Hizmet:</span> {offer.supportRequest.title} — <span className="text-success fw-bold">{offer.proposedPrice}₺</span>
                  </div>

                  <div className="mb-3">
                    <h6 className="mb-2">Banka Hesapları</h6>
                    <Row className="g-3">
                      {bankAccounts.map((acc, idx) => (
                        <Col md={6} key={idx}>
                          <Card className="h-100 shadow-sm">
                            <Card.Body className="d-flex align-items-center justify-content-between">
                              <div>
                                <div className="fw-semibold"><FaUniversity className="me-2" />{acc.bank}</div>
                                <div className="small text-muted">IBAN: {acc.iban}</div>
                              </div>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleCopy(acc.iban, idx)}
                              >
                                <FaCopy className="me-1" />
                                {copiedIndex === idx ? 'Kopyalandı' : 'Kopyala'}
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  <Alert variant="warning" className="small">
                    Havale/EFT açıklamasına lütfen şu ifadeyi ekleyin: <strong>Teklif #{offerId}</strong>.
                  </Alert>

                  <div className="d-grid gap-2">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handlePayment}
                      disabled={processing || !eligible}
                    >
                      {processing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <FaCheck className="me-2" />
                          Ödemeyi Yaptım
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
