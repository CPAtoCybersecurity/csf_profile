/**
 * Confluence Sync Utilities
 * Handles Confluence database entry ID harvesting and Smart-Embed URL generation.
 *
 * Smart-Embed URLs allow embedding Confluence database entries into Jira issues,
 * solving the entryId GUID challenge for linking requirements to evaluations.
 */

// Confluence configuration
const CONFLUENCE_CONFIG = {
  baseUrl: 'https://cpatocybersecurity-wiki.atlassian.net',
  spaceKey: '~712020aeb06967d1d640ce902614e256bca90d',
  requirementsDbId: '1146881',
  // Add more database IDs as needed
  controlsDbId: null
};

/**
 * Store for entryId mappings (requirementId -> confluenceEntryId)
 * This should be persisted to localStorage or a store
 */
let entryIdMappings = {};

/**
 * Load entry ID mappings from localStorage
 */
export function loadEntryIdMappings() {
  try {
    const stored = localStorage.getItem('confluence-entry-mappings');
    if (stored) {
      entryIdMappings = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load Confluence entry mappings:', e);
  }
  return entryIdMappings;
}

/**
 * Save entry ID mappings to localStorage
 */
export function saveEntryIdMappings(mappings) {
  try {
    entryIdMappings = { ...entryIdMappings, ...mappings };
    localStorage.setItem('confluence-entry-mappings', JSON.stringify(entryIdMappings));
  } catch (e) {
    console.error('Failed to save Confluence entry mappings:', e);
  }
}

/**
 * Get entryId for a requirement
 */
export function getEntryId(requirementId) {
  if (Object.keys(entryIdMappings).length === 0) {
    loadEntryIdMappings();
  }
  return entryIdMappings[requirementId] || null;
}

/**
 * Set entryId for a requirement
 */
export function setEntryId(requirementId, entryId) {
  entryIdMappings[requirementId] = entryId;
  saveEntryIdMappings(entryIdMappings);
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
export function generateSmartEmbedUrl(entryId, databaseId = CONFLUENCE_CONFIG.requirementsDbId) {
  if (!entryId) return null;

  return `${CONFLUENCE_CONFIG.baseUrl}/wiki/spaces/${CONFLUENCE_CONFIG.spaceKey}/database/${databaseId}/entry/${entryId}`;
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
  const auth = btoa(`${email}:${apiToken}`);

  try {
    // Note: The exact API endpoint may vary based on Confluence version
    const response = await fetch(
      `${CONFLUENCE_CONFIG.baseUrl}/wiki/api/v2/databases/${CONFLUENCE_CONFIG.requirementsDbId}/entries?limit=250`,
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
    saveEntryIdMappings(mappings);

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
export function importEntryIdsFromCSV(csvContent) {
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

  saveEntryIdMappings(mappings);
  return Object.keys(mappings).length;
}

/**
 * Export entry ID mappings to CSV
 *
 * @returns {string} CSV content
 */
export function exportEntryIdsToCSV() {
  loadEntryIdMappings();

  const rows = [['Requirement ID', 'Entry ID']];
  for (const [reqId, entryId] of Object.entries(entryIdMappings)) {
    rows.push([reqId, entryId]);
  }

  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Get all stored entry ID mappings
 */
export function getAllEntryIdMappings() {
  loadEntryIdMappings();
  return { ...entryIdMappings };
}

/**
 * Clear all entry ID mappings
 */
export function clearEntryIdMappings() {
  entryIdMappings = {};
  localStorage.removeItem('confluence-entry-mappings');
}

/**
 * Get Confluence configuration
 */
export function getConfluenceConfig() {
  return { ...CONFLUENCE_CONFIG };
}

/**
 * Update Confluence configuration
 */
export function updateConfluenceConfig(updates) {
  Object.assign(CONFLUENCE_CONFIG, updates);
}

export default {
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
  updateConfluenceConfig
};
