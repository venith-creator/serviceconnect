// controllers/reviewController.js
import Review from "../models/Review.js";
import Job from "../models/Job.js";
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

    const existingReview = await Review.findOne({
      job: jobId,
      reviewer: req.user._id,
      revieweeProvider: providerId,
    });
    if (existingReview)
      return res.status(400).json({ message: "You already reviewed this provider" });

    const review = await Review.create({
      job: jobId,
      reviewerRole: "client",
      revieweeRole: "provider",
      revieweeProvider: providerId,
      rating,
      comment,
      reviewer: req.user._id,
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
      revieweeUser: clientId,
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
      reviewerRole: "provider",
      revieweeRole: "client",
      revieweeUser: clientId,
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
    const providerId = req.params.providerId;
    const reviews = await Review.find({revieweeRole: "provider", $or: [
        { revieweeProvider: providerId },
        { reviewee: providerId }, // for backward-compatibility (old reviews)
      ], })
      .populate("reviewer", "name email avatar")
      .populate("job", "title")
      .populate({
        path: "revieweeProvider",
        populate: {
          path: "user",
          select: "name email avatar",
        },
      })
      .lean();

       const enriched = reviews.map((r) => ({
      ...r,
      reviewee:
        r.revieweeProvider?.user || // provider’s user
        r.revieweeUser || // direct user (client)
        r.reviewee || // legacy
        null,
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

export const getReviewsForClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const reviews = await Review.find({
      revieweeRole: "client",
      $or: [{ revieweeUser: clientId }, { reviewee: clientId }],
    })
      .populate("reviewer", "name email avatar")
      .populate("job", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client reviews", error: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate("revieweeUser", "name email avatar")
      .populate({
          path: "revieweeProvider",
          populate: {
            path: "user",
            select: "name email avatar",
          },
        })
      .populate("job", "title")
      .lean();

      const enriched = reviews.map((r) => ({
      ...r,
      reviewee:
        r.revieweeProvider?.user ||
        r.revieweeUser ||
        r.reviewee ||
        null,
    }));
    res.json(enriched);
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

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.reviewerRole = role;

    // 1️⃣ Fetch & populate all data first
    let reviews = await Review.find(query)
      .populate("reviewer", "name email")
      .populate("reviewee", "name email")
      .populate({
        path: "revieweeProvider",
        populate: { path: "user", select: "name email" },
      })
      .populate("revieweeUser", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // 2️⃣ Apply search filtering in-memory (after populate)
    if (search) {
      const regex = new RegExp(search, "i");
      reviews = reviews.filter((r) =>
        regex.test(r.reviewer?.name || "") ||
        regex.test(r.reviewer?.email || "") ||
        regex.test(r.revieweeUser?.name || "") ||
        regex.test(r.revieweeUser?.email || "") ||
        regex.test(r.revieweeProvider?.user?.name || "") ||
        regex.test(r.revieweeProvider?.user?.email || "") ||
        regex.test(r.reviewee?.name || "") ||
        regex.test(r.reviewee?.email || "")
      );
    }

    // 3️⃣ Count only filtered reviews (for total)
    const total = reviews.length;

    res.json({
      reviews,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    res.status(500).json({
      message: "Error fetching admin reviews",
      error: error.message,
    });
  }
};

// 📊 Admin Summary - Avg Ratings per Provider
// controllers/reviewController.js
export const getProviderRatingSummary = async (req, res) => {
  try {
    const summary = await Review.aggregate([
      // only client → provider reviews
      { $match: { reviewerRole: "client", revieweeRole: "provider", revieweeProvider: { $exists: true } } },

      // group by provider profile id (revieweeProvider)
      {
        $group: {
          _id: "$revieweeProvider",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      },

      // join with providerprofiles
      {
        $lookup: {
          from: "providerprofiles",
          localField: "_id",
          foreignField: "_id",
          as: "profile"
        }
      },
      { $unwind: "$profile" },

      // lookup the user for the provider profile
      {
        $lookup: {
          from: "users",
          localField: "profile.user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // tidy project
      {
        $project: {
          _id: 1,
          avgRating: { $round: ["$avgRating", 1] },
          reviewCount: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "profile._id": "$profile._id",
          "profile.ratingAvg": "$profile.ratingAvg",
        }
      },

      { $sort: { avgRating: -1 } }
    ]);

    res.json(summary);
  } catch (error) {
    console.error("Error generating rating summary:", error);
    res.status(500).json({ message: "Error generating rating summary", error: error.message });
  }
};


// 🧹 Utility: Clean reviews for deleted jobs
export const cleanupOrphanReviews = async () => {
  try {
    const validJobIds = (await Job.find({}, "_id")).map((j) => j._id.toString());
    const orphanedReviews = await Review.find({ job: { $nin: validJobIds } });

    if (orphanedReviews.length > 0) {
      const ids = orphanedReviews.map((r) => r._id);
      await Review.deleteMany({ _id: { $in: ids } });
      console.log(`🧹 Cleaned up ${ids.length} orphaned reviews`);
    } else {
      console.log("✅ No orphaned reviews found");
    }
  } catch (error) {
    console.error("💥 Error cleaning orphan reviews:", error.message);
  }
};
