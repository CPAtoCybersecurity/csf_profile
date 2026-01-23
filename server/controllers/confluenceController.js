import confluenceClient from "../services/confluenceClient.js";

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
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || error.message,
    });
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
    console.error("STATUS:", error.response?.status);
    console.error("DATA:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to authenticate with Confluence",
    });
  }
};
