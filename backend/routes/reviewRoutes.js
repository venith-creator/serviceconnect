import express from "express";
import { createReview, getReviewsForProvider, getMyReviews, deleteReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("client"), createReview);
router.get("/my", protect, authorizeRoles("client"), getMyReviews);
router.get("/provider/:providerId", getReviewsForProvider);
router.delete("/:id", protect, authorizeRoles("admin"), deleteReview);

export default router;
