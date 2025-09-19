// controllers/portfolioController.js
import Portfolio from "../models/Portfolio.js";
import ProviderProfile from "../models/ProviderProfile.js";
import mongoose from "mongoose";

export const createPortfolioItem = async (req, res) => {
  try {
    if (req.user.roles && !req.user.roles.includes("provider")) {
      return res.status(403).json({ message: "Only providers can create portfolio items" });
    }

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) return res.status(400).json({ message: "Provider profile not found" });

    const { title, description, jobRef, media } = req.body;

    const item = await Portfolio.create({
      provider: providerProfile._id,
      title,
      description,
      jobRef,
      media: media || []
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPortfolioForProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const items = await Portfolio.find({ provider: providerId })
      .populate("provider", "user")
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const likePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Portfolio.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });

    const uid = req.user._id;
    if (item.likes.some(l => l.toString() === uid.toString())) {
      item.likes = item.likes.filter(l => l.toString() !== uid.toString());
    } else {
      item.likes.push(uid);
    }
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const commentPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const item = await Portfolio.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });

    item.comments.push({ author: req.user._id, text });
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Portfolio.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });

    // Only provider owner or admin can delete
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    const isOwner = providerProfile && providerProfile._id.equals(item.provider);
    if (!isOwner && !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await item.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
