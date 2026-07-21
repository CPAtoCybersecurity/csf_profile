/**
 * Wizard Environment step logic (plan PR-6). The page component is a
 * dispatcher; every rule lives here so it is lint-gated and probe-able.
 *
 * Semantics, all ratified:
 *  - Platform chips are EPHEMERAL viewport state, seeded from the saved org
 *    profile (a pure read — nothing writes back). The assessment persists
 *    only the DERIVED set of platforms with at least one attached check.
 *  - Offers stay unranked (committed-map order); rows sort in CSF canonical
 *    function order — a location, not a ranking.
 *  - Nothing attaches by default and the machine never trims: a checked
 *    subcategory×platform cell attaches ALL of that cell's offers, an
 *    unchecked cell attaches none and keeps its count visible.
 */
import subcategoryMap from '../data/platformSubcategoryMap.json';
import { getPlatformProcedures, platformLabel } from './platformBank';
import { getBankProcedure, subcategoryFromItemId } from './procedureBank';

/* Requirement-scope item ids look like "PR.DS-10 Ex1"; the platform map keys
 * on the bare subcategory id. Same normalization the bank lookup applies. */
const itemOffers = (itemId, platforms) =>
  getPlatformProcedures(subcategoryFromItemId(itemId), platforms);

/**
 * Platforms the committed map actually covers, as {id, label} chips in
 * stable alphabetical id order. Derived from data so a future corpus's
 * platforms appear without a code change here.
 */
let availablePlatformsCache = null;
export const availablePlatforms = () => {
  if (!availablePlatformsCache) {
    const ids = new Set();
    Object.values(subcategoryMap.policies).forEach((entry) => ids.add(entry.platform));
    availablePlatformsCache = Array.from(ids).sort().map((id) => ({ id, label: platformLabel(id) }));
  }
  return availablePlatformsCache;
};

/* CSF 2.0 function order — canonical presentation order, not a ranking. */
const FUNCTION_ORDER = ['GV', 'ID', 'PR', 'DE', 'RS', 'RC'];
const functionRank = (itemId) => {
  const fn = String(itemId).slice(0, 2);
  const idx = FUNCTION_ORDER.indexOf(fn);
  return idx === -1 ? FUNCTION_ORDER.length : idx;
};
export const compareCsfOrder = (a, b) =>
  functionRank(a) - functionRank(b) || String(a).localeCompare(String(b));

/** Stable key for one subcategory×platform selection cell. */
export const cellKey = (itemId, platformId) => `${itemId}|${platformId}`;

/**
 * Build the Environment step's review matrix: one row per scoped item that
 * has a community bank entry (addenda ride the community trunk) AND at least
 * one offer for the chosen platforms. Rows sort in CSF canonical order.
 * `noOfferCount` counts the scoped items that get no row — the footer keeps
 * them visible so non-coverage is stated, never implied away.
 */
export const buildEnvironmentMatrix = (scopeItemIds, platformIds) => {
  const ids = Array.isArray(scopeItemIds) ? scopeItemIds : [];
  const platforms = Array.isArray(platformIds) ? platformIds : [];
  const totals = {};
  platforms.forEach((p) => { totals[p] = 0; });
  const rows = [];
  let noOfferCount = 0;
  ids.forEach((itemId) => {
    const bankEntry = getBankProcedure(itemId);
    const cells = {};
    let rowTotal = 0;
    if (bankEntry) {
      platforms.forEach((platformId) => {
        const count = itemOffers(itemId, [platformId]).length;
        if (count > 0) {
          cells[platformId] = count;
          totals[platformId] += count;
          rowTotal += count;
        }
      });
    }
    if (rowTotal === 0) {
      noOfferCount += 1;
      return;
    }
    rows.push({ itemId, title: bankEntry.title, cells });
  });
  rows.sort((a, b) => compareCsfOrder(a.itemId, b.itemId));
  const totalAvailable = Object.values(totals).reduce((n, c) => n + c, 0);
  return { rows, totals, totalAvailable, noOfferCount };
};

