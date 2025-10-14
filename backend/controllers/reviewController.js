// controllers/reviewController.js
import Review from "../models/Review.js";
import Job from "../models/Job.js";
import ProviderProfile from "../models/ProviderProfile.js";
import { recalcProviderRating } from "./providerProfileController.js";

// CLIENT → PROVIDER
export const createReview = async (req, res) => {
  try {
    const { jobId, providerId, rating, comment } = req.body;

    const job = await Job.findById(jobId).populate("client");
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.client._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (job.status !== "completed")
      return res.status(400).json({ message: "Job must be completed first" });

    if (!job || !job._id) {
      return res.status(400).json({ message: "Cannot create review without valid job reference" });
    }

    const review = await Review.create({
      job: jobId,
      reviewer: req.user._id,
      reviewee: providerId, // provider.user._id
      rating,
      comment,
      role: "client",
    });

    await recalcProviderRating(providerId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

export const providerCreateReview = async (req, res) => {
  try {
    const { jobId, clientId, rating, comment } = req.body;
    console.log("🟢 Incoming provider review:", { jobId, clientId, user: req.user._id });

    // ✅ Fully populate assignedProvider -> user
    const job = await Job.findById(jobId)
      .populate({
        path: "assignedProvider",
        populate: { path: "user", model: "User" },
      })
      .populate("client");

    if (!job) {
      console.log("❌ Job not found");
      return res.status(404).json({ message: "Job not found" });
    }

    console.log("✅ Found job:", job._id);

    // ✅ Now extract the correct provider User ID
    const providerUserId = job.assignedProvider?.user?._id?.toString();
    const loggedInUserId = req.user._id.toString();

    if (!providerUserId) {
      console.log("❌ Job has no assigned provider user");
      return res.status(400).json({ message: "Job provider missing" });
    }

    if (providerUserId !== loggedInUserId) {
      console.log("❌ Not authorized: provider mismatch");
      return res.status(403).json({ message: "Not authorized" });
    }

    if (job.status !== "completed") {
      console.log("❌ Job not completed");
      return res.status(400).json({ message: "Job must be completed first" });
    }

    const existingReview = await Review.findOne({
      job: jobId,
      reviewer: req.user._id,
      reviewee: clientId,
    });

    if (existingReview) {
      console.log("❌ Duplicate review detected");
      return res.status(400).json({ message: "You already reviewed this client" });
    }

    if (!job || !job._id) {
      return res.status(400).json({ message: "Cannot create review without valid job reference" });
    }

    const review = await Review.create({
      job: jobId,
      reviewer: req.user._id,
      reviewee: clientId,
      rating,
      comment,
      role: "provider",
    });

    console.log("✅ Review created successfully:", review._id);
    res.status(201).json(review);
  } catch (error) {
    console.error("💥 Error creating provider review:", error);
    res.status(500).json({
      message: "Error creating provider review",
      error: error.message,
    });
  }
};


export const getReviewsForProvider = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.providerId })
      .populate("reviewer", "name email")
      .populate("job", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};


export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate("reviewee", "name email")
      .populate("job", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching my reviews", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.deleteOne();

    // Recalc provider rating after deletion
    await recalcProviderRating(review.provider);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};

// Admin - Paginated & Searchable Reviews
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const { role, jobId, page = 1, limit = 10, search = "" } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (jobId) filter.job = jobId;

    const skip = (page - 1) * limit;

    // Optional search: by reviewer/reviewee name/email
    const matchStage = search
      ? {
          $or: [
            { "reviewer.name": { $regex: search, $options: "i" } },
            { "reviewer.email": { $regex: search, $options: "i" } },
            { "reviewee.name": { $regex: search, $options: "i" } },
            { "reviewee.email": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const reviews = await Review.find(filter)
      .populate("job", "title description budget status city state country category timelineStart timelineEnd")
      .populate("reviewer", "name email role")
      .populate("reviewee", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admin reviews",
      error: error.message,
    });
  }
};

// 📊 Admin Summary - Avg Ratings per Provider
export const getProviderRatingSummary = async (req, res) => {
  try {
    const summary = await Review.aggregate([
      { $match: { role: "client" } },
      {
        $group: {
          _id: "$reviewee",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "provider",
        },
      },
      { $unwind: "$provider" },
      {
        $project: {
          _id: 1,
          avgRating: { $round: ["$avgRating", 1] },
          reviewCount: 1,
          "provider.name": 1,
          "provider.email": 1,
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: "Error generating rating summary",
      error: error.message,
    });
  }
};
