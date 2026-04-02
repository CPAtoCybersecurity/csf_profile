import express from "express";
import { getPage, validateConfluence, getMappings, saveMappings, clearMappings } from "../controllers/confluenceController.js";
import { getPageValidation, validateConfluenceValidation, saveMappingsValidation } from "../middlewares/validators/confluenceValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

// GET /page/:pageId - Validates alphanumeric page ID
router.get("/page/:pageId", getPageValidation, validateRequest, getPage);

// POST /validate - Validates Jira/Confluence credentials and baseUrl
router.post("/validate", validateConfluenceValidation, validateRequest, validateConfluence);

// Entry ID mappings (secure replacement for localStorage)
router.get("/mappings", getMappings);
router.post("/mappings", saveMappingsValidation, validateRequest, saveMappings);
router.delete("/mappings", clearMappings);

export default router;
