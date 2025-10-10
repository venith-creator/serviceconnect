import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: String,
    budget: Number,
    timelineStart: { type: Date },
    timelineEnd: { type: Date },
    attachments: [{ url: String }],
    clientEmail: { type: String },
    clientPhone: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
      address: {
        type: String, // "Ikorodu, Lagos"
        required: true,
      },
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
