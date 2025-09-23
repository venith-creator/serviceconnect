// routes/uploadRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUploader } from "../middleware/upload.js";

const router = express.Router();

// Upload documents
router.post(
  "/docs",
  protect,
  getUploader("docs").array("docs", 5),
  (req, res) => {
    const files = req.files.map((f) => `/uploads/docs/${f.filename}`);
    res.json({ files });
  }
);

// Upload portfolio images
router.post(
  "/portfolio",
  protect,
  getUploader("portfolio").array("portfolio", 10),
  (req, res) => {
    const files = req.files.map((f) => `/uploads/portfolio/${f.filename}`);
    res.json({ files });
  }
);

// Upload avatar (single)
router.post(
  "/avatar",
  protect,
  getUploader("avatars").single("avatar"),
  (req, res) => {
    res.json({ file: `/uploads/avatars/${req.file.filename}` });
  }
);

export default router;
