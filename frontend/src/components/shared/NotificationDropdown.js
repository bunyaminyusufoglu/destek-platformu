import React from 'react';
import { Card, ListGroup, Button, Badge } from 'react-bootstrap';
import { useNotifications } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaEnvelope, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaMoneyBillWave,
  FaFileAlt,
  FaTrash,
  FaCheckDouble
} from 'react-icons/fa';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    // Bildirimi okundu işaretle
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Bildirim tipine göre yönlendir
    const { type, data } = notification;
    
    switch (type) {
      case 'new_message':
        if (data?.conversationId) {
          navigate('/messages');
          onClose();
        }
        break;
      case 'offer_approved':
      case 'offer_rejected':
        navigate('/my-offers');
        onClose();
        break;
      case 'payment_approved':
      case 'payment_rejected':
        navigate('/dashboard');
        onClose();
        break;
      case 'request_approved':
      case 'request_rejected':
        navigate('/my-requests');
        onClose();
        break;
      default:
        navigate('/dashboard');
        onClose();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return <FaEnvelope className="text-primary" />;
      case 'offer_approved':
      case 'request_approved':
      case 'payment_approved':
        return <FaCheckCircle className="text-success" />;
      case 'offer_rejected':
      case 'request_rejected':
      case 'payment_rejected':
        return <FaTimesCircle className="text-danger" />;
      case 'payment_approved':
        return <FaMoneyBillWave className="text-success" />;
      default:
        return <FaFileAlt className="text-info" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return new Date(date).toLocaleDateString('tr-TR');
  };

  return (
    <Card
      className="notification-dropdown"
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '8px',
        width: '350px',
        maxWidth: '90vw',
        maxHeight: '500px',
        zIndex: 1050,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #dee2e6'
      }}
    >
      <Card.Header className="d-flex justify-content-between align-items-center bg-light">
        <div className="d-flex align-items-center">
          <strong>Bildirimler</strong>
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 me-2"
              onClick={markAllAsRead}
              title="Tümünü okundu işaretle"
            >
              <FaCheckDouble />
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-danger"
              onClick={clearAll}
              title="Tümünü temizle"
            >
              <FaTrash />
            </Button>
          )}
        </div>
      </Card.Header>
      
      <Card.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div className="text-center text-muted p-4">
            <FaEnvelope size={48} className="mb-3 opacity-50" />
            <p className="mb-0">Henüz bildiriminiz yok</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                style={{
                  cursor: 'pointer',
                  backgroundColor: !notification.read ? '#f8f9fa' : 'white',
                  borderLeft: !notification.read ? '3px solid #0d6efd' : '3px solid transparent',
                  padding: '12px'
                }}
                onClick={() => handleNotificationClick(notification)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = !notification.read ? '#e9ecef' : '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = !notification.read ? '#f8f9fa' : 'white';
                }}
              >
                <div className="d-flex align-items-start">
                  <div className="me-3 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="notification-title" style={{ fontSize: '0.9rem' }}>
                        {notification.title}
                      </strong>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 ms-2 text-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        title="Sil"
                      >
                        <FaTrash size={12} />
                      </Button>
                    </div>
                    <p className="notification-message mb-1" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      {notification.message}
                    </p>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {formatTime(notification.createdAt)}
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      
      {notifications.length > 0 && (
        <Card.Footer className="bg-light text-center">
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              navigate('/dashboard');
              onClose();
            }}
          >
            Tümünü Görüntüle
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};

export default NotificationDropdown;

