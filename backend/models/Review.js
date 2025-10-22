import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    reviewer : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee : { type: mongoose.Schema.Types.ObjectId, ref: "User",  },
    revieweeUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    revieweeProvider: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile" },
    reviewerRole: { type: String, enum: ["client", "provider"], required: true },
    revieweeRole: { type: String, enum: ["client", "provider"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    role: { type: String, enum: ["client", "provider"], required: true }, // who gave review
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
