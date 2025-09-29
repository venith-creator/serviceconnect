// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId }, // service _id from providerProfile.services
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // optional (for job-based payments)
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional (for job-based payments)

    amount: { type: Number, required: true },
    type: { type: String, enum: ["job", "subscription"], default: "job" }, // distinguish
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

