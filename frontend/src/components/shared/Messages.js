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
    () => {
      const found = conversations.find(c => c._id === selectedConversationId || c.conversationId === selectedConversationId);
      console.log('Seçili konuşma:', found);
      return found || null;
    },
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
      console.log('Konuşmalar yükleniyor...');
      const data = await messageAPI.getMyConversations();
      console.log('Konuşmalar yüklendi:', data);
      
      // Backend'den gelen formatı kontrol et
      let conversationsList = [];
      if (Array.isArray(data)) {
        conversationsList = data;
      } else if (data?.conversations && Array.isArray(data.conversations)) {
        conversationsList = data.conversations;
      } else if (data && typeof data === 'object') {
        // Backend doğrudan array döndürüyor olabilir
        conversationsList = Array.isArray(data) ? data : [];
      }
      
      console.log('İşlenen konuşmalar:', conversationsList);
      setConversations(conversationsList);
      
      // Auto-select first conversation
      if (!selectedConversationId && conversationsList.length > 0) {
        const firstId = conversationsList[0]?._id || conversationsList[0]?.conversationId;
        console.log('İlk konuşma seçiliyor:', firstId);
        if (firstId) setSelectedConversationId(firstId);
      }
    } catch (err) {
      console.error('Konuşmalar yüklenemedi:', err);
      console.error('Hata detayı:', err.response?.data);
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedConversationId]);

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoadingMessages(true);
      console.log('Mesajlar yükleniyor:', conversationId);
      const data = await messageAPI.getConversation(conversationId, 1, 100);
      console.log('Mesajlar yüklendi:', data);
      setMessages(Array.isArray(data) ? data : data?.messages || []);
      // Okundu işaretle (sessizce)
      try { await messageAPI.markAllAsRead(conversationId); } catch (_) {}
    } catch (err) {
      console.error('Mesajlar yüklenemedi:', err);
      console.error('Hata detayı:', err.response?.data);
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
      console.log('Mesaj gönderiliyor:', { conversationId: selectedConversationId, content: newMessage.trim() });
      const sent = await messageAPI.sendMessage({ conversationId: selectedConversationId, content: newMessage.trim() });
      console.log('Mesaj gönderildi:', sent);
      setMessages(prev => [...prev, sent?.message || sent?.data || sent]);
      setNewMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      console.error('Hata detayı:', err.response?.data);
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
                {conversations.map((conv) => {
                  const convId = conv._id || conv.conversationId;
                  return (
                    <ListGroup.Item
                      key={convId}
                      action
                      onClick={() => {
                        console.log('Konuşma seçiliyor:', conv);
                        setSelectedConversationId(convId);
                      }}
                      active={selectedConversationId === convId}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">{conv.supportRequest?.title || conv.title || conv.subject || 'Sohbet'}</div>
                        <div className="small text-muted">{conv.lastMessage?.content ? String(conv.lastMessage.content).slice(0, 48) : 'Henüz mesaj yok'}</div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge bg="primary" pill>{conv.unreadCount}</Badge>
                      )}
                    </ListGroup.Item>
                  );
                })}
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
            <div className="card-body chat-body">
              {messages.length === 0 && !loadingMessages && (
                <div className="text-muted">Bu konuşmada mesaj yok.</div>
              )}
              {messages.map((msg) => (
                <div key={msg._id || msg.id} className={`d-flex mb-3 ${isMessageMine(msg) ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div className={`chat-bubble ${isMessageMine(msg) ? 'mine' : 'theirs'}`}>
                    <div className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{String(msg.content || '')}</div>
                    <div className="chat-meta text-muted">
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


