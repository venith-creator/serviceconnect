// controllers/providerProfileController.js
import dotenv from "dotenv";
dotenv.config();

import ProviderProfile from "../models/ProviderProfile.js";
import Review from "../models/Review.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";
import User from "../models/User.js";

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
      services = [],
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
      portfolioCaptions = []
    } = parsedData;

    const base = process.env.MINIO_ENDPOINT || "http://localhost:9000";
    const bucket = process.env.MINIO_BUCKET || "serviceconnect-files";
    //  Handle .any() format: req.files is an array
    const allFiles = Array.isArray(req.files) ? req.files : [];

    const docs = allFiles
      .filter(f => f.fieldname === "docs")
      .map(f => ({
        key: f.key,
        bucket: f.bucket,
        originalname: f.originalname,
        location: f.location,
        url: f.location || `${base}/${bucket}/${f.key}`,
      }));

    const portfolio = allFiles
      .filter(f => f.fieldname === "portfolio")
      .map((f, i) => ({
        key: f.key,
        bucket: f.bucket,
        originalname: f.originalname,
        caption: parsedData.portfolioCaptions?.[i] || "",
        location: f.location,
        url: f.location || `${base}/${bucket}/${f.key}`,
      }));

    const avatarFile = allFiles.find(f => f.fieldname === "avatar");
    const avatar = avatarFile
      ? avatarFile.location || `${base}/${bucket}/${avatarFile.key}`
      : null;


    const normalizedServices = services.map(s => ({
      category: s.category,
      rate: Number(s.rate) || 0,
      availability: s.availability || "",
      radiusKm: Number(s.radiusKm) || 0,
      status: "trial",
      trialEndsAt: new Date(Date.now() + 30*24*60*60*1000),
      approved: false
    }));

    // Merge everything
    const profileData = {
      user: req.user._id,
      services: normalizedServices,
      serviceRadiusKm,
      description,
      city,
      state,
      country,
      yearsOfExperience,
      languages,
      availability: availability || "On-call",
      paymentOptions,
      insurance,
      badges,
      docs,
      portfolio,
      avatar,
      status: "pending",
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
    await User.findByIdAndUpdate(req.user._id, { providerOnboarding: true });
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

    const reviews = await Review.find({
        $or: [
          { revieweeProvider: profile._id },
          { reviewee: profile.user._id }, // backward-compatibility
        ],
      })
        .populate("reviewer", "name email avatar")
        .populate("job", "title createdAt status")
        .populate({
            path: "revieweeProvider",
            populate: {
              path: "user",
              select: "name email avatar",
            },
          })
        .sort({ createdAt: -1 })
        .lean();

        const enrichedReviews = reviews.map((r) => ({
          ...r,
          reviewee:
            r.revieweeProvider?.user ||
            r.revieweeUser ||
            r.reviewee ||
            null,
        }));

    res.json({ ...profile.toObject(), reviews: enrichedReviews });
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
      .populate("user", "name email roles avatar")
      .populate("pastJobs", "title budget status createdAt completedAt");

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const reviews = await Review.find({ $or: [
        { revieweeProvider: profile._id },
        { reviewee: profile.user._id },
      ], })
      .populate("reviewer", "name email avatar")
      .populate("job", "title createdAt status")
      .sort({ createdAt: -1 });

      const ratingAvg =
      reviews.length > 0
        ? reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length
        : 0;

      const base = process.env.MINIO_ENDPOINT || "http://localhost:9000";
    const bucket = process.env.MINIO_BUCKET || "serviceconnect-files";

      const enrichedProfile = {
      ...profile.toObject(),
      docs: (profile.docs || []).map((d) => ({
        ...d,
        url: d.url || d.location || `${base}/${bucket}/${d.key}`,
      })),
      portfolio: (profile.portfolio || []).map((p) => ({
        ...p,
        url: p.url || p.location || `${base}/${bucket}/${p.key}`,
      })),
      avatar:
        profile.avatar && !profile.avatar.startsWith("http")
          ? `${base}/${bucket}/${profile.avatar}`
          : profile.avatar,
      reviews,
      ratingAvg,
    };

    res.json({ profile: enrichedProfile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List providers (with filters & pagination)
export const listAllProfiles = async (req, res) => {
  try {
    const { service, city, state, country, minExp, minRating, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (!req.user) {
        filter.suspended = false; // hide only for unauthenticated users
      } else if (!req.user.roles.includes("admin")) {
        filter.suspended = false; // hide for non-admins
      }
// Admins will now see everything (including suspended)

    
    if (req.query.status) filter.status = req.query.status;


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
      .sort({ ratingAvg: -1, createdAt: -1 })
      .lean();

    for (let provider of profiles) {
      const reviews = await Review.find({ $or: [
        { revieweeProvider: provider._id },
        { reviewee: provider.user._id },
      ], });
      provider.ratingAvg =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
          : 0;
    }

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

export const recalcProviderRating = async (providerProfileOrUserId) => {
  try {
    // Try to treat input as ProviderProfile._id first
    let providerProfile = await ProviderProfile.findById(providerProfileOrUserId);

    // If not found, treat input as a User._id and find profile
    if (!providerProfile) {
      providerProfile = await ProviderProfile.findOne({ user: providerProfileOrUserId });
    }

    if (!providerProfile) {
      console.warn("recalcProviderRating: provider profile not found for id:", providerProfileOrUserId);
      return;
    }

    const providerProfileId = providerProfile._id;

    // Only count reviews targeted to the provider profile as provider
    const providerReviews = await Review.find({
      revieweeProvider: providerProfileId,
      revieweeRole: "provider",
    });

    if (!providerReviews.length) {
      await ProviderProfile.findByIdAndUpdate(providerProfileId, {
        ratingAvg: 0,
        ratingCount: 0,
      });
      return;
    }

    const total = providerReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avg = total / providerReviews.length;

    await ProviderProfile.findByIdAndUpdate(providerProfileId, {
      ratingAvg: avg,
      ratingCount: providerReviews.length,
    });
  } catch (err) {
    console.error("❌ Error recalculating provider rating:", err.message || err);
  }
};


export const suspendProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.suspended = true;
    profile.status = "suspended";
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

    profile.approved = true;
    profile.suspended = false;
    profile.status = "approved";
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
    const filter = { approved: true, suspended: false};

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

export const rejectProvider = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await ProviderProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    profile.status = "rejected";
    profile.approved = false;
    profile.rejectionReason = reason || "";
    await profile.save();
    res.json({ message: "Provider rejected", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveService = async (req, res) => {
  try {
    const { id, serviceId } = req.params;
    const profile = await ProviderProfile.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const service = profile.services.id(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    service.approved = true;
    await profile.save();

    res.json({ message: "Service approved", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectService = async (req, res) => {
  try {
    const { id, serviceId } = req.params;
    const { reason } = req.body;
    const profile = await ProviderProfile.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const service = profile.services.id(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    service.approved = false;
    service.status = "rejected";
    service.rejectionReason = reason || "";
    await profile.save();

    res.json({ message: "Service rejected", profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProviderStatus = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.json({ status: "pending" });
    }
    console.log("Provider status check:", req.user._id);

    const servicesStatus = profile.services.map(service => ({
      id: service._id,
      category: service.category,
      status: service.status,
      trialEndsAt: service.trialEndsAt,
      subscriptionExpiresAt: service.subscriptionExpiresAt,
      requiresPayment: service.requiresPayment,
      approved: service.approved,
    }));

    res.json({
      status: profile.status,
      rejectionReason: profile.rejectionReason || "",
      hasActiveSubscription: profile.hasActiveSubscription,
      services: servicesStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all services for the current provider
 */
export const getProviderServices = async (req, res) => {
  try {
    // Get the provider's profile with services
    const profile = await ProviderProfile.findOne({ user: req.user._id })
      .select('services')
      .lean();
    
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Return the services array from the profile
    res.json(profile.services || []);
  } catch (error) {
    console.error('Error fetching provider services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get services requiring payment
 */
export const getServicesRequiringPayment = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const servicesRequiringPayment = profile.services.filter(
      service => service.requiresPayment && service.status === "expired"
    );

    res.json({
      count: servicesRequiringPayment.length,
      services: servicesRequiringPayment.map(service => ({
        id: service._id,
        category: service.category,
        status: service.status,
        trialEndsAt: service.trialEndsAt,
        rate: service.rate,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
