import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true},
    password: { type: String, required: true },
    roles: { 
      type: [String], 
      enum: ["client", "provider", "admin"] ,
      default: ["client"]
    },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    services: { type: [String], default: [] },
    providerOnboarding: { type: Boolean, default: false },

    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
