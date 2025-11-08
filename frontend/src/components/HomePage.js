import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Accordion } from 'react-bootstrap';
import { FaUsers, FaHandsHelping, FaShieldAlt, FaRocket, FaStar, FaTools, FaCheckCircle } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <h1 className="hero-title">
                Teknik Destek Platformu
              </h1>
              <p className="hero-subtitle">
                Uzmanlardan anında destek alın, sorunlarınızı hızlıca çözün. 
                Güvenilir ve profesyonel teknik destek hizmeti.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="hero-btn-primary">
                  <FaRocket className="me-2" />
                  Hemen Başla
                </Link>
                <Link to="/login" className="hero-btn-secondary">
                  Giriş Yap
                </Link>
              </div>
            </Col>
            <Col lg={6} className="hero-visual">
              <div className="hero-image-container">
                <div className="main-icon">
                  <FaUsers size="8rem" className="text-white-50" />
                </div>
                <div className="floating-card card-1">
                  <FaHandsHelping size="1.5rem" />
                  <span>Hızlı Destek</span>
                </div>
                <div className="floating-card card-2">
                  <FaShieldAlt size="1.2rem" />
                  <span>Güvenli</span>
                </div>
                <div className="floating-card card-3">
                  <FaRocket size="1rem" />
                  <span>Kolay</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Neden Destek Platformu?</h2>
              <p className="section-subtitle">
                Modern teknolojilerle donatılmış platformumuzla teknik sorunlarınızı çözebilirsiniz.
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">
                    <FaUsers size="2rem" />
                  </div>
                  <Card.Title>Uzman Topluluk</Card.Title>
                  <Card.Text>
                    Alanında uzman kişilerden oluşan güvenilir topluluğumuzdan profesyonel destek alın.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">
                    <FaHandsHelping size="2rem" />
                  </div>
                  <Card.Title>Hızlı Çözüm</Card.Title>
                  <Card.Text>
                    Sorunlarınızı en kısa sürede çözmek için optimize edilmiş sistemimizle destek alın.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center">
                  <div className="feature-icon">
                    <FaShieldAlt size="2rem" />
                  </div>
                  <Card.Title>Güvenli Platform</Card.Title>
                  <Card.Text>
                    Verilerinizin güvenliği için en üst düzey güvenlik önlemleri alınmıştır.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="text-center">
            <Col md={8} className="mx-auto">
              <h2 className="cta-title">Hemen Başlayın</h2>
              <p className="cta-subtitle">
                Teknik sorunlarınızı çözmek için bugün kayıt olun.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="cta-btn-primary">
                  <FaRocket className="me-2" />
                  Ücretsiz Kayıt Ol
                </Link>
                <Link to="/login" className="cta-btn-secondary">
                  Zaten Hesabım Var
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="home-stats-section">
        <Container>
          <Row className="g-3">
            <Col xs={6} md={3}>
              <div className="home-stats-card">
                <div className="home-stats-icon bg-success-subtle text-success">
                  <FaUsers />
                </div>
                <div>
                  <div className="home-stats-value">1.200+</div>
                  <div className="home-stats-label">Kayıtlı Kullanıcı</div>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="home-stats-card">
                <div className="home-stats-icon bg-primary-subtle text-primary">
                  <FaTools />
                </div>
                <div>
                  <div className="home-stats-value">350+</div>
                  <div className="home-stats-label">Uzman</div>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="home-stats-card">
                <div className="home-stats-icon bg-warning-subtle text-warning">
                  <FaCheckCircle />
                </div>
                <div>
                  <div className="home-stats-value">1.500+</div>
                  <div className="home-stats-label">Çözülen Talep</div>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="home-stats-card">
                <div className="home-stats-icon bg-info-subtle text-info">
                  <FaStar />
                </div>
                <div>
                  <div className="home-stats-value">%98</div>
                  <div className="home-stats-label">Memnuniyet</div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 className="section-title">Kullanıcılarımız Ne Diyor?</h2>
              <p className="section-subtitle">Gerçek deneyimler, gerçek sonuçlar.</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="testimonial-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3 gap-2 text-warning">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <Card.Text>
                    “Sorunum birkaç saat içinde çözüldü. Süreç çok kolay ve güven vericiydi.”
                  </Card.Text>
                  <div className="testimonial-user">Ali K.</div>
                  <small className="text-muted">Web Geliştirici</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="testimonial-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3 gap-2 text-warning">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <Card.Text>
                    “Uzmanlar çok ilgiliydi. Projem için doğru yönlendirmeler aldım.”
                  </Card.Text>
                  <div className="testimonial-user">Ece T.</div>
                  <small className="text-muted">Girişimci</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="testimonial-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3 gap-2 text-warning">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <Card.Text>
                    “Güvenli ve hızlı. Artık teknik işler için ilk durağım burası.”
                  </Card.Text>
                  <div className="testimonial-user">Murat D.</div>
                  <small className="text-muted">Freelancer</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="steps-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="section-title">Nasıl Çalışır?</h2>
              <p className="section-subtitle">Sadece 3 adımda destek alın</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <div className="step-card">
                <div className="step-number">1</div>
                <h4>Destek Talebi Oluştur</h4>
                <p>
                  Teknik sorununuzu detaylı bir şekilde açıklayarak destek talebi oluşturun.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="step-card">
                <div className="step-number">2</div>
                <h4>Uzman Teklifleri Al</h4>
                <p>
                  Uzmanlarımız tekliflerini gönderir, en uygun olanını seçebilirsiniz.
                </p>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="step-card">
                <div className="step-number">3</div>
                <h4>Çözümü Al</h4>
                <p>
                  Seçtiğiniz uzmanla iletişime geçin ve sorununuzu birlikte çözün.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 className="section-title">Sık Sorulan Sorular</h2>
              <p className="section-subtitle">Kısa cevaplarla aklınızdaki sorular.</p>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={12}>
              <Accordion defaultActiveKey="0" flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Nasıl destek talebi oluştururum?</Accordion.Header>
                  <Accordion.Body>
                    Kayıt olup giriş yaptıktan sonra menüden “Yeni Destek Talebi Oluştur” bölümüne giderek birkaç adımda talebinizi iletebilirsiniz.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Uzmanlar nasıl seçiliyor?</Accordion.Header>
                  <Accordion.Body>
                    Uzmanlarımız başvurularını gönderir. Profil, değerlendirme ve teklif içeriğine göre istediğiniz uzmanı seçebilirsiniz.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Güvenlik ve gizlilik nasıl sağlanıyor?</Accordion.Header>
                  <Accordion.Body>
                    Tüm iletişim ve veriler güvenli altyapı üzerinde saklanır, kişisel bilgileriniz gizli tutulur.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Container>
          <Row className="text-center">
            <Col>
              <p className="footer-text">© 2024 Destek Platformu. Tüm hakları saklıdır.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
