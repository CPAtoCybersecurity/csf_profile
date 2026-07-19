/**
 * Private data-pack import — the overlay counterpart to dataImport.js.
 *
 * A pack is a single local JSON file (see PRIVATE_DATA.md) that loads an
 * organization's private assessment values and risk entries into the app.
 * Packs are ADDITIVE and never touch data the user created by hand:
 *
 *  - metricValues land in a pack-owned assessment (id `ASM-pack-<slug>`),
 *    never in the active assessment.
 *  - risks land as findings linked to that assessment, with pack provenance.
 *  - Re-importing the same `org.slug` REPLACES what the pack owns and never
 *    duplicates it — packVersion bumps update in place.
 *
 * Every record written carries `source: "pack"`, `packSlug`, and
 * `packVersion`, and the pack-owned assessment is the lineage anchor the
 * share export (dataExport.js) uses to exclude private data by default.
 */

/** Highest pack envelope version this build reads. */
import { normalizeExternalTracking } from './externalLinks';

export const PACK_FORMAT_VERSION = 1;

/**
 * App version for `engineMin` checks. CRA blocks importing package.json from
 * src/, so this constant mirrors it; packImport.test.js asserts they match.
 */
export const ENGINE_VERSION = '2.2.0';

export const PACK_ASSESSMENT_ID_PREFIX = 'ASM-pack-';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

/** Sections this build can apply vs. accept-and-report-only. */
const APPLIED_SECTIONS = ['metricValues', 'risks'];
const ACCEPTED_UNAPPLIED_SECTIONS = ['resources', 'frameworks'];

/** Compare dotted version strings numerically. Returns -1 | 0 | 1. */
const compareVersions = (a, b) => {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
};

/**
 * Validate a parsed pack file.
 * @param {Object} parsed - JSON.parse result of the uploaded pack
 * @returns {{ ok: boolean, errors: string[], warnings: string[], counts: Object, notApplied: string[] }}
 */
