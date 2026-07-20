/**
 * 800-53 -> CSF 2.0 subcategory mapping — pure join + validation logic
 * (plan §7 R-2; PR-4). Shared (relatedSection.mjs precedent) between the
 * build-time generator (scripts/generate-subcategory-map.mjs) and the jest
 * suite, so CI and tests exercise the SAME code.
 *
 * Mappings decide only which optional addendum is offered — never scope,
 * never score. Precision beats recall.
 *
 * Chain: policy nist80053[] -> OLIR informative references -> subcategory.
 * The OLIR side (vendor/olir/, faithful-raw reference strings) is normalized
 * and joined HERE, so a join-rule change is a GENERATOR_VERSION bump, never a
 * re-vendoring.
 *
 * Grain doctrine (every coarsening is flagged per pair, never silent):
 *  - Resolution precedence per control: stated grain exact match first, then
 *    sub-part truncation (IA-5c -> IA-5), then enhancement fallback
 *    (IA-2(1) -> IA-2).
 *  - Grain labels: 'exact' | 'subpart-truncated' | 'enh-fallback'. When BOTH
 *    coarsenings apply (SC-7(10)(a) -> SC-7), the coarsest step wins:
 *    'enh-fallback'.
 *  - Pair grain = the FINEST contributing via grain (exact beats
 *    subpart-truncated beats enh-fallback). That scalar is a projection and
 *    is monotone-optimistic on its own (one exact via riding with many
 *    coarsened ones reads the same as all-exact), so every derived pair also
 *    carries grainVias — the lossless per-grain via counts — and the scalar
 *    is derivable from it. Consumers that would rank or filter on grain must
 *    read grainVias.
 *  - Measured fact turned assertion: the pinned OLIR lanes carry no sub-part
 *    reference forms today. If a future release adds one, buildOlirIndex
 *    THROWS rather than silently keeping a truth that stopped being true.
 *
 * Provenance doctrine:
 *  - 'derived'    — produced by the OLIR join. A pair supported by both a
 *    derived and a gap-table via stays 'derived' (the machine edge exists
 *    independently of hand-authoring).
 *  - 'authored'   — produced only by the hand-authored gap table
 *    (data/mapping-overrides.json). Gap edges apply by base-form match
 *    (SC-15a carries SC-15) uniformly to ALL carriers. No grain field.
 *  - 'overridden' — the policy's or signature's pairs were replaced outright
 *    by an override. Policy override wins over signature override. No grain
 *    field.
 *  - An override or gap row referencing an unknown policy, signature,
 *    control, or subcategory is a VALIDATION ERROR, not a warning —
 *    otherwise overrides rot silently when upstream revs v1 -> v2. So is a
 *    gap-table control that becomes mapped upstream (re-ratify it) or that
 *    no bank policy carries (stale row).
 */

export const GENERATOR_VERSION = 1;

/** The 800-53 lane of the vendored OLIR artifact this join is pinned to. */
export const PINNED_LANE = 'SP 800-53 Rev 5.2.0';

/** Verbatim from the plan (§5 "Mapping derivation detail"). */
export const JUSTIFICATION =
  'Mappings decide only which optional addendum is offered — never scope, never score. ' +
  'Precision beats recall.';

const GRAIN_RANK = { exact: 0, 'subpart-truncated': 1, 'enh-fallback': 2 };

