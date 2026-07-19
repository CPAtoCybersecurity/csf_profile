/**
 * Assessment scoping (issue #297).
 *
 * Findings, artifacts, and users are stored globally, but most surfaces show
 * them in the context of one assessment. The shipped demo (Alma) records are
 * stamped with the demo assessment's id, so they appear only there; records
 * with no assessmentId (anything a user created before this scheme existed)
 * are treated as visible in EVERY per-assessment view — hiding a user's own
 * legacy data behind a filter they never chose is not an acceptable outcome.
 *
 * One helper family so every consumer (pages, pick lists, Dashboard KPIs,
 * report generators) scopes the same way.
 */

// Provenance marker on records this app ships as example data. Set on the
// demo users, findings, and artifacts at seed time and stamped onto existing
// installs' copies by the store migrations.
export const DEMO_SEED_SOURCE = 'demo-alma';

// Scope filter sentinels for the Findings/Artifacts pages.
export const SCOPE_ALL = 'all';
export const SCOPE_UNASSIGNED = 'unassigned';

/** A record with no assessment linkage (legacy/user-created before #297). */
export const isUnassigned = (record) => !record?.assessmentId;

/**
 * Does this record belong to the given assessment? Matches the explicit
 * assessmentId; for findings that predate the assessmentId field, falls back
 * to the evaluationId convention (evaluation ids embed the assessment id).
 */
export const belongsToAssessment = (record, assessmentId) => {
  if (!record || !assessmentId) return false;
  if (record.assessmentId === assessmentId) return true;
  if (!record.assessmentId && typeof record.evaluationId === 'string' &&
      record.evaluationId.includes(assessmentId)) {
    return true;
  }
  return false;
};

/**
 * Apply a page scope filter. `scope` is SCOPE_ALL, SCOPE_UNASSIGNED, or an
 * assessment id. Per-assessment views include unassigned records (see module
 * doc) — demo records, being stamped, drop out of every other assessment.
 *
 * opts.knownAssessmentIds (optional Set/array): when given, the Unassigned
 * view ALSO surfaces orphans — records stamped with an assessment that no
 * longer exists (deleted assessment). Without it those records would be
 * reachable only under All.
 */
export const filterByScope = (records, scope, opts = {}) => {
  const list = Array.isArray(records) ? records : [];
  if (!scope || scope === SCOPE_ALL) return list;
  if (scope === SCOPE_UNASSIGNED) {
    const known = opts.knownAssessmentIds ? new Set(opts.knownAssessmentIds) : null;
    return list.filter(r => isUnassigned(r) || (known && !known.has(r.assessmentId)));
  }
  return list.filter(r => belongsToAssessment(r, scope) || isUnassigned(r));
};

/**
 * The assessmentId to stamp on a record created while a page scope filter is
 * active: a concrete assessment scope wins; the Unassigned view stamps null
 * (a record created there must stay visible there — stamping the current
 * assessment would make it vanish from the very view it was created in);
 * otherwise the app-wide current assessment, otherwise null.
 */
export const resolveScopeStamp = (scope, currentAssessmentId) => {
  if (scope === SCOPE_UNASSIGNED) return null;
  if (scope && scope !== SCOPE_ALL) return scope;
  return currentAssessmentId || null;
};

/**
 * The default page scope: the assessment the user is working in when one is
 * selected, else everything.
 */
export const defaultScope = (currentAssessmentId) => currentAssessmentId || SCOPE_ALL;
