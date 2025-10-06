import mongoose from "mongoose";

const SeoSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  description: { type: String, default: "" },
  keywords: { type: [String], default: [] },
  robots: { type: String, default: "index, follow" }
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: "Destek Platformu" },
  supportEmail: { type: String, default: "" },
  maintenanceMode: { type: Boolean, default: false },
  seo: { type: SeoSchema, default: () => ({}) }
}, { timestamps: true });

const Settings = mongoose.model("Settings", SettingsSchema);

export default Settings;


