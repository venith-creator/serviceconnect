// models/Portfolio.js
import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
  title: { type: String },
  description: { type: String },
  jobRef: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  media: [{ url: String, type: String }], // images / video urls
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);