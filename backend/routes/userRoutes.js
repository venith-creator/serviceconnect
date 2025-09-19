import express from "express";
import { registerUser, loginUser, upload, addRole} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/add-role", protect, addRole);

export default router;