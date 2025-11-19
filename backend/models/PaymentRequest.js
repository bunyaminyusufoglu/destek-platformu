import mongoose from "mongoose";

const paymentRequestSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminApprovedAt: { type: Date, default: null },
  adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

export default mongoose.model("PaymentRequest", paymentRequestSchema);


