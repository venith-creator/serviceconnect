// scripts/updateMinioUrls.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Job from "../models/Job.js";
import Portfolio from "../models/Portfolio.js"; // if you still have a standalone portfolio model

// Replace these with your actual URLs
const OLD = "https://minio.serviceconnect.uk";
const NEW = "https://minioapi.serviceconnect.uk";

// ✅ Helper to safely replace old MinIO URLs
const replaceUrl = (val) =>
  typeof val === "string" && val.includes(OLD) ? val.replaceAll(OLD, NEW) : val;

// ✅ Generic batch processor (safe for large collections)
async function processInBatches(Model, handler, batchSize = 100) {
  const total = await Model.countDocuments();
  console.log(`\n🧩 Processing ${Model.modelName} (${total} docs)...`);

  for (let skip = 0; skip < total; skip += batchSize) {
    const docs = await Model.find().skip(skip).limit(batchSize);
    for (const doc of docs) {
      const changed = await handler(doc);
      if (changed) await doc.save();
    }
    console.log(`   ✅ Processed ${Math.min(skip + batchSize, total)} / ${total}`);
  }

  console.log(`✅ Done ${Model.modelName}\n`);
}

// ✅ USERS — avatar only
async function updateUsers(user) {
  if (!user.avatar) return false;
  const newUrl = replaceUrl(user.avatar);
  if (newUrl !== user.avatar) {
    user.avatar = newUrl;
    return true;
  }
  return false;
}

// ✅ PROVIDER PROFILES — avatar, docs[], portfolio[]
async function updateProviderProfiles(profile) {
  let changed = false;

  // avatar
  if (profile.avatar) {
    const newUrl = replaceUrl(profile.avatar);
    if (newUrl !== profile.avatar) {
      profile.avatar = newUrl;
      changed = true;
    }
  }

  // docs[]
  if (Array.isArray(profile.docs)) {
    const updatedDocs = profile.docs.map((doc) => ({
      ...doc,
      url: replaceUrl(doc.url),
      location: replaceUrl(doc.location),
    }));
    if (JSON.stringify(updatedDocs) !== JSON.stringify(profile.docs)) {
      profile.docs = updatedDocs;
      changed = true;
    }
  }

  // portfolio[]
  if (Array.isArray(profile.portfolio)) {
    const updatedPortfolio = profile.portfolio.map((item) => ({
      ...item,
      url: replaceUrl(item.url),
      location: replaceUrl(item.location),
    }));
    if (JSON.stringify(updatedPortfolio) !== JSON.stringify(profile.portfolio)) {
      profile.portfolio = updatedPortfolio;
      changed = true;
    }
  }

  return changed;
}

// ✅ JOBS — attachments[].url
async function updateJobs(job) {
  if (!Array.isArray(job.attachments)) return false;
  const updated = job.attachments.map((a) => ({
    ...a,
    url: replaceUrl(a.url),
  }));
  if (JSON.stringify(updated) !== JSON.stringify(job.attachments)) {
    job.attachments = updated;
    return true;
  }
  return false;
}

// ✅ (Optional) PORTFOLIO MODEL — media[].url if exists
async function updatePortfolios(p) {
  if (!Array.isArray(p.media)) return false;
  const updated = p.media.map((m) => ({
    ...m,
    url: replaceUrl(m.url),
  }));
  if (JSON.stringify(updated) !== JSON.stringify(p.media)) {
    p.media = updated;
    return true;
  }
  return false;
}

// ✅ MAIN
async function main() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await processInBatches(User, updateUsers);
    await processInBatches(ProviderProfile, updateProviderProfiles);
    await processInBatches(Job, updateJobs);
    await processInBatches(Portfolio, updatePortfolios);

    console.log("🎉 All MinIO URLs updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during update:", err);
    process.exit(1);
  }
}

main();
