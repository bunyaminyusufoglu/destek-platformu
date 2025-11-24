import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Kullanıcı giriş yapmamışsa socket bağlantısı kurma
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Socket.io bağlantısını kur
    const token = localStorage.getItem('token');
    if (!token) return;

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const socket = io(API_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Bağlantı başarılı
    socket.on('connect', () => {});

    // Bağlantı hatası
    socket.on('connect_error', () => {});

    // Bildirim al
    socket.on('notification', (data) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: data.type || 'info',
        title: getNotificationTitle(data),
        message: getNotificationMessage(data),
        data: data,
        read: false,
        createdAt: new Date()
      };
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Tarayıcı bildirimi göster (izin varsa)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/images/b6464.png'
        });
      }
    });

    // Mesaj bildirimi
    socket.on('new_message', () => {});

    // Bağlantı koptu
    socket.on('disconnect', () => {});

    // Tarayıcı bildirim izni iste
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user]);

  // Bildirim başlığı
  const getNotificationTitle = (data) => {
    switch (data.type) {
      case 'new_message':
        return 'Yeni Mesaj';
      case 'offer_approved':
        return 'Teklif Onaylandı';
      case 'offer_rejected':
        return 'Teklif Reddedildi';
      case 'payment_approved':
        return 'Ödeme Onaylandı';
      case 'payment_rejected':
        return 'Ödeme Reddedildi';
      case 'request_approved':
        return 'Talep Onaylandı';
      case 'request_rejected':
        return 'Talep Reddedildi';
      default:
        return 'Yeni Bildirim';
    }
  };

  // Bildirim mesajı
  const getNotificationMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        return data.sender?.name 
          ? `${data.sender.name} size mesaj gönderdi`
          : 'Yeni bir mesaj aldınız';
      case 'offer_approved':
        return 'Teklifiniz admin tarafından onaylandı';
      case 'offer_rejected':
        return 'Teklifiniz admin tarafından reddedildi';
      case 'payment_approved':
        return 'Ödemeniz onaylandı, proje başlatıldı';
      case 'payment_rejected':
        return 'Ödeme talebiniz reddedildi';
      case 'request_approved':
        return 'Destek talebiniz onaylandı';
      case 'request_rejected':
        return 'Destek talebiniz reddedildi';
      default:
        return data.message || 'Yeni bir bildiriminiz var';
    }
  };

  // Bildirimi okundu işaretle
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Tüm bildirimleri okundu işaretle
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  // Bildirimi sil
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  // Tüm bildirimleri temizle
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

