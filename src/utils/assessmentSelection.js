/**
 * Assessment selection — narrowing an export envelope to a chosen subset of
 * assessments.
 *
 * Design note (why this is a separate module and not a flag threaded through
 * dataExport.js): selection is not a different KIND of export. Every export
 * path already produces the same envelope shape — `exportAllDataJSON` builds
 * it, `buildShareableExport` runs the privacy fold over it. Selection is a
 * pure narrowing of ONE array plus the records that hang off it, so it runs
 * LAST, over whatever the previous stage produced.
 *
 * That ordering is deliberate and load-bearing: the share fold
 * (shareRegistry.js) is the privacy boundary and stays untouched. Filtering
 * afterwards can only ever remove more records, never re-admit one the fold
 * dropped, so no share guarantee is in the blast radius of this file.
 *
 * The no-op contract matters just as much: with no selection — or with every
 * assessment selected — the envelope is returned by reference, unchanged. The
 * default export path is therefore byte-identical to the pre-selection
 * behaviour, which is what keeps the golden snapshots honest.
 */

/**
 * EXHAUSTIVE section disposition. Every top-level key an export envelope can
 * carry is classified here, and `sectionDispositionGaps()` fails loudly when a
 * new section appears that nobody classified — silence in the share path is a
 * silent disclosure, so drift must be noisy.
 *
 *  narrow      — the selection itself
 *  cascade     — owned by an assessment via `assessmentId`, follows it out
 *  keep-whole  — carries no assessment linkage; a subset that dropped it would
 *                not open (catalogue) or would break restore (directory)
 *
 * Why metrics / systems / orgProfile are keep-whole and not cascade: none of
 * the three carries an `assessmentId` — verified against metricsStore,
 * inventoryStore and orgProfileStore. They are org-level, not assessment-level,
 * so there is no correct way to attribute them to a selection. Their PRIVACY
 * is a separate question already answered upstream by the share fold
 * (shareRegistry.js): metrics are license-gated and private-by-lineage,
 * systems are OMITted by default, and orgProfile is stripped unconditionally.
 * Narrowing here would duplicate that boundary, not strengthen it.
 */
export const SECTION_DISPOSITION = {
  assessments: 'narrow',
  findings: 'cascade',
  artifacts: 'cascade',
  users: 'keep-whole',
  controls: 'keep-whole',
  requirements: 'keep-whole',
  frameworks: 'keep-whole',
  metrics: 'keep-whole',
  systems: 'keep-whole',
  orgProfile: 'keep-whole'
};

/**
 * Top-level `data` keys present in `envelope` that SECTION_DISPOSITION does not
 * classify. Non-empty means a section was added without a selection decision.
 */
export const sectionDispositionGaps = (envelope) =>
  Object.keys(envelope?.data || {}).filter((k) => !(k in SECTION_DISPOSITION));

/**
 * True when `ids` asks for a strict subset of the assessments in `envelope`.
 * A null/empty selection, or one covering everything present, is not a subset.
 */
const isSubsetSelection = (envelope, ids) => {
  if (!Array.isArray(ids)) return false;
  const present = envelope?.data?.assessments;
  if (!Array.isArray(present)) return false;
  const wanted = new Set(ids);
  const kept = present.filter((a) => wanted.has(a?.id));
  return kept.length < present.length;
};

/**
 * A record belongs to the selection when it points at a selected assessment.
 * Records with no `assessmentId` at all are UNASSIGNED, not orphaned — they
 * were never owned by any assessment, so narrowing the assessment list is not
 * a reason to drop them (same rule ArtifactSelector uses when it scopes a
 * pick list: `belongsToAssessment(a, id) || isUnassigned(a)`).
 */
const belongsToSelection = (record, wanted) => {
  const id = record?.assessmentId;
  if (!id) return true;
  return wanted.has(id);
};

