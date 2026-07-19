/**
 * Data export utilities for complete database backup/restore.
 * All persisted state lives in the browser's localStorage (zustand persist);
 * these helpers serialize it to a versioned JSON envelope.
 */

import { licenseIsRestricted } from './metricsImport';
import { getBankProcedure } from './procedureBank';

/**
 * Export format version. Bump when the envelope shape changes and teach
 * validateDatabaseExport (dataImport.js) how to handle the older shape.
 * Format 1: legacy `version: '1.0'` exports (no storeVersions, no findings).
 * Format 2: adds formatVersion, storeVersions, and the findings section.
 * Format 3: adds the metrics section (imported metrics catalogues).
 * Format 4: adds the orgProfile section (object, not array) to COMPLETE
 *   backups. Share exports NEVER carry it, and tailored procedures are
 *   swapped back to the pristine community text (see PRIVATE_DATA.md).
 */
export const EXPORT_FORMAT_VERSION = 4;

// zustand persist keys whose schema versions travel with the export so a
// restore can detect version drift between the exporting and importing app.
export const PERSIST_KEYS = {
  assessments: 'csf-assessments-storage',
  frameworks: 'csf-frameworks-storage',
  findings: 'csf-findings-storage',
  requirements: 'csf-requirements-storage',
  metrics: 'csf-metrics-storage',
  orgProfile: 'csf-org-profile-storage'
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
    orgProfileStore
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
      metrics: metricsStore?.getState?.()?.metrics || [],
      // Object section (not an array): the org profile rides COMPLETE
      // backups only; buildShareableExport strips it unconditionally.
      orgProfile: orgProfileState
        ? { profile: orgProfileState.profile, cloudConsent: orgProfileState.cloudConsent }
        : { profile: null, cloudConsent: false }
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
 * Swap tailored procedures back to the pristine community version. The org
 * profile is excluded from share exports, but tailoring BAKES profile facts
 * (org name, systems, crown-jewel references) into observation text — a
 * derived leak path. Provenance (procedureSource.bankId) makes the fix
 * deterministic: shared copies get the untailored community markdown. If the
 * bank entry cannot be resolved, the text is dropped entirely — never leaked.
 * Copies on write; never mutates store objects.
 */
const swapTailoredProcedures = (assessments) =>
  assessments.map((assessment) => {
    const observations = assessment.observations;
    if (!observations || typeof observations !== 'object') return assessment;

    let changed = false;
    const nextObservations = {};
    Object.entries(observations).forEach(([itemId, obs]) => {
      if (obs?.procedureSource?.tailored) {
        const bankEntry = getBankProcedure(obs.procedureSource.bankId);
        nextObservations[itemId] = {
          ...obs,
          testProcedures: bankEntry ? bankEntry.markdown : '',
          procedureSource: { ...obs.procedureSource, tailored: false, modified: false }
        };
        changed = true;
      } else {
        nextObservations[itemId] = obs;
      }
    });

    return changed ? { ...assessment, observations: nextObservations } : assessment;
  });

/**
 * Build a shareable export: the complete-database envelope minus private
 * pack data. The filter is LINEAGE-aware, not tag-only — it drops every
 * assessment that originated from a pack import (including all observations
 * nested inside it, which carry no tags of their own) and every finding that
 * either carries pack provenance or points at a pack-owned assessment.
 *
 * The org profile is stripped UNCONDITIONALLY — the include-private opt-in
 * does not restore it (crown jewels + tooling are never share material).
 * Tailored procedure text (profile-derived) is swapped back to the pristine
 * community version by default; include-private keeps the tailored text.
 * External ticketing/document URLs (findings.externalUrl, artifacts.link,
 * controls.externalUrl) and the external system name are scrubbed by
 * default; include-private keeps them (issue #284).
 *
 * @param {Object} stores - Same store map exportAllDataJSON receives
 * @param {Object} [options]
 * @param {boolean} [options.includePrivate=false] - Keep pack data (explicit opt-in)
 */
export const buildShareableExport = (stores, { includePrivate = false } = {}) => {
  const jsonData = exportAllDataJSON(stores);
  const allMetrics = jsonData.data.metrics || [];

  // Org profile: never in a share export, opt-in or not.
  delete jsonData.data.orgProfile;

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
  jsonData.data.assessments = swapTailoredProcedures(
    jsonData.data.assessments.filter((a) => a.source !== 'pack')
  );
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

  // The user directory (names + email addresses) is PII and rides complete
  // backups only. Excluded from default share exports since issues #290/#291
  // — the wizard Users step now routes real people into the directory as the
  // normal new-assessment flow, so a "shareable" file must not carry it.
  // The KEY is deleted (not emptied): restore applies every section present
  // in a file, so `users: []` would wipe the receiving install's own
  // directory, while an absent section is left untouched. Observation
  // auditorId / assessment { userId, role } references stay (opaque ids) and
  // resolve against whatever directory the receiving install already has.
  // The include-private opt-in keeps the directory; this deliberately changes
  // pre-existing behavior the same way issue #284 did for artifacts.link.
  delete jsonData.data.users;
  jsonData.metadata.userCount = 0;

  // External ticketing/document URLs (issue #284) point at internal
  // infrastructure — Jira/ServiceNow hostnames, SharePoint sites, Drive docs,
  // project keys in paths. Scrubbed from share exports by default; the
  // include-private opt-in keeps them, complete backups are unaffected.
  // This deliberately also scrubs the PRE-EXISTING artifacts.link field,
  // which previously rode share exports wholesale. Map+spread clones every
  // record — live store objects are never mutated.
  jsonData.data.assessments = jsonData.data.assessments.map((a) => {
    const next = { ...a };
    if (a.externalTracking) {
      // REBUILD the config rather than spreading it, so a legacy field
      // (v11 systemName) riding on an unmigrated record can never survive
      // into a share export. Only the non-sensitive enabled flag is kept.
      next.externalTracking = {
        enabled: a.externalTracking.enabled === true,
        systems: { findings: '', artifacts: '', controls: '' }
      };
    }
    if (a.observations && typeof a.observations === 'object') {
      // Observation external links (issue #288) name internal hosts/paths —
      // scrubbed by default like every other external URL. Shape-agnostic on
      // purpose (any present value → []), so a tampered non-array value can
      // no more ride out than the rebuilt externalTracking above. Copy-on-write.
      next.observations = Object.fromEntries(
        Object.entries(a.observations).map(([itemId, obs]) => (
          obs && obs.externalLinks !== undefined
            ? [itemId, { ...obs, externalLinks: [] }]
            : [itemId, obs]
        ))
      );
    }
    return next;
  });
  jsonData.data.findings = jsonData.data.findings.map((f) => ({ ...f, externalUrl: '' }));
  jsonData.data.artifacts = (jsonData.data.artifacts || []).map((ar) => ({ ...ar, link: '' }));
  jsonData.data.controls = (jsonData.data.controls || []).map((c) => ({ ...c, externalUrl: '' }));

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
