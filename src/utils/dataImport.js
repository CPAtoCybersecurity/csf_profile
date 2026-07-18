/**
 * Data import (restore) utilities — the counterpart to dataExport.js.
 *
 * Restores a complete-database JSON export back into the application stores.
 * Full-replace semantics: every section present in the file replaces the
 * corresponding store's data. Sections absent from the file are left untouched
 * (legacy format-1 exports have no findings section, for example).
 *
 * Safety model:
 *  - validateDatabaseExport() rejects files from a NEWER app (storeVersions or
 *    formatVersion ahead of this build) with an explicit message — never a
 *    silent partial import.
 *  - importCompleteDatabase() downloads a pre-restore backup of the current
 *    data before anything is replaced (filename *.backup.json — gitignored,
 *    never meant for a repository).
 */

import {
  exportAllDataJSON,
  downloadJSON,
  readPersistedVersion,
  EXPORT_FORMAT_VERSION,
  PERSIST_KEYS
} from './dataExport';
import {
  migrateAssessmentsState,
  ASSESSMENTS_SCHEMA_VERSION
} from '../stores/assessmentsStore';
import { normalizeExternalTracking } from './externalLinks';

// Sections a restore knows how to apply, with the store + bulk setter each uses.
// Format-2 exports carry no metrics section — it is simply skipped (untouched),
// same as findings in legacy format-1 files.
const SECTIONS = [
  { key: 'users', store: 'userStore', setter: 'setUsers' },
  { key: 'controls', store: 'controlsStore', setter: 'setControls' },
  { key: 'assessments', store: 'assessmentsStore', setter: 'setAssessments' },
  { key: 'requirements', store: 'requirementsStore', setter: 'setRequirements' },
  { key: 'frameworks', store: 'frameworksStore', setter: 'setFrameworks' },
  { key: 'artifacts', store: 'artifactStore', setter: 'setArtifacts' },
  { key: 'findings', store: 'findingsStore', setter: 'setFindings' },
  { key: 'metrics', store: 'metricsStore', setter: 'setMetrics' }
];

/**
 * Validate a parsed complete-database export.
 * @param {Object} parsed - JSON.parse result of the uploaded file
 * @returns {{ ok: boolean, errors: string[], warnings: string[], counts: Object }}
 */
export const validateDatabaseExport = (parsed) => {
  const errors = [];
  const warnings = [];
  const counts = {};

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, errors: ['File is not a JSON object.'], warnings, counts };
  }

  const isLegacy = parsed.formatVersion === undefined && parsed.version === '1.0';
  if (!isLegacy && typeof parsed.formatVersion !== 'number') {
    errors.push('Not a CSF Profile database export (missing formatVersion).');
  }
  if (typeof parsed.formatVersion === 'number' && parsed.formatVersion > EXPORT_FORMAT_VERSION) {
    errors.push(
      `Export was created by a newer version of this app (format ${parsed.formatVersion}, ` +
      `this build reads up to ${EXPORT_FORMAT_VERSION}). Update the app, then restore.`
    );
  }
  if (isLegacy) {
    warnings.push('Legacy (v1.0) export: it contains no findings section; findings will be left untouched.');
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    errors.push('Export has no data section.');
    return { ok: errors.length === 0, errors, warnings, counts };
  }

  let presentSections = 0;
  SECTIONS.forEach(({ key }) => {
    const value = parsed.data[key];
    if (value === undefined) return;
    if (!Array.isArray(value)) {
      errors.push(`Section "${key}" is not an array.`);
      return;
    }
    counts[key] = value.length;
    presentSections += 1;
  });

  // orgProfile (format 4+) is an OBJECT section, not an array. Format-3 and
  // older files simply don't carry it — the profile is skipped, not erased.
  const orgProfileSection = parsed.data.orgProfile;
  if (orgProfileSection !== undefined) {
    if (typeof orgProfileSection !== 'object' || Array.isArray(orgProfileSection) || orgProfileSection === null) {
      errors.push('Section "orgProfile" is not an object.');
    } else {
      counts.orgProfile = orgProfileSection.profile ? 1 : 0;
      presentSections += 1;
    }
  }
  if (presentSections === 0) {
    errors.push('Export contains none of the known data sections.');
  }

  // A complete-database export always carries at least one framework; an empty
  // frameworks array means a damaged/hand-edited file. Reject rather than
  // silently mixing old frameworks with newly restored data.
  if (Array.isArray(parsed.data.frameworks) && parsed.data.frameworks.length === 0) {
    errors.push('Export has an empty frameworks section — file looks incomplete or damaged.');
  }

  // Reject exports written by a newer schema than this build persists.
  if (parsed.storeVersions && typeof parsed.storeVersions === 'object') {
    Object.entries(PERSIST_KEYS).forEach(([name, persistKey]) => {
      const fileVersion = parsed.storeVersions[name];
      const localVersion = readPersistedVersion(persistKey);
      if (typeof fileVersion === 'number' && typeof localVersion === 'number' && fileVersion > localVersion) {
        errors.push(
          `Section "${name}" was exported at schema v${fileVersion} but this app persists v${localVersion}. ` +
          'Update the app before restoring this file.'
        );
      }
    });
  }

  return { ok: errors.length === 0, errors, warnings, counts };
};

