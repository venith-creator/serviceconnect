import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: String,
    budget: Number,
    timeline: String, // e.g. "2 weeks", "flexible"
    attachments: [{ url: String }],
    clientEmail: { type: String },
    clientPhone: { type: String },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    city: String,
    state: String,
    country: String,
    status: { 
      type: String, 
      enum: ["open", "taken", "active", "completed", "cancelled"], 
      default: "open" 
    },
    assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile" },
  },
  { timestamps: true }
);

jobSchema.index({ location: "2dsphere" });

export default mongoose.model("Job", jobSchema);
