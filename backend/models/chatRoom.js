import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  systemName: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Check if model already exists
const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
