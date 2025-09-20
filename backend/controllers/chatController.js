import ChatRoom from "../models/chatRoom.js";
import Message from "../models/Message.js";
import Announcement from "../models/Announcement.js";
import User from "../models/User.js";

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

    if (isSystem) {
      // For system we use a fixed unique identifier pattern: "system_all", "system_providers", "system_clients"
      const audience = req.body.audience || "all";
      const sysName = `system_${audience}`;
      let room = await ChatRoom.findOne({ systemName: sysName });
      if (!room) {
        room = await ChatRoom.create({ participants: [], job: null, systemName: sysName });
      }
      return res.json(room);
    }

    let room = null;
    if (jobId) {
      room = await ChatRoom.findOne({ job: jobId, participants: { $all: participants, $size: participants.length } });
    }
    if (!room) {
      // For 1:1 chats we consider participants array of length 2 and look for existing room with same participants
      const found = await ChatRoom.findOne({
        participants: { $all: participants, $size: participants.length },
        job: jobId || null,
      });
      if (found) room = found;
    }

    if (!room) {
      room = await ChatRoom.create({ participants, job: jobId || null });
    }

    res.status(201).json(room);
  } catch (err) {
    console.error("createOrGetRoom:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getRoomsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const rooms = await ChatRoom.find({ $or: [{ participants: userId }, { systemName: { $exists: true } }] })
      .populate({
        path: "participants",
        select: "name email avatar roles"
      })
      .populate("job", "title status");
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("sender", "name email avatar roles");

    // return newest-first client may reverse on frontend
    res.json(messages.reverse());
  } catch (err) {
    console.error("getMessagesForRoom:", err);
    res.status(500).json({ message: err.message });
  }
};

// Send a message to a room (sender is req.user)
export const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, attachments } = req.body;

    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: "Chat room not found" });

    // Authorization: user must be participant OR room is system and user is admin (or recipients)
    const isParticipant = room.participants.some((p) => p.toString() === req.user._id.toString());
    if (room.systemName && !req.user.roles.includes("admin")) {
      // only admins can post in system rooms
      return res.status(403).json({ message: "Only admins can post to system channel" });
    }
     if (!isParticipant && !room.systemName) {
      // allow if user is not participant? deny
      return res.status(403).json({ message: "Not a participant in this chat room" });
    }

    const msg = await Message.create({
      chatRoom: roomId,
      sender: req.user._id,
      text,
      attachments: attachments || []
    });

    const populated = await msg.populate("sender", "name email avatar roles");

    // Emit to room — if io attached. We'll emit to a room name equal to chatRoom._id
    if (io) {
      io.to(roomId.toString()).emit("message:new", populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendMessage:", err);
    res.status(500).json({ message: err.message });
  }
};

// Admin helper: publish announcement into system chat room(s)
export const publishAnnouncementToChat = async (announcement) => {
  try {
    // announcement: mongoose doc with audience, title, message, createdBy
    const audience = announcement.audience || "all";
    const sysName = `system_${audience}`;

    // Ensure system room exists (system rooms don't have participants array; they are broadcast channels)
    let systemRoom = await ChatRoom.findOne({ systemName: sysName });
    if (!systemRoom) {
      systemRoom = await ChatRoom.create({ systemName: sysName, participants: [], job: null });
    }

    const systemMessage = await Message.create({
      chatRoom: systemRoom._id,
      sender: announcement.createdBy, // admin user id
      text: `[ANNOUNCEMENT] ${announcement.title}\n\n${announcement.message}`,
      attachments: []
    });

    const populated = await systemMessage.populate("sender", "name email avatar roles");

    // Emit to room if socket available
    if (io) {
      io.to(systemRoom._id.toString()).emit("announcement:new", populated);
    }

    return populated;
  } catch (err) {
    console.error("publishAnnouncementToChat:", err);
  }
};

