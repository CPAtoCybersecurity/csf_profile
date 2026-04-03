/**
 * Confluence Sync Utilities
 * Handles Confluence database entry ID harvesting and Smart-Embed URL generation.
 *
 * Smart-Embed URLs allow embedding Confluence database entries into Jira issues,
 * solving the entryId GUID challenge for linking requirements to evaluations.
 * 
 * SECURITY UPDATE:
 * - Removed use of localStorage (CWE-922)
 * - Mappings are now stored server-side and accessed via API
 * - Prevents exposure via XSS attacks
 */

// Use environment-based API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
let isInitialized = false;

// Confluence configuration
let confluenceConfig=undefined;

/**
 * Frontend cache (source of truth is backend)
 */
let entryIdMappings = {};

/**
 * Load entry ID mappings from backend
 * Must be called once at app startup
 */
export async function initializeEntryIdMappings() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/confluence/mappings`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error(`Failed to load mappings: ${res.status}`);

    const data = await res.json();

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error("Invalid mappings format");
    }
    for (const val of Object.values(data)) {
      if (typeof val !== 'string') {
        throw new Error("Invalid mapping values");
      }
    }
    
    entryIdMappings = data;
    isInitialized = true;
  } catch (e) {
    console.error('Failed to initialize Confluence entry mappings:', e);
  }
}

/**
 * Save mappings to backend
 */
export async function saveEntryIdMappings(mappings) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/confluence/mappings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mappings)
    });

    if (!res.ok) {
      throw new Error(`Failed to save mappings: ${res.status}`);
    }

    // Update local cache only after successful save
    entryIdMappings = { ...entryIdMappings, ...mappings };

  } catch (e) {
    console.error('Failed to save Confluence entry mappings:', e);
    throw e;
  }
}

/**
 * Get entryId for a requirement
 */
export function getEntryId(requirementId) {
  if (!isInitialized) {
    console.warn("Mappings not initialized yet");
  }
  return entryIdMappings[requirementId] || null;
}

/**
 * Set entryId for a requirement
 */
export async function setEntryId(requirementId, entryId) {
  await saveEntryIdMappings({ [requirementId]: entryId });
}

/** 
 * Ensures Confluence config is available before usage
 * Prevents runtime errors when app initializes slowly or API call fails
 */ 
const ensureConfigLoaded = () => {
  if (!confluenceConfig) {
    console.warn("Confluence config not loaded yet. Call loadConfluenceConfig() before using Confluence utilities.");
    return false;
  }
  return true;
};

// Load Confluence configuration from backend (env-backed config)
export async function loadConfluenceConfig() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/config/status`, {
      credentials: "include"
    });

    if (!res.ok) throw new Error("Failed to load config");

    const data = await res.json();
    const cfg = data?.data?.confluenceMeta;

    if (!cfg || typeof cfg !== "object") {
      throw new Error("Invalid config format");
    }

    const { baseUrl, spaceKey, requirementsDbId, controlsDbId } = cfg;

    if (!baseUrl || !spaceKey || !requirementsDbId) {
      throw new Error("Missing required Confluence config fields");
    }

    if (typeof baseUrl !== "string" || typeof spaceKey !== "string" || typeof requirementsDbId !== "string") {
      throw new Error("Invalid Confluence config types");
    }

    confluenceConfig = {
      baseUrl,
      spaceKey,
      requirementsDbId,
      controlsDbId: controlsDbId || null
    };
    console.log(confluenceConfig)
  } catch (err) {
    console.error("Failed to load Confluence config:", err);
  }
}

/**
 * Generate Smart-Embed URL for a Confluence database entry
 *
 * Smart-Embed URLs use the format:
 * https://{site}.atlassian.net/wiki/spaces/{spaceKey}/database/{databaseId}/entry/{entryId}
 *
 * When embedded in Jira description (ADF format), this creates a live-updating card
 * showing the requirement details.
 *
 * @param {string} entryId - The Confluence database entry GUID
 * @param {string} databaseId - The database ID (defaults to requirements DB)
 * @returns {string} The Smart-Embed URL
 */
export function generateSmartEmbedUrl(entryId, databaseId = confluenceConfig?.requirementsDbId) {
  if (!entryId) return null;
  if (!ensureConfigLoaded()) {
    throw new Error("Confluence config not loaded");
  }

  if (!confluenceConfig?.baseUrl || !confluenceConfig?.spaceKey || !databaseId) {
    console.warn("Confluence config incomplete");
    return null;
  }
  return `${confluenceConfig.baseUrl}/wiki/spaces/${confluenceConfig.spaceKey}/database/${databaseId}/entry/${entryId}`;
}

/**
 * Generate Smart-Embed URL for a requirement by its ID
 * Requires the entry ID mapping to be available
 *
 * @param {string} requirementId - The requirement ID (e.g., "GV.OC-01")
 * @returns {string|null} The Smart-Embed URL or null if mapping not found
 */
export function getSmartEmbedUrlForRequirement(requirementId) {
  const entryId = getEntryId(requirementId);
  if (!entryId) {
    console.warn(`No Confluence entryId found for requirement: ${requirementId}`);
    return null;
  }
  return generateSmartEmbedUrl(entryId);
}

