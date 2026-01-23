import express from "express";
<<<<<<< HEAD
import confluenceClient from "../services/confluenceClient.js";

const router = express.Router();

router.post("/validate", async (req, res) => {
  try {
    await confluenceClient.get("/wiki/api/v2/spaces?limit=1");

    res.json({
      success: true,
      message: "Confluence authentication successful",
    });
  } catch (error) {
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data);

    res.status(500).json({
      success: false,
      message: "Failed to authenticate with Confluence",
    });
  }
});
=======
import { getPage, validateConfluence } from "../controllers/confluenceController.js";

const router = express.Router();

// GET /api/confluence/page/:pageId
router.get("/page/:pageId", getPage);

// POST /api/confluence/validate
router.post("/validate", validateConfluence);
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)

export default router;
