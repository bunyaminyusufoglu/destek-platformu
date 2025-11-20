import React, { useState, useRef, useEffect } from 'react';
import { Badge, Dropdown, Button } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  // Dışarı tıklandığında dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  return (
    <div ref={dropdownRef} className="notification-bell-container" style={{ position: 'relative' }}>
      <Button
        variant="link"
        className="notification-bell-btn p-0"
        onClick={() => setShow(!show)}
        style={{
          position: 'relative',
          border: 'none',
          background: 'transparent',
          color: 'inherit',
          textDecoration: 'none'
        }}
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="notification-badge"
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              fontSize: '0.7rem',
              minWidth: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {show && <NotificationDropdown onClose={() => setShow(false)} />}
    </div>
  );
};

export default NotificationBell;

