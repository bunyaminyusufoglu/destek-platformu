import React, { useState } from 'react';
import { Tabs, Tab, Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeKey, setActiveKey] = useState('profile');

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header">
          <strong>Ayarlar</strong>
        </div>
        <div className="card-body">
          <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k || 'profile')} className="mb-3">
            <Tab eventKey="profile" title="Profil">
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ad Soyad</Form.Label>
                      <Form.Control type="text" defaultValue={user?.name || ''} placeholder="Ad Soyad" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>E-posta</Form.Label>
                      <Form.Control type="email" defaultValue={user?.email || ''} placeholder="E-posta" disabled />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Hakkımda</Form.Label>
                  <Form.Control as="textarea" rows={4} placeholder="Kendiniz hakkında kısa bir bilgi" />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="primary">Kaydet</Button>
                </div>
              </Form>
            </Tab>

            <Tab eventKey="password" title="Şifre">
              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mevcut Şifre</Form.Label>
                      <Form.Control type="password" placeholder="Mevcut şifreniz" />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yeni Şifre</Form.Label>
                      <Form.Control type="password" placeholder="Yeni şifre" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yeni Şifre (Tekrar)</Form.Label>
                      <Form.Control type="password" placeholder="Yeni şifre tekrar" />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button variant="primary">Şifreyi Güncelle</Button>
                </div>
              </Form>
            </Tab>

            <Tab eventKey="notifications" title="Bildirimler">
              <Form>
                <Form.Check className="mb-2" type="switch" id="email-notifs" label="E-posta bildirimleri" defaultChecked />
                <Form.Check className="mb-2" type="switch" id="offer-notifs" label="Teklif bildirimleri" defaultChecked />
                <Form.Check className="mb-3" type="switch" id="message-notifs" label="Mesaj bildirimleri" defaultChecked />
                <div className="d-flex justify-content-end">
                  <Button variant="primary">Tercihleri Kaydet</Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;


