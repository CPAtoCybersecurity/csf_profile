/**
 * Share-export disposition registry — the single home of the invariant
 * "share exports carry no private or derived-private data."
 *
 * Every field that can appear in a share export is DECLARED here with a
 * disposition. buildShareableExport (dataExport.js) is a mechanical fold over
 * these specs: a field that is not declared does not serialize, in either
 * share mode. That inverts the historical fail-open default (serialize whole
 * stores, subtract known-private fields), which produced four separate leaks —
 * artifacts.link, the user directory, quarter metricId linkage, and derived
 * tailored text — each found only when an adjacent issue walked past it.
 *
 * Enforcement is two-ended (see shareRegistry.test.js):
 *  - appearance test: state built through the real producers is walked and
 *    every field path must be declared here — a NEW field is a red test at
 *    commit time, not a silent leak later;
 *  - conformance test: the production share output is checked against each
 *    declared disposition, in both modes.
 * Complete backups (exportAllDataJSON) are wholesale by design and do not
 * consult this registry; the own-data CSV/JSON exports are the documented
 * exception in PRIVATE_DATA.md ("Own-data exports are NOT scrubbed").
 *
 * Dispositions (leaf):
 *  - SHARE       rides the share export verbatim
 *  - OMIT        key never present in share output (deleted, not emptied —
 *                restore applies every section/key present, so an emptied
 *                value would overwrite the receiving install's own data)
 *  - EMPTY_STRING / EMPTY_LIST
 *                key present but neutralized ('' / []) when the source has it
 *  - REBUILD_EXTERNAL_TRACKING
 *                externalTracking is rebuilt (never spread) so legacy keys —
 *                v11 systemName, the interim array shape — cannot survive
 *  - STRIP_IF_EXCLUDED_METRIC
 *                quarter metricId is removed when it names a metric the share
 *                dropped (linkage-token strip), kept otherwise
 * A leaf may be a single disposition (same in both modes) or
 * { default, includePrivate }.
 *
 * Container nodes: { kind: 'struct', fields } (allow-list fold),
 * { kind: 'map', of } (keyed collection, e.g. observations, quarters),
 * { kind: 'list', of } (array of records).
 */

import { licenseIsRestricted } from './metricsImport';
import { getBankProcedure } from './procedureBank';

export const SHARE = 'share';
export const OMIT = 'omit';
export const EMPTY_STRING = 'empty-string';
export const EMPTY_LIST = 'empty-list';
export const REBUILD_EXTERNAL_TRACKING = 'rebuild-external-tracking';
export const STRIP_IF_EXCLUDED_METRIC = 'strip-if-excluded-metric';

const struct = (fields) => ({ kind: 'struct', fields });
const map = (of) => ({ kind: 'map', of });
// A `list` node kind ({ kind: 'list', of }) is supported by the fold for
// arrays of registered records; no current field needs it (rosters and id
// arrays are SHARE leaves), so no helper exists until one does.

/**
 * Swap tailored procedures back to the pristine community version. The org
 * profile is excluded from share exports, but tailoring BAKES profile facts
 * (org name, systems, crown-jewel references) into observation text — a
 * derived leak path. Provenance (procedureSource.bankId) makes the fix
 * deterministic: shared copies get the untailored community markdown. If the
 * bank entry cannot be resolved, the text is dropped entirely — never leaked.
 * Registry-owned so the pristine rule has exactly one home; applied as the
 * observation record transform in default share mode.
 */
export const pristineObservation = (obs) => {
  if (!obs?.procedureSource?.tailored) return obs;
  const bankEntry = getBankProcedure(obs.procedureSource.bankId);
  return {
    ...obs,
    testProcedures: bankEntry ? bankEntry.markdown : '',
    procedureSource: { ...obs.procedureSource, tailored: false, modified: false }
  };
};

const QUARTER = struct({
  actualScore: SHARE,
  targetScore: SHARE,
  observations: SHARE,
  observationDate: SHARE,
  testingStatus: SHARE,
  examine: SHARE,
  interview: SHARE,
  test: SHARE,
  metricId: STRIP_IF_EXCLUDED_METRIC
});

