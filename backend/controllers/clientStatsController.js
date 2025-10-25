// controllers/clientStatsController.js
import Job from "../models/Job.js";
import Proposal from "../models/Proposal.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Review from "../models/Review.js";


export const getClientDashboardStats = async (req, res) => {
  try {
    const clientId = req.user._id;

    // Fetch client’s jobs (for computing totals + spent)
    const clientJobs = await Job.find({ client: clientId }, "_id budget status");
    const jobIds = clientJobs.map((j) => j._id);

    // --- Jobs ---
    const [openJobs, activeJobs, completedJobs, cancelledJobs] = await Promise.all([
      Job.countDocuments({ client: clientId, status: "open" }),
      Job.countDocuments({ client: clientId, status: "active" }),
      Job.countDocuments({ client: clientId, status: "completed" }),
      Job.countDocuments({ client: clientId, status: "cancelled" }),
    ]);

    // --- Proposals ---
    const [totalProposals, pendingProposals, acceptedProposals] = await Promise.all([
      Proposal.countDocuments({ job: { $in: jobIds } }),
      Proposal.countDocuments({ job: { $in: jobIds }, status: "pending" }),
      Proposal.countDocuments({ job: { $in: jobIds }, status: "accepted" }),
    ]);

    // --- REVIEWS ---
    const [reviewsGiven, reviewsReceived, avgRatingData] = await Promise.all([
      Review.countDocuments({ reviewer: clientId, reviewerRole: "client" }),
      Review.countDocuments({ revieweeRole: "client", $or: [{ revieweeUser: clientId }, { reviewee: clientId }] }),
      Review.aggregate([
        {
          $match: {
            revieweeRole: "client",
            $or: [{ revieweeUser: clientId }, { reviewee: clientId }],
            rating: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const averageRating = avgRatingData.length ? Number(avgRatingData[0].avgRating.toFixed(1)) : 0;
    // --- Derived Stats ---
    const totalSpent = clientJobs
      .filter((j) => j.status === "completed")
      .reduce((sum, j) => sum + (j.budget || 0), 0);

    res.json({
      jobStats: { openJobs, activeJobs, completedJobs, cancelledJobs },
      proposalStats: { totalProposals, pendingProposals, acceptedProposals },
      reviewStats: { reviewsGiven, reviewsReceived, averageRating },
      totalSpent,
    });
  } catch (error) {
    console.error("Error fetching client dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
};
