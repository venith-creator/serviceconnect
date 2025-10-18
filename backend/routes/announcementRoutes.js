import express from "express";
import { createAnnouncement, getAnnouncements } from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.post("/", protect, authorizeRoles(["admin"]), createAnnouncement);
router.get("/", protect, authorizeRoles(["admin"]), getAnnouncements);
export default router;
