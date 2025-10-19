import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ roles: "client" }).select("avatar email name");
    console.log(user);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
  }
})();