const OBSERVATION = struct({
  auditorId: SHARE, // opaque ref; the directory itself is omitted below
  testProcedures: SHARE, // pristine transform (above) already ran in default mode
  procedureSource: struct({
    bank: SHARE,
    bankId: SHARE,
    bankVersion: SHARE,
    attachedAt: SHARE,
    modified: SHARE,
    tailored: SHARE
  }),
  linkedArtifacts: SHARE,
  linkedFindings: SHARE,
  linkedControls: SHARE,
  externalLinks: { default: EMPTY_LIST, includePrivate: SHARE }, // #288 internal hosts/paths
  remediation: struct({
    ownerId: SHARE,
    actionPlan: SHARE,
    dueDate: SHARE
  }),
  jiraKey: SHARE, // Jira-importer field; named residual, rides shares today
  quarters: map(QUARTER),
  // Pre-quarterly (v0) legacy shape. Still readable by the dormant migration
  // path, so old records may carry these. SHARE preserves long-standing
  // behavior; candidates for OMIT in a deliberate follow-up, not silently.
  actualScore: SHARE,
  targetScore: SHARE,
  observations: SHARE,
  observationDate: SHARE,
  testingStatus: SHARE,
  assessmentMethods: SHARE,
  score: SHARE
});

const ASSESSMENT = struct({
  id: SHARE,
  name: SHARE,
  description: SHARE,
  scopeType: SHARE,
  scoringScale: SHARE,
  externalTracking: { default: REBUILD_EXTERNAL_TRACKING, includePrivate: SHARE },
  year: SHARE,
  users: SHARE, // roster of { userId, role } pairs — opaque ids, no PII
  scopeIds: SHARE,
  frameworkFilter: SHARE,
  status: SHARE,
  createdDate: SHARE,
  lastModified: SHARE,
  observations: map(OBSERVATION),
  jiraKey: SHARE,
  // Pack lineage tokens. In default mode pack assessments are filtered out
  // whole, so these ride only under includePrivate (and on tampered records —
  // preserving today's behavior).
  source: SHARE,
  packSlug: SHARE,
  packVersion: SHARE,
  packImportedAt: SHARE
});

const USER = struct({
  id: SHARE,
  name: SHARE,
  title: SHARE,
  email: SHARE,
  seedSource: SHARE
});

const CONTROL = struct({
  controlId: SHARE,
  name: SHARE,
  implementationDescription: SHARE,
  ownerId: SHARE,
  stakeholderIds: SHARE,
  linkedRequirementIds: SHARE,
  status: SHARE,
  tests: SHARE,
  frameworks: SHARE,
  artifacts: SHARE, // requirements-migration era, free text
  findings: SHARE,
  controlEvaluationBackLink: SHARE,
  externalUrl: { default: EMPTY_STRING, includePrivate: SHARE }, // #284
  assessmentId: SHARE,
  seedSource: SHARE,
  createdDate: SHARE,
  lastModified: SHARE
});

const REQUIREMENT = struct({
  id: SHARE,
  frameworkId: SHARE,
  function: SHARE,
  functionDescription: SHARE,
  category: SHARE,
  categoryDescription: SHARE,
  categoryId: SHARE,
  subcategoryId: SHARE,
  subcategoryDescription: SHARE,
  implementationExample: SHARE,
  inScope: SHARE,
  // Deprecated free-text people NAMES (pre-controls-migration). They ride
  // default shares today — the one directory-adjacent PII surface the #290
  // users-section omission does not cover. Declared SHARE to preserve
  // behavior; flagged as a named residual for a deliberate decision.
  controlOwner: SHARE,
  stakeholders: SHARE,
  implementationDescription: SHARE,
  artifacts: SHARE,
  findings: SHARE,
  controlEvaluationBackLink: SHARE
});

const FRAMEWORK = struct({
  id: SHARE,
  name: SHARE,
  shortName: SHARE,
  version: SHARE,
  source: SHARE,
  sourceUrl: SHARE, // user URL; render-gated by sanitizeExternalUrl, not export-scrubbed
  description: SHARE,
  enabled: SHARE,
  color: SHARE,
  hierarchyLabels: SHARE,
  importedDate: SHARE,
  isDefault: SHARE,
  comingSoon: SHARE // extinct v4-era flag (v<5 hard-resets); kept for old restores
});

const ARTIFACT = struct({
  id: SHARE,
  artifactId: SHARE,
  name: SHARE,
  description: SHARE,
  link: { default: EMPTY_STRING, includePrivate: SHARE }, // #284
  controlId: SHARE,
  assessmentId: SHARE,
  linkedEvaluationIds: SHARE,
  complianceRequirement: SHARE,
  linkedSubcategoryIds: SHARE,
  type: SHARE,
  health: SHARE,
  createdDate: SHARE,
  lastModified: SHARE,
  jiraKey: SHARE, // named residual (PR #286 follow-up)
  status: SHARE,
  priority: SHARE, // CSV-importer-only field
  seedSource: SHARE
});

