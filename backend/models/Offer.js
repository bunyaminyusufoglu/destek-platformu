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
    enum: ["pending", "accepted", "rejected", "cancelled"], 
    default: "pending" 
  },
  respondedAt: { type: Date, default: null }
}, { timestamps: true });

// Bir uzmanın aynı talebe sadece bir teklif gönderebilmesi
offerSchema.index({ supportRequest: 1, expert: 1 }, { unique: true });

export default mongoose.model("Offer", offerSchema);
