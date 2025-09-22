import express from "express";
import Message from "../models/Message.js";
import SupportRequest from "../models/SupportRequest.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate, validateObjectId } from "../middleware/validation.js";
import Joi from "joi";

const router = express.Router();

// Mesaj gönderme validation schema
const sendMessageSchema = Joi.object({
  conversationId: Joi.string().hex().length(24).required(),
  content: Joi.string().min(1).max(2000).required(),
  messageType: Joi.string().valid("text", "image", "file", "offer_response").default("text"),
  relatedOfferId: Joi.string().hex().length(24).optional()
});

// Mesaj gönder
router.post("/send", authMiddleware, validate(sendMessageSchema), async (req, res) => {
  try {
    const { conversationId, content, messageType, relatedOfferId } = req.body;

    // Destek talebi var mı kontrol et
    const supportRequest = await SupportRequest.findById(conversationId)
      .populate("student", "name email")
      .populate("expert", "name email");

    if (!supportRequest) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }

    // Kullanıcı bu konuşmaya dahil mi kontrol et
    const userId = req.user.id;
    const isStudent = supportRequest.student._id.toString() === userId;
    const isExpert = supportRequest.expert && supportRequest.expert._id.toString() === userId;

    if (!isStudent && !isExpert) {
      return res.status(403).json({ message: "Bu konuşmaya erişim yetkiniz yok" });
    }

    // Mesaj gönderebilmek için talep atanmış olmalı
    if (supportRequest.status === "open") {
      return res.status(400).json({ message: "Bu talep henüz atanmamış" });
    }

    // Alıcıyı belirle
    const receiver = isStudent ? supportRequest.expert : supportRequest.student;
    
    if (!receiver) {
      return res.status(400).json({ message: "Bu talep henüz atanmamış" });
    }

    const newMessage = new Message({
      conversation: conversationId,
      sender: userId,
      receiver: receiver._id,
      content,
      messageType,
      relatedOffer: relatedOfferId || null
    });

    await newMessage.save();

    // Mesaj bilgilerini populate et
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    // Socket.io ile gerçek zamanlı mesaj gönder
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('new_message', {
        message: populatedMessage,
        conversationId: conversationId
      });

      // Alıcıya bildirim gönder
      io.to(`user_${receiver._id}`).emit('notification', {
        type: 'new_message',
        conversationId: conversationId,
        message: populatedMessage,
        sender: populatedMessage.sender
      });
    }

    res.status(201).json({ 
      message: "Mesaj gönderildi", 
      data: populatedMessage 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Konuşma mesajlarını getir
router.get("/conversation/:conversationId", authMiddleware, validateObjectId("conversationId"), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Destek talebi var mı kontrol et
    const supportRequest = await SupportRequest.findById(conversationId)
      .populate("student", "name email")
      .populate("expert", "name email");

    if (!supportRequest) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }

    // Kullanıcı bu konuşmaya dahil mi kontrol et
    const userId = req.user.id;
    const isStudent = supportRequest.student._id.toString() === userId;
    const isExpert = supportRequest.expert && supportRequest.expert._id.toString() === userId;

    if (!isStudent && !isExpert) {
      return res.status(403).json({ message: "Bu konuşmaya erişim yetkiniz yok" });
    }

    // Mesajları getir
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("relatedOffer", "proposedPrice estimatedDuration")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Toplam mesaj sayısı
    const totalMessages = await Message.countDocuments({ conversation: conversationId });

    res.json({
      messages: messages.reverse(), // En eski mesajlar önce
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages
      },
      conversation: {
        supportRequest: {
          id: supportRequest._id,
          title: supportRequest.title,
          status: supportRequest.status
        },
        participants: {
          student: supportRequest.student,
          expert: supportRequest.expert
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kullanıcının konuşmalarını listele
router.get("/my-conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Kullanıcının dahil olduğu destek taleplerini getir
    const supportRequests = await SupportRequest.find({
      $or: [
        { student: userId },
        { expert: userId }
      ],
      status: { $in: ["assigned", "in_progress", "completed"] }
    })
      .populate("student", "name email")
      .populate("expert", "name email")
      .sort({ updatedAt: -1 });

    // Her konuşma için son mesajı ve okunmamış mesaj sayısını getir
    const conversationsWithLastMessage = await Promise.all(
      supportRequests.map(async (request) => {
        const lastMessage = await Message.findOne({ conversation: request._id })
          .sort({ createdAt: -1 })
          .populate("sender", "name");

        const unreadCount = await Message.countDocuments({
          conversation: request._id,
          receiver: userId,
          isRead: false
        });

        return {
          conversationId: request._id,
          supportRequest: {
            id: request._id,
            title: request.title,
            status: request.status,
            budget: request.budget,
            deadline: request.deadline
          },
          participants: {
            student: request.student,
            expert: request.expert
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.sender,
            createdAt: lastMessage.createdAt,
            messageType: lastMessage.messageType
          } : null,
          unreadCount,
          updatedAt: request.updatedAt
        };
      })
    );

    res.json(conversationsWithLastMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mesajı okundu olarak işaretle
router.put("/:messageId/read", authMiddleware, validateObjectId("messageId"), async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Mesaj bulunamadı" });
    }

    // Mesaj alıcısı bu kullanıcı mı kontrol et
    if (message.receiver.toString() !== userId) {
      return res.status(403).json({ message: "Bu mesajı okundu olarak işaretleyemezsiniz" });
    }

    // Zaten okunmuş mu kontrol et
    if (message.isRead) {
      return res.json({ message: "Mesaj zaten okunmuş" });
    }

    // Mesajı okundu olarak işaretle
    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    // Socket.io ile okundu bilgisini gönder
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${message.conversation}`).emit('message_read', {
        messageId: message._id,
        readBy: userId,
        readAt: message.readAt
      });
    }

    res.json({ message: "Mesaj okundu olarak işaretlendi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Konuşmadaki tüm mesajları okundu olarak işaretle
router.put("/conversation/:conversationId/read-all", authMiddleware, validateObjectId("conversationId"), async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Destek talebi var mı kontrol et
    const supportRequest = await SupportRequest.findById(conversationId);

    if (!supportRequest) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }

    // Kullanıcı bu konuşmaya dahil mi kontrol et
    const isStudent = supportRequest.student.toString() === userId;
    const isExpert = supportRequest.expert && supportRequest.expert.toString() === userId;

    if (!isStudent && !isExpert) {
      return res.status(403).json({ message: "Bu konuşmaya erişim yetkiniz yok" });
    }

    // Okunmamış mesajları okundu olarak işaretle
    const result = await Message.updateMany(
      { 
        conversation: conversationId, 
        receiver: userId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Socket.io ile okundu bilgisini gönder
    const io = req.app.get('io');
    if (io && result.modifiedCount > 0) {
      io.to(`conversation_${conversationId}`).emit('conversation_read', {
        conversationId: conversationId,
        readBy: userId,
        readAt: new Date()
      });
    }

    res.json({ 
      message: "Tüm mesajlar okundu olarak işaretlendi",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
