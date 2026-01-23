/**
 * Data export utilities for complete database backup/restore
 * Exports all IndexedDB contents to JSON format
 */

/**
 * Export all application data to JSON
 * @param {Object} stores - Object containing all store references
 *   {
 *     controlsStore, assessmentsStore, requirementsStore, 
 *     frameworksStore, artifactStore, userStore
 *   }
 */
export const exportAllDataJSON = (stores) => {
  const {
    controlsStore,
    assessmentsStore,
    requirementsStore,
    frameworksStore,
    artifactStore,
    userStore
  } = stores;

  const jsonData = {
    exportDate: new Date().toISOString(),
    dataType: 'Complete Assessment Database',
    version: '1.0',
    metadata: {
      applicationName: 'CSF Profile Assessment Tool',
      exportTimestamp: new Date().toISOString(),
      userCount: userStore?.getState?.()?.users?.length || 0,
      controlCount: controlsStore?.getState?.()?.controls?.length || 0,
      assessmentCount: assessmentsStore?.getState?.()?.assessments?.length || 0
    },
    data: {
      users: userStore?.getState?.()?.users || [],
      controls: controlsStore?.getState?.()?.controls || [],
      assessments: assessmentsStore?.getState?.()?.assessments || [],
      requirements: requirementsStore?.getState?.()?.requirements || [],
      frameworks: frameworksStore?.getState?.()?.frameworks || [],
      artifacts: artifactStore?.getState?.()?.artifacts || []
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