export const validatePack = (parsed) => {
  const errors = [];
  const warnings = [];
  const counts = {};
  const notApplied = [];

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, errors: ['File is not a JSON object.'], warnings, counts, notApplied };
  }

  if (typeof parsed.packFormat !== 'number') {
    errors.push('Not a data pack (missing packFormat). For app backups, use Restore From Backup instead.');
    return { ok: false, errors, warnings, counts, notApplied };
  }
  if (parsed.packFormat > PACK_FORMAT_VERSION) {
    errors.push(
      `Pack uses format ${parsed.packFormat}; this build reads up to format ${PACK_FORMAT_VERSION}. ` +
      'Update the app, then import.'
    );
  }
  if (parsed.engineMin !== undefined && compareVersions(parsed.engineMin, ENGINE_VERSION) > 0) {
    errors.push(
      `Pack requires app version ${parsed.engineMin} or newer (this build is ${ENGINE_VERSION}). ` +
      'Update the app, then import.'
    );
  }
  if (parsed.packVersion === undefined || parsed.packVersion === null || parsed.packVersion === '') {
    errors.push('Pack has no packVersion.');
  }
  if (!parsed.org || typeof parsed.org !== 'object') {
    errors.push('Pack has no org section.');
  } else {
    if (typeof parsed.org.slug !== 'string' || parsed.org.slug.trim() === '') {
      errors.push('Pack org has no slug (the stable identity key re-imports match on).');
    } else if (!/^[a-z0-9][a-z0-9-]*$/.test(parsed.org.slug)) {
      warnings.push(`org.slug "${parsed.org.slug}" is unusual — lowercase letters, digits, and dashes are recommended.`);
    }
    if (typeof parsed.org.name !== 'string' || parsed.org.name.trim() === '') {
      errors.push('Pack org has no name.');
    }
  }
  if (parsed.assessmentScope !== undefined && parsed.assessmentScope !== 'new') {
    errors.push(
      'This build only supports assessmentScope "new" (pack-owned assessment). ' +
      'Targeting an existing assessment is not supported yet — nothing was imported.'
    );
  }

  if (!parsed.sections || typeof parsed.sections !== 'object') {
    errors.push('Pack has no sections.');
    return { ok: errors.length === 0, errors, warnings, counts, notApplied };
  }

  Object.entries(parsed.sections).forEach(([key, value]) => {
    const known = APPLIED_SECTIONS.includes(key) || ACCEPTED_UNAPPLIED_SECTIONS.includes(key);
    if (!known) {
      warnings.push(`Unknown section "${key}" skipped (written for a newer engine?).`);
      return;
    }
    if (!Array.isArray(value)) {
      errors.push(`Section "${key}" is not an array.`);
      return;
    }
    counts[key] = value.length;
    if (ACCEPTED_UNAPPLIED_SECTIONS.includes(key) && value.length > 0) {
      notApplied.push(key);
    }
  });

  if (APPLIED_SECTIONS.every((key) => !counts[key])) {
    errors.push('Pack contains no importable data (metricValues or risks).');
  }

  // The per-entry loops below must never see a truthy non-array (e.g.
  // "metricValues": {...}) — the section-type error was already recorded
  // above; here it would throw a raw TypeError past the validator's contract.
  const metricValues = Array.isArray(parsed.sections.metricValues) ? parsed.sections.metricValues : [];
  const risks = Array.isArray(parsed.sections.risks) ? parsed.sections.risks : [];

  metricValues.forEach((entry, i) => {
    if (!entry || typeof entry.subcategoryId !== 'string' || entry.subcategoryId.trim() === '') {
      errors.push(`metricValues[${i}] has no subcategoryId.`);
      return;
    }
    if (!entry.quarters || typeof entry.quarters !== 'object' || Object.keys(entry.quarters).length === 0) {
      errors.push(`metricValues[${i}] (${entry.subcategoryId}) has no quarters.`);
      return;
    }
    Object.keys(entry.quarters).forEach((q) => {
      if (!QUARTERS.includes(q)) {
        errors.push(`metricValues[${i}] (${entry.subcategoryId}) has invalid quarter "${q}" (expected Q1–Q4).`);
      }
    });
  });

  risks.forEach((risk, i) => {
    if (!risk || typeof risk.id !== 'string' || risk.id.trim() === '') {
      errors.push(`risks[${i}] has no id.`);
      return;
    }
    if (typeof risk.title !== 'string' || risk.title.trim() === '') {
      errors.push(`risks[${i}] (${risk.id}) has no title.`);
    }
    ['likelihood', 'impact'].forEach((field) => {
      const v = risk[field];
      if (v !== undefined && (typeof v !== 'number' || v < 1 || v > 5)) {
        errors.push(`risks[${i}] (${risk.id}) ${field} must be a number from 1 to 5.`);
      }
    });
  });

  return { ok: errors.length === 0, errors, warnings, counts, notApplied };
};

/** Resolve pack subcategory IDs to requirement rows of the default framework. */
const resolveSubcategories = (parsed, stores) => {
  const frameworks = stores.frameworksStore?.getState?.()?.frameworks || [];
  const defaultFramework = frameworks.find((f) => f.isDefault) || frameworks[0] || null;
  const requirements = stores.requirementsStore?.getState?.()?.requirements || [];
  const inFramework = defaultFramework
    ? requirements.filter((r) => r.frameworkId === defaultFramework.id)
    : [];

  const resolved = [];
  const unresolved = [];
  const ambiguous = [];
  (parsed.sections.metricValues || []).forEach((entry) => {
    // First matching row (sorted by id) — deterministic when a subcategory has
    // several implementation-example rows. Ambiguity is DISCLOSED in the
    // preview: in a GRC tool a mis-attributed value is a correctness bug, so
    // deterministic-and-silent is not acceptable, deterministic-and-told is.
    const matches = inFramework
      .filter((r) => r.subcategoryId === entry.subcategoryId)
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));
    if (matches.length > 0) {
      resolved.push({ entry, requirementId: matches[0].id });
      if (matches.length > 1) {
        ambiguous.push({ subcategoryId: entry.subcategoryId, matches: matches.length, attachedTo: matches[0].id });
      }
    } else {
      unresolved.push(entry.subcategoryId);
    }
  });
  return { defaultFramework, resolved, unresolved, ambiguous };
};

