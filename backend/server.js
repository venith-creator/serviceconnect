// server.js
import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import detect from "detect-port";
import connectDB from "./config/db.js";
import { initSocket } from "./utils/socket.js";
import { setSocketServer } from "./controllers/chatController.js";


import userRoutes from "./routes/userRoutes.js";
import providerProfileRoutes from "./routes/providerProfileRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js"
import aiRoutes from "./routes/aiRoutes.js"

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
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
app.use("/api/ai", aiRoutes)

const PORT = process.env.PORT || 5000;
detect(DEFAULT_PORT).then(port => {
  if (port !== DEFAULT_PORT) {
    console.warn(
      `⚠️ Port ${DEFAULT_PORT} is busy, using fallback port ${port} instead.`
    );
  }
  server.listen(port, () => console.log(`✅ Server running on port ${port}`));
});