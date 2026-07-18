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

/** Provenance object the wizard/detail panel stamps on a bank attach. */
export const buildProcedureSource = (bankId) => ({
  bank: 'community',
  bankId,
  bankVersion: BANK_VERSION,
  attachedAt: new Date().toISOString(),
  modified: false
});

/** GitHub URL of the community source file — the "Improve this procedure" target. */
export const bankSourceUrl = (bankId) => {
  const entry = bank.procedures[bankId];
  if (!entry) return null;
  return `https://github.com/CPAtoCybersecurity/csf_profile/blob/main/${entry.sourcePath}`;
};
