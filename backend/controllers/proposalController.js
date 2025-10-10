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

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) return res.status(400).json({ message: "Provider profile not found" });

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
      .populate("job", "title category budget status")
      .populate({
        path: "provider",
        select: "headline services", // enrich provider info
        populate: { path: "user", select: "name email" },
      });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error: error.message });
  }
};

// GET proposals for a specific job (client only)
export const getProposalsForJob = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      job: req.params.jobId,
      status: { $in: ["pending", "accepted"] }, // exclude withdrawn/rejected
    })
      .populate({
        path: "provider",
        select: "headline services",
        populate: { path: "user", select: "name email" },
      })
      .populate("job", "title category");

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
        select: "headline services",
        populate: { path: "user", select: "name email" },
      });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching proposals", error: error.message });
  }
};

// ACCEPT proposal (client chooses a provider)
export const acceptProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate("job provider");
    if (!proposal) return res.status(404).json({ message: "Proposal not found" });

    const job = await Job.findById(proposal.job._id);

    // Ensure only job owner (client) can accept
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this proposal" });
    }

    // Prevent re-accepting if job already active/completed
    if (job.status !== "open") {
      return res.status(400).json({ message: "Job is not open for new proposals" });
    }

    // Update job → assign provider + activate
    job.status = "active";
    job.assignedProvider = proposal.provider._id;
    await job.save();

    // Mark this proposal as accepted
    proposal.status = "accepted";
    await proposal.save();

    // Reject all other proposals for this job
    await Proposal.updateMany(
      { job: job._id, _id: { $ne: proposal._id } },
      { $set: { status: "rejected" } }
    );

    const participants = [job.client, proposal.provider];
    const existingChat = await ChatRoom.findOne({job: job._id});

    if (!existingChat) {
      await ChatRoom.create({
        job: job._id,
        participants,
        createdBy: req.user._id,
      });
    }

    res.json({ message: "Proposal accepted, job activated", job, acceptedProposal: proposal });
  } catch (error) {
    res.status(500).json({ message: "Error accepting proposal", error: error.message });
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
