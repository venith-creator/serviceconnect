import express from "express";
import {
  createReview,
  providerCreateReview,
  getReviewsForProvider,
  getReviewsForClient,
  getMyReviews,
  getReviewsAboutMe,
  deleteReview,
   getAllReviewsAdmin,
  getProviderRatingSummary
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// client → provider
router.post("/", protect, authorizeRoles("client"), createReview);
// provider → client
router.post("/provider", protect, authorizeRoles("provider"), providerCreateReview);

router.get("/my", protect, getMyReviews);
router.get("/about-me", protect, getReviewsAboutMe);
router.get("/provider/:providerId", getReviewsForProvider);
router.get("/client/:clientId", getReviewsForClient);
router.get("/admin/all", protect, authorizeRoles("admin"), getAllReviewsAdmin);
router.get("/admin/summary", protect, authorizeRoles("admin"), getProviderRatingSummary);
router.delete("/:id", protect, authorizeRoles("admin"), deleteReview);

export default router;

