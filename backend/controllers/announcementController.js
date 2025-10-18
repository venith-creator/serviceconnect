import Announcement from "../models/Announcement.js";
import { publishAnnouncementToChat } from "./chatController.js";
import { getIO } from "../utils/socket.js";

export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, audience, expiresAt } = req.body;
        const announcement = await Announcement.create({
            title,
            message, 
            audience, 
            expiresAt,
            createdBy: req.user._id,
        
        });

        const io = getIO();
            if (audience === "clients") {
            io.to("clients").emit("announcement:new", announcement);
            } else if (audience === "providers") {
            io.to("providers").emit("announcement:new", announcement);
            } else {
            io.emit("announcement:new", announcement);
            }
        const chatMessage = await publishAnnouncementToChat(announcement);
        res.status(201).json({ announcement, chatMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAnnouncements = async (req, res) => {
  try {
    const isAdmin = req.user.roles.includes("admin");
    const now = new Date();

    const filter = isAdmin
      ? {} // admin sees all
      : {
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }], // only active ones
        };

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.json(announcements);
  } catch (err) {
    console.error("getAnnouncements error:", err);
    res.status(500).json({ message: err.message });
  }
};