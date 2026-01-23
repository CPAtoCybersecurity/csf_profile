import express from "express";
import { getPage, validateConfluence } from "../controllers/confluenceController.js";

const router = express.Router();

// GET /api/confluence/page/:pageId
router.get("/page/:pageId", getPage);

// POST /api/confluence/validate
router.post("/validate", validateConfluence);

export default router;
