import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, required: true }, // service _id from providerProfile.services
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    // Stripe fields
    stripeCheckoutSessionId: { type: String },
    stripeCustomerId: { type: String },
    currency: { type: String, default: "usd" },
    paymentMethod: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
