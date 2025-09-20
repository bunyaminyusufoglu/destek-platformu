const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Sadece giriş yapan kullanıcı görebilir
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, this is a protected route.` });
});

module.exports = router;
