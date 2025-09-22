import express from "express";
import Offer from "../models/Offer.js";
import SupportRequest from "../models/SupportRequest.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate, createOfferSchema, validateObjectId } from "../middleware/validation.js";

const router = express.Router();

// Teklif gönder (sadece uzmanlar)
router.post("/create", authMiddleware, validate(createOfferSchema), async (req, res) => {
  try {
    const { supportRequestId, message, proposedPrice, estimatedDuration } = req.body;

    // Kullanıcı bilgisi çek
    const user = await User.findById(req.user.id);
    if (!user || !user.isExpert) {
      return res.status(403).json({ message: "Yalnızca uzmanlar teklif gönderebilir" });
    }

    // Talep var mı kontrol et
    const supportRequest = await SupportRequest.findById(supportRequestId);
    if (!supportRequest) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }

    // Talep açık mı kontrol et
    if (supportRequest.status !== "open") {
      return res.status(400).json({ message: "Bu talep artık teklif almıyor" });
    }

    // Kendi talebine teklif gönderemez
    if (supportRequest.student.toString() === req.user.id) {
      return res.status(400).json({ message: "Kendi talebinize teklif gönderemezsiniz" });
    }

    const newOffer = new Offer({
      supportRequest: supportRequestId,
      expert: req.user.id,
      message,
      proposedPrice,
      estimatedDuration
    });

    await newOffer.save();
    
    // Teklif bilgilerini populate et
    const populatedOffer = await Offer.findById(newOffer._id)
      .populate("expert", "name email skills")
      .populate("supportRequest", "title budget deadline");

    res.status(201).json({ 
      message: "Teklif başarıyla gönderildi", 
      offer: populatedOffer 
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Bu talebe zaten teklif gönderdiniz" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Bir talebe gelen teklifleri listele (talep sahibi)
router.get("/request/:requestId", authMiddleware, validateObjectId("requestId"), async (req, res) => {
  try {
    const supportRequest = await SupportRequest.findById(req.params.requestId);
    
    if (!supportRequest) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }

    // Sadece talep sahibi teklifleri görebilir
    if (supportRequest.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu talebe ait teklifleri göremezsiniz" });
    }

    const offers = await Offer.find({ supportRequest: req.params.requestId })
      .populate("expert", "name email skills")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Uzmanın gönderdiği teklifleri listele
router.get("/my-offers", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isExpert) {
      return res.status(403).json({ message: "Yalnızca uzmanlar bu endpoint'i kullanabilir" });
    }

    const offers = await Offer.find({ expert: req.user.id })
      .populate("supportRequest", "title budget deadline status")
      .populate("expert", "name email")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teklif kabul et (talep sahibi)
router.put("/:offerId/accept", authMiddleware, validateObjectId("offerId"), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId)
      .populate("supportRequest");

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı" });
    }

    // Sadece talep sahibi kabul edebilir
    if (offer.supportRequest.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu teklifi kabul edemezsiniz" });
    }

    // Teklif pending durumunda olmalı
    if (offer.status !== "pending") {
      return res.status(400).json({ message: "Bu teklif zaten yanıtlanmış" });
    }

    // Teklifi kabul et
    offer.status = "accepted";
    offer.respondedAt = new Date();
    await offer.save();

    // Talebi assigned yap ve uzmanı ata
    await SupportRequest.findByIdAndUpdate(offer.supportRequest._id, {
      status: "assigned",
      expert: offer.expert,
      assignedAt: new Date()
    });

    // Diğer teklifleri reddet
    await Offer.updateMany(
      { 
        supportRequest: offer.supportRequest._id, 
        _id: { $ne: offer._id },
        status: "pending"
      },
      { 
        status: "rejected", 
        respondedAt: new Date() 
      }
    );

    // Otomatik hoş geldin mesajları gönder
    const student = await User.findById(offer.supportRequest.student);
    const expert = await User.findById(offer.expert);

    // Öğrenciye hoş geldin mesajı
    const studentWelcomeMessage = new Message({
      conversation: offer.supportRequest._id,
      sender: offer.expert,
      receiver: offer.supportRequest.student,
      content: `Merhaba ${student.name}! Teklifimi kabul ettiğiniz için teşekkür ederim. Bu proje üzerinde birlikte çalışmaya başlayabiliriz. Size nasıl yardımcı olabilirim?`,
      messageType: "text",
      relatedOffer: offer._id
    });

    // Uzmana hoş geldin mesajı
    const expertWelcomeMessage = new Message({
      conversation: offer.supportRequest._id,
      sender: offer.supportRequest.student,
      receiver: offer.expert,
      content: `Merhaba ${expert.name}! Projemi kabul ettiğiniz için teşekkür ederim. Birlikte çalışmaya hazırım.`,
      messageType: "text",
      relatedOffer: offer._id
    });

    await Promise.all([studentWelcomeMessage.save(), expertWelcomeMessage.save()]);

    res.json({ 
      message: "Teklif kabul edildi ve mesajlaşma başlatıldı",
      conversationId: offer.supportRequest._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teklif reddet (talep sahibi)
router.put("/:offerId/reject", authMiddleware, validateObjectId("offerId"), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId)
      .populate("supportRequest");

    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı" });
    }

    // Sadece talep sahibi reddedebilir
    if (offer.supportRequest.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu teklifi reddedemezsiniz" });
    }

    // Teklif pending durumunda olmalı
    if (offer.status !== "pending") {
      return res.status(400).json({ message: "Bu teklif zaten yanıtlanmış" });
    }

    // Teklifi reddet
    offer.status = "rejected";
    offer.respondedAt = new Date();
    await offer.save();

    res.json({ message: "Teklif reddedildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
