import express from "express";
import configAuth from "../middleware/configAuth.js";
import {
  saveJiraConfig,
  saveConfluenceConfig,
  getConfigStatus,
  testConnection,
  saveAIConfig,
} from "../controllers/configController.js";
import { atlassianConfigValidation } from "../middlewares/validators/configValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

// All config routes require X-Config-Key authentication
router.use(configAuth);

router.post("/jira", saveJiraConfig);
router.post("/confluence", saveConfluenceConfig);
router.get("/status", getConfigStatus);
router.post("/test", atlassianConfigValidation, validateRequest, testConnection);
router.post("/ai", saveAIConfig);

export default router;  
