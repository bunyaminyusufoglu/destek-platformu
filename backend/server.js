import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import supportRoutes from "./routes/support.js";
import connectDB from "./config/db.js";

// Environment variables yükle
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/support", supportRoutes);


const PORT = process.env.PORT || 5000;

// Database bağlantısı
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
