import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, ListGroup, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const chatEndRef = useRef(null);

  const isMessageMine = useCallback((msg) => {
    if (!msg) return false;
    if (typeof msg.isMine === 'boolean') return msg.isMine;
    const myId = user?._id || user?.id;
    const senderId = msg.sender?._id || msg.senderId || msg.userId;
    return myId && senderId && String(myId) === String(senderId);
  }, [user]);

  const selectedConversation = useMemo(
    () => conversations.find(c => c._id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  );

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const data = await messageAPI.getMyConversations();
      setConversations(Array.isArray(data) ? data : data?.conversations || []);
      // Auto-select first conversation
      if (!selectedConversationId) {
        const firstId = (Array.isArray(data) ? data : data?.conversations || [])[0]?._id;
        if (firstId) setSelectedConversationId(firstId);
      }
    } catch (err) {
      console.error('Konuşmalar yüklenemedi:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedConversationId]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoadingMessages(true);
      const data = await messageAPI.getConversation(conversationId, 1, 100);
      setMessages(Array.isArray(data) ? data : data?.messages || []);
      // Okundu işaretle (sessizce)
      try { await messageAPI.markAllAsRead(conversationId); } catch (_) {}
    } catch (err) {
      console.error('Mesajlar yüklenemedi:', err);
    } finally {
      setLoadingMessages(false);
      // Slight delay to ensure DOM renders
      setTimeout(scrollToBottom, 50);
    }
  }, [scrollToBottom]);

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;
    try {
      setSending(true);
      const sent = await messageAPI.sendMessage({ conversationId: selectedConversationId, content: newMessage.trim() });
      setMessages(prev => [...prev, sent?.message || sent]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
    } finally {
      setSending(false);
    }
  }, [newMessage, selectedConversationId, scrollToBottom]);

  // Initial load
  useEffect(() => {
    loadConversations();
    // Scroll top on page mount
    window.scrollTo(0, 0);
  }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    loadMessages(selectedConversationId);
  }, [selectedConversationId, loadMessages]);

  // Lightweight polling for new messages
  useEffect(() => {
    if (!selectedConversationId) return;
    const interval = setInterval(() => {
      loadMessages(selectedConversationId);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedConversationId, loadMessages]);

  return (
    <div className="container-fluid mt-5">
      <Row>
        <Col lg={4} className="mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Konuşmalar</strong>
              {loadingConversations && <Spinner size="sm" animation="border" />}
            </div>
            <div className="card-body p-0" style={{ maxHeight: 600, overflowY: 'auto' }}>
              {conversations.length === 0 && !loadingConversations && (
                <div className="p-3 text-muted">Konuşma bulunamadı.</div>
              )}
              <ListGroup variant="flush">
                {conversations.map((conv) => (
                  <ListGroup.Item
                    key={conv._id}
                    action
                    onClick={() => setSelectedConversationId(conv._id)}
                    active={selectedConversationId === conv._id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold">{conv.title || conv.subject || 'Sohbet'}</div>
                      <div className="small text-muted">{conv.lastMessage?.content ? String(conv.lastMessage.content).slice(0, 48) : 'Henüz mesaj yok'}</div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge bg="primary" pill>{conv.unreadCount}</Badge>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </div>
        </Col>
        <Col lg={8}>
          <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>{selectedConversation?.title || selectedConversation?.subject || 'Sohbet'}</strong>
              {loadingMessages && <Spinner size="sm" animation="border" />}
            </div>
            <div className="card-body" style={{ maxHeight: 520, overflowY: 'auto' }}>
              {messages.length === 0 && !loadingMessages && (
                <div className="text-muted">Bu konuşmada mesaj yok.</div>
              )}
              {messages.map((msg) => (
                <div key={msg._id || msg.id} className={`d-flex mb-3 ${isMessageMine(msg) ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`p-2 rounded ${isMessageMine(msg) ? 'bg-primary text-white' : 'bg-light'}`} style={{ maxWidth: '75%' }}>
                    <div className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{String(msg.content || '')}</div>
                    <div className="small text-muted" style={{ opacity: 0.8 }}>
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="card-footer">
              <Form onSubmit={handleSend} className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Mesaj yazın..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button type="submit" disabled={sending || !selectedConversationId || !newMessage.trim()}>
                  {sending ? 'Gönderiliyor...' : 'Gönder'}
                </Button>
              </Form>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Messages;


