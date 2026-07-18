/**
 * Data export utilities for complete database backup/restore.
 * All persisted state lives in the browser's localStorage (zustand persist);
 * these helpers serialize it to a versioned JSON envelope.
 */

import { licenseIsRestricted } from './metricsImport';

/**
 * Export format version. Bump when the envelope shape changes and teach
 * validateDatabaseExport (dataImport.js) how to handle the older shape.
 * Format 1: legacy `version: '1.0'` exports (no storeVersions, no findings).
 * Format 2: adds formatVersion, storeVersions, and the findings section.
 * Format 3: adds the metrics section (imported metrics catalogues).
 */
export const EXPORT_FORMAT_VERSION = 3;

// zustand persist keys whose schema versions travel with the export so a
// restore can detect version drift between the exporting and importing app.
export const PERSIST_KEYS = {
  assessments: 'csf-assessments-storage',
  frameworks: 'csf-frameworks-storage',
  findings: 'csf-findings-storage',
  requirements: 'csf-requirements-storage',
  metrics: 'csf-metrics-storage'
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
    findingsStore,
    metricsStore
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
      findingCount: findingsStore?.getState?.()?.findings?.length || 0,
      metricCount: metricsStore?.getState?.()?.metrics?.length || 0
    },
    data: {
      users: userStore?.getState?.()?.users || [],
      controls: controlsStore?.getState?.()?.controls || [],
      assessments: assessmentsStore?.getState?.()?.assessments || [],
      requirements: requirementsStore?.getState?.()?.requirements || [],
      frameworks: frameworksStore?.getState?.()?.frameworks || [],
      artifacts: artifactStore?.getState?.()?.artifacts || [],
      findings: findingsStore?.getState?.()?.findings || [],
      metrics: metricsStore?.getState?.()?.metrics || []
    }
  };

  return jsonData;
};

/**
 * Remove quarter-level `metricId` links that point at metric definitions the
 * share export dropped — the ID itself (e.g. a licensed catalogue's key) is a
 * linkage token that would leak the catalogue's identity through otherwise
 * shareable, user-authored assessments. Copies on write; never mutates store
 * objects.
 */
const stripMetricLinks = (assessments, excludedIds) => {
  if (excludedIds.size === 0) return assessments;
  return assessments.map((assessment) => {
    const observations = assessment.observations;
    if (!observations || typeof observations !== 'object') return assessment;

    let changed = false;
    const nextObservations = {};
    Object.entries(observations).forEach(([reqId, obs]) => {
      const quarters = obs?.quarters;
      if (!quarters || typeof quarters !== 'object') {
        nextObservations[reqId] = obs;
        return;
      }
      let obsChanged = false;
      const nextQuarters = {};
      Object.entries(quarters).forEach(([q, quarter]) => {
        if (quarter && excludedIds.has(quarter.metricId)) {
          const { metricId, ...rest } = quarter;
          nextQuarters[q] = rest;
          obsChanged = true;
        } else {
          nextQuarters[q] = quarter;
        }
      });
      if (obsChanged) {
        nextObservations[reqId] = { ...obs, quarters: nextQuarters };
        changed = true;
      } else {
        nextObservations[reqId] = obs;
      }
    });

    return changed ? { ...assessment, observations: nextObservations } : assessment;
  });
};

/**
 * Build a shareable export: the complete-database envelope minus private
 * pack data. The filter is LINEAGE-aware, not tag-only — it drops every
 * assessment that originated from a pack import (including all observations
 * nested inside it, which carry no tags of their own) and every finding that
 * either carries pack provenance or points at a pack-owned assessment.
 *
 * @param {Object} stores - Same store map exportAllDataJSON receives
 * @param {Object} [options]
 * @param {boolean} [options.includePrivate=false] - Keep pack data (explicit opt-in)
 */
export const buildShareableExport = (stores, { includePrivate = false } = {}) => {
  const jsonData = exportAllDataJSON(stores);
  const allMetrics = jsonData.data.metrics || [];

  // Restricted-license metric definitions (NC/ND/proprietary — e.g. a CIS
  // catalogue an org uses internally) are HARD-BLOCKED from share exports:
  // redistribution is a licensing violation, so this is not overridable by
  // the include-private opt-in. Mechanical, keyed on the license field.
  const restrictedDropped = allMetrics.filter((m) => licenseIsRestricted(m.license));

  if (includePrivate) {
    jsonData.data.metrics = allMetrics.filter((m) => !licenseIsRestricted(m.license));
    jsonData.dataType = restrictedDropped.length > 0
      ? 'Complete Assessment Database (private pack data INCLUDED; restricted-license metrics still excluded)'
      : 'Complete Assessment Database (private pack data INCLUDED)';
    jsonData.metadata.metricCount = jsonData.data.metrics.length;
    const restrictedIds = new Set(restrictedDropped.map((m) => m.id));
    jsonData.data.assessments = stripMetricLinks(jsonData.data.assessments, restrictedIds);
    return jsonData;
  }

  const packAssessmentIds = new Set(
    jsonData.data.assessments.filter((a) => a.source === 'pack').map((a) => a.id)
  );
  jsonData.data.assessments = jsonData.data.assessments.filter((a) => a.source !== 'pack');
  jsonData.data.findings = jsonData.data.findings.filter(
    (f) => f.source !== 'pack' && !packAssessmentIds.has(f.assessmentId)
  );

  // Imported metric definitions are private data: excluded by default, same
  // lineage rule as packs. Restricted-license metrics are dropped regardless
  // of provenance token (defense-in-depth — the guarantee must not hang on a
  // single source string). IDs of everything dropped are stripped from the
  // surviving (user-authored) assessments' quarter-level metricId links so no
  // linkage token rides out.
  const survivors = allMetrics.filter(
    (m) => m.source !== 'csv-import' && !licenseIsRestricted(m.license)
  );
  jsonData.data.metrics = survivors;
  const survivorIds = new Set(survivors.map((m) => m.id));
  const excludedIds = new Set(allMetrics.filter((m) => !survivorIds.has(m.id)).map((m) => m.id));
  jsonData.data.assessments = stripMetricLinks(jsonData.data.assessments, excludedIds);

  jsonData.dataType = 'Shareable Assessment Database (private pack data excluded)';
  jsonData.metadata.assessmentCount = jsonData.data.assessments.length;
  jsonData.metadata.findingCount = jsonData.data.findings.length;
  jsonData.metadata.metricCount = jsonData.data.metrics.length;
  return jsonData;
};

/**
 * Download a shareable export (csf_share_YYYY-MM-DD.json).
 * @param {Object} stores - All store references
 * @param {Object} [options] - See buildShareableExport
 */
export const exportShareableDatabase = (stores, options = {}) => {
  const jsonData = buildShareableExport(stores, options);
  const date = new Date().toISOString().split('T')[0];
  downloadJSON(jsonData, `csf_share_${date}.json`);
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
