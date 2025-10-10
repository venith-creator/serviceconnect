import mongoose from "mongoose";

const providerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  services: [
    {
      category: String,
      rate: Number,
      availability: String, // free text
      radiusKm: Number,
      status: { type: String, default: "trial" }, // trial, active, suspended, expired
      trialEndsAt: Date,
      subscriptionExpiresAt: Date, // for paid subscriptions
      approved: { type: Boolean, default: false },
      rejectionReason: { type: String, default: "" },
      requiresPayment: { type: Boolean, default: false }, // true when trial expires
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
    }
  ],

  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectionReason: { type: String, default: "" },
  docs: [
    {
      key: String,
      bucket: String,
      originalname: String,
      location: String,
      url: String,
    }
  ],
  serviceRadiusKm: { type: Number, default: 0 },
  description: String,
  city: String,
  state: String,
  country: String,

  yearsOfExperience: Number,
  languages: [String],
  availability: { type: String, enum: ["Full-time", "Part-time", "Weekends", "On-call"], default: "On-call" },
  paymentOptions: [String],

  pastJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  portfolio: [
    {
      key: String,
      bucket: String,
      originalname: String,
      caption: String,
      location: String,
      url: String,
    }
  ],
  avatar: { type: String },

  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  isVerified: { type: Boolean, default: false },
  insurance: { type: String }, // e.g., "General Liability Insurance"
  badges: [String], // e.g., "Top Rated", "Fast Responder"

  responseRate: { type: Number, default: 100 },
  avgResponseTime: { type: Number, default: 0 }, // in hours

  approved: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },

  // Stripe subscription management
  stripeCustomerId: { type: String },
  hasActiveSubscription: { type: Boolean, default: false },
  subscriptionPlan: { type: String, enum: ["basic", "premium"], default: "basic" },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ProviderProfile", providerProfileSchema);