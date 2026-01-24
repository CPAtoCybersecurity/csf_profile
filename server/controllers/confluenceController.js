import confluenceClient from "../services/confluenceClient.js";
import { sanitizeErrorResponse, getErrorStatus } from "../utils/errorUtils.js";

// GET /api/confluence/page/:pageId
export const getPage = async (req, res) => {
  const { pageId } = req.params;

  if (!pageId) {
    return res.status(400).json({ error: "Missing pageId" });
  }

  try {
    const response = await confluenceClient.get(
      `/wiki/rest/api/content/${pageId}?expand=body.storage`
    );

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    res.status(getErrorStatus(error)).json(sanitizeErrorResponse(error, 'Confluence getPage'));
  }
};

// POST /api/confluence/validate
export const validateConfluence = async (req, res) => {
  try {
    await confluenceClient.get("/wiki/rest/api/space?limit=1");

    res.json({
      success: true,
      message: "Confluence authentication successful",
    });
  } catch (error) {
    res.status(getErrorStatus(error)).json(sanitizeErrorResponse(error, 'Confluence validateConfluence'));
  }
};
