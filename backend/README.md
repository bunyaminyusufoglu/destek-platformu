# Destek Platformu Backend API

Öğrenci-uzman eşleştirme platformu için Node.js/Express backend API'si.

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama
- JWT token tabanlı authentication
- Bcrypt ile şifre hashleme
- Öğrenci/Uzman rol sistemi
- Input validation (Joi)

### 📝 Destek Talepleri
- Öğrenciler yardım talebi oluşturabilir
- Talep güncelleme/silme (sadece talep sahibi)
- Talep durumu takibi (open, assigned, in_progress, completed, cancelled)

### 💼 Teklif Sistemi
- Uzmanlar taleplere teklif gönderebilir
- Teklif kabul/red işlemleri
- Otomatik hoş geldin mesajları

### 💬 Gerçek Zamanlı Mesajlaşma
- Socket.io ile anında mesajlaşma
- Typing indicators
- Read receipts
- Bildirimler

### 🛡️ Güvenlik
- Helmet güvenlik header'ları
- Rate limiting (100 istek/15dk)
- CORS domain kısıtlaması
- Input sanitization

## 📦 Kurulum

```bash
# Dependencies yükle
npm install

# Environment variables ayarla
cp .env.example .env
# .env dosyasını düzenle

# Development server başlat
npm run dev

# Production server başlat
npm start
```

## 🔧 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_super_secret_jwt_key

# CORS
FRONTEND_URL=http://localhost:3000
```

## 📚 API Endpoints

### Authentication
```
POST /api/auth/register     # Kullanıcı kaydı
POST /api/auth/login        # Giriş yap
```

### Support Requests
```
POST   /api/support/create     # Talep oluştur
GET    /api/support            # Tüm talepleri listele
GET    /api/support/:id        # Tekil talep getir
PUT    /api/support/:id        # Talep güncelle
DELETE /api/support/:id        # Talep sil
```

### Offers
```
POST /api/offers/create                    # Teklif gönder
GET  /api/offers/request/:requestId        # Talebe gelen teklifler
GET  /api/offers/my-offers                 # Uzmanın teklifleri
PUT  /api/offers/:offerId/accept          # Teklif kabul
PUT  /api/offers/:offerId/reject          # Teklif reddet
```

### Messages
```
POST /api/messages/send                           # Mesaj gönder
GET  /api/messages/conversation/:conversationId   # Konuşma mesajları
GET  /api/messages/my-conversations              # Konuşmalarım
PUT  /api/messages/:messageId/read               # Mesaj okundu işaretle
PUT  /api/messages/conversation/:id/read-all     # Tüm mesajları okundu işaretle
```

### Protected
```
GET /api/protected/dashboard    # Kullanıcı dashboard
```

## 🔌 Socket.io Events

### Client → Server
```javascript
socket.emit('join_conversation', conversationId);
socket.emit('leave_conversation', conversationId);
socket.emit('typing', { conversationId, isTyping: true });
socket.emit('mark_as_read', { conversationId });
```

### Server → Client
```javascript
socket.on('new_message', (data) => { /* yeni mesaj */ });
socket.on('message_read', (data) => { /* mesaj okundu */ });
socket.on('user_typing', (data) => { /* kullanıcı yazıyor */ });
socket.on('notification', (data) => { /* bildirim */ });
```

## 🔑 Authentication

API istekleri için Authorization header kullanın:

```javascript
headers: {
  'Authorization': 'Bearer <JWT_TOKEN>',
  'Content-Type': 'application/json'
}
```

## 📊 Veritabanı Modelleri

### User
```javascript
{
  isStudent: Boolean,
  isExpert: Boolean,
  name: String,
  email: String (unique),
  password: String (hashed),
  skills: [String]
}
```

### SupportRequest
```javascript
{
  title: String,
  description: String,
  budget: Number,
  deadline: Date,
  skills: [String],
  status: String (open|assigned|in_progress|completed|cancelled),
  student: ObjectId (ref: User),
  expert: ObjectId (ref: User),
  assignedAt: Date,
  completedAt: Date
}
```

### Offer
```javascript
{
  supportRequest: ObjectId (ref: SupportRequest),
  expert: ObjectId (ref: User),
  message: String,
  proposedPrice: Number,
  estimatedDuration: String,
  status: String (pending|accepted|rejected|cancelled),
  respondedAt: Date
}
```

### Message
```javascript
{
  conversation: ObjectId (ref: SupportRequest),
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  content: String,
  messageType: String (text|image|file|offer_response),
  isRead: Boolean,
  readAt: Date,
  relatedOffer: ObjectId (ref: Offer)
}
```

## 🧪 Test

```bash
# Test çalıştır (gelecekte eklenecek)
npm test
```

## 🚀 Production Deployment

### Heroku
```bash
# Heroku CLI ile
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGO_URI=your_mongo_uri
git push heroku main
```

### Railway
```bash
# Railway CLI ile
railway login
railway init
railway up
```

## 📝 API Test

Postman collection'ı kullanarak API'yi test edebilirsiniz:

1. `POST /api/auth/register` - Kullanıcı kaydı
2. `POST /api/auth/login` - Token al
3. Header'a `Authorization: Bearer <token>` ekle
4. Diğer endpoint'leri test et

## 🔧 Development

```bash
# Code linting (gelecekte eklenecek)
npm run lint

# Code formatting (gelecekte eklenecek)
npm run format
```

## 📄 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

- Email: your-email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

**Not:** Bu backend API'si production-ready durumda. Frontend geliştirmeye başlayabilirsiniz!
