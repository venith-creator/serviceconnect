// controllers/reviewController.js
import Review from "../models/Review.js";
import Job from "../models/Job.js";
import ProviderProfile from "../models/ProviderProfile.js";
import { recalcProviderRating } from "./providerProfileController.js";

// CREATE review
export const createReview = async (req, res) => {
  try {
    const { jobId, providerId, rating, comment } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to review this job" });
    }
    if (job.status !== "completed") {
      return res.status(400).json({ message: "Job must be completed before review" });
    }

    const review = new Review({
      job: jobId,
      reviewer: req.user._id,
      provider: providerId,
      rating,
      comment,
    });

    await review.save();

    // Recalculate rating using helper
    await recalcProviderRating(providerId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

// GET reviews for a provider
export const getReviewsForProvider = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate("reviewer", "name email")
      .populate("job", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// GET my reviews (client)
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate("provider", "user ratingAvg");
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