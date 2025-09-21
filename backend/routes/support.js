const express = require("express");
const SupportRequest = require("../models/SupportRequest");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

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
    const requests = await SupportRequest.find().populate("student", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
