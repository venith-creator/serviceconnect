import ChatRoom from "../models/chatRoom.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { getIO } from "../utils/socket.js";

let io = null;
export const setSocketServer = (socketIo) => {
  io = socketIo;
};

export const createOrGetRoom = async (req, res) => {
  try {
    const { participants, jobId, isSystem } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: "Participants required (array of user ids)" });
    }

    // ✅ Filter out falsy/null IDs
    const cleanParticipants = participants.filter(Boolean);

    if (cleanParticipants.length < 2 && !isSystem) {
      return res.status(400).json({ message: "At least two valid participants required" });
    }

    // 🔹 Handle system channels (system_all, system_providers, etc.)
    if (isSystem) {
      const audience = req.body.audience || "all";
      const sysName = `system_${audience}`;
      let room = await ChatRoom.findOne({ systemName: sysName });
      if (!room) {
        room = await ChatRoom.create({ participants: [], job: null, systemName: sysName });
      }
      return res.json(room);
    }

    // 🔹 Check existing 1:1 or job-based room
    let room = null;
    if (jobId) {
      room = await ChatRoom.findOne({
        job: jobId,
        participants: { $all: cleanParticipants, $size: cleanParticipants.length },
      });
    }

    if (!room) {
      room = await ChatRoom.findOne({
        participants: { $all: cleanParticipants, $size: cleanParticipants.length },
        job: jobId || null,
      });
    }

    // 🔹 Create new room if none exists
    if (!room) {
      room = await ChatRoom.create({ participants: cleanParticipants, job: jobId || null });
    }

    res.status(201).json(room);
  } catch (err) {
    console.error("createOrGetRoom:", err);
    res.status(500).json({ message: err.message });
  }
};

// near top of file keep: import mongoose from "mongoose";
export const createClientProviderRoom = async (req, res) => {
  try {
    const { providerId } = req.body;
    const clientId = req.user._id; // from protect middleware

    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }

    // Ensure ObjectId typed participants (prevent mixed string/ObjectId issues)
    const participants = [
      new mongoose.Types.ObjectId(String(clientId)),
      new mongoose.Types.ObjectId(String(providerId)),
    ];

    // Find existing 1:1 room (no systemName, job null)
    let room = await ChatRoom.findOne({
      participants: { $all: participants, $size: participants.length },
      systemName: { $exists: false },
      job: null,
    });

    // Create if none exists
    if (!room) {
      room = await ChatRoom.create({
        participants,
        job: null,
      });

      // create a ping message from the client (optional)
      const welcomeMsg = await Message.create({
        chatRoom: room._id,
        sender: clientId,
        text: "👋 Hello, I'd like to discuss your services!",
      });

      room.lastMessage = welcomeMsg._id;
      await room.save();
    }

    // Populate for the frontend response
    room = await ChatRoom.findById(room._id)
      .populate("participants", "name email avatar roles")
      .populate("lastMessage")
      .populate("job", "title status");

    // Notify both sides via socket (private user rooms) and also emit chat:new
    const io = getIO();
    if (io) {
      // emit to provider and client private rooms so their lists refresh
      io.to(String(providerId)).emit("chat:new", room);
      io.to(String(clientId)).emit("chat:new", room);
      // also emit to provider role room (optional)
      io.to("providers").emit("chat:new", room);
    }

    return res.status(200).json(room);
  } catch (err) {
    console.error("createClientProviderRoom:", err);
    return res.status(500).json({ message: err.message });
  }
};


/*export const createClientProviderRoom = async (req, res) => {
  try {
    const { providerId } = req.body;
    const clientId = req.user._id; // from protect middleware

    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }

    // ✅ Reuse createOrGetRoom logic
    const participants = [
      new mongoose.Types.ObjectId(clientId),
      new mongoose.Types.ObjectId(providerId)
    ];

    let room = await ChatRoom.findOne({
      participants: { $all: participants, $size: participants.length },
      systemName: { $exists: false },
      job: null,
    })
      .populate("participants", "name email avatar roles")
      .populate("lastMessage");

    // 🆕 Create if none exists
    if (!room) {
      room = await ChatRoom.create({
        participants,
        job: null,
      });

      // 📨 Optional first message (acts as ping)
      const welcomeMsg = await Message.create({
        chatRoom: room._id,
        sender: clientId,
        text: "👋 Hello, I'd like to discuss your services!",
      });

      room.lastMessage = welcomeMsg._id;
      await room.save();
    }

    // ✅ Populate consistently for frontend
    room = await ChatRoom.findById(room._id)
      .populate("participants", "name email avatar roles")
      .populate("lastMessage")
      .populate("job", "title status");

    // 🔔 Notify provider (if socket connected)
    const io = getIO();
    if (io) {
      io.to(providerId.toString()).emit("chat:new", room);
      io.to(clientId.toString()).emit("chat:new", room);
    }

    res.status(200).json(room);
  } catch (err) {
    console.error("createClientProviderRoom:", err);
    res.status(500).json({ message: err.message });
  }
};*/

