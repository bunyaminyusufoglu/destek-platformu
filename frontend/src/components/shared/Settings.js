import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Form, Button, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const Settings = () => {
  const { user, updateProfile, changePassword, isExpert } = useAuth();
  
  const [activeKey, setActiveKey] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profil form state
  const [profileData, setProfileData] = useState({
    name: '',
    skills: []
  });
  const [skillsInput, setSkillsInput] = useState('');

  // Şifre form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        skills: user.skills || []
      });
    }
  }, [user]);

  // Profil form handler'ları
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSkillsInputChange = (e) => {
    setSkillsInput(e.target.value);
  };

  const addSkill = () => {
    if (skillsInput.trim() && !profileData.skills.includes(skillsInput.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillsInput.trim()]
      }));
      setSkillsInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(profileData);
      setSuccess('Profil bilgileri başarıyla güncellendi');
      // Form state'i güncelle
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Şifre form handler'ları
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validasyon
    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Şifre başarıyla değiştirildi');
      // Formu temizle
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header">
          <strong>Ayarlar</strong>
        </div>
        <div className="card-body">
          {(error || success) && (
            <Alert 
              variant={error ? 'danger' : 'success'} 
              dismissible 
              onClose={() => {
                setError('');
                setSuccess('');
              }}
              className="mb-3"
            >
              {error ? (
                <>
                  <FaExclamationTriangle className="me-2" />
                  {error}
                </>
              ) : (
                success
              )}
            </Alert>
          )}

          <Tabs activeKey={activeKey} onSelect={(k) => {
            setActiveKey(k || 'profile');
            setError('');
            setSuccess('');
          }} className="mb-3">
            <Tab eventKey="profile" title="Profil">
              <Form onSubmit={handleProfileSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ad Soyad</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        placeholder="Ad Soyad"
                        required
                        minLength={2}
                        maxLength={50}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>E-posta</Form.Label>
                      <Form.Control
                        type="email"
                        value={user?.email || ''}
                        placeholder="E-posta"
                        disabled
                      />
                      <Form.Text className="text-muted">
                        E-posta adresi değiştirilemez
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {isExpert && (
                  <Form.Group className="mb-3">
                    <Form.Label>Yetenekler (Skills)</Form.Label>
                    <InputGroup className="mb-2">
                      <Form.Control
                        type="text"
                        value={skillsInput}
                        onChange={handleSkillsInputChange}
                        placeholder="Yetenek ekle (örn: JavaScript, React)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button variant="outline-secondary" onClick={addSkill}>
                        Ekle
                      </Button>
                    </InputGroup>
                    {profileData.skills.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {profileData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="badge bg-primary d-flex align-items-center gap-1"
                            style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                          >
                            {skill}
                            <FaTimes
                              style={{ cursor: 'pointer' }}
                              onClick={() => removeSkill(skill)}
                            />
                          </span>
                        ))}
                      </div>
                    )}
                    <Form.Text className="text-muted">
                      Uzman iseniz, sahip olduğunuz yetenekleri ekleyin
                    </Form.Text>
                  </Form.Group>
                )}

                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                </div>
              </Form>
            </Tab>

            <Tab eventKey="password" title="Şifre">
              <Form onSubmit={handlePasswordSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mevcut Şifre</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Mevcut şifreniz"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yeni Şifre</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Yeni şifre (min. 6 karakter)"
                        required
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Yeni Şifre (Tekrar)</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Yeni şifre tekrar"
                        required
                        minLength={6}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                  </Button>
                </div>
              </Form>
            </Tab>

            <Tab eventKey="notifications" title="Bildirimler">
              <Form>
                <Form.Check
                  className="mb-2"
                  type="switch"
                  id="email-notifs"
                  label="E-posta bildirimleri"
                  defaultChecked
                />
                <Form.Check
                  className="mb-2"
                  type="switch"
                  id="offer-notifs"
                  label="Teklif bildirimleri"
                  defaultChecked
                />
                <Form.Check
                  className="mb-3"
                  type="switch"
                  id="message-notifs"
                  label="Mesaj bildirimleri"
                  defaultChecked
                />
                <Alert variant="info">
                  Bildirim ayarları yakında eklenecektir.
                </Alert>
              </Form>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;