/**
 * Narrow a complete/shareable export envelope to a chosen set of assessments.
 *
 * Sections narrowed:
 *  - `assessments` — kept in store order, exactly the selected IDs
 *  - `findings`    — dropped when they point at an unselected assessment
 *  - `artifacts`   — same rule; unassigned artifacts are retained
 *
 * Sections deliberately left whole:
 *  - `users` — the directory is referenced by remediation owners and auditor
 *    stamps across records this filter does not inspect; narrowing it would
 *    turn a restore into a dangling-reference hunt. The per-assessment roster
 *    (`assessment.users`) already rides inside each kept assessment.
 *  - `controls` / `requirements` / `frameworks` — the catalogue the scope IDs
 *    resolve against. A subset export that dropped them would not open.
 *
 * @param {Object} envelope - Envelope from exportAllDataJSON / buildShareableExport
 * @param {string[]|null} [assessmentIds] - Selected assessment IDs; null/omitted = all
 * @returns {Object} The same envelope (by reference) when no subset is asked
 *   for, otherwise a new envelope — the input is never mutated.
 */
export const filterExportByAssessments = (envelope, assessmentIds = null) => {
  if (!isSubsetSelection(envelope, assessmentIds)) return envelope;

  const wanted = new Set(assessmentIds);
  const data = envelope.data;

  const assessments = data.assessments.filter((a) => wanted.has(a?.id));

  const next = { ...envelope, data: { ...data } };
  next.data.assessments = assessments;

  // Unassigned records ride along, so their count is reported rather than left
  // implicit — a share recipient should be able to see that the file carries
  // records belonging to no assessment at all.
  const unassigned = {};
  const cascade = (key) => {
    // Share exports DELETE sections rather than emptying them, so a section may
    // legitimately be absent here — guard, don't resurrect it as [].
    if (!Array.isArray(data[key])) return;
    next.data[key] = data[key].filter((r) => belongsToSelection(r, wanted));
    const n = next.data[key].filter((r) => !r?.assessmentId).length;
    if (n > 0) unassigned[key] = n;
  };
  cascade('findings');
  cascade('artifacts');

  // Comments cascade with their records: evaluation comments follow the kept
  // assessments (targetId is `assessmentId::itemId`), finding comments follow
  // the findings that survived above, control comments ride wholesale because
  // the control catalogue itself rides wholesale.
  if (Array.isArray(data.comments)) {
    const keptFindingIds = new Set(
      (Array.isArray(next.data.findings) ? next.data.findings : []).map((f) => f?.id)
    );
    next.data.comments = data.comments.filter((c) => {
      if (!c || typeof c !== 'object') return false;
      if (c.targetType === 'evaluation') {
        const idx = typeof c.targetId === 'string' ? c.targetId.indexOf('::') : -1;
        return idx > 0 && wanted.has(c.targetId.slice(0, idx));
      }
      if (c.targetType === 'finding') return keptFindingIds.has(c.targetId);
      return true;
    });
  }

  next.metadata = {
    ...(envelope.metadata || {}),
    assessmentCount: assessments.length,
    findingCount: Array.isArray(next.data.findings)
      ? next.data.findings.length
      : (envelope.metadata?.findingCount ?? 0),
    // The provenance stamp a restore reads to warn that this file is a slice,
    // not a backup (dataImport.validateDatabaseExport).
    assessmentSelection: {
      selectedIds: assessments.map((a) => a.id),
      selectedCount: assessments.length,
      totalCount: data.assessments.length,
      // Records kept because they belong to NO assessment. Records pointing at
      // an assessment that is not selected — including one that no longer
      // exists — are dropped; only a null/absent link means "unassigned".
      includedUnassigned: unassigned
    }
  };

  next.dataType = `${envelope.dataType} — selected assessments only`;

  return next;
};

/**
 * Filename marker for a subset export. Complete backups and slices must not
 * share a filename shape: `csf_assessment_*.json` is what the restore control
 * accepts, and a slice restored as a backup silently deletes the assessments
 * it left behind.
 */
export const isSubsetOf = (allAssessments, assessmentIds) =>
  Array.isArray(assessmentIds) &&
  Array.isArray(allAssessments) &&
  assessmentIds.length < allAssessments.length;

export default filterExportByAssessments;
