import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

// Public settings (SEO ve public alanlar)
router.get("/public", async (req, res) => {
  try {
    const doc = await Settings.findOne();
    if (!doc) {
      return res.json({
        platformName: "Destek Platformu",
        seo: { title: "", description: "", keywords: [], robots: "index, follow" },
        maintenanceMode: false
      });
    }
    const { platformName, maintenanceMode, seo = {}, supportEmail } = doc.toObject();
    res.json({ platformName, maintenanceMode, seo, supportEmail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


