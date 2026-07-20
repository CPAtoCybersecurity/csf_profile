/**
 * Community test-procedure bank — runtime access to the generated
 * src/data/communityProcedures.json (one entry per CSF 2.0 subcategory,
 * full community markdown preserved).
 *
 * Attach semantics are copy-on-attach: the markdown is copied into the
 * observation's testProcedures and a procedureSource provenance object
 * records where it came from. Staleness against a newer bank is a known
 * non-goal (see PRIVATE_DATA.md): provenance powers auditability, the
 * share-export pristine swap, and "Reset to community version" — not
 * automatic re-sync.
 */
import bank from '../data/communityProcedures.json';

const SUBCATEGORY_PREFIX = /^([A-Z]{2}\.[A-Z]{2,3}-\d{2})/;

export const BANK_VERSION = bank.bankVersion;

/**
 * Extract the CSF subcategory ID from a scope item ID.
 * Requirement-scope item IDs look like "GV.OC-01 Ex1"; control-scope IDs
 * have no subcategory prefix and resolve to null (no bank coverage).
 */
export const subcategoryFromItemId = (itemId) => {
  if (typeof itemId !== 'string') return null;
  const m = itemId.match(SUBCATEGORY_PREFIX);
  return m ? m[1] : null;
};

/** Bank entry ({title, markdown, sourcePath}) for a scope item, or null. */
export const getBankProcedure = (itemId) => {
  const subId = subcategoryFromItemId(itemId);
  if (!subId) return null;
  const entry = bank.procedures[subId];
  return entry ? { bankId: subId, ...entry } : null;
};

/**
 * Coverage of the bank over a list of scope item IDs.
 * Returns { covered: string[], uncovered: string[] } preserving input order.
 */
export const bankCoverage = (itemIds) => {
  const covered = [];
  const uncovered = [];
  for (const id of itemIds) {
    (getBankProcedure(id) ? covered : uncovered).push(id);
  }
  return { covered, uncovered };
};

/**
 * Bank identity values. COMMUNITY_BANK is the only bank that exists today;
 * NO_BANK is the explicit no-bank marker tailoredProvenance stamps on
 * AI-tailored text for uncovered items. Provenance checks route through the
 * predicates below rather than comparing strings at call sites, so a second
 * bank value (plan §7 PR-3) cannot silently fall through a `=== 'community'`
 * test somewhere. The ONLY other literal equality is the frozen v14
 * migration step in assessmentsStore.js, which is historical by design.
 */
export const COMMUNITY_BANK = 'community';
export const NO_BANK = 'none';

/** The one community string-equality test — every provenance check routes here. */
export const isCommunityBankSource = (source) => source?.bank === COMMUNITY_BANK;

/**
 * True when the source records an attach from SOME procedure bank —
 * community today, any future bank value tomorrow. The no-bank marker is
 * not an attach.
 */
export const isBankAttached = (source) =>
  typeof source?.bank === 'string' && source.bank !== NO_BANK;

/**
 * Badge descriptor for a procedure's provenance, or null for none.
 * A bank value this build does not recognize still gets a visible
 * descriptor naming the bank — a record from a newer build must never
 * silently lose its provenance badge (plan §7 R-10). A tailored source
 * from an unrecognized bank shows that bank, not the org-tailor label.
 */
export const procedureBadge = (source) => {
  if (!source) return null;
  if (isCommunityBankSource(source)) {
    return { kind: 'community', label: source.modified ? 'Community · customized' : 'Community' };
  }
  if (isBankAttached(source)) {
    return { kind: 'bank', label: source.modified ? `${source.bank} · customized` : String(source.bank) };
  }
  return source.tailored ? { kind: 'tailored', label: 'Tailored to your org' } : null;
};

/**
 * Deterministically restore the pristine payload a source points at.
 * Positive match only: community sources resolve against the community
 * bank; the no-bank marker and any bank value this build does not
 * recognize return null. Callers treat null as "cannot restore — do not
 * substitute" (the share scrub drops the text, Reset refuses), never as
 * "use some other bank's text" — resolving foreign provenance against
 * this bank is the R-6 inversion this predicate exists to prevent.
 */
export const resolvePristine = (source) => {
  if (!isCommunityBankSource(source)) return null;
  const entry = getBankProcedure(source.bankId);
  return entry ? { bankId: entry.bankId, markdown: entry.markdown } : null;
};

/**
 * Reset/insert safety: overwriting an observation with the community entry
 * must never destroy content owned by ANOTHER bank. Hand-written text (no
 * source — the insert path confirm-gates it), community attaches, and
 * no-bank tailored text may be replaced; any other bank value may not.
 */
export const canResetToCommunity = (source) =>
  !isBankAttached(source) || isCommunityBankSource(source);

/** Provenance object the wizard/detail panel stamps on a bank attach. */
export const buildProcedureSource = (bankId) => ({
  bank: COMMUNITY_BANK,
  bankId,
  bankVersion: BANK_VERSION,
  attachedAt: new Date().toISOString(),
  modified: false
});

/**
 * Pure producer for the detail panel's Insert / Reset-to-community action.
 * Returns the observation update (pristine markdown + pristine provenance),
 * or null when the item has no bank entry or the existing source belongs to
 * another bank — a community reset must never destroy foreign bank content
 * (plan §7 R-10). The page stays a dumb dispatcher.
 */
export const resetToCommunityUpdate = (itemId, existingSource) => {
  if (!canResetToCommunity(existingSource)) return null;
  const entry = getBankProcedure(itemId);
  if (!entry) return null;
  return {
    testProcedures: entry.markdown,
    procedureSource: buildProcedureSource(entry.bankId)
  };
};

/**
 * Upstream URL of a bank entry's source. An explicit `upstreamUrl` on the
 * entry wins — how a bank whose source is not this repo names its origin —
 * with the repo blob URL derived from sourcePath as the community default.
 */
export const bankSourceUrl = (bankId) => {
  const entry = bank.procedures[bankId];
  if (!entry) return null;
  if (entry.upstreamUrl) return entry.upstreamUrl;
  return `https://github.com/CPAtoCybersecurity/csf_profile/blob/main/${entry.sourcePath}`;
};

/**
 * "Improve this procedure" link target for a provenance source. Community
 * resolves through the bank; an unrecognized bank gets no link rather than
 * a wrong community URL. The URL always comes from OUR bank data — never
 * from the (possibly foreign) source object itself.
 */
export const sourceUrlFor = (source) =>
  isCommunityBankSource(source) ? bankSourceUrl(source.bankId) : null;
