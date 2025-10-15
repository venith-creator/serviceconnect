import dotenv from "dotenv";
dotenv.config();
import http from "http";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import multer from "multer";
import { initSocket } from "./utils/socket.js";
import { setSocketServer } from "./controllers/chatController.js";
import { cleanupOrphanReviews } from "./controllers/reviewController.js";
import userRoutes from "./routes/userRoutes.js";
import providerProfileRoutes from "./routes/providerProfileRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// DB Connection Logs
console.log("🔌 Connecting to MongoDB...");
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(cors());

// Stripe webhook needs raw body - apply this BEFORE express.json()
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
setTimeout(cleanupOrphanReviews, 5000);
// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers["user-agent"], req.ip);
  if (req.method !== "GET") {
    console.log("Body:", req.body);
  }
  next();
});

const server = http.createServer(app);
const io = initSocket(server);



setSocketServer(io);
const DEFAULT_PORT = process.env.PORT || 5000;

// Routes
app.use("/api/users", userRoutes);
app.use("/api/provider-profiles", providerProfileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);

// Static folder for uploads
app.use("/uploads", express.static("uploads"));

// Error Logger
app.use((err, req, res, next) => {
  console.error("🔥 Error caught:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

// Uncaught exceptions & rejections
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection:", reason);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});