/**
 * Generate ADF (Atlassian Document Format) embed block for Jira
 * This creates a rich embed card in Jira issue descriptions
 *
 * @param {string} url - The Smart-Embed URL
 * @param {string} title - Optional title for the embed
 * @returns {object} ADF embedCard node
 */
export function generateAdfEmbedBlock(url, title = 'Linked Requirement') {
  return {
    type: 'embedCard',
    attrs: {
      url: url,
      layout: 'wide'
    }
  };
}

/**
 * Generate full ADF document with Smart-Embed
 * For use in Jira issue creation API
 *
 * @param {string} description - Text description
 * @param {string} requirementId - Requirement ID to embed
 * @returns {object} ADF document
 */
export function generateJiraDescription(description, requirementId) {
  const smartEmbedUrl = getSmartEmbedUrlForRequirement(requirementId);

  const content = [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: description
        }
      ]
    }
  ];

  // Add smart embed if we have the URL
  if (smartEmbedUrl) {
    content.push(
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Linked Requirement:',
            marks: [{ type: 'strong' }]
          }
        ]
      },
      generateAdfEmbedBlock(smartEmbedUrl)
    );
  }

  return {
    type: 'doc',
    version: 1,
    content
  };
}

/**
 * Parse Confluence database entries response to extract entryIds
 *
 * Note: This is a placeholder for the actual API response parsing.
 * The actual structure depends on the Confluence API version and response format.
 *
 * @param {object} apiResponse - Response from Confluence database entries API
 * @returns {object} Mapping of requirementId -> entryId
 */
export function parseConfluenceEntriesResponse(apiResponse) {
  const mappings = {};

  if (!apiResponse?.results) return mappings;

  for (const entry of apiResponse.results) {
    // Extract requirement ID from entry properties
    // The exact field name depends on your Confluence database schema
    const requirementId = entry.properties?.['Requirement ID']?.value
      || entry.properties?.requirementId?.value
      || entry.title;

    if (requirementId && entry.id) {
      mappings[requirementId] = entry.id;
    }
  }

  return mappings;
}

/**
 * Fetch and harvest entry IDs from Confluence database
 * Requires authentication to be configured
 *
 * @param {string} apiToken - Atlassian API token
 * @param {string} email - Atlassian account email
 * @returns {Promise<object>} Mapping of requirementId -> entryId
 */
export async function harvestEntryIds(apiToken, email) {
  if (!ensureConfigLoaded()) {
    throw new Error("Confluence config not loaded");
  }
  const auth = btoa(`${email}:${apiToken}`);

  try {
    // Note: The exact API endpoint may vary based on Confluence version
    const response = await fetch(
      `${confluenceConfig?.baseUrl}/wiki/api/v2/databases/${confluenceConfig?.requirementsDbId}/entries?limit=250`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch entries: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const mappings = parseConfluenceEntriesResponse(data);

    // Save mappings
    await saveEntryIdMappings(mappings);

    return mappings;
  } catch (error) {
    console.error('Failed to harvest Confluence entry IDs:', error);
    throw error;
  }
}

/**
 * Import entry ID mappings from a CSV file
 * CSV should have columns: Requirement ID, Entry ID
 *
 * @param {string} csvContent - CSV file content
 * @returns {number} Number of mappings imported
 */
export async function importEntryIdsFromCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return 0;

  // Parse header to find columns
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const reqIdCol = header.findIndex(h => h.includes('requirement') && h.includes('id'));
  const entryIdCol = header.findIndex(h => h.includes('entry') && h.includes('id'));

  if (reqIdCol === -1 || entryIdCol === -1) {
    throw new Error('CSV must have "Requirement ID" and "Entry ID" columns');
  }

  const mappings = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const reqId = cols[reqIdCol];
    const entryId = cols[entryIdCol];

    if (reqId && entryId) {
      mappings[reqId] = entryId;
    }
  }

  await saveEntryIdMappings(mappings);
  return Object.keys(mappings).length;
}

/**
 * Export entry ID mappings to CSV
 *
 * @returns {string} CSV content
 */
export function exportEntryIdsToCSV() {
  const rows = [['Requirement ID', 'Entry ID']];
  for (const [reqId, entryId] of Object.entries(entryIdMappings)) {
    rows.push([reqId, entryId]);
  }

  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Get all mappings (from cache)
 */
export function getAllEntryIdMappings() {
  return { ...entryIdMappings };
}

/**
 * Clear mappings (backend + local cache)
 */
export async function clearEntryIdMappings() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/confluence/mappings`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error(`Failed to clear mappings: ${res.status}`);
    }

    entryIdMappings = {};
  } catch (e) {
    console.error('Failed to clear Confluence entry mappings:', e);
  }
}

/**
 * Get Confluence configuration
 */
export function getConfluenceConfig() {
  if (!ensureConfigLoaded()) {
    throw new Error("Confluence config not loaded");
  }
  return { ...confluenceConfig};
}

export default {
  initializeEntryIdMappings,
  generateSmartEmbedUrl,
  getSmartEmbedUrlForRequirement,
  generateAdfEmbedBlock,
  generateJiraDescription,
  harvestEntryIds,
  importEntryIdsFromCSV,
  exportEntryIdsToCSV,
  getEntryId,
  setEntryId,
  getAllEntryIdMappings,
  clearEntryIdMappings,
  getConfluenceConfig,
  loadConfluenceConfig
};
