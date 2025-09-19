import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // client + provider
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // optional link to job
  systemName: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export default mongoose.model("ChatRoom", chatRoomSchema);