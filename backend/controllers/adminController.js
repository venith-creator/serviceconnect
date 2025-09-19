// controllers/adminController.js
import User from "../models/User.js";
import Job from "../models/Job.js";
import Payment from "../models/Payment.js";
import Announcement from "../models/Announcement.js";
import { publishAnnouncementToChat } from "./chatController.js";

// 📌 User management
export const listUsers = async (req, res) => {
  try {
    const { roles, page = 1, limit = 20 } = req.query;
    const filter = roles ? { roles: { $in: [roles] } } : {};
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ total, page: Number(page), limit: Number(limit), users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roles } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.roles = roles;
    await user.save();
    res.json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { ban, reason } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = ban;
    user.banReason = ban ? reason || "Banned by admin" : "";
    await user.save();

    res.json({ message: ban ? "User banned" : "User unbanned", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Stats
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const clients = await User.countDocuments({ roles: "client" });
    const providers = await User.countDocuments({ roles: "provider" });

    const jobsOpen = await Job.countDocuments({ status: "open" });
    const jobsCompleted = await Job.countDocuments({ status: "completed" });
    const jobsCancelled = await Job.countDocuments({ status: "cancelled" });

    const revenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.json({
      users: { total: totalUsers, clients, providers },
      jobs: { open: jobsOpen, completed: jobsCompleted, cancelled: jobsCancelled },
      revenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Announcements
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      message,
      audience,
      createdBy: req.user._id,
      expiresAt,
    });
    await publishAnnouncementToChat(announcement);

    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listAnnouncements = async (req, res) => {
  try {
    const { audience = "all" } = req.query;

    const filter =
      audience === "all"
        ? {}
        : { $or: [{ audience }, { audience: "all" }] };

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: "Not found" });

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
