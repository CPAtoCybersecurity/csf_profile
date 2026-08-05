/**
 * Data export utilities for complete database backup/restore.
 * All persisted state lives in the browser's localStorage (zustand persist);
 * these helpers serialize it to a versioned JSON envelope.
 */

import { SHARE_SECTIONS, OMIT, foldSection, buildShareContext } from './shareRegistry';
import { filterExportByAssessments } from './assessmentSelection';

/**
 * Export format version. Bump when the envelope shape changes and teach
 * validateDatabaseExport (dataImport.js) how to handle the older shape.
 * Format 1: legacy `version: '1.0'` exports (no storeVersions, no findings).
 * Format 2: adds formatVersion, storeVersions, and the findings section.
 * Format 3: adds the metrics section (imported metrics catalogues).
 * Format 4: adds the orgProfile section (object, not array) to COMPLETE
 *   backups. Share exports NEVER carry it, and tailored procedures are
 *   swapped back to the pristine community text (see PRIVATE_DATA.md).
 * Format 5: the platform-procedures envelope discriminator. Share-export
 *   procedure text is SELF-CONTAINED — platform addendum references are
 *   expanded into testProcedures (trunk + addendum text + attribution) and
 *   the refs themselves never ride a share; procedureSource.components
 *   records the composition recipe; complete backups carry
 *   observation.platformProcedures references verbatim (wholesale by
 *   design). From format 5 on, ABSENCE is meaningful: a file with no
 *   components / license metadata / platformProcedures genuinely had none,
 *   where a format ≤4 file simply predates the machinery.
 * Format 6: adds the systems section (system inventory records). Complete
 *   backups carry it wholesale; share exports OMIT it by default and carry
 *   it only under the include-private opt-in (see shareRegistry.js — a
 *   populated inventory reads as a target list).
 * Format 7: adds the comments section (per-record discussion threads on
 *   evaluations/controls/findings). Complete backups carry it wholesale;
 *   share exports OMIT it by default (author names + free discussion text —
 *   the users-directory pattern) and carry it only under include-private.
 */
export const EXPORT_FORMAT_VERSION = 7;

// zustand persist keys whose schema versions travel with the export so a
// restore can detect version drift between the exporting and importing app.
export const PERSIST_KEYS = {
  assessments: 'csf-assessments-storage',
  frameworks: 'csf-frameworks-storage',
  findings: 'csf-findings-storage',
  requirements: 'csf-requirements-storage',
  metrics: 'csf-metrics-storage',
  orgProfile: 'csf-org-profile-storage',
  // issue #297: artifact/user schema versions travel too, so future restores
  // can version-gate instead of relying on the unconditional stamp passes
  artifacts: 'csf-artifacts-storage',
  users: 'csf-users-storage',
  systems: 'csf-inventory-storage',
  comments: 'csf-comments-storage'
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
    metricsStore,
    orgProfileStore,
    inventoryStore,
    commentsStore
  } = stores;

  const orgProfileState = orgProfileStore?.getState?.();

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
      metricCount: metricsStore?.getState?.()?.metrics?.length || 0,
      systemCount: inventoryStore?.getState?.()?.systems?.length || 0
    },
    data: {
      users: userStore?.getState?.()?.users || [],
      controls: controlsStore?.getState?.()?.controls || [],
      assessments: assessmentsStore?.getState?.()?.assessments || [],
      requirements: requirementsStore?.getState?.()?.requirements || [],
      frameworks: frameworksStore?.getState?.()?.frameworks || [],
      artifacts: artifactStore?.getState?.()?.artifacts || [],
      findings: findingsStore?.getState?.()?.findings || [],
      metrics: metricsStore?.getState?.()?.metrics || [],
      systems: inventoryStore?.getState?.()?.systems || [],
      comments: commentsStore?.getState?.()?.comments || [],
      // Object section (not an array): the org profile rides COMPLETE
      // backups only; buildShareableExport strips it unconditionally.
      // `branding` (the custom sidebar logo) is carried in the same section
      // and inherits that disposition — a backup restores your logo, a share
      // export never carries it. Absent in files written before the field
      // existed, which restore reads as "leave the receiver's logo alone".
      orgProfile: orgProfileState
        ? {
            profile: orgProfileState.profile,
            cloudConsent: orgProfileState.cloudConsent,
            branding: orgProfileState.branding
          }
        : { profile: null, cloudConsent: false }
    }
  };

  return jsonData;
};

/**
 * Build a shareable export: the complete-database envelope folded through the
 * DISPOSITION REGISTRY (shareRegistry.js). Every field that serializes here
 * is explicitly declared there — an undeclared field does not ride, in either
 * mode. That is the fail-closed inversion of the old hand-maintained scrub
 * list, which leaked four times because its default was fail-open.
 *
 * Behavior (unchanged from the pre-registry implementation, pinned by the
 * golden snapshots in dataExportGolden.test.js):
 *  - the filter is LINEAGE-aware, not tag-only — it drops every assessment
 *    that originated from a pack import (including all observations nested
 *    inside it) and every finding that either carries pack provenance or
 *    points at a pack-owned assessment;
 *  - the org profile is stripped UNCONDITIONALLY — the include-private
 *    opt-in does not restore it (crown jewels + tooling are never share
 *    material); tailored procedure text (profile-derived) is swapped back to
 *    the pristine community version by default;
 *  - restricted-license metrics are hard-blocked in BOTH modes; imported
 *    metrics are private-by-lineage in default mode, and quarter-level
 *    metricId linkage tokens pointing at dropped metrics are stripped;
 *  - the user directory is omitted by default (key deleted, never emptied);
 *  - external ticketing/document URLs and system names are scrubbed by
 *    default; include-private keeps them (issue #284).
 *
 * @param {Object} stores - Same store map exportAllDataJSON receives
 * @param {Object} [options]
 * @param {boolean} [options.includePrivate=false] - Keep pack data (explicit opt-in)
 */
