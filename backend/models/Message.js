import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  attachments: [String],
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);