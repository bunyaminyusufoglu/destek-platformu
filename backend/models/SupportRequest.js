import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  skills: { type: [String], default: [] },
  status: { 
    type: String, 
    enum: ["open", "assigned", "in_progress", "completed", "cancelled"], 
    default: "open" 
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("SupportRequest", supportRequestSchema);