const FINDING = struct({
  id: SHARE,
  summary: SHARE,
  description: SHARE, // CSV-importer-only field
  evaluationId: SHARE,
  controlId: SHARE,
  assessmentId: SHARE,
  complianceRequirement: SHARE,
  rootCause: SHARE,
  remediationActionPlan: SHARE,
  remediationOwner: SHARE,
  dueDate: SHARE,
  status: SHARE,
  priority: SHARE,
  createdDate: SHARE,
  lastModified: SHARE,
  jiraKey: SHARE,
  externalUrl: { default: EMPTY_STRING, includePrivate: SHARE }, // #284
  linkedArtifacts: SHARE,
  seedSource: SHARE,
  // Pack lineage + R5-class pack payload fields — filtered out with the
  // record in default mode, ride under includePrivate.
  source: SHARE,
  packSlug: SHARE,
  packVersion: SHARE,
  packRiskId: SHARE,
  packLikelihood: SHARE,
  packImpact: SHARE,
  packSubcategoryIds: SHARE
});

const METRIC = struct({
  id: SHARE,
  name: SHARE,
  type: SHARE,
  subcategoryIds: SHARE,
  description: SHARE,
  formula: SHARE,
  unit: SHARE,
  target: SHARE,
  direction: SHARE,
  frequency: SHARE,
  dataSource: SHARE,
  references: SHARE,
  notes: SHARE,
  license: SHARE, // also the hard-block key — see the metrics section filter
  source: SHARE,
  catalogSlug: SHARE,
  importedAt: SHARE
});

// Record filters, per section and mode. A filter decides whether a record
// appears in the share AT ALL; field dispositions then govern its shape.
const keepAssessment = (a, ctx) => (ctx.includePrivate ? true : a.source !== 'pack');
const keepFinding = (f, ctx) =>
  ctx.includePrivate ? true : f.source !== 'pack' && !ctx.packAssessmentIds.has(f.assessmentId);
// Restricted-license metric definitions (NC/ND/proprietary — e.g. a CIS
// catalogue an org uses internally) are HARD-BLOCKED from share exports:
// redistribution is a licensing violation, so this is not overridable by the
// include-private opt-in. Imported (csv-import) metrics are additionally
// private-by-lineage in default mode.
const keepMetric = (m, ctx) =>
  ctx.includePrivate
    ? !licenseIsRestricted(m.license)
    : m.source !== 'csv-import' && !licenseIsRestricted(m.license);

/**
 * The registry proper. Section dispositions:
 *  - 'fold'  records pass filter → record transform → field fold
 *  - OMIT    key deleted from the share envelope
 * `record` names the struct spec; `filter` the record predicate;
 * `recordTransform` an optional per-record rewrite applied before the fold
 * (mode-gated inside the transform itself where needed).
 */
export const SHARE_SECTIONS = {
  users: {
    disposition: { default: OMIT, includePrivate: 'fold' },
    record: USER
  },
  controls: { disposition: 'fold', record: CONTROL },
  assessments: {
    disposition: 'fold',
    record: ASSESSMENT,
    filter: keepAssessment,
    observationTransform: (obs, ctx) => (ctx.includePrivate ? obs : pristineObservation(obs))
  },
  requirements: { disposition: 'fold', record: REQUIREMENT },
  frameworks: { disposition: 'fold', record: FRAMEWORK },
  artifacts: { disposition: 'fold', record: ARTIFACT },
  findings: { disposition: 'fold', record: FINDING, filter: keepFinding },
  metrics: { disposition: 'fold', record: METRIC, filter: keepMetric },
  // The org profile (crown jewels + tooling) is never share material —
  // unconditionally, opt-in or not.
  orgProfile: { disposition: OMIT }
};

const modeValue = (leaf, ctx) =>
  typeof leaf === 'object' && leaf !== null && !leaf.kind
    ? (ctx.includePrivate ? leaf.includePrivate : leaf.default)
    : leaf;

/**
 * Presence semantics mirror the pre-registry scrubs exactly:
 *  - SHARE emits only when the source has the key (absent stays absent);
 *  - EMPTY_STRING emits '' UNCONDITIONALLY (the historical map-spread
 *    `{ ...record, link: '' }` added the key even when the record lacked it);
 *  - EMPTY_LIST emits [] only when the key is present (#288 behavior);
 *  - REBUILD passes a falsy value through untouched (the historical
 *    `if (a.externalTracking)` guard) and rebuilds otherwise;
 *  - STRIP_IF_EXCLUDED_METRIC drops the key when it names an excluded metric.
 */
