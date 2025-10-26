// controllers/portfolioController.js
import Portfolio from "../models/Portfolio.js";
import ProviderProfile from "../models/ProviderProfile.js";
import mongoose from "mongoose";
import { providerPostUpload, getFileUrl } from "../middleware/upload.js";

export const createPortfolioItem = [
  providerPostUpload.array("media", 5), async (req, res) => {
  try {
    if (req.user.roles && !req.user.roles.includes("provider")) {
      return res.status(403).json({ message: "Only providers can create portfolio items" });
    }

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) return res.status(400).json({ message: "Provider profile not found" });

    const { title, description, jobRef} = req.body;
    const media = (req.files || []).map(file => ({
        url: getFileUrl(process.env.MINIO_BUCKET, file.key),
        type: file.mimetype.startsWith("video") ? "video" : "image"
      }));

    const item = await Portfolio.create({
      provider: providerProfile._id,
      title,
      description,
      jobRef,
      media
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}];

export const getPortfolioForProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const items = await Portfolio.find({ provider: providerId })
      .populate({
        path: "provider",
        select: "user city state country",
        populate: { path: "user", select: "name avatar" },
      })
      .populate({
        path: "comments.author",
        select: "name avatar",
      })
      .populate({
        path: "comments.replies.author",
        select: "name avatar",
      })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error("❌ getPortfolioForProvider error:", err);
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
    await item.populate({
      path: "comments.author",
      select: "name avatar"
    });
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

export const getAllPortfolios = async (req, res) => {
  try {
    const items = await Portfolio.find({})
      .populate({
        path: "provider",
        select: "user city state country",
        populate: { path: "user", select: "name avatar" }
      })
      .populate({
          path: "comments.author",
          select: "name avatar"
        })
        .populate({
          path: "comments.replies.author",
          select: "name avatar"
        })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyPortfolio = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    const items = await Portfolio.find({ provider: providerProfile._id })
      .populate({
        path: "provider",
        select: "user city country",
        populate: { path: "user", select: "name avatar" },
      })
      .populate({
        path: "comments.author",
        select: "name avatar"
      })
      .populate({
        path: "comments.replies.author",
        select: "name avatar"
      })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Add a reply to a comment
export const addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const portfolio = await Portfolio.findById(postId);
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    const comment = portfolio.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({
      text: req.body.text,
      author: req.user._id,
      likes: [],
    });

    await portfolio.save();
    await portfolio.populate({
      path: "comments.author",
      select: "name avatar"
    }).populate({
      path: "comments.replies.author",
      select: "name avatar"
    });

    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Toggle like on comment
export const toggleCommentLike = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const portfolio = await Portfolio.findById(postId);
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    const comment = portfolio.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user._id;
    const alreadyLiked = comment.likes.some(l => l.toString() === userId.toString());
    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await portfolio.save();
    res.json({ liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle like on reply
export const toggleReplyLike = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const portfolio = await Portfolio.findById(postId);
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    const comment = portfolio.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const userId = req.user._id;
    const alreadyLiked = reply.likes.some(l => l.toString() === userId.toString());
    if (alreadyLiked) {
      reply.likes.pull(userId);
    } else {
      reply.likes.push(userId);
    }

    await portfolio.save();
    res.json({ liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
