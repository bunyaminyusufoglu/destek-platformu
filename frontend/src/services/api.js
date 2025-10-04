import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
api.interceptors.request.use(
  (config) => {
    // Admin endpoint'leri için admin token kullan
    if (config.url.startsWith('/admin')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Normal endpoint'ler için user token kullan
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Admin endpoint'leri için admin token temizle
      if (error.config.url.startsWith('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        window.location.href = '/admin';
      } else {
        // Normal endpoint'ler için user token temizle
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Kullanıcı kaydı
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Giriş yap
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

// Support API functions
export const supportAPI = {
  // Tüm destek taleplerini getir
  getRequests: async () => {
    const response = await api.get('/support');
    return response.data;
  },

  // Destek talebi oluştur
  createRequest: async (requestData) => {
    const response = await api.post('/support/create', requestData);
    return response.data;
  },

  // Tekil talep getir
  getRequest: async (id) => {
    const response = await api.get(`/support/${id}`);
    return response.data;
  },

  // Talep güncelle
  updateRequest: async (id, requestData) => {
    const response = await api.put(`/support/${id}`, requestData);
    return response.data;
  },

  // Talep sil
  deleteRequest: async (id) => {
    const response = await api.delete(`/support/${id}`);
    return response.data;
  },

  // Kullanıcının kendi taleplerini getir
  getMyRequests: async () => {
    const response = await api.get('/support/my-requests');
    return response.data;
  },
};

// Offer API functions
export const offerAPI = {
  // Teklif gönder
  createOffer: async (offerData) => {
    const response = await api.post('/offers/create', offerData);
    return response.data;
  },

  // Talebe gelen teklifleri getir
  getRequestOffers: async (requestId) => {
    const response = await api.get(`/offers/request/${requestId}`);
    return response.data;
  },

  // Uzmanın tekliflerini getir
  getMyOffers: async () => {
    const response = await api.get('/offers/my-offers');
    return response.data;
  },

  // Teklif kabul et
  acceptOffer: async (offerId) => {
    const response = await api.put(`/offers/${offerId}/accept`);
    return response.data;
  },

  // Teklif reddet
  rejectOffer: async (offerId) => {
    const response = await api.put(`/offers/${offerId}/reject`);
    return response.data;
  },
};

// Message API functions
export const messageAPI = {
  // Mesaj gönder
  sendMessage: async (messageData) => {
    const response = await api.post('/messages/send', messageData);
    return response.data;
  },

  // Konuşma mesajlarını getir
  getConversation: async (conversationId, page = 1, limit = 50) => {
    const response = await api.get(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Kullanıcının konuşmalarını getir
  getMyConversations: async () => {
    const response = await api.get('/messages/my-conversations');
    return response.data;
  },

  // Mesajı okundu işaretle
  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  // Konuşmadaki tüm mesajları okundu işaretle
  markAllAsRead: async (conversationId) => {
    const response = await api.put(`/messages/conversation/${conversationId}/read-all`);
    return response.data;
  },
};

// Admin API functions
export const adminAPI = {
  // Dashboard istatistikleri
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Kullanıcı yönetimi
  getAllUsers: async (page = 1, limit = 10) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  resetUserPassword: async (id, newPassword) => {
    const response = await api.put(`/admin/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  // Destek talepleri yönetimi
  getAllSupportRequests: async (page = 1, limit = 10, status = null) => {
    let url = `/admin/support-requests?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  updateSupportRequest: async (id, requestData) => {
    const response = await api.put(`/admin/support-requests/${id}`, requestData);
    return response.data;
  },

  deleteSupportRequest: async (id) => {
    const response = await api.delete(`/admin/support-requests/${id}`);
    return response.data;
  },
};

export default api;
