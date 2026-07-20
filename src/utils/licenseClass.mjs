/**
 * License class + obligations model — the single license authority.
 *
 * Every question about what a third-party license permits routes through this
 * module, the way provenance questions route through procedureBank's
 * predicates. Two orthogonal axes, because a single enum provably cannot
 * express the real corpus (plan §7 R-5: CC BY-ND, CC0-with-asserted-notices,
 * MITRE's notice-conditioned terms, mixed-license single files):
 *
 *  - CLASS (the gate axis): may the text ship in this MIT/commercial repo at
 *    all? PUBLIC_DOMAIN | ATTRIBUTION | REFERENCE_ONLY | UNDECLARED.
 *  - OBLIGATIONS (the accompany/transform axis): what must ride along when it
 *    ships, and what may be done to it —
 *    { attribution, changeIndication, noDerivatives, noticeText[] }.
 *
 * The license STRING is the floor, never the ceiling: a record may declare
 * additional obligations (CISA files are CC0 yet assert a no-endorsement
 * notice; ScubaGear M365 files are CC0 at repo grain but CC BY-portioned per
 * file — §7 R-1). Merging only ever tightens.
 *
 * Callers use the predicates (mayShipText / mayTailor / requiresAttribution),
 * not the bare class: branching on `class === ATTRIBUTION` would ship a
 * CC BY-ND derivative with credit and no other complaint. The class exists
 * for display and notices grouping.
 *
 * Reserved name: product-licensing prose (e.g. ScubaGear's "License
 * Requirements" sections — "requires Entra ID P2", Microsoft PRODUCT
 * licensing, not content licensing) must be carried as `productLicenseNotes`
 * and must never wire into any share-export or render block.
 */

/* The gate axis. Order matters: merging takes the MOST restrictive. */
export const UNDECLARED = 'undeclared'; // blank/unrecognized — asserts nothing, restricts nothing
export const PUBLIC_DOMAIN = 'public-domain'; // CC0, US Government work
export const ATTRIBUTION = 'attribution'; // CC BY family — shippable with obligations
export const REFERENCE_ONLY = 'reference-only'; // NC / proprietary / internal — IDs and links only, never text

/* Total order for the tightening merge. UNDECLARED is BOTTOM: a record
 * declaring nothing can never loosen a classification derived from its
 * license string. */
const CLASS_RANK = {
  [UNDECLARED]: 0,
  [PUBLIC_DOMAIN]: 1,
  [ATTRIBUTION]: 2,
  [REFERENCE_ONLY]: 3
};

/* Token vocabulary — the same tokenization contract the shipped
 * licenseIsRestricted used, extended with class/attribution recognition.
 * Single tokens match exactly; pairs match adjacent token sequences so
 * ordinary words ("Vendor Standard License", "NDA") never false-positive. */
