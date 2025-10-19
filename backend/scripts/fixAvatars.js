// scripts/fixAvatars.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User.js";
import { getFileUrl } from "../middleware/upload.js";

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const bucket = process.env.MINIO_BUCKET || "serviceconnect-files";

  const users = await User.find({ avatar: { $exists: true, $ne: null } });

  for (const u of users) {
    if (!/^https?:\/\//i.test(u.avatar)) {
      const key = u.avatar.replace(/^\/+/, "").replace(/\\/g, "/");
      u.avatar = getFileUrl(bucket, key);
      await u.save();
      console.log(`Updated avatar for ${u.email}`);
    }
  }

  console.log("✅ Fixed avatars for existing users.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
