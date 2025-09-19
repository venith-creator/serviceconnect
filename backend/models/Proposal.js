import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
    price: Number,
    timelineEstimate: String,
    message: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);
