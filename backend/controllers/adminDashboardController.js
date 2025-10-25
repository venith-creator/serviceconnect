// controllers/adminDashboardController.js
import ProviderProfile from "../models/ProviderProfile.js";
import Job from "../models/Job.js";
import Proposal from "../models/Proposal.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // ✅ Protect route: only admin
    if (!req.user || !req.user.roles.includes("admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ---------------------------------------------------------
    // PROVIDER STATS
    // ---------------------------------------------------------
    const totalProviders = await ProviderProfile.countDocuments();
    const approvedProviders = await ProviderProfile.countDocuments({ status: "approved" });
    const pendingProviders = await ProviderProfile.countDocuments({ status: "pending" });
    const rejectedProviders = await ProviderProfile.countDocuments({ status: "rejected" });
    const suspendedProviders = await ProviderProfile.countDocuments({ status: "suspended" });

    // ---------------------------------------------------------
    // SERVICE STATS
    // ---------------------------------------------------------
    const allProfiles = await ProviderProfile.find({}, "services").lean();

    let totalServices = 0;
    let approvedServices = 0;
    let pendingServices = 0;
    let rejectedServices = 0;
    let trialServices = 0;
    let activePaidServices = 0;

    for (const profile of allProfiles) {
      for (const service of profile.services || []) {
        totalServices++;
        switch (service.status) {
          case "approved":
            approvedServices++;
            break;
          case "pending":
            pendingServices++;
            break;
          case "rejected":
            rejectedServices++;
            break;
          case "trial":
            trialServices++;
            // detect if trial expired (optional future enhancement)
            break;
          case "active":
            activePaidServices++;
            break;
        }
      }
    }

    // ---------------------------------------------------------
    // PAYMENT / PLAN STATS
    // ---------------------------------------------------------
    const trialProviders = await ProviderProfile.countDocuments({
      "services.status": "trial",
    });
    const activePaidProviders = await ProviderProfile.countDocuments({
      "services.status": "active",
    });

    // ---------------------------------------------------------
    // JOBS / PROPOSALS / REVIEWS OVERVIEW
    // ---------------------------------------------------------
    const totalJobs = await Job.countDocuments();
    const completedJobs = await Job.countDocuments({ status: "completed" });
    const activeJobs = await Job.countDocuments({ status: "active" });
    const pendingJobs = await Job.countDocuments({ status: "pending" });

    const totalProposals = await Proposal.countDocuments();
    const totalReviews = await Review.countDocuments();

    // ---------------------------------------------------------
    // BUILD RESPONSE
    // ---------------------------------------------------------
    res.json({
      summary: {
        providers: {
          total: totalProviders,
          approved: approvedProviders,
          pending: pendingProviders,
          rejected: rejectedProviders,
          suspended: suspendedProviders,
          trial: trialProviders,
          activePaid: activePaidProviders,
        },
        services: {
          total: totalServices,
          approved: approvedServices,
          pending: pendingServices,
          rejected: rejectedServices,
          trial: trialServices,
          active: activePaidServices,
        },
        jobs: {
          total: totalJobs,
          completed: completedJobs,
          active: activeJobs,
          pending: pendingJobs,
        },
        proposals: totalProposals,
        reviews: totalReviews,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching admin dashboard:", err);
    res.status(500).json({ message: "Error fetching admin dashboard", error: err.message });
  }
};
