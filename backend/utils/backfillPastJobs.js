import mongoose from "mongoose";
import Job from "../models/Job.js";
import ProviderProfile from "../models/ProviderProfile.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const completedJobs = await Job.find({ status: "completed" });

    console.log(`📦 Found ${completedJobs.length} completed jobs.`);

    for (const job of completedJobs) {
      if (!job.assignedProvider) continue;

      const provider = await ProviderProfile.findById(job.assignedProvider);
      if (!provider) continue;

      const alreadyExists = provider.pastJobs.some((j) => j.equals(job._id));

      if (!alreadyExists) {
        provider.pastJobs.push(job._id);
        await provider.save();
        console.log(`✅ Added job ${job._id} to provider ${provider._id}`);
      }
    }

    console.log("🎉 Backfill complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during backfill:", err);
    process.exit(1);
  }
})();
