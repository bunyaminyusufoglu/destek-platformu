import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { paymentsAPI } from '../../services/api';

const PaymentApprovals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadPending = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await paymentsAPI.getPending();
      setRequests(data.requests || []);
    } catch (err) {
      setError('Ödeme talepleri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const approve = async (id) => {
    try {
      setProcessingId(id);
      setError('');
      setSuccess('');
      await paymentsAPI.approve(id);
      setSuccess('Ödeme onaylandı. Teklif kabul edildi ve sohbet başlatıldı.');
      // Optimistic remove to avoid stale actions
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Onay sırasında hata oluştu.');
    } finally {
      setProcessingId(null);
    }
  };

  const reject = async (id) => {
    try {
      setProcessingId(id);
      setError('');
      setSuccess('');
      await paymentsAPI.reject(id);
      setSuccess('Ödeme talebi reddedildi.');
      // Optimistic remove
      setRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Reddetme sırasında hata oluştu.');
    } finally {
      setProcessingId(null);
    }
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
        <h2>Ödeme Onayları</h2>
        <Badge bg="warning" className="fs-6">{requests.length} Bekleyen</Badge>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Bekleyen Ödeme Talepleri</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Kullanıcı</th>
                <th>Hizmet</th>
                <th>Tutar</th>
                <th>Uzman</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="fw-semibold">{r.payer?.name}</div>
                    <small className="text-muted">{r.payer?.email}</small>
                  </td>
                  <td className="text-truncate" style={{maxWidth: 260}}>
                    {r.offer?.supportRequest?.title || '-'}
                  </td>
                  <td>
                    <Badge bg="success">{r.amount}₺</Badge>
                  </td>
                  <td>{r.offer?.expert?.name || '-'}</td>
                  <td>{new Date(r.createdAt).toLocaleString('tr-TR')}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => approve(r._id)}
                        disabled={processingId === r._id}
                      >
                        Onayla
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => reject(r._id)}
                        disabled={processingId === r._id}
                      >
                        Reddet
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={async () => {
                          setProcessingId(r._id);
                          setError(''); setSuccess('');
                          try {
                            await paymentsAPI.remove(r._id);
                            setSuccess('Ödeme talebi silindi.');
                            setRequests(prev => prev.filter(x => x._id !== r._id));
                          } catch (err) {
                            setError(err.response?.data?.message || 'Silme sırasında hata oluştu.');
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === r._id}
                      >
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Bekleyen ödeme talebi bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentApprovals;


