import mongoose from "mongoose";

const supportRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  skills: { type: [String], default: [] },
  status: { 
    type: String, 
    enum: ["pending", "admin_approved", "admin_rejected", "open", "assigned", "in_progress", "completed", "cancelled"], 
    default: "pending" 
  },
  adminApprovalStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  adminApprovedAt: { type: Date, default: null },
  adminRejectedAt: { type: Date, default: null },
  adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("SupportRequest", supportRequestSchema);
