const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  isStudent: { type: Boolean, default: true },
  isExpert: { type: Boolean, default: false },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