export class MappingValidationError extends Error {
  constructor(problems) {
    super(`Mapping validation failed:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'MappingValidationError';
    this.problems = problems;
  }
}

/**
 * Parse a bank-side 800-53 control string. Measured corpus forms: base
 * ("IA-2"), enhancement ("IA-2(1)"), base+sub-part letter ("IA-5c"),
 * enhancement+parenthesized sub-part ("SC-7(10)(a)"), and the one
 * unparenthesized variant ("SC-7(10)a"). Anything else returns null — the
 * CALLER must treat null as an error: a skipped control is a silently
 * un-mapped policy.
 */
export const parseControl = (raw) => {
  const m = String(raw).trim().match(/^([A-Z]{2})-(\d+)(?:\((\d+)\))?(?:\(?([a-z])\)?)?\.?$/);
  if (!m) return null;
  return { family: m[1], number: Number(m[2]), enhancement: m[3] ? Number(m[3]) : null, subpart: m[4] || null };
};

const baseForm = (p) => `${p.family}-${p.number}`;
const enhForm = (p) => (p.enhancement === null ? null : `${p.family}-${p.number}(${p.enhancement})`);

/**
 * Normalize a RAW OLIR reference string ("AC-07", "SI-02(07)") to canonical
 * unpadded form ("AC-7", "SI-2(7)"). Returns null for unparseable strings;
 * sub-part forms are rejected by buildOlirIndex (see grain doctrine).
 */
export const normalizeOlirRef = (raw) => {
  const p = parseControl(String(raw).trim());
  if (!p) return null;
  if (p.subpart) return { subpart: true };
  return enhForm(p) || baseForm(p);
};

/**
 * Build the join index for one lane of the converted OLIR artifact:
 * canonical control ref -> sorted array of subcategory IDs. Throws on a
 * missing lane, an unparseable reference, or a sub-part reference form.
 */
export const buildOlirIndex = (converted, lane) => {
  if (!converted.lanes.includes(lane)) {
    throw new MappingValidationError([
      `lane "${lane}" not present in the vendored OLIR artifact (has: ${converted.lanes.join(', ')})`
    ]);
  }
  const index = new Map();
  const problems = [];
  for (const [subcategoryId, lanes] of Object.entries(converted.subcategories)) {
    for (const raw of lanes[lane] || []) {
      const ref = normalizeOlirRef(raw);
      if (ref === null) {
        problems.push(`unparseable OLIR reference "${raw}" on ${subcategoryId} (${lane})`);
        continue;
      }
      if (ref.subpart) {
        problems.push(
          `OLIR reference "${raw}" on ${subcategoryId} carries a sub-part form — the no-subpart ` +
          'assumption this join is built on stopped being true; re-derive the grain rules'
        );
        continue;
      }
      if (!index.has(ref)) index.set(ref, new Set());
      index.get(ref).add(subcategoryId);
    }
  }
  if (problems.length > 0) throw new MappingValidationError(problems);
  return new Map([...index.entries()].map(([k, v]) => [k, [...v].sort()]));
};

/**
 * Resolve one parsed bank control against the lane index.
 * Returns { grain, matchedRef, subcategories } or { grain: 'unmapped' }.
 */
export const resolveControl = (parsed, index) => {
  const enh = enhForm(parsed);
  const base = baseForm(parsed);
  // Stated grain first. OLIR carries no sub-part forms (asserted at index
  // build), so a sub-part control can never match at stated grain.
  if (!parsed.subpart) {
    const stated = enh || base;
    if (index.has(stated)) return { grain: 'exact', matchedRef: stated, subcategories: index.get(stated) };
  } else {
    // Sub-part truncation: IA-5c -> IA-5, SC-7(10)(a) -> SC-7(10).
    const truncated = enh || base;
    if (index.has(truncated)) {
      return { grain: 'subpart-truncated', matchedRef: truncated, subcategories: index.get(truncated) };
    }
  }
  // Enhancement fallback: IA-2(1) -> IA-2. When a sub-part was also dropped
  // (SC-7(10)(a) -> SC-7), the coarsest step wins the label.
  if (parsed.enhancement !== null && index.has(base)) {
    return { grain: 'enh-fallback', matchedRef: base, subcategories: index.get(base) };
  }
  return { grain: 'unmapped' };
};

/** Signature: sorted distinct control set, joined — the review-queue key. */
export const signatureOf = (nist80053) => [...new Set(nist80053)].sort().join('|');

const validateOverrides = ({ overrides, index, procedures, universe, signatures }) => {
  const problems = [];
  const policyIds = new Set(Object.values(procedures).map((r) => r.policyId));

  for (const [control, row] of Object.entries(overrides.gapTable || {})) {
    const parsed = parseControl(control);
    if (!parsed) {
      problems.push(`gap-table control "${control}" is not a parseable 800-53 control form`);
      continue;
    }
    // Mirror resolveControl's reach: a gap row is redundant/conflicting when
    // its stated form is indexed OR (for an enhancement key) its base would
    // resolve via enhancement fallback — either way the machine already maps
    // the carriers, and the authored edge silently conflates with it.
    if (
      index.has(enhForm(parsed) || baseForm(parsed)) ||
      (parsed.enhancement !== null && index.has(baseForm(parsed)))
    ) {
      problems.push(
        `gap-table control "${control}" is now mapped upstream in the pinned lane — ` +
        'the hand-authored edge is redundant or conflicting; re-ratify against the upstream mapping'
      );
    }
    const carriers = Object.values(procedures).filter((r) =>
      r.nist80053.some((c) => {
        const p = parseControl(c);
        return p && baseForm(p) === baseForm(parsed);
      })
    );
    if (carriers.length === 0) {
      problems.push(`gap-table control "${control}" is carried by no bank policy — stale row`);
    }
    for (const sub of row.subcategories || []) {
      if (!universe.has(sub)) problems.push(`gap-table control "${control}" targets unknown subcategory "${sub}"`);
    }
    if (!row.subcategories || row.subcategories.length === 0) {
      problems.push(`gap-table control "${control}" declares no target subcategories`);
    }
  }

  for (const key of Object.keys(overrides.byPolicy || {})) {
    if (!policyIds.has(key)) problems.push(`override byPolicy key "${key}" matches no bank policy`);
  }
  for (const key of Object.keys(overrides.bySignature || {})) {
    if (!signatures.has(key)) problems.push(`override bySignature key "${key}" matches no bank signature`);
  }
  for (const [key, row] of [
    ...Object.entries(overrides.byPolicy || {}),
    ...Object.entries(overrides.bySignature || {})
  ]) {
    for (const pair of row.pairs || []) {
      if (!universe.has(pair.subcategoryId)) {
        problems.push(`override "${key}" targets unknown subcategory "${pair.subcategoryId}"`);
      }
    }
  }
  return problems;
};

/**
 * The production join. Inputs:
 *  - procedures: the platform bank's procedures object (id -> record)
 *  - converted:  the vendored OLIR artifact (csf2-sp80053-refs.json)
 *  - overrides:  data/mapping-overrides.json content
 *  - lane:       which 800-53 lane to join against (default PINNED_LANE)
 * Returns { policies, signatures, stats }. Throws MappingValidationError on
 * any unparseable bank control, unknown override/gap reference, or violated
 * grain assumption.
 */
export const deriveMapping = ({ procedures, converted, overrides, lane = PINNED_LANE }) => {
  const index = buildOlirIndex(converted, lane);
  const universe = new Set(Object.keys(converted.subcategories));
  const ids = Object.keys(procedures).sort();

  const signatures = new Map();
  for (const id of ids) {
    const sig = signatureOf(procedures[id].nist80053);
    if (!signatures.has(sig)) signatures.set(sig, []);
    signatures.get(sig).push(id);
  }

  const problems = validateOverrides({
    overrides,
    index,
    procedures,
    universe,
    signatures: new Set(signatures.keys())
  });

  // Gap-table edges by base form: "SI-8" applies to SI-8 and to SI-8-derived
  // sub-part forms alike, on every carrier.
  const gapEdges = new Map();
  for (const [control, row] of Object.entries(overrides.gapTable || {})) {
    const parsed = parseControl(control);
    if (parsed) gapEdges.set(baseForm(parsed), [...row.subcategories].sort());
  }

  const policies = {};
  const grainPairs = { exact: 0, 'subpart-truncated': 0, 'enh-fallback': 0 };
  let authoredPairs = 0;
  let overriddenPolicies = 0;
  const fanouts = [];
  const emptyPolicies = [];

  for (const id of ids) {
    const record = procedures[id];
    const sig = signatureOf(record.nist80053);
    const pairMap = new Map();
    const unmapped = [];

    for (const control of [...new Set(record.nist80053)].sort()) {
      const parsed = parseControl(control);
      if (!parsed) {
        problems.push(`policy ${record.policyId} carries unparseable control "${control}"`);
        continue;
      }
      const res = resolveControl(parsed, index);
      const gapTargets = gapEdges.get(baseForm(parsed));
      if (res.grain === 'unmapped' && !gapTargets) {
        unmapped.push(control);
        continue;
      }
      if (res.grain !== 'unmapped') {
        for (const sub of res.subcategories) {
          if (!pairMap.has(sub)) {
            pairMap.set(sub, { provenance: 'derived', grain: res.grain, grains: {}, via: new Set() });
          }
          const pair = pairMap.get(sub);
          // Upgrade path: a pair first created by a gap edge becomes derived
          // the moment a machine via lands on it.
          pair.provenance = 'derived';
          if (pair.grains === undefined) pair.grains = {};
          if (pair.grain === undefined || GRAIN_RANK[res.grain] < GRAIN_RANK[pair.grain]) {
            pair.grain = res.grain;
          }
          pair.grains[res.grain] = (pair.grains[res.grain] || 0) + 1;
          pair.via.add(control);
        }
      }
      if (gapTargets) {
        for (const sub of gapTargets) {
          if (!pairMap.has(sub)) pairMap.set(sub, { provenance: 'authored', via: new Set() });
          pairMap.get(sub).via.add(control);
        }
      }
    }

    let pairs = [...pairMap.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([subcategoryId, p]) => {
        const out = { subcategoryId, provenance: p.provenance, via: [...p.via].sort() };
        if (p.provenance === 'derived') {
          out.grain = p.grain;
          out.grainVias = Object.fromEntries(
            Object.keys(p.grains).sort().map((g) => [g, p.grains[g]])
          );
        }
        return out;
      });

    const policyOverride = (overrides.byPolicy || {})[record.policyId];
    const sigOverride = (overrides.bySignature || {})[sig];
    const applied = policyOverride || sigOverride;
    let overrideSource = null;
    if (applied) {
      overrideSource = policyOverride ? 'policy' : 'signature';
      overriddenPolicies++;
      pairs = [...(applied.pairs || [])]
        .sort((a, b) => (a.subcategoryId < b.subcategoryId ? -1 : 1))
        .map((p) => ({ subcategoryId: p.subcategoryId, provenance: 'overridden' }));
    }

    for (const p of pairs) {
      if (p.provenance === 'derived') grainPairs[p.grain]++;
      if (p.provenance === 'authored') authoredPairs++;
    }
    fanouts.push(pairs.length);

    const entry = { policyId: record.policyId, platform: record.platform, signature: sig, pairs };
    if (pairs.length === 0) {
      emptyPolicies.push(record.policyId);
      entry.emptyReason = applied
        ? `overridden to empty by ${overrideSource} override — ratified as mapping to no subcategory`
        : `no OLIR ${lane} reference and no gap-table row covers: ${unmapped.join(', ')}`;
    }
    if (overrideSource) entry.overrideSource = overrideSource;
    policies[id] = entry;
  }

  if (problems.length > 0) throw new MappingValidationError(problems);

  fanouts.sort((a, b) => a - b);
  const q = (p) => fanouts[Math.floor(p * (fanouts.length - 1))] ?? 0;
  const totalPairs = fanouts.reduce((a, b) => a + b, 0);
  const stats = {
    policyCount: ids.length,
    signatureCount: signatures.size,
    pairCount: totalPairs,
    derivedPairCount: grainPairs.exact + grainPairs['subpart-truncated'] + grainPairs['enh-fallback'],
    grainPairs,
    authoredPairs,
    overriddenPolicies,
    emptyPolicies: emptyPolicies.sort(),
    fanout: {
      median: q(0.5),
      mean: Math.round((totalPairs / (ids.length || 1)) * 100) / 100,
      p90: q(0.9),
      max: fanouts[fanouts.length - 1] ?? 0
    }
  };

  return { policies, signatures, stats, lane };
};
