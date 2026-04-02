// AI Routes
import express from "express";
import { handleClaudeRequest } from "../controllers/aiController.js";
import { aiLimiter } from "../utils/rateLimiter.js";
import { claudeRequestValidation } from "../middlewares/validators/aiValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

// POST /api/ai/claude
router.post("/claude", aiLimiter, claudeRequestValidation, validateRequest, handleClaudeRequest);

export default router;
