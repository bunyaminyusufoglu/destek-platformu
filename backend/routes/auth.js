import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validate, registerSchema, loginSchema } from "../middleware/validation.js";

const router = express.Router();

// Register
router.post("/register", validate(registerSchema), async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { isUser, isExpert, name, email, password, skills } = req.body;

    // Email kontrol
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // Şifre hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = new User({
      isUser,
      isExpert,
      isAdmin: false, // Admin sadece manuel olarak oluşturulur
      name,
      email,
      password: hashedPassword,
      skills
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Şifre kontrol
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Token üret
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
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
        skills: user.skills
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
