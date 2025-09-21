import express from "express";
import SupportRequest from "../models/SupportRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Talep oluştur (sadece öğrenciler)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description, budget, deadline, skills } = req.body;

    // Kullanıcı bilgisi çek
    const user = await User.findById(req.user.id);

    if (!user || !user.isStudent) {
      return res.status(403).json({ message: "Yalnızca öğrenciler talep oluşturabilir" });
    }

    const newRequest = new SupportRequest({
      title,
      description,
      budget,
      deadline,
      skills,
      student: req.user.id
    });

    await newRequest.save();
    res.status(201).json({ message: "Destek talebi oluşturuldu", request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tüm destek taleplerini listele
router.get("/", authMiddleware, async (req, res) => {
  try {
    const requests = await SupportRequest.find().populate("student", "name email").populate("expert", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tekil talep getir
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id)
      .populate("student", "name email")
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
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, budget, deadline, skills } = req.body;
    
    const request = await SupportRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }
    
    // Sadece talep sahibi güncelleyebilir
    if (request.student.toString() !== req.user.id) {
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
    ).populate("student", "name email");
    
    res.json({ message: "Destek talebi güncellendi", request: updatedRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Talep sil (sadece talep sahibi)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Destek talebi bulunamadı" });
    }
    
    // Sadece talep sahibi silebilir
    if (request.student.toString() !== req.user.id) {
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
