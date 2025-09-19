import Announcement from "../models/Announcement.js";
import { publishAnnouncementToChat } from "./chatController.js";

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
        const chatMessage = await publishAnnouncementToChat(announcement);
        res.status(201).json({ announcement, chatMessage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};