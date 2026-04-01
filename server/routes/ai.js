import express from "express";
import { handleClaudeRequest } from "../controllers/aiController.js";
import { verifyInternalRequest } from "../middleware/auth.js";

const router = express.Router();

router.post("/claude", verifyInternalRequest, handleClaudeRequest);

export default router;