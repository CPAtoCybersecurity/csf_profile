import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import confluenceClient from "../services/confluenceClient.js";
import { sanitizeErrorResponse, getErrorStatus } from "../utils/errorUtils.js";

// Entry-ID mappings persist to disk so they survive server restarts
// (previously a process-global, lost on every restart). server/data/ is
// gitignored — mappings are deployment-local state, never repository content.
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const MAPPINGS_FILE = path.join(DATA_DIR, "entry-id-mappings.json");

const loadMappings = () => {
  try {
    return JSON.parse(fs.readFileSync(MAPPINGS_FILE, "utf8"));
  } catch {
    return {};
  }
};

const persistMappings = (mappings) => {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    // Write to a temp file then rename: a crash mid-write must never corrupt
    // or truncate the only copy of the mappings.
    const tempFile = `${MAPPINGS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(mappings, null, 2));
    fs.renameSync(tempFile, MAPPINGS_FILE);
  } catch (error) {
    console.error("Failed to persist entry-id mappings:", error.message);
  }
};

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

let entryIdMappings = loadMappings();

// GET mappings
export const getMappings = (req, res) => {
  res.json(entryIdMappings);
};

// POST mappings
export const saveMappings = (req, res) => {
  entryIdMappings = {
    ...entryIdMappings,
    ...req.body
  };
  persistMappings(entryIdMappings);

  res.status(200).json({ success: true });
};

// DELETE mappings
export const clearMappings = (req, res) => {
  entryIdMappings = {};
  persistMappings(entryIdMappings);
  res.status(200).json({ success: true });
};
