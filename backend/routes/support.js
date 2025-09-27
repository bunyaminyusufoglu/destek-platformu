import express from "express";
import SupportRequest from "../models/SupportRequest.js";
import Offer from "../models/Offer.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { validate, createSupportRequestSchema, updateSupportRequestSchema, validateObjectId } from "../middleware/validation.js";

const router = express.Router();

router.post("/create", authMiddleware, validate(createSupportRequestSchema), async (req, res) => {
  try {
    const { title, description, budget, deadline, skills } = req.body;

    const user = await User.findById(req.user.id);

    if (!user || !user.isUser) {
      return res.status(403).json({ message: "Yalnızca kullanıcılar talep oluşturabilir" });
    }

    const newRequest = new SupportRequest({
      title,
      description,
      budget,
      deadline,
      skills,
      user: req.user.id
    });

    await newRequest.save();
    res.status(201).json({ message: "Destek talebi oluşturuldu", request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const requests = await SupportRequest.find()
      .populate("user", "name email")
      .populate("expert", "name email")
      .sort({ createdAt: -1 });
    
    // Her talebe teklif sayısını ekle
    const requestsWithOfferCount = await Promise.all(
      requests.map(async (request) => {
        const offerCount = await Offer.countDocuments({ supportRequest: request._id });
        return {
          ...request.toObject(),
          offerCount
        };
      })
    );
    
    res.json(requestsWithOfferCount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tekil talep getir
router.get("/:id", authMiddleware, validateObjectId("id"), async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id)
      .populate("user", "name email")
      .populate("expert", "name email");
    
    if (!request) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }
    
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Talep güncelle (sadece talep sahibi)
router.put("/:id", authMiddleware, validateObjectId("id"), validate(updateSupportRequestSchema), async (req, res) => {
  try {
    const { title, description, budget, deadline, skills } = req.body;
    
    const request = await SupportRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }
    
    // Sadece talep sahibi güncelleyebilir
    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sadece talep sahibi güncelleyebilir" });
    }
    
    // Sadece açık talepler güncellenebilir
    if (request.status !== "open") {
      return res.status(400).json({ message: "Sadece açık talepler güncellenebilir" });
    }
    
    const updatedRequest = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { title, description, budget, deadline, skills },
      { new: true }
    ).populate("user", "name email");
    
    res.json({ message: "Destek talebi güncellendi", request: updatedRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Talep sil (sadece talep sahibi)
router.delete("/:id", authMiddleware, validateObjectId("id"), async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }
    
    // Sadece talep sahibi silebilir
    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Sadece talep sahibi silebilir" });
    }
    
    // Sadece açık talepler silinebilir
    if (request.status !== "open") {
      return res.status(400).json({ message: "Sadece açık talepler silinebilir" });
    }
    
    await SupportRequest.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Destek talebi silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
