import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../middleware/validation.js";

const router = express.Router();

// Register
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { isUser, isExpert, name, email, password, skills } = req.body;

    // Email'i normalize et (küçük harfe çevir ve trim yap)
    const normalizedEmail = email.toLowerCase().trim();

    // Email kontrol (case-insensitive)
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "Bu email adresi zaten kullanılıyor" });
    }

    // Şifre hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = new User({
      isUser,
      isExpert,
      isAdmin: false, // Admin sadece manuel olarak oluşturulur
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      skills: skills || []
    });

    await newUser.save();
    res.status(201).json({ message: "Kullanıcı başarıyla kaydedildi" });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Bu email adresi zaten kullanılıyor" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Email'i normalize et (küçük harfe çevir)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Debug log (sadece development için)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Login attempt for email:', normalizedEmail);
    }

    // Email ile kullanıcı ara (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('User not found for email:', normalizedEmail);
      }
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('User found:', { id: user._id, name: user.name, email: user.email });
    }

    // Şifre kontrol
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Password mismatch for user:', user.email);
      }
      return res.status(400).json({ message: "Email veya şifre hatalı" });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Login successful for user:', user.email);
    }

    // Token üret
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        isUser: user.isUser,
        isExpert: user.isExpert,
        isAdmin: user.isAdmin,
        skills: user.skills || []
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || "Giriş sırasında bir hata oluştu" });
  }
});

// Profil bilgilerini getir
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profil güncelle
router.put("/profile", authMiddleware, validate(updateProfileSchema), async (req, res) => {
  try {
    const { name, skills } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Güncelleme objesi oluştur
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (skills !== undefined) updateData.skills = skills;

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profil başarıyla güncellendi",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Şifre değiştir
router.put("/change-password", authMiddleware, validate(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mevcut şifre yanlış" });
    }

    // Yeni şifreyi hashle ve güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
