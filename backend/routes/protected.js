import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Sadece giriş yapan kullanıcı görebilir
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, this is a protected route.` });
});

export default router;
