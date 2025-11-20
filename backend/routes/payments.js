import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import PaymentRequest from "../models/PaymentRequest.js";
import Offer from "../models/Offer.js";
import SupportRequest from "../models/SupportRequest.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { validateObjectId } from "../middleware/validation.js";

const router = express.Router();

// User: Create payment request for an offer
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const { offerId } = req.body || {};
    if (!offerId || !offerId.match(/^[a-fA-F0-9]{24}$/)) {
      return res.status(400).json({ message: "Geçersiz teklif kimliği" });
    }

    const offer = await Offer.findById(offerId).populate("supportRequest");
    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı" });
    }

    // Only the request owner can initiate payment
    if (offer.supportRequest.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu teklif için ödeme başlatma yetkiniz yok" });
    }

    // Offer must be admin_approved to proceed
    if (offer.adminApprovalStatus !== "approved" || offer.status !== "admin_approved") {
      return res.status(400).json({ message: "Bu teklif henüz ödeme için uygun değil" });
    }

    // If an existing pending payment request exists, reuse it
    const existing = await PaymentRequest.findOne({ offer: offerId, status: "pending" });
    if (existing) {
      return res.json({ message: "Ödeme talebiniz zaten oluşturulmuş", paymentRequest: existing });
    }

    const pr = new PaymentRequest({
      offer: offer._id,
      payer: req.user.id,
      amount: offer.proposedPrice
    });
    await pr.save();

    res.status(201).json({ message: "Ödeme talebiniz oluşturuldu. Admin onayı bekleniyor.", paymentRequest: pr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: List pending payment requests
router.get("/admin/pending", adminMiddleware, async (req, res) => {
  try {
    const requests = await PaymentRequest.find({ status: "pending" })
      .populate({ path: "offer", populate: [{ path: "supportRequest" }, { path: "expert", select: "name email" }] })
      .populate("payer", "name email")
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Approve payment request -> accept offer and start conversation
router.put("/admin/:id/approve", adminMiddleware, validateObjectId("id"), async (req, res) => {
  try {
    const pr = await PaymentRequest.findById(req.params.id).populate({
      path: "offer",
      populate: [{ path: "supportRequest" }, { path: "expert" }]
    });
    if (!pr) {
      return res.status(404).json({ message: "Ödeme talebi bulunamadı" });
    }
    if (pr.status !== "pending") {
      return res.status(400).json({ message: "Bu ödeme talebi zaten işleme alınmış" });
    }

    const offer = await Offer.findById(pr.offer._id).populate("supportRequest");
    if (!offer) {
      return res.status(404).json({ message: "Teklif bulunamadı" });
    }
    if (offer.adminApprovalStatus !== "approved" || offer.status !== "admin_approved") {
      return res.status(400).json({ message: "Teklif ödeme onayı için uygun durumda değil" });
    }

    // Accept the offer
    offer.status = "accepted";
    offer.respondedAt = new Date();
    await offer.save();

    // Assign request to expert
    await SupportRequest.findByIdAndUpdate(offer.supportRequest._id, {
      status: "assigned",
      expert: offer.expert,
      assignedAt: new Date()
    });

    // Send welcome messages
    const user = await User.findById(offer.supportRequest.user);
    const expert = await User.findById(offer.expert);
    const userWelcomeMessage = new Message({
      conversation: offer.supportRequest._id,
      sender: offer.expert,
      receiver: offer.supportRequest.user,
      content: `Merhaba ${user.name}! Ödemeniz onaylandı. Projeye başlayabiliriz, nasıl ilerleyelim?`,
      messageType: "text",
      relatedOffer: offer._id
    });
    const expertWelcomeMessage = new Message({
      conversation: offer.supportRequest._id,
      sender: offer.supportRequest.user,
      receiver: offer.expert,
      content: `Merhaba ${expert.name}! Ödeme onaylandı. Projeye başlayalım.`,
      messageType: "text",
      relatedOffer: offer._id
    });
    await Promise.all([userWelcomeMessage.save(), expertWelcomeMessage.save()]);

    // Update payment request
    pr.status = "approved";
    pr.adminApprovedAt = new Date();
    pr.adminApprovedBy = req.user._id;
    await pr.save();

    // Socket.io bildirimi gönder - kullanıcı ve uzmana
    const io = req.app.get('io');
    if (io) {
      // Kullanıcıya bildirim
      io.to(`user_${offer.supportRequest.user}`).emit('notification', {
        type: 'payment_approved',
        paymentRequestId: pr._id,
        message: 'Ödemeniz onaylandı, proje başlatıldı'
      });
      // Uzmana bildirim
      io.to(`user_${offer.expert._id}`).emit('notification', {
        type: 'payment_approved',
        paymentRequestId: pr._id,
        message: 'Ödeme onaylandı, projeye başlayabilirsiniz'
      });
    }

    res.json({ message: "Ödeme onaylandı, teklif kabul edildi ve sohbet başlatıldı", paymentRequest: pr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Reject payment request
router.put("/admin/:id/reject", adminMiddleware, validateObjectId("id"), async (req, res) => {
  try {
    const pr = await PaymentRequest.findById(req.params.id).populate({
      path: "offer",
      populate: [{ path: "supportRequest" }, { path: "expert" }]
    });
    if (!pr) {
      return res.status(404).json({ message: "Ödeme talebi bulunamadı" });
    }
    if (pr.status !== "pending") {
      return res.status(400).json({ message: "Bu ödeme talebi zaten işleme alınmış" });
    }
    pr.status = "rejected";
    pr.adminApprovedAt = new Date();
    pr.adminApprovedBy = req.user._id;
    await pr.save();

    // Socket.io bildirimi gönder
    const io = req.app.get('io');
    if (io && pr.offer && pr.offer.supportRequest) {
      io.to(`user_${pr.offer.supportRequest.user}`).emit('notification', {
        type: 'payment_rejected',
        paymentRequestId: pr._id,
        message: 'Ödeme talebiniz reddedildi'
      });
    }

    res.json({ message: "Ödeme talebi reddedildi", paymentRequest: pr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete payment request (manual cleanup)
router.delete("/admin/:id", adminMiddleware, validateObjectId("id"), async (req, res) => {
  try {
    const pr = await PaymentRequest.findById(req.params.id);
    if (!pr) {
      return res.status(404).json({ message: "Ödeme talebi bulunamadı" });
    }
    await PaymentRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Ödeme talebi silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


