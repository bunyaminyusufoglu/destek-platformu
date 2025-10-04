import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import { 
  Card,
  Container,
  Table, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Spinner, 
  Alert, 
  Badge,
  Pagination,
  ButtonGroup
} from 'react-bootstrap';
import { 
  FaEdit, 
  FaTrash,
  FaKey, 
  FaSearch,
  FaUserShield,
  FaUserTie,
  FaUser
} from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers(currentPage, 10);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      isUser: user.isUser,
      isExpert: user.isExpert,
      isAdmin: user.isAdmin,
      skills: user.skills || []
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      await adminAPI.updateUser(selectedUser._id, editForm);
      setShowEditModal(false);
      fetchUsers();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı güncellenirken hata oluştu');
    }
  };

  const handleResetPassword = async () => {
    try {
      await adminAPI.resetUserPassword(selectedUser._id, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Şifre sıfırlanırken hata oluştu');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      fetchUsers();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Kullanıcı silinirken hata oluştu');
    }
  };

  const getRoleBadge = (user) => {
    const badges = [];
    if (user.isAdmin) badges.push(<Badge key="admin" bg="danger">Admin</Badge>);
    if (user.isExpert) badges.push(<Badge key="expert" bg="success">Uzman</Badge>);
    if (user.isUser) badges.push(<Badge key="user" bg="primary">Kullanıcı</Badge>);
    return badges;
  };

  const getRoleIcon = (user) => {
    if (user.isAdmin) return <FaUserShield className="text-danger" />;
    if (user.isExpert) return <FaUserTie className="text-success" />;
    return <FaUser className="text-primary" />;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <Container fluid className="py-4">
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
            <Alert.Heading>Hata!</Alert.Heading>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2>Kullanıcı Yönetimi</h2>
              <Button variant="outline-primary" onClick={fetchUsers}>
                <FaSearch className="me-2" />
                Yenile
              </Button>
            </div>
          </Col>
        </Row>

        {/* Arama ve Filtreler */}
        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Kullanıcı adı veya email ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <div className="d-flex gap-2">
              <Badge bg="info" className="p-2">
                Toplam: {pagination.total} kullanıcı
              </Badge>
            </div>
          </Col>
        </Row>

        {/* Kullanıcı Tablosu */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Kullanıcı Listesi</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
        <thead>
          <tr>
            <th>Kullanıcı</th>
            <th>Email</th>
            <th>Roller</th>
            <th>Kayıt Tarihi</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>
                <div className="d-flex align-items-center">
                  {getRoleIcon(user)}
                  <span className="ms-2">{user.name}</span>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <div className="d-flex gap-1">
                  {getRoleBadge(user)}
                </div>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
              <td>
                <ButtonGroup size="sm">
                  <Button 
                    variant="outline-primary" 
                    onClick={() => handleEditUser(user)}
                    title="Düzenle"
                  >
                    <FaEdit />
                  </Button>
                  <Button 
                    variant="outline-warning" 
                    onClick={() => {
                      setSelectedUser(user);
                      setShowPasswordModal(true);
                    }}
                    title="Şifre Sıfırla"
                  >
                    <FaKey />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDeleteModal(true);
                    }}
                    title="Sil"
                  >
                    <FaTrash />
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sayfalama */}
        {pagination.pages > 1 && (
          <Row className="mt-4">
            <Col>
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.Prev 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                  {[...Array(pagination.pages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    disabled={currentPage === pagination.pages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </Pagination>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      {/* Kullanıcı Düzenleme Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Kullanıcı Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ad Soyad</Form.Label>
                  <Form.Control
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Roller</Form.Label>
                  <div className="d-flex gap-3">
                    <Form.Check
                      type="checkbox"
                      label="Kullanıcı"
                      checked={editForm.isUser}
                      onChange={(e) => setEditForm({...editForm, isUser: e.target.checked})}
                    />
                    <Form.Check
                      type="checkbox"
                      label="Uzman"
                      checked={editForm.isExpert}
                      onChange={(e) => setEditForm({...editForm, isExpert: e.target.checked})}
                    />
                    <Form.Check
                      type="checkbox"
                      label="Admin"
                      checked={editForm.isAdmin}
                      onChange={(e) => setEditForm({...editForm, isAdmin: e.target.checked})}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            İptal
          </Button>
          <Button variant="primary" onClick={handleUpdateUser}>
            Güncelle
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Şifre Sıfırlama Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Şifre Sıfırla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Yeni Şifre</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
            />
          </Form.Group>
          <Alert variant="warning" className="mt-2">
            <small>Kullanıcıya yeni şifreyi güvenli bir şekilde iletin.</small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            İptal
          </Button>
          <Button variant="warning" onClick={handleResetPassword}>
            Şifreyi Sıfırla
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Silme Onay Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Kullanıcıyı Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <strong>Dikkat!</strong> Bu işlem geri alınamaz. 
            {selectedUser?.name} kullanıcısı ve tüm verileri kalıcı olarak silinecek.
          </Alert>
          <p>Kullanıcı: <strong>{selectedUser?.name}</strong></p>
          <p>Email: <strong>{selectedUser?.email}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Kullanıcıyı Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
