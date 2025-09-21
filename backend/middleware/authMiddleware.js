import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied, no token provided" });
  }

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified; // { id, email }
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
}

export default authMiddleware;