const findPackAssessment = (stores, slug) => {
  const assessments = stores.assessmentsStore?.getState?.()?.assessments || [];
  return assessments.find((a) => a.source === 'pack' && a.packSlug === slug) || null;
};

/**
 * Dry-run a pack against the current stores — powers the preview dialog.
 * Performs NO writes.
 */
export const previewPackImport = (parsed, stores) => {
  const validation = validatePack(parsed);
  if (!validation.ok) {
    return { validation };
  }

  const slug = parsed.org.slug;
  const { defaultFramework, resolved, unresolved, ambiguous } = resolveSubcategories(parsed, stores);
  const existing = findPackAssessment(stores, slug);
  const localEditsSinceImport = Boolean(
    existing &&
    existing.packImportedAt &&
    existing.lastModified &&
    new Date(existing.lastModified).getTime() > new Date(existing.packImportedAt).getTime()
  );

  return {
    validation,
    orgName: parsed.org.name,
    slug,
    packVersion: parsed.packVersion,
    frameworkName: defaultFramework?.name || null,
    metricValues: {
      count: (parsed.sections.metricValues || []).length,
      resolved: resolved.length,
      unresolved,
      ambiguous
    },
    risks: { count: (parsed.sections.risks || []).length },
    notApplied: validation.notApplied,
    willReplace: Boolean(existing),
    existingName: existing?.name || null,
    localEditsSinceImport
  };
};

// Defaults mirror the store's canonical present-quarter shape
// (assessmentsStore createDefaultQuarter): 0 scores, boolean E/I/T flags.
const buildQuarter = (quarterData) => ({
  actualScore: quarterData.actualScore ?? 0,
  targetScore: quarterData.targetScore ?? 0,
  observations: quarterData.observations ?? '',
  observationDate: quarterData.observationDate ?? '',
  testingStatus: quarterData.testingStatus ?? '',
  examine: quarterData.examine ?? false,
  interview: quarterData.interview ?? false,
  test: quarterData.test ?? false,
  metricId: quarterData.metricId ?? ''
});

const riskPriority = (risk) => {
  const score = (risk.likelihood || 0) * (risk.impact || 0);
  if (score >= 16) return 'High';
  if (score >= 9) return 'Medium';
  return 'Low';
};

/**
 * Apply a validated pack to the stores.
 * Idempotent on org.slug: the pack-owned assessment and pack-sourced findings
 * for that slug are replaced, never duplicated. Both writes resolve before
 * either applies; a mid-apply failure rolls back.
 *
 * @param {Object} parsed - JSON.parse result of the pack file
 * @param {Object} stores - { assessmentsStore, findingsStore, frameworksStore, requirementsStore }
 * @returns {{ replaced: boolean, assessmentId: string, applied: Object, unresolved: string[], notApplied: string[] }}
 */