export const getRoomsForUser = async (req, res) => {
  try {
    const userId = req.user._id;

    let rooms = await ChatRoom.find({
      $or: [{ participants: userId }, { systemName: { $exists: true } }],
    })
      .populate({
        path: "participants",
        select: "name email avatar roles",
      })
      .populate("job", "title status")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    // ✅ Filter system rooms by user role
    const userRoles = req.user.roles || [];

    rooms = rooms.filter((room) => {
      if (!room.systemName) return true; // normal user chats

      // system_all → everyone sees
      if (room.systemName === "system_all") return true;

      // system_clients → only clients
      if (room.systemName === "system_clients" && userRoles.includes("client")) return true;

      // system_providers → only providers
      if (room.systemName === "system_providers" && userRoles.includes("provider")) return true;

      // hide other system rooms
      return false;
    });

    res.json(rooms);
  } catch (err) {
    console.error("getRoomsForUser:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get messages for a room (pagination)
export const getMessagesForRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ chatRoom: roomId })
      .sort({ createdAt: 1 }) // ✅ chronological order
      .skip(skip)
      .limit(Number(limit))
      .populate("sender", "name email avatar roles");

    res.json(messages);
  } catch (err) {
    console.error("getMessagesForRoom:", err);
    res.status(500).json({ message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, attachments } = req.body;

    const room = await ChatRoom.findById(roomId).populate("participants");
    if (!room) return res.status(404).json({ message: "Chat room not found" });

    const isParticipant = room.participants
      .filter(Boolean)
      .some((p) => p._id.toString() === req.user._id.toString());

    if (room.systemName && !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Only admins can post to system channel" });
    }

    console.log("Participants:", room.participants.map(p => p._id.toString()), "User:", req.user._id.toString());

    if (!isParticipant && !room.systemName) {
      return res.status(403).json({ message: "Not a participant in this chat room" });
    }

    const msg = await Message.create({
      chatRoom: roomId,
      sender: req.user._id,
      text,
      attachments: attachments || [],
    });

    const populated = await msg.populate("sender", "name email avatar roles");

    // ✅ Update room lastMessage and updatedAt
    room.lastMessage = msg._id;
    room.unreadBy = room.participants
        .filter(p => p && p._id.toString() !== req.user._id.toString());
    await room.save();

    // ✅ Correct emit: broadcast to the chatRoom ID everyone joined
    if (io) {
      io.to(roomId.toString()).emit("message:new", populated);
      console.log("📤 Emitted message to room:", roomId);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendMessage:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Mark a chat room as read for the current user
export const markRoomAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Remove the current user from unreadBy
    await ChatRoom.findByIdAndUpdate(roomId, {
      $pull: { unreadBy: req.user._id },
    });

    res.json({ success: true, message: "Room marked as read" });
  } catch (error) {
    console.error("Error marking room as read:", error);
    res.status(500).json({ message: "Failed to mark as read", error: error.message });
  }
};


export const publishAnnouncementToChat = async (announcement) => {
  try {
  const io = getIO();
  const { title, message, audience, createdBy } = announcement;
  if (!title || !message || !createdBy)
      throw new Error("Missing announcement fields");

  /*if (expiresAt && new Date(expiresAt) < new Date()) {
    console.log("⚠️ Skipping expired announcement:", title);
    return null;
  }*/

  // ✅ Determine the correct system chatroom name
  const systemName =
    audience === "all"
      ? "system_all"
      : audience === "clients"
      ? "system_clients"
      : "system_providers";

  // ✅ Create or get that room
  let room = await ChatRoom.findOne({ systemName });
  if (!room) {
    room = await ChatRoom.create({
      systemName,
      participants: [],
      job: null,
    });
  }

  // ✅ Create the announcement message
  const chatMessage = await Message.create({
    chatRoom: room._id,
    sender: createdBy,
    text: `📢 ${title}\n${message}`,
    type: "announcement",
  });

  // ✅ Update lastMessage
  room.lastMessage = chatMessage._id;
  try {
      let audienceUsers = [];
      if (audience === "all") {
        audienceUsers = await User.find({}, "_id");
      } else if (audience === "clients") {
        audienceUsers = await User.find({ roles: { $in: ["client"] } }, "_id");
      } else if (audience === "providers") {
        audienceUsers = await User.find({ roles: { $in: ["provider"] } }, "_id");
      }

      const unreadFor = audienceUsers
        .map((u) => u._id.toString())
        .filter((id) => id !== createdBy.toString());

      room.unreadBy = unreadFor;
    } catch (unreadErr) {
      console.warn("⚠️ Could not populate unreadBy:", unreadErr.message);
    }
  await room.save();

  // ✅ Emit only to audience group
  const emitTarget =
    audience === "all"
      ? null
      : audience === "clients"
      ? "clients"
      : "providers";

  if (emitTarget) {
    io.to(emitTarget).emit("announcement:new", { roomId: room._id, message: chatMessage });
  } else {
    io.emit("announcement:new", { roomId: room._id, message: chatMessage });
  }

   console.log("📢 Announcement published:", title);
  return chatMessage;
  } catch (err) {
    console.error("❌ publishAnnouncementToChat failed:", err);
    throw err; // Let controller catch it
  }
};