const tokenize = (license) =>
  String(license || '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);

const NC_TOKENS = ['NC', 'NONCOMMERCIAL'];
const NC_PAIRS = [['NON', 'COMMERCIAL']];
const ND_TOKENS = ['ND', 'NODERIVATIVES', 'NODERIVS'];
const ND_PAIRS = [['NO', 'DERIVATIVES'], ['NO', 'DERIVS']];
const CLOSED_TOKENS = ['PROPRIETARY', 'INTERNAL'];
const PD_TOKENS = ['CC0'];
const PD_PAIRS = [['PUBLIC', 'DOMAIN'], ['US', 'GOVERNMENT']];
const BY_TOKENS = ['BY', 'ATTRIBUTION'];

const hasToken = (tokens, list) => list.some((t) => tokens.includes(t));
const hasPair = (tokens, pairs) =>
  pairs.some(([a, b]) => tokens.some((t, i) => t === a && tokens[i + 1] === b));

const EMPTY_OBLIGATIONS = Object.freeze({
  attribution: false,
  changeIndication: false,
  noDerivatives: false,
  noticeText: Object.freeze([])
});

/**
 * Classify a license STRING into { licenseClass, obligations }. Pure floor:
 * only what the string itself asserts. Blank and unrecognized strings are
 * UNDECLARED with no obligations — the shipped blank-stays-unrestricted
 * contract depends on this (legacy and user records carry '' licenses).
 */
export const classifyLicense = (license) => {
  const tokens = tokenize(license);
  if (tokens.length === 0) return { licenseClass: UNDECLARED, obligations: EMPTY_OBLIGATIONS };

  const nc = hasToken(tokens, NC_TOKENS) || hasPair(tokens, NC_PAIRS);
  const nd = hasToken(tokens, ND_TOKENS) || hasPair(tokens, ND_PAIRS);
  const closed = hasToken(tokens, CLOSED_TOKENS);
  const by = hasToken(tokens, BY_TOKENS);
  const pd = hasToken(tokens, PD_TOKENS) || hasPair(tokens, PD_PAIRS);

  let licenseClass = UNDECLARED;
  if (nc || closed) {
    licenseClass = REFERENCE_ONLY;
  } else if (by || nd) {
    // ND without NC is ATTRIBUTION class: CC BY-ND permits verbatim
    // commercial redistribution with credit. The noDerivatives OBLIGATION
    // (not the class) is what forbids transformation — and what keeps the
    // metrics-lane restriction (see licenseIsRestricted) byte-compatible.
    licenseClass = ATTRIBUTION;
  } else if (pd) {
    licenseClass = PUBLIC_DOMAIN;
  }

  return {
    licenseClass,
    obligations: {
      attribution: by,
      // CC BY 4.0 §3(a)(1)(B): modifications must be indicated. Derived
      // conservatively from the attribution family.
      changeIndication: by,
      noDerivatives: nd,
      noticeText: []
    }
  };
};

/**
 * Effective license of a bank RECORD: string-derived floor tightened by
 * record-declared fields. Records may declare `licenseClass` and/or
 * `licenseObligations: { attribution?, changeIndication?, noDerivatives?,
 * noticeText?: [] }`. Merging can only ADD restriction: class by rank
 * (UNDECLARED bottom), booleans by OR, noticeText by sorted union — sorted
 * so downstream renders (the notices file) are byte-stable.
 */
export const recordLicense = (record) => {
  const derived = classifyLicense(record?.license);
  const declared = record?.licenseObligations || {};
  const declaredClass = record?.licenseClass;

  const licenseClass =
    declaredClass && CLASS_RANK[declaredClass] > CLASS_RANK[derived.licenseClass]
      ? declaredClass
      : derived.licenseClass;

  const noticeText = [
    ...new Set([...derived.obligations.noticeText, ...(declared.noticeText || [])])
  ].sort();

  return {
    licenseClass,
    obligations: {
      attribution: derived.obligations.attribution || declared.attribution === true,
      changeIndication: derived.obligations.changeIndication || declared.changeIndication === true,
      noDerivatives: derived.obligations.noDerivatives || declared.noDerivatives === true,
      noticeText
    }
  };
};

/**
 * True when a license string forbids redistribution on the metrics lane —
 * NC/ND Creative Commons variants (abbreviated or spelled out), proprietary,
 * or explicitly internal content. Re-expressed on the class+obligations
 * model, byte-compatible with the shipped token matcher (pinned by a
 * reference-implementation property test): REFERENCE_ONLY is a closed gate,
 * and noDerivatives is restricted HERE because metric fields are recombined
 * and re-rendered — that lane cannot guarantee the verbatim form ND requires.
 * Blank stays unrestricted: three dataExport share-block call sites depend on
 * legacy/user records with '' licenses riding shares.
 */
export const licenseIsRestricted = (license) => {
  const { licenseClass, obligations } = classifyLicense(license);
  return licenseClass === REFERENCE_ONLY || obligations.noDerivatives;
};

/**
 * True when a record's attribution block is complete enough to discharge an
 * attribution obligation at every egress. All five are load-bearing: the
 * notices generator and the attach gate both refuse on any miss.
 */
export const attributionComplete = (record) => {
  const a = record?.attribution;
  return Boolean(
    a &&
      typeof a.attributionText === 'string' && a.attributionText.trim() &&
      typeof a.sourceUrl === 'string' && a.sourceUrl.trim() &&
      typeof a.licenseUrl === 'string' && a.licenseUrl.trim() &&
      typeof a.retrievedAt === 'string' && a.retrievedAt.trim() &&
      typeof a.upstream?.sha === 'string' && a.upstream.sha.trim()
  );
};

/** May this record's TEXT ship (attach, render, export) at all? */
export const mayShipText = (record) => {
  const { licenseClass, obligations } = recordLicense(record);
  if (licenseClass === REFERENCE_ONLY) return false;
  if (obligations.attribution && !attributionComplete(record)) return false;
  return true;
};

/** May this record's text be TRANSFORMED (tailored, truncated, reflowed)? */
export const mayTailor = (record) =>
  mayShipText(record) && !recordLicense(record).obligations.noDerivatives;

/** Must an attribution block accompany this record's text at every egress? */
export const requiresAttribution = (record) =>
  recordLicense(record).obligations.attribution;

/**
 * The attach/render gate. Total — never throws, never returns null:
 *  - { allow: true, verbatimOnly } when the text may ship (verbatimOnly set
 *    for noDerivatives content: truncation/reflow/summarization are
 *    derivatives, so the ONLY permitted forms are verbatim or omission);
 *  - { allow: false, reason } when it may not (reference-only class, or an
 *    attribution obligation with no resolvable attribution block).
 * Entries with no license metadata are unlicensed own-content (the community
 * bank today) and pass through untouched.
 */
export const licenseGate = (record) => {
  const { licenseClass, obligations } = recordLicense(record);
  if (licenseClass === REFERENCE_ONLY) {
    return { allow: false, reason: 'reference-only' };
  }
  if (obligations.attribution && !attributionComplete(record)) {
    return { allow: false, reason: 'attribution-incomplete' };
  }
  return { allow: true, verbatimOnly: obligations.noDerivatives };
};

/**
 * License-metadata fields a licensed bank entry contributes to
 * procedureSource at attach time. Empty for unlicensed own-content, so the
 * community attach output is byte-identical to the pre-gate producer. Copies
 * only license metadata — never text. Attribution traveling IN provenance is
 * what lets every egress (share export, notices, future render surfaces)
 * re-assert the obligation from data instead of re-deriving it per surface
 * (§7 R-9).
 */
export const licenseProvenance = (record) => {
  const out = {};
  if (record?.license) out.license = record.license;
  if (record?.licenseClass) out.licenseClass = record.licenseClass;
  if (record?.licenseObligations) out.licenseObligations = record.licenseObligations;
  if (record?.attribution) out.attribution = record.attribution;
  return out;
};

/**
 * Fail-closed placeholder for refused content. Explicit and visible (never a
 * silent drop — §7 R-3 doctrine), and carries ZERO licensed text. Total-return
 * contract: attach call sites dereference `.testProcedures` directly, so
 * refusal must produce a string, not null.
 */
export const refusalPlaceholder = (reason) =>
  reason === 'reference-only'
    ? '> This content is reference-only under its license and cannot be included. Consult the linked source directly.'
    : '> This content is unavailable: its license requires an attribution record that is missing or incomplete.';
