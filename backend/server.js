import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// JSON parse middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// MongoDB bağlantısı
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI .env dosyasından alınamadı!");
  process.exit(1); // Uygulamayı durdur
}

mongoose.connect(mongoUri)
.then(() => console.log("MongoDB bağlantısı başarılı"))
.catch((err) => console.error("MongoDB bağlantı hatası:", err));

// Basit test route
app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

// Server başlat
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