/**
 * Replace application data with the contents of a validated export.
 * @param {Object} parsed - JSON.parse result of the uploaded file
 * @param {Object} stores - Same store map exportAllDataJSON receives
 * @param {Object} [options]
 * @param {boolean} [options.backupFirst=true] - Download a pre-restore backup
 * @returns {{ applied: string[], skipped: string[], counts: Object }}
 */
export const importCompleteDatabase = (parsed, stores, { backupFirst = true } = {}) => {
  const validation = validateDatabaseExport(parsed);
  if (!validation.ok) {
    throw new Error(validation.errors.join(' '));
  }

  if (backupFirst) {
    const backup = exportAllDataJSON(stores);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadJSON(backup, `csf_pre_restore_${stamp}.backup.json`);
  }

  const applied = [];
  const skipped = [];
  const writes = [];

  // Assessments exported at an older schema version must run the migration
  // chain BEFORE they reach the store — bulk setters bypass zustand's normal
  // load-time migrate, so skipping this would inject stale-format records.
  // Legacy v1.0 exports carry no storeVersions; they only ever came from
  // builds at the current schema, so they import as-is.
  const data = { ...parsed.data };
  const fileAssessmentsVersion = parsed.storeVersions?.assessments;
  if (
    Array.isArray(data.assessments) &&
    typeof fileAssessmentsVersion === 'number' &&
    fileAssessmentsVersion < ASSESSMENTS_SCHEMA_VERSION
  ) {
    const migrated = migrateAssessmentsState(
      { assessments: data.assessments, currentAssessmentId: null },
      fileAssessmentsVersion
    );
    data.assessments = migrated.assessments;
  }

  // externalTracking is normalized UNCONDITIONALLY (issue #288): a file
  // claiming the current schema version skips the migration above, but a
  // hand-edited or tampered payload can still carry duplicate system ids,
  // an oversize list, or the legacy systemName shape — and no later write
  // path re-normalizes. normalizeExternalTracking is idempotent, so this
  // is free for well-formed files.
  if (Array.isArray(data.assessments)) {
    data.assessments = data.assessments.map((a) => (
      a && typeof a === 'object'
        ? { ...a, externalTracking: normalizeExternalTracking(a.externalTracking) }
        : a
    ));
  }

  // Resolve every write BEFORE applying any, so a missing setter can never
  // leave the stores half-restored.
  SECTIONS.forEach(({ key, store, setter }) => {
    const value = data[key];
    if (value === undefined) {
      skipped.push(key);
      return;
    }
    const storeState = stores[store]?.getState?.();
    const setFn = storeState?.[setter];
    if (typeof setFn !== 'function') {
      throw new Error(`Store "${store}" is missing ${setter}(); restore aborted before any data was changed.`);
    }
    // Snapshot the current value so a mid-apply failure can roll back.
    writes.push({ key, setFn, value, previous: storeState[key] });
  });

  // orgProfile (format 4+, object section) rides the same resolve-then-apply
  // pipeline. Absent in older files → skipped, current profile untouched.
  if (data.orgProfile !== undefined) {
    const orgState = stores.orgProfileStore?.getState?.();
    const setProfileState = orgState?.setProfileState;
    if (typeof setProfileState !== 'function') {
      throw new Error('Store "orgProfileStore" is missing setProfileState(); restore aborted before any data was changed.');
    }
    writes.push({
      key: 'orgProfile',
      setFn: setProfileState,
      value: data.orgProfile,
      previous: { profile: orgState.profile, cloudConsent: orgState.cloudConsent }
    });
  } else {
    skipped.push('orgProfile');
  }

  try {
    writes.forEach(({ key, setFn, value }) => {
      setFn(value);
      applied.push(key);
    });
  } catch (error) {
    // Roll back everything already applied — never leave a half-restored state.
    writes.forEach(({ setFn, previous }) => {
      if (previous !== undefined) {
        try { setFn(previous); } catch { /* best effort — original error is rethrown */ }
      }
    });
    throw new Error(`Restore failed mid-apply and was rolled back: ${error.message}`);
  }

  return { applied, skipped, counts: validation.counts };
};
