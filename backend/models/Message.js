import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupportRequest",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ["text", "image", "file", "offer_response"],
    default: "text"
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  // Mesajın hangi teklifle ilgili olduğu (opsiyonel)
  relatedOffer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null
  }
}, { timestamps: true });

// Mesajlaşma performansı için index'ler
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, isRead: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

export default mongoose.model("Message", messageSchema);
