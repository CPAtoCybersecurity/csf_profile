/**
 * Data export utilities for complete database backup/restore.
 * All persisted state lives in the browser's localStorage (zustand persist);
 * these helpers serialize it to a versioned JSON envelope.
 */

/**
 * Export format version. Bump when the envelope shape changes and teach
 * validateDatabaseExport (dataImport.js) how to handle the older shape.
 * Format 1: legacy `version: '1.0'` exports (no storeVersions, no findings).
 * Format 2: adds formatVersion, storeVersions, and the findings section.
 */
export const EXPORT_FORMAT_VERSION = 2;

// zustand persist keys whose schema versions travel with the export so a
// restore can detect version drift between the exporting and importing app.
export const PERSIST_KEYS = {
  assessments: 'csf-assessments-storage',
  frameworks: 'csf-frameworks-storage',
  findings: 'csf-findings-storage',
  requirements: 'csf-requirements-storage'
};

/**
 * Read the schema version a zustand persist key currently has on disk.
 * Returns null when the key is absent or unreadable (fresh browser, no data).
 */
export const readPersistedVersion = (persistKey) => {
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.version === 'number' ? parsed.version : null;
  } catch {
    return null;
  }
};

const collectStoreVersions = () =>
  Object.fromEntries(
    Object.entries(PERSIST_KEYS).map(([name, key]) => [name, readPersistedVersion(key)])
  );

/**
 * Export all application data to JSON
 * @param {Object} stores - Object containing all store references
 *   {
 *     controlsStore, assessmentsStore, requirementsStore,
 *     frameworksStore, artifactStore, userStore, findingsStore
 *   }
 */
export const exportAllDataJSON = (stores) => {
  const {
    controlsStore,
    assessmentsStore,
    requirementsStore,
    frameworksStore,
    artifactStore,
    userStore,
    findingsStore
  } = stores;

  const jsonData = {
    exportDate: new Date().toISOString(),
    dataType: 'Complete Assessment Database',
    formatVersion: EXPORT_FORMAT_VERSION,
    storeVersions: collectStoreVersions(),
    metadata: {
      applicationName: 'CSF Profile Assessment Tool',
      exportTimestamp: new Date().toISOString(),
      userCount: userStore?.getState?.()?.users?.length || 0,
      controlCount: controlsStore?.getState?.()?.controls?.length || 0,
      assessmentCount: assessmentsStore?.getState?.()?.assessments?.length || 0,
      findingCount: findingsStore?.getState?.()?.findings?.length || 0
    },
    data: {
      users: userStore?.getState?.()?.users || [],
      controls: controlsStore?.getState?.()?.controls || [],
      assessments: assessmentsStore?.getState?.()?.assessments || [],
      requirements: requirementsStore?.getState?.()?.requirements || [],
      frameworks: frameworksStore?.getState?.()?.frameworks || [],
      artifacts: artifactStore?.getState?.()?.artifacts || [],
      findings: findingsStore?.getState?.()?.findings || []
    }
  };

  return jsonData;
};

/**
 * Download JSON data as a file
 * @param {Object} jsonData - The data object to export
 * @param {string} filename - The filename for the download
 */
export const downloadJSON = (jsonData, filename) => {
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export all data with proper filename formatting
 * @param {Object} stores - All store references
 */
export const exportCompleteDatabase = (stores) => {
  const jsonData = exportAllDataJSON(stores);
  const date = new Date().toISOString().split('T')[0];
  const filename = `csf_assessment_${date}.json`;
  downloadJSON(jsonData, filename);
};

/**
 * Export assessments data to JSON
 * @param {Object} assessmentsStore - The assessments store
 * @param {Object} controlsStore - The controls store (for context)
 */
export const exportAssessmentsJSON = (assessmentsStore, controlsStore, userStore) => {
  const users = userStore?.getState?.()?.users || [];
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId || '';
  };

  const assessments = assessmentsStore?.getState?.()?.assessments || [];
  const date = new Date().toISOString().split('T')[0];
  
  const jsonData = {
    exportDate: new Date().toISOString(),
    dataType: 'Assessments',
    count: assessments.length,
    assessments: assessments.map(a => ({
      ...a,
      // Enhance with user names for readability
      observations: a.observations ? Object.entries(a.observations).reduce((acc, [controlId, obs]) => {
        acc[controlId] = {
          ...obs,
          auditorName: getUserName(obs.auditorId)
        };
        return acc;
      }, {}) : {}
    }))
  };

  downloadJSON(jsonData, `assessments_${date}.json`);
};
