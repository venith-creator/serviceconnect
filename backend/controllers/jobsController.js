import Job from "../models/Job.js";
import Proposal from "../models/Proposal.js";
import User from "../models/User.js";
import fetch from "node-fetch";
import ProviderProfile from "../models/ProviderProfile.js";

// CREATE job (client posts a new job)
export const createJob = async (req, res) => {
  try {
    let parsedData = {};

    if (req.body.data) {
      try {
        parsedData = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON in data field" });
      }
    } else {
      parsedData = req.body;
    }

    const {
      category,
      title,
      description,
      location,
      budget,
      timelineStart,
      timelineEnd,
      city,
      state,
      country,
      email,
      phone,
    } = parsedData;

    // ✅ wrap each file path in { url }
    const attachments =
        req.files?.map((f) => ({
          url: f.location,   // ✅ public MinIO/S3 URL
          key: f.key,        // optional: useful if you want to delete later
        })) || [];

    const geoLocation = await geocodeLocation(location);
    let jobData = {
      category,
      title,
      description,
      budget,
      timelineStart,
      timelineEnd,
      attachments,
      location: {
        type: "Point",
        coordinates: geoLocation.coordinates,
        address: location,
      },
      city,
      state,
      country,
    };

    if (req.user) {
      // logged-in client
      jobData.client = req.user._id;
    } else {
      // guest posting
      jobData.clientEmail = email;
      jobData.clientPhone = phone;

      if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          jobData.client = existingUser._id;
        }
      }
    }

    const job = new Job(jobData);
    await job.save();

    res.status(201).json(job);
  } catch (error) {
    console.error("❌ Job creation error:", error);
    res.status(500).json({
      message: "Error creating job",
      error: error.message,
      stack: error.stack,
    });
  }
};

const geocodeLocation = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await response.json();
    if (data.length > 0) {
      return {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
        address,
      };
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
  // fallback (if no match)
  return {
    type: "Point",
    coordinates: [0, 0],
    address,
  };
};

// ✅ GET all jobs (with optional filters)
export const getJobs = async (req, res) => {
  try {
    const { keyword, category, location, lat, lon, maxDistance, city, state, country, status, limit } = req.query;
    const filter = {};

    //  Keyword filter (by title)
    if (keyword) {
      filter.title = { $regex: keyword, $options: "i" };
    }

    //  Category filter
    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    //  Text-based city/state/country filter
    if (city) filter.city = { $regex: city, $options: "i" };
    if (state) filter.state = { $regex: state, $options: "i" };
    if (country) filter.country = { $regex: country, $options: "i" };

    // 📍 Optional text address filter (for manual input)
    if (location) {
      filter["location.address"] = { $regex: location, $options: "i" };
    }

    //  Geo-filter: find jobs near given coordinates
    if (lat && lon) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: maxDistance ? parseInt(maxDistance) : 10000, // 10 km default
        },
      };
    }

    if (limit) {
        const filteredJobs = await Job.find(
            filter
        ).populate("client", "name email roles").limit(limit);

        res.json(filteredJobs);
    }

    const jobs = await Job.find(filter).populate("client", "name email roles");
    res.json(jobs);
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

export const getJobByIdExcludeProposals = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("client", "name email roles");
    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job", error: error.message });
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
// ✅ CLIENT: mark job as completed
export const markJobCompleted = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only job owner can mark as completed
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to complete this job" });
    }

    if (!job.assignedProvider) {
      return res.status(400).json({ message: "No provider assigned to this job" });
    }

    // Update job status
    job.status = "completed";
    job.completedAt = new Date();
    await job.save();

     const providerProfile = await ProviderProfile.findById(job.assignedProvider);
      if (providerProfile) {
        const alreadyAdded = providerProfile.pastJobs.some(
          j => j.toString() === job._id.toString()
        );

        if (!alreadyAdded) {
          providerProfile.pastJobs.push(job._id);
          await providerProfile.save();
          console.log("✅ Job added to pastJobs:", job._id);
        } else {
          console.log("⚠️ Job already exists in pastJobs:", job._id);
        }
}



    // Also update accepted proposal (if any)
    await Proposal.updateMany(
      { job: job._id, status: "accepted" },
      { $set: { status: "completed" } }
    );

    res.json({ message: "Job marked as completed successfully", job });
  } catch (error) {
    console.error("❌ markJobCompleted error:", error);
    res.status(500).json({ message: "Error marking job completed", error: error.message });
  }
};
export const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("client", "name email")
      .populate({
        path: "assignedProvider",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error("❌ Error fetching all jobs for admin:", error);
    res.status(500).json({ message: "Error fetching jobs", error: error.message });
  }
};

export const getCompletedJobsForClient = async (req, res) => {
  try {
    const jobs = await Job.find({
      client: req.user._id,
      status: "completed",
    })
      .populate({
        path: "assignedProvider",
        populate: { path: "user", select: "name email" },
      })
      .lean();

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching completed jobs", error: error.message });
  }
};

// ✅ PROVIDER: Get completed jobs they've done
export const getCompletedJobsForProvider = async (req, res) => {
  try {
    // 1️⃣ Find provider profile by the logged-in user's ID
    const providerProfile = await ProviderProfile.findOne({ user: req.user._id });
    if (!providerProfile) {
      return res.status(404).json({ message: "Provider profile not found" });
    }

    // 2️⃣ Use the profile ID to query completed jobs
    const jobs = await Job.find({
      assignedProvider: providerProfile._id, // ✅ FIXED
      status: "completed",
    })
      .populate("client", "name email")
      .lean();

    res.json(jobs);
  } catch (error) {
    console.error("❌ Error fetching provider completed jobs:", error);
    res.status(500).json({
      message: "Error fetching completed jobs for provider",
      error: error.message,
    });
  }
};

