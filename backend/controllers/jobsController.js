// controllers/jobsController.js
import Job from "../models/Job.js";
import Proposal from "../models/Proposal.js";

// CREATE job (client posts a new job)
export const createJob = async (req, res) => {
  try {
    const { category, title, description, location, budget, timeline, attachments, city, state, country } = req.body;

    const job = new Job({
      client: req.user._id,
      category,
      title,
      description,
      budget,
      timeline,
      attachments,
      location,
      city,
      state,
      country,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Error creating job", error: error.message });
  }
};

// GET all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("client", "name email roles");
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

// GET single job by ID + proposals
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("client", "name email roles");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const proposals = await Proposal.find({ job: job._id })
      .populate({
        path: "provider",
        populate: { path: "user", select: "name email" },
      });

    res.json({ job, proposals });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error: error.message });
  }
};

// UPDATE job (client only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, client: req.user._id },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found or not authorized" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
};

// DELETE job (client only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, client: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found or not authorized" });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job", error: error.message });
  }
};

export const getMyJobs = async (req, res) => {
  try {
    let jobs;
    if (req.user.roles.includes("client") ) {
      jobs = await Job.find({ client: req.user._id });
    } else if (req.user.roles.includes("provider")) {
      jobs = await Job.find({ assignedProvider: req.user._id });
    }
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

// ADMIN: force complete a job
export const forceCompleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = "completed";
    await job.save();

    res.json({ message: "Job force-completed by admin", job });
  } catch (error) {
    res.status(500).json({ message: "Error forcing job complete", error: error.message });
  }
};

// ADMIN: cancel job
export const cancelJobByAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = "cancelled";
    await job.save();

    res.json({ message: "Job cancelled by admin", job });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling job", error: error.message });
  }
};

export const assignProvider = async (req, res ) => {
  try {
    const { jobId, providerId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to assign provider for this job" });
    }

    job.status="active";
    job.assignedProvider = providerId;
    await job.save();

    const participants = [job.client, providerId];
    const existingChat = await ChatRoom.findOne({job: job._id});

    if (!existingChat) {
      await ChatRoom.create({ participants, job: job._id });
    }

    res.json({ message: "Provider assigned, job active", job});
  } catch (error) {
    res.status(500).json({ message: "Error assigning provider", error: error.message});
  }
};