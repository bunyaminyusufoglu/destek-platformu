import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import supportRoutes from "./routes/support.js";
import offerRoutes from "./routes/offer.js";
import messageRoutes from "./routes/message.js";
import adminRoutes from "./routes/admin.js";
import settingsRoutes from "./routes/settings.js";
import connectDB from "./config/db.js";

// Environment variables yükle
dotenv.config();


const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(helmet());

// CORS sadece izin verilen origin'e açılır
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
}));

// Rate limiting
app.set("trust proxy", 1);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // pencere başına 100 istek
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);


// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    
    // User bilgisini socket'e ekle
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.userEmail} (${socket.id})`);

  // Kullanıcıyı kendi room'una join et
  socket.join(`user_${socket.userId}`);

  // Konuşmaya join ol
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`📨 User ${socket.userEmail} joined conversation ${conversationId}`);
  });

  // Konuşmadan ayrıl
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`📤 User ${socket.userEmail} left conversation ${conversationId}`);
  });

  // Mesaj gönder
  socket.on('send_message', (data) => {
    // Mesaj veritabanına kaydedildikten sonra bu event tetiklenecek
    socket.to(`conversation_${data.conversationId}`).emit('new_message', data);
  });

  // Mesaj okundu işaretle
  socket.on('mark_as_read', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('message_read', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: data.isTyping
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.userEmail}`);
  });
});

// Socket.io instance'ını export et (route'larda kullanmak için)
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Database bağlantısı
connectDB();

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io server ready`);
});
