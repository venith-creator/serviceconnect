// models/Announcement.js
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: {
      type: String,
      enum: ["all", "clients", "providers"],
      default: "all",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
    expiresAt: { type: Date }, // optional expiration
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