const foldLeaf = (value, present, disposition, out, key, ctx) => {
  switch (disposition) {
    case SHARE:
      if (present) out[key] = value;
      return;
    case OMIT:
      return;
    case EMPTY_STRING:
      out[key] = '';
      return;
    case EMPTY_LIST:
      if (present) out[key] = [];
      return;
    case REBUILD_EXTERNAL_TRACKING:
      // REBUILD the config rather than spreading it, so a legacy field
      // (v11 systemName) riding on an unmigrated record can never survive
      // into a share export. Only the non-sensitive enabled flag is kept.
      if (!present) return;
      out[key] = value
        ? {
            enabled: value.enabled === true,
            systems: { findings: '', artifacts: '', controls: '' }
          }
        : value;
      return;
    case STRIP_IF_EXCLUDED_METRIC:
      if (present && !ctx.excludedMetricIds.has(value)) out[key] = value;
      return;
    default:
      // Unknown disposition = programming error in the registry itself.
      throw new Error(`shareRegistry: unknown disposition "${disposition}" for "${key}"`);
  }
};

const foldNode = (value, spec, ctx) => {
  if (spec.kind === 'struct') {
    if (value === null || typeof value !== 'object') return value;
    const out = {};
    Object.entries(spec.fields).forEach(([field, fieldSpec]) => {
      const present = value[field] !== undefined;
      if (fieldSpec.kind) {
        if (present) out[field] = foldNode(value[field], fieldSpec, ctx);
      } else {
        foldLeaf(value[field], present, modeValue(fieldSpec, ctx), out, field, ctx);
      }
    });
    return out;
  }
  if (spec.kind === 'map') {
    if (value === null || typeof value !== 'object') return value;
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, foldNode(v, spec.of, ctx)])
    );
  }
  if (spec.kind === 'list') {
    if (!Array.isArray(value)) return value;
    return value.map((v) => foldNode(v, spec.of, ctx));
  }
  throw new Error(`shareRegistry: unknown node kind "${spec.kind}"`);
};

/**
 * Fold one section's records through filter → record transform → field fold.
 * The observations transform is threaded explicitly because the pristine swap
 * operates at observation grain inside the assessment struct.
 */
export const foldSection = (name, records, ctx) => {
  const section = SHARE_SECTIONS[name];
  const kept = section.filter ? records.filter((r) => section.filter(r, ctx)) : records;
  return kept.map((record) => {
    let working = record;
    if (
      name === 'assessments' &&
      section.observationTransform &&
      working?.observations &&
      typeof working.observations === 'object'
    ) {
      working = {
        ...working,
        observations: Object.fromEntries(
          Object.entries(working.observations).map(([itemId, obs]) => [
            itemId,
            obs && typeof obs === 'object' ? section.observationTransform(obs, ctx) : obs
          ])
        )
      };
    }
    return foldNode(working, section.record, ctx);
  });
};

/**
 * Enumerate every declared field path (for the appearance test). Paths use
 * `[]` for list items and `{}` for map values, e.g.
 * `assessments[].observations{}.procedureSource.bankId`.
 */
export const declaredPaths = () => {
  const paths = new Set();
  const walkSpec = (spec, prefix) => {
    if (!spec.kind) {
      paths.add(prefix);
      return;
    }
    if (spec.kind === 'struct') {
      paths.add(prefix);
      Object.entries(spec.fields).forEach(([field, fieldSpec]) =>
        walkSpec(fieldSpec, prefix ? `${prefix}.${field}` : field)
      );
    } else if (spec.kind === 'map') {
      paths.add(prefix);
      walkSpec(spec.of, `${prefix}{}`);
    } else if (spec.kind === 'list') {
      paths.add(prefix);
      walkSpec(spec.of, `${prefix}[]`);
    }
  };
  Object.entries(SHARE_SECTIONS).forEach(([name, section]) => {
    paths.add(name);
    if (section.record) walkSpec(section.record, `${name}[]`);
  });
  return paths;
};

/**
 * Remove quarter-level `metricId` links that point at metric definitions the
 * share export dropped — the ID itself (e.g. a licensed catalogue's key) is a
 * linkage token that would leak the catalogue's identity through otherwise
 * shareable, user-authored assessments. Handled by STRIP_IF_EXCLUDED_METRIC
 * during the fold; ctx carries the excluded-id set.
 */
export const buildShareContext = (allMetrics, allAssessments, { includePrivate }) => {
  const excludedMetricIds = includePrivate
    ? new Set(allMetrics.filter((m) => licenseIsRestricted(m.license)).map((m) => m.id))
    : new Set(
        allMetrics
          .filter((m) => m.source === 'csv-import' || licenseIsRestricted(m.license))
          .map((m) => m.id)
      );
  return {
    includePrivate,
    excludedMetricIds,
    restrictedDroppedCount: allMetrics.filter((m) => licenseIsRestricted(m.license)).length,
    packAssessmentIds: new Set(
      allAssessments.filter((a) => a.source === 'pack').map((a) => a.id)
    )
  };
};
