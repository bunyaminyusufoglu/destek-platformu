import React, { useEffect, useMemo, useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { adminAPI } from '../../services/api';

const defaultSettings = {
  platformName: 'Destek Platformu',
  supportEmail: '',
  maintenanceMode: false,
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [account, setAccount] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [seo, setSeo] = useState({ title: '', description: '', keywords: '', robots: 'index, follow' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSaveGeneral = useMemo(() => {
    return settings.platformName?.trim().length > 0;
  }, [settings]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        // General settings (optional endpoint)
        if (adminAPI.getSettings) {
          const data = await adminAPI.getSettings();
          if (isMounted && data) {
            setSettings({
              platformName: data.platformName ?? defaultSettings.platformName,
              supportEmail: data.supportEmail ?? '',
              maintenanceMode: Boolean(data.maintenanceMode),
            });
            const initialSeo = data.seo || {};
            setSeo({
              title: initialSeo.title ?? '',
              description: initialSeo.description ?? '',
              keywords: Array.isArray(initialSeo.keywords) ? initialSeo.keywords.join(', ') : (initialSeo.keywords ?? ''),
              robots: initialSeo.robots ?? 'index, follow',
            });
          }
        } else {
          setSettings(defaultSettings);
        }

        // Admin account info from localStorage user for initial fill
        try {
          const userRaw = localStorage.getItem('user');
          if (userRaw) {
            const user = JSON.parse(userRaw);
            if (isMounted) {
              setAccount(prev => ({ ...prev, name: user?.name || '', email: user?.email || '' }));
            }
          }
        } catch (_) {}
      } catch (e) {
        setError('Ayarlar yüklenirken bir hata oluştu.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const handleGeneralSave = async (e) => {
    e.preventDefault();
    if (!canSaveGeneral) return;
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (adminAPI.updateSettings) {
        await adminAPI.updateSettings({ ...settings });
      }
      setSuccess('Genel ayarlar başarıyla kaydedildi.');
    } catch (e) {
      setError('Genel ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      // Update profile if backend route exists; fallback to local update
      if (adminAPI.updateProfile) {
        await adminAPI.updateProfile({ name: account.name, email: account.email });
      }
      // Password change if provided
      if (account.newPassword) {
        if (!adminAPI.changePassword) {
          throw new Error('changePassword endpoint not available');
        }
        await adminAPI.changePassword({ currentPassword: account.currentPassword, newPassword: account.newPassword });
      }
      // Reflect in localStorage for immediate UI consistency
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: account.name, email: account.email }));
        }
      } catch (_) {}
      setSuccess('Hesap bilgileri güncellendi.');
      setAccount(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (e) {
      setError('Hesap bilgileri güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleSeoSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const payload = {
        seo: {
          title: seo.title,
          description: seo.description,
          keywords: seo.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean),
          robots: seo.robots,
        }
      };
      if (adminAPI.updateSettings) {
        await adminAPI.updateSettings(payload);
      }
      setSuccess('SEO ayarları kaydedildi.');
    } catch (e) {
      setError('SEO ayarları kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 240 }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <h2 className="mb-4">Admin Ayarları</h2>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="general" id="admin-settings-tabs" className="mb-3">
            <Tab eventKey="general" title="Genel">
              <Form onSubmit={handleGeneralSave}>
                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="platformName">
                      <Form.Label>Platform Adı</Form.Label>
                      <Form.Control
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        placeholder="Örn: Destek Platformu"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="supportEmail">
                      <Form.Label>Destek E-postası</Form.Label>
                      <Form.Control
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        placeholder="destek@ornek.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Check
                  type="switch"
                  id="maintenanceMode"
                  label="Bakım Modu"
                  className="mb-3"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                />

                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" disabled={!canSaveGeneral || saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </Form>
            </Tab>

            <Tab eventKey="seo" title="SEO">
              <Form onSubmit={handleSeoSave}>
                <Form.Group className="mb-3" controlId="seoTitle">
                  <Form.Label>Site Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={seo.title}
                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                    placeholder="Örn: Destek Platformu - Uzman Desteği"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="seoDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={seo.description}
                    onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                    placeholder="Sitenizin arama sonuçlarındaki açıklaması"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="seoKeywords">
                  <Form.Label>Keywords (virgülle ayırın)</Form.Label>
                  <Form.Control
                    type="text"
                    value={seo.keywords}
                    onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                    placeholder="destek, uzman, danışmanlık"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="seoRobots">
                  <Form.Label>Robots</Form.Label>
                  <Form.Select
                    value={seo.robots}
                    onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
                  >
                    <option value="index, follow">index, follow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </Form>
            </Tab>

            <Tab eventKey="account" title="Hesap">
              <Form onSubmit={handleAccountSave}>
                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="adminName">
                      <Form.Label>Ad Soyad</Form.Label>
                      <Form.Control
                        type="text"
                        value={account.name}
                        onChange={(e) => setAccount({ ...account, name: e.target.value })}
                        placeholder="Ad Soyad"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="adminEmail">
                      <Form.Label>E-posta</Form.Label>
                      <Form.Control
                        type="email"
                        value={account.email}
                        onChange={(e) => setAccount({ ...account, email: e.target.value })}
                        placeholder="eposta@ornek.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="currentPassword">
                      <Form.Label>Mevcut Şifre</Form.Label>
                      <Form.Control
                        type="password"
                        value={account.currentPassword}
                        onChange={(e) => setAccount({ ...account, currentPassword: e.target.value })}
                        placeholder="Mevcut şifre"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3" controlId="newPassword">
                      <Form.Label>Yeni Şifre</Form.Label>
                      <Form.Control
                        type="password"
                        value={account.newPassword}
                        onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                        placeholder="Yeni şifre"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSettings;


