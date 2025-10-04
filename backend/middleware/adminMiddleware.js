// Sabit admin kullanıcısı kontrolü
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin12345';

// Admin yetkilendirme middleware
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Token'ı decode et (basit base64)
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Token'ın geçerli olup olmadığını kontrol et
    const tokenAge = Date.now() - tokenData.timestamp;
    const tokenValid = tokenAge < 24 * 60 * 60 * 1000; // 24 saat
    
    if (!tokenValid || tokenData.email !== ADMIN_EMAIL || !tokenData.isAdmin) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    // Admin kullanıcı bilgilerini ayarla
    req.user = {
      _id: 'admin',
      name: 'Admin',
      email: ADMIN_EMAIL,
      isAdmin: true,
      isUser: true,
      isExpert: true
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

export default adminMiddleware;
