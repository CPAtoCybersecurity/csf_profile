import express from "express";
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

export default router;