export const importPack = (parsed, stores) => {
  const validation = validatePack(parsed);
  if (!validation.ok) {
    throw new Error(validation.errors.join(' '));
  }

  const slug = parsed.org.slug;
  const packVersion = String(parsed.packVersion);
  const now = new Date().toISOString();
  const { defaultFramework, resolved, unresolved } = resolveSubcategories(parsed, stores);

  if ((parsed.sections.metricValues || []).length > 0 && resolved.length === 0) {
    throw new Error(
      'None of the pack subcategory IDs exist in the active framework — nothing was imported. ' +
      `Unmatched: ${unresolved.join(', ')}`
    );
  }

  const assessmentsState = stores.assessmentsStore?.getState?.();
  const findingsState = stores.findingsStore?.getState?.();
  if (typeof assessmentsState?.setAssessments !== 'function') {
    throw new Error('assessmentsStore is missing setAssessments(); import aborted before any data was changed.');
  }
  if (typeof findingsState?.setFindings !== 'function') {
    throw new Error('findingsStore is missing setFindings(); import aborted before any data was changed.');
  }

  const previousAssessments = assessmentsState.assessments || [];
  const previousFindings = findingsState.findings || [];

  const existing = previousAssessments.find((a) => a.source === 'pack' && a.packSlug === slug) || null;
  const assessmentId = existing?.id || `${PACK_ASSESSMENT_ID_PREFIX}${slug}`;

  const observations = {};
  resolved.forEach(({ entry, requirementId }) => {
    const quarters = {};
    Object.entries(entry.quarters).forEach(([q, quarterData]) => {
      quarters[q] = buildQuarter(quarterData || {});
    });
    observations[requirementId] = {
      auditorId: '',
      testProcedures: '',
      linkedArtifacts: [],
      remediation: { ownerId: '', actionPlan: '', dueDate: '' },
      quarters
    };
  });

  const packAssessment = {
    id: assessmentId,
    name: `${parsed.org.name} (private pack)`,
    description: `Imported from data pack "${slug}" ${packVersion}. Re-importing the pack replaces this assessment.`,
    scopeType: 'requirements',
    // packFormat 1 scores are defined on the 10-point scale (issue #277)
    scoringScale: 10,
    // packFormat 1 has no external-tracking concept; disabled default
    // (issues #284/#288 — normalize emits the current per-type shape)
    externalTracking: normalizeExternalTracking(undefined),
    scopeIds: resolved.map(({ requirementId }) => requirementId),
    frameworkFilter: defaultFramework?.id || null,
    status: 'In Progress',
    createdDate: existing?.createdDate || now,
    lastModified: now,
    observations,
    source: 'pack',
    packSlug: slug,
    packVersion,
    packImportedAt: now
  };

  const packFindings = (parsed.sections.risks || []).map((risk) => ({
    id: `FND-pack-${slug}-${risk.id}`,
    summary: risk.title,
    evaluationId: '',
    controlId: (risk.subcategoryIds || [])[0] || '',
    assessmentId,
    rootCause: risk.notes || '',
    remediationActionPlan: '',
    remediationOwner: '',
    dueDate: '',
    status: 'Not Started',
    priority: riskPriority(risk),
    createdDate: now,
    lastModified: now,
    jiraKey: '',
    linkedArtifacts: [],
    source: 'pack',
    packSlug: slug,
    packVersion,
    packRiskId: risk.id,
    packLikelihood: risk.likelihood ?? null,
    packImpact: risk.impact ?? null,
    packSubcategoryIds: risk.subcategoryIds || []
  }));

  const nextAssessments = [
    ...previousAssessments.filter((a) => !(a.source === 'pack' && a.packSlug === slug)),
    packAssessment
  ];
  const nextFindings = [
    ...previousFindings.filter((f) => f.packSlug !== slug),
    ...packFindings
  ];

  // Apply with rollback — never leave one store updated and the other not.
  assessmentsState.setAssessments(nextAssessments);
  try {
    findingsState.setFindings(nextFindings);
  } catch (error) {
    try { assessmentsState.setAssessments(previousAssessments); } catch { /* best effort — original error is rethrown */ }
    throw new Error(`Pack import failed mid-apply and was rolled back: ${error.message}`);
  }

  return {
    replaced: Boolean(existing),
    assessmentId,
    applied: { metricValues: resolved.length, risks: packFindings.length },
    unresolved,
    notApplied: validation.notApplied
  };
};