export const buildShareableExport = (stores, { includePrivate = false } = {}) => {
  const jsonData = exportAllDataJSON(stores);
  const ctx = buildShareContext(
    jsonData.data.metrics || [],
    jsonData.data.assessments || [],
    { includePrivate }
  );

  Object.entries(SHARE_SECTIONS).forEach(([name, section]) => {
    const disposition =
      typeof section.disposition === 'object'
        ? (includePrivate ? section.disposition.includePrivate : section.disposition.default)
        : section.disposition;
    if (disposition === OMIT) {
      // Deleted, not emptied: restore applies every section present in a
      // file, so an emptied section would wipe the receiving install's own
      // data, while an absent one is left untouched.
      delete jsonData.data[name];
      return;
    }
    jsonData.data[name] = foldSection(name, jsonData.data[name] || [], ctx);
  });

  if (includePrivate) {
    jsonData.dataType =
      ctx.restrictedDroppedCount > 0
        ? 'Complete Assessment Database (private pack data INCLUDED; restricted-license metrics still excluded)'
        : 'Complete Assessment Database (private pack data INCLUDED)';
    jsonData.metadata.metricCount = jsonData.data.metrics.length;
    jsonData.metadata.systemCount = jsonData.data.systems.length;
    return jsonData;
  }

  jsonData.dataType = 'Shareable Assessment Database (private pack data excluded)';
  jsonData.metadata.userCount = 0;
  jsonData.metadata.assessmentCount = jsonData.data.assessments.length;
  jsonData.metadata.findingCount = jsonData.data.findings.length;
  jsonData.metadata.metricCount = jsonData.data.metrics.length;
  // The systems section is deleted in default mode; the count is an
  // aggregate leak on its own (it discloses fleet size), so it zeroes with it.
  jsonData.metadata.systemCount = 0;
  return jsonData;
};

/**
 * Download a shareable export (csf_share_YYYY-MM-DD.json).
 *
 * Assessment selection runs AFTER the share fold, never before: the fold is
 * the privacy boundary, and a post-fold narrowing can only remove more
 * records, never re-admit one the fold dropped.
 *
 * @param {Object} stores - All store references
 * @param {Object} [options] - See buildShareableExport
 * @param {string[]|null} [options.assessmentIds] - Selected assessments; null = all
 */
export const exportShareableDatabase = (stores, options = {}) => {
  const { assessmentIds = null, ...shareOptions } = options;
  const jsonData = filterExportByAssessments(
    buildShareableExport(stores, shareOptions),
    assessmentIds
  );
  const date = new Date().toISOString().split('T')[0];
  const subset = jsonData.metadata?.assessmentSelection ? '_subset' : '';
  downloadJSON(jsonData, `csf_share${subset}_${date}.json`);
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
 * Export all data with proper filename formatting.
 *
 * With a subset selected the file is named `csf_assessment_subset_*.json`, NOT
 * `csf_assessment_*.json`. That distinction is load-bearing: the restore
 * control performs a full replace, so a slice restored as a backup would
 * silently delete the assessments it left behind. The filename, the dataType
 * suffix, and `metadata.assessmentSelection` all say the same thing, and
 * validateDatabaseExport turns the last one into a warning at restore time.
 *
 * @param {Object} stores - All store references
 * @param {Object} [options]
 * @param {string[]|null} [options.assessmentIds] - Selected assessments; null = all
 */
export const exportCompleteDatabase = (stores, { assessmentIds = null } = {}) => {
  const jsonData = filterExportByAssessments(exportAllDataJSON(stores), assessmentIds);
  const date = new Date().toISOString().split('T')[0];
  const subset = jsonData.metadata?.assessmentSelection ? '_subset' : '';
  downloadJSON(jsonData, `csf_assessment${subset}_${date}.json`);
};

/**
 * Export assessments data to JSON
 * @param {Object} assessmentsStore - The assessments store
 * @param {Object} controlsStore - The controls store (for context)
 * @param {Object} userStore - The user store (auditor-name enrichment)
 * @param {Object} [options]
 * @param {string[]|null} [options.assessmentIds] - Selected assessments; null = all
 */
export const exportAssessmentsJSON = (
  assessmentsStore,
  controlsStore,
  userStore,
  { assessmentIds = null } = {}
) => {
  const users = userStore?.getState?.()?.users || [];
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId || '';
  };

  const allAssessments = assessmentsStore?.getState?.()?.assessments || [];
  const wanted = Array.isArray(assessmentIds) ? new Set(assessmentIds) : null;
  const assessments = wanted ? allAssessments.filter(a => wanted.has(a?.id)) : allAssessments;
  const isSubset = assessments.length < allAssessments.length;
  const date = new Date().toISOString().split('T')[0];

  const jsonData = {
    exportDate: new Date().toISOString(),
    dataType: isSubset ? 'Assessments — selected assessments only' : 'Assessments',
    count: assessments.length,
    ...(isSubset
      ? {
          assessmentSelection: {
            selectedIds: assessments.map(a => a.id),
            selectedCount: assessments.length,
            totalCount: allAssessments.length
          }
        }
      : {}),
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

  downloadJSON(jsonData, `assessments${isSubset ? '_subset' : ''}_${date}.json`);
};
