// controllers/proposalController.js
import Proposal from "../models/Proposal.js";
import Job from "../models/Job.js";
import ProviderProfile from "../models/ProviderProfile.js";
import ChatRoom from "../models/chatRoom.js";
import e from "express";

// CREATE proposal for a job
export const createProposal = async (req, res) => {
  try {
    const { jobId, message, price, timelineEstimate } = req.body;

    const job = await Job.findById(jobId).populate("client", "name email _id");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) return res.status(400).json({ message: "Provider profile not found" });

    // 3️⃣ Prevent self-proposal (user posting as client cannot submit)
    const isOwnJob =
      job.client && job.client._id.toString() === req.user._id.toString();

    const isOwnGuestJob =
      job.clientEmail &&
      job.clientEmail.toLowerCase() === req.user.email.toLowerCase();

    if (isOwnJob || isOwnGuestJob) {
      return res.status(403).json({
        message: "You cannot submit a proposal for your own job posting.",
      });
    }

    // Prevent duplicate proposals for the same job
    const existing = await Proposal.findOne({ job: jobId, provider: providerProfile._id });
    if (existing) {
      return res.status(400).json({ message: "You already submitted a proposal for this job" });
    }

    const proposal = new Proposal({
      job: jobId,
      provider: providerProfile._id,
      message,
      price,
      timelineEstimate,
      status: "pending", // explicitly set
    });

    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Error creating proposal", error: error.message });
  }
};

// GET proposals created by logged-in provider
export const getMyProposals = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });

    const proposals = await Proposal.find({ provider: providerProfile._id })
      .populate({
        path: "job",
        select: "title category budget status client",
        populate: {
          path: "client",
          select: "name email",
        },
      })
      .populate({
        path: "provider",
        select: "headline services",
        populate: { path: "user", select: "name email" },
      });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error: error.message });
  }
};


export const getProposalsForJob = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      job: req.params.jobId,
      status: { $in: ["pending", "accepted", "rejected","withdrawn","completed"] },
    })
      .populate({
          path: "provider",
          select: "headline services description city state yearsOfExperience portfolio",
          populate: [
            { path: "user", select: "name email" },
          ],
        })
      .populate({
        path: "job",
        select: "title category client",
        populate: { path: "client", select: "name email" }, // 👈 Added this
      });
      proposals.forEach((proposal) => {
        console.log("Provider in proposal:", JSON.stringify(proposal.provider, null, 2));
      });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error: error.message });
  }
};


// UPDATE proposal (provider only)
export const updateProposal = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });

    // Only allow safe fields to be updated
    const { message, price, timelineEstimate } = req.body;

    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, provider: providerProfile._id },
      { message, price, timelineEstimate },
      { new: true }
    );
    if (!proposal) return res.status(404).json({ message: "Proposal not found or not authorized" });

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ message: "Error updating proposal", error: error.message });
  }
};

// DELETE proposal (provider only)
export const deleteProposal = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    const proposal = await Proposal.findOneAndDelete({ _id: req.params.id, provider: providerProfile._id });
    if (!proposal) return res.status(404).json({ message: "Proposal not found or not authorized" });

    res.json({ message: "Proposal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting proposal", error: error.message });
  }
};

// ADMIN: get all proposals (with optional filters)
export const getAllProposals = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.job) filters.job = req.query.job;

    const proposals = await Proposal.find(filters)
      .populate("job", "title category client")
      .populate({
        path: "provider",
        select: "headline services description city state yearsOfExperience portfolio",
        populate: [
          { path: "user", select: "name email" },
        ],
      })
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error: error.message });
  }
};

// ACCEPT proposal (client chooses a provider)
export const acceptProposal = async (req, res) => {
  console.log("🟢 Incoming request to accept proposal");
  console.log("User ID from token:", req.user?._id);
  console.log("Proposal ID param:", req.params.id);

  try {
    // 1️⃣ Find proposal and its linked job
    const proposal = await Proposal.findById(req.params.id).populate("job provider");
    if (!proposal) {
      console.warn("❌ Proposal not found with ID:", req.params.id);
      return res.status(404).json({ message: "Proposal not found" });
    }

    const job = await Job.findById(proposal.job._id);
    if (!job) {
      console.warn("❌ Linked job not found for proposal:", proposal._id);
      return res.status(404).json({ message: "Linked job not found" });
    }

    // 2️⃣ Log key context
    console.log("🔹 Job ID:", job._id);
    console.log("🔹 Job client:", job.client);
    console.log("🔹 Proposal provider:", proposal.provider?._id);
    console.log("🔹 Job status:", job.status);

    // 3️⃣ Authorization check — only job owner can accept
    if (job.client.toString() !== req.user._id.toString()) {
      console.warn("🚫 Unauthorized attempt: user", req.user._id, "is not job owner", job.client);
      return res.status(403).json({
        message: "You are not authorized to accept this proposal — only the job owner can do that",
        debug: { loggedInUser: req.user._id, jobClient: job.client }
      });
    }

    // 4️⃣ Status check
    if (job.status !== "open") {
      console.warn("⚠️ Job is not open:", job.status);
      return res.status(400).json({
        message: "Job is not open for new proposals",
        debug: { currentStatus: job.status }
      });
    }

    // 5️⃣ Update job status and assign provider
    job.status = "active";
    job.assignedProvider = proposal.provider._id;
    await job.save();
    console.log("✅ Job status updated to ACTIVE and provider assigned:", proposal.provider._id);

    // 6️⃣ Update proposal to accepted
    proposal.status = "accepted";
    await proposal.save();
    console.log("✅ Proposal marked as ACCEPTED:", proposal._id);

    // 7️⃣ Reject other proposals for same job
    const rejectResult = await Proposal.updateMany(
      { job: job._id, _id: { $ne: proposal._id } },
      { $set: { status: "rejected" } }
    );
    console.log("🔻 Other proposals rejected:", rejectResult.modifiedCount);

    // 8️⃣ Create chat room if it doesn't exist
    const participants = [job.client, proposal.provider.user || proposal.provider];
    const existingChat = await ChatRoom.findOne({ job: job._id });
    if (!existingChat) {
      await ChatRoom.create({
        job: job._id,
        participants,
        createdBy: req.user._id,
      });
      console.log("💬 New ChatRoom created for job:", job._id);
    } else {
      console.log("💬 ChatRoom already exists for job:", job._id);
    }

    // 9️⃣ Success
    console.log("🎉 Proposal accepted successfully for job:", job._id);
    res.json({
      message: "Proposal accepted successfully",
      job,
      acceptedProposal: proposal
    });

  } catch (error) {
    console.error("🔥 Error in acceptProposal:", error);
    res.status(500).json({
      message: "Error accepting proposal",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};


// WITHDRAW proposal (provider only)
export const withdrawProposal = async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(400).json({ message: "Provider profile not found" });
    }

    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id, provider: providerProfile._id },
      { status: "withdrawn" },
      { new: true }
    );

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found or not authorized" });
    }

    res.json({ message: "Proposal withdrawn successfully", proposal });
  } catch (error) {
    res.status(500).json({ message: "Error withdrawing proposal", error: error.message });
  }
};
