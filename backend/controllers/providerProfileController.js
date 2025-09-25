// controllers/providerProfileController.js
import ProviderProfile from "../models/ProviderProfile.js";
import Review from "../models/Review.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

//  Create or Update Profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.roles.includes("provider")) {
      return res.status(403).json({ message: "Only providers can create/update profiles" });
    }

    let parsedData = {};
    if (req.body.data) {
      try {
        parsedData = JSON.parse(req.body.data);
      } catch (err) {
        return res.status(400).json({ message: "Invalid JSON in data field" });
      }
    }

    const {
      services,
      serviceRadiusKm,
      description,
      city,
      state,
      country,
      yearsOfExperience,
      languages,
      availability,
      paymentOptions,
      insurance,
      badges
    } = parsedData;

    // 🔹 Grab uploaded files
    const docs = req.files?.docs?.map((f) => f.path) || [];
    const portfolio = req.files?.portfolio?.map((f) => ({
      url: f.path,
      caption: "" // you can extend frontend to send caption later
    })) || [];
    const avatar = req.files?.avatar?.[0]?.path || null;

    // Merge everything
    const profileData = {
      user: req.user._id,
      services,
      serviceRadiusKm,
      description,
      city,
      state,
      country,
      yearsOfExperience,
      languages,
      availability,
      paymentOptions,
      insurance,
      badges,
      docs,
      portfolio,
      avatar
    };

    let profile = await ProviderProfile.findOne({ user: req.user._id });

    if (profile) {
      profile = await ProviderProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileData },
        { new: true }
      );
      return res.json(profile);
    }

    const newProfile = new ProviderProfile(profileData);
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  Get logged-in provider profile + reviews
export const getMyProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id })
      .populate("user", "name email roles")
      .populate("pastJobs", "title budget status createdAt completedAt");

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const reviews = await Review.find({ provider: profile._id })
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    res.json({ ...profile.toObject(), reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Public: Get profile by ID
export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid profile id" });
    }

    const profile = await ProviderProfile.findById(id)
      .populate("user", "name email roles")
      .populate("pastJobs", "title budget status createdAt completedAt");

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const reviews = await Review.find({ provider: profile._id })
      .populate("reviewer", "name")
      .sort({ createdAt: -1 });

    res.json({ ...profile.toObject(), reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List providers (with filters & pagination)
export const listAllProfiles = async (req, res) => {
  try {
    const { service, city, state, country, minExp, minRating, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (!req.user || !req.user.roles.includes("admin")) {
      filter.approved = true;
      filter.suspended = false;
    }

    if (service) filter["services.category"] = new RegExp(service, "i");
    if (city) filter.city = new RegExp(city, "i");
    if (state) filter.state = new RegExp(state, "i");
    if (country) filter.country = new RegExp(country, "i");
    if (minExp) filter.yearsOfExperience = { $gte: Number(minExp) };
    if (minRating) filter.ratingAvg = { $gte: Number(minRating) };

    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 20, 1);
    const skip = (p - 1) * l;

    const total = await ProviderProfile.countDocuments(filter);

    const profiles = await ProviderProfile.find(filter)
      .populate("user", "name roles")
      .skip(skip)
      .limit(l)
      .sort({ ratingAvg: -1, createdAt: -1 });

    res.json({ total, page: p, limit: l, profiles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete provider profile
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid profile id" });
    }

    const profile = await ProviderProfile.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    await profile.deleteOne();
    res.json({ message: "Provider profile removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Auto-update pastJobs when job completes
export const addCompletedJobToProvider = async (jobId, providerId) => {
  try {
    const job = await Job.findById(jobId);
    if (!job || job.status !== "completed") return;

    await ProviderProfile.findOneAndUpdate(
      { user: providerId },
      { $addToSet: { pastJobs: job._id } } // no duplicates
    );
  } catch (error) {
    console.error("Error updating past jobs:", error.message);
  }
};

//  Extra: Get provider stats (jobs, ratings, etc.)
export const getProviderStats = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id }).populate("pastJobs");
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const totalJobs = profile.pastJobs.length;
    const completedJobs = profile.pastJobs.filter(j => j.status === "completed").length;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    res.json({
      totalJobs,
      completedJobs,
      completionRate,
      avgRating: profile.ratingAvg,
      ratingCount: profile.ratingCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const recalcProviderRating = async (providerId) => {
  try {
    const reviews = await Review.find({ provider: providerId });
    const ratingCount = reviews.length;
    const ratingAvg = ratingCount > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount
      : 0;

    await ProviderProfile.findByIdAndUpdate(providerId, {
      ratingCount,
      ratingAvg
    });
  } catch (err) {
    console.error("Error recalculating rating:", err.message);
  }
};

export const suspendProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.suspended = true; // add `suspended` field in schema if not present**
    await profile.save();

    res.json({ message: "Provider suspended", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.approved = true; // add `approved` field in schema**
    await profile.save();

    res.json({ message: "Provider approved", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderStatsAdmin = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id).populate("pastJobs");
    if (!profile) return res.status(404).json({ message: "Profile not found" });  

    const totalJobs = profile.pastJobs.length;
    const completedJobs = profile.pastJobs.filter(j => j.status === "completed").length;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;  
    res.json({
      totalJobs,
      completedJobs,
      completionRate,
      avgRating: profile.ratingAvg,
      ratingCount: profile.ratingCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveProviders = async (req, res) => {
  try {
    const { service, city, state, country, minExp, page = 1, limit = 20 } = req.query;
    const filter = { approved: true, suspended: false };

    if (service) filter["services.category"] = new RegExp(service, "i");
    if (city) filter.city = new RegExp(city, "i");
    if (state) filter.state = new RegExp(state, "i");
    if (country) filter.country = new RegExp(country, "i");
    if (minExp) filter.yearsOfExperience = { $gte: Number(minExp) };

    const p = Math.max(Number(page) || 1, 1);
    const l = Math.max(Number(limit) || 20, 1);
    const skip = (p - 1) * l;

    const total = await ProviderProfile.countDocuments(filter);

    const activeProviders = await ProviderProfile.find(filter)
      .populate("user", "name role")
      .skip(skip)
      .limit(l)
      .sort({ createdAt: -1 });

    res.json({ total, page: p, limit: l, providers: activeProviders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
