// models/Portfolio.js
import mongoose from "mongoose";
const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
});

const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

const portfolioSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
  title: { type: String },
  description: { type: String },
  jobRef: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  media: [mediaSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    commentSchema
  ],
}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);