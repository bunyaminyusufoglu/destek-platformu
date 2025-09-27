import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  isUser: { type: Boolean, default: true },
  isExpert: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
