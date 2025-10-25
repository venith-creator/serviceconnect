// controllers/providerDashboardController.js
import Proposal from "../models/Proposal.js";
import Job from "../models/Job.js";
import Review from "../models/Review.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Portfolio from "../models/Portfolio.js";

export const getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.params.providerId;

    // ✅ 1. Find Provider Profile
    const providerProfile = await ProviderProfile.findOne({ user: providerId })
      .populate("user", "name email avatar");

    if (!providerProfile)
      return res.status(404).json({ message: "Provider profile not found" });

    // ✅ 2. Fetch Proposals by this provider
    const proposals = await Proposal.find({ provider: providerProfile._id })
      .populate({
        path: "job",
        select: "title category budget status",
      })
      .lean();

    const totalProposals = proposals.length;
    const acceptedProposals = proposals.filter(p => p.status === "accepted").length;
    const withdrawnProposals = proposals.filter(p => p.status === "withdrawn").length;
    const rejectedProposals = proposals.filter(p => p.status === "rejected").length;
    const completedProposals = proposals.filter(p => p.status === "completed").length;

    // ✅ 3. Jobs assigned to this provider
    const jobs = await Job.find({ assignedProvider: providerProfile._id }).lean();
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === "active").length;
    const completedJobs = jobs.filter(j => j.status === "completed").length;

    // ✅ 4. Reviews for this provider
    const reviews = await Review.find({
      revieweeRole: "provider",
      $or: [
        { revieweeProvider: providerId },
        { reviewee: providerId },
      ],
    })
      .populate("reviewer", "name email avatar")
      .populate("job", "title")
      .lean();

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
        : 0;

    const portfolios = await Portfolio.find({ provider: providerProfile._id }).lean();

            const totalPosts = portfolios.length;
            let totalLikes = 0;
            let totalComments = 0;

            for (const post of portfolios) {
            totalLikes += post.likes?.length || 0;
            totalComments += post.comments?.length || 0;

            // Include replies too if you want deeper comment count:
            for (const c of post.comments || []) {
                totalComments += c.replies?.length || 0;
            }
            }

    // ✅ 5. Send summary response
    res.json({
      provider: {
        id: providerProfile._id,
        name: providerProfile.user.name,
        email: providerProfile.user.email,
        avatar: providerProfile.user.avatar,
        ratingAvg: providerProfile.ratingAvg || avgRating,
        ratingCount: totalReviews,
      },
      stats: {
        proposals: {
          total: totalProposals,
          accepted: acceptedProposals,
          withdrawn: withdrawnProposals,
          rejected: rejectedProposals,
          completed: completedProposals,
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          completed: completedJobs,
        },
        reviews: {
          total: totalReviews,
          avgRating,
          details: reviews,
        },
        posts: {
            total: totalPosts,
            likes: totalLikes,
            comments: totalComments,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching provider dashboard:", error);
    res.status(500).json({ message: "Error fetching provider dashboard", error: error.message });
  }
};
