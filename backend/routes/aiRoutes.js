// routes/aiRoutes.js
import express from "express";
import { askAI } from "../services/openAiService.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    const answer = await askAI(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
