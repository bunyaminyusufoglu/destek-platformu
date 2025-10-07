import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  supportRequest: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SupportRequest", 
    required: true 
  },
  expert: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000 
  },
  proposedPrice: { 
    type: Number, 
    required: true,
    min: 0 
  },
  estimatedDuration: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "admin_approved", "admin_rejected", "accepted", "rejected", "cancelled"], 
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
  respondedAt: { type: Date, default: null }
}, { timestamps: true });

// Bir uzmanın aynı talebe sadece bir teklif gönderebilmesi
offerSchema.index({ supportRequest: 1, expert: 1 }, { unique: true });

export default mongoose.model("Offer", offerSchema);
