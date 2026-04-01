import express from "express";
import { getPage, validateConfluence, getMappings, saveMappings } from "../controllers/confluenceController.js";
import { getPageValidation, validateConfluenceValidation } from "../middlewares/validators/confluenceValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

// GET /page/:pageId - Validates alphanumeric page ID
router.get("/page/:pageId", getPageValidation, validateRequest, getPage);

// POST /validate - Validates Jira/Confluence credentials and baseUrl
router.post("/validate", validateConfluenceValidation, validateRequest, validateConfluence);

// Entry ID mappings (secure replacement for localStorage)
router.get("/mappings", getMappings);
router.post("/mappings", saveMappings);

export default router;