/** Count of checks the current selection attaches, for the honest header. */
export const countAttached = (matrix, selections) =>
  matrix.rows.reduce((sum, row) =>
    sum + Object.entries(row.cells).reduce((rowSum, [platformId, count]) =>
      rowSum + (selections[cellKey(row.itemId, platformId)] ? count : 0), 0), 0);

/** Checks the current selection attaches for ONE item, for preview lines. */
export const attachedCountForItem = (matrix, selections, itemId) => {
  const row = matrix.rows.find((r) => r.itemId === itemId);
  if (!row) return 0;
  return Object.entries(row.cells).reduce((sum, [platformId, count]) =>
    sum + (selections[cellKey(itemId, platformId)] ? count : 0), 0);
};

/** Checks a whole platform column offers, for the labeled select-all. */
export const columnTotal = (matrix, platformId) => matrix.totals[platformId] || 0;

/** True when every cell of the platform's column is selected. */
export const columnFullySelected = (matrix, selections, platformId) =>
  matrix.rows.every((row) =>
    !(platformId in row.cells) || selections[cellKey(row.itemId, platformId)]);

/** New selections object with the platform's whole column set on/off. */
export const setColumn = (matrix, selections, platformId, on) => {
  const next = { ...selections };
  matrix.rows.forEach((row) => {
    if (!(platformId in row.cells)) return;
    if (on) next[cellKey(row.itemId, platformId)] = true;
    else delete next[cellKey(row.itemId, platformId)];
  });
  return next;
};

/** New selections object with one cell toggled. */
export const toggleCell = (selections, itemId, platformId) => {
  const key = cellKey(itemId, platformId);
  const next = { ...selections };
  if (next[key]) delete next[key];
  else next[key] = true;
  return next;
};

/**
 * Step-3 attach-count sentence for the community-procedures card. Pure so
 * the page stays a dispatcher and so the off state can never claim an
 * attach that buildAttachPlan will not perform: addenda ride the community
 * trunk, and the bank toggle gates attachment. Returns null when there is
 * nothing to say (bank off, nothing selected).
 */
export const environmentAttachCopy = (useBank, attachedCount, totalAvailable) => {
  const noun = attachedCount === 1 ? 'check' : 'checks';
  if (!useBank) {
    if (attachedCount === 0) return null;
    return {
      active: false,
      text: `${attachedCount} platform ${noun} selected in the Environment step will not attach while community test procedures are off. Turn them back on to apply your selections.`
    };
  }
  const verb = attachedCount === 1 ? 'attaches' : 'attach';
  return {
    active: true,
    text: `${attachedCount} platform ${noun} from the Environment step ${verb} as addenda (${totalAvailable} available).`
  };
};

/**
 * The create-time attach plan. For every scoped item, the offers its checked
 * cells attach (ALL offers of each checked platform — user cells are the only
 * exclusion actor), plus the DERIVED platform set the assessment persists:
 * exactly the platforms that contribute at least one attached offer. Items
 * without a community trunk (or with the bank disabled) attach nothing —
 * addenda ride the community procedure.
 */
export const buildAttachPlan = (scopeItemIds, selections, platformIds, useBank) => {
  const ids = Array.isArray(scopeItemIds) ? scopeItemIds : [];
  const platforms = Array.isArray(platformIds) ? platformIds : [];
  const offersByItem = {};
  const attachedPlatforms = new Set();
  if (useBank) {
    ids.forEach((itemId) => {
      if (!getBankProcedure(itemId)) return;
      const checked = platforms.filter((p) => selections[cellKey(itemId, p)]);
      if (checked.length === 0) return;
      const offers = itemOffers(itemId, checked);
      if (offers.length === 0) return;
      offersByItem[itemId] = offers;
      offers.forEach((offer) => attachedPlatforms.add(offer.record.platform));
    });
  }
  return {
    offersByItem,
    platforms: Array.from(attachedPlatforms).sort()
  };
};
