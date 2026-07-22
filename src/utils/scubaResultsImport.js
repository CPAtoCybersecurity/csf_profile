/**
 * ScubaGoggles / ScubaGear results importer (plan Evidence lane, review R-7).
 *
 * The app never runs the tools. Steve's workflow: the Environment step is the
 * run plan, the CISA tool runs OUTSIDE against the tenant, and this module
 * brings the results artifact back in as STRUCTURED evidence keyed by
 * policyId — the same key every platform-bank record and addendum reference
 * already carries. Results inform the auditor's subcategory score; nothing
 * here writes a score (the altitude rule: a tenant-config pass does not make
 * the outcome true).
 *
 * Untrusted-input posture (R-7): the file is hostile until proven otherwise.
 * Strict validation on everything we rely on (id pattern, result enum),
 * bounded walk (depth/node/stack/entry caps), dangerous-key rejection, and
 * the load-bearing guarantee: no UNBOUNDED text from the file survives into
 * an imported record. An imported entry is {policyId, result} plus fields WE
 * stamp; the only file-derived strings stored are toolVersion/reportDate,
 * bounded printable ASCII of at most 64 chars. Details, requirements, tenant
 * names, report prose all stay in the tool's own report, which the user
 * links by reference (#288 externalLinks).
 */

/* Measured in UTF-16 code units (string length), not raw bytes — a coarse
 * pre-parse bound, deliberately simple. */
export const MAX_RESULTS_FILE_BYTES = 20 * 1024 * 1024;
const MAX_WALK_DEPTH = 16;
const MAX_WALK_NODES = 200000;
const MAX_RESULT_ENTRIES = 5000;
const MAX_STORED_ENTRIES = 600;
const META_MAX_LEN = 64;
const ID_SAMPLE_MAX_LEN = 48;

/** Matches normalized (lowercased) SCuBA policy ids: gws.gmail.1.1v1, ms.aad.3.2v1 */
export const SCUBA_POLICY_ID = /^(gws|ms)\.[a-z0-9]+\.\d+\.\d+v\d+$/;

/**
 * Closed verdict enum. Anything else is skipped-with-reason, never imported.
 * Token map verified against the upstream output schema
 * (ScubaGoggles docs/misc/tooloutputschema.md, Control Object → Result:
 * Pass · Fail · Warning · N/A · Omitted · Incorrect Result ·
 * Error - Test results missing · Error · No events found) plus the boolean
 * RequirementMet lane of ScubaGear's TestResults.json sample artifact.
 */
export const RESULT_VALUES = ['pass', 'fail', 'warning', 'na', 'error', 'omitted', 'manual', 'incorrect'];

const RESULT_TOKEN_MAP = {
  pass: 'pass',
  fail: 'fail',
  failure: 'fail',
  warning: 'warning',
  'n/a': 'na',
  na: 'na',
  'no events found': 'na',
  error: 'error',
  'error - test results missing': 'error',
  omitted: 'omitted',
  'incorrect result': 'incorrect',
  manual: 'manual',
  '3rd party': 'manual'
};

const ID_FIELDS = ['Control ID', 'ControlID', 'PolicyId', 'Policy Id', 'policyId'];
const RESULT_FIELDS = ['Result', 'result'];
const BOOLEAN_RESULT_FIELDS = ['Requirement Met', 'RequirementMet'];
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/* Printable ASCII minus HTML-significant chars — belt-and-braces for a
 * future sink that renders these raw (every current sink is React-escaped). */
const printable = (value, max) =>
  String(value).replace(/[^\x20-\x7e]|[<>&"']/g, '').slice(0, max);

const normalizeResultToken = (raw) => {
  if (raw === true) return 'pass';
  if (raw === false) return 'fail';
  if (typeof raw !== 'string') return null;
  return RESULT_TOKEN_MAP[raw.trim().toLowerCase()] || null;
};

const firstOwn = (obj, fields) => {
  for (let i = 0; i < fields.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(obj, fields[i])) return obj[fields[i]];
  }
  return undefined;
};

/* Meta keys are read from any object level during the walk; first hit wins.
 * Values are bounded printable strings — never trusted further than display. */
const META_FIELDS = {
  toolVersion: ['ToolVersion', 'Tool Version', 'ScubaGogglesVersion', 'ScubaGearVersion'],
  reportDate: ['Report Date', 'ReportDate', 'TimestampZulu', 'Timestamp', 'Date']
};

/**
 * Parse + validate a results file. Returns
 *   { ok: false, errors: [...] } or
 *   { ok: true, entries: [{policyId, result}], meta: {toolVersion?, reportDate?, tool},
 *     skipped: [{reason, idSample?}], warnings: [...] }
 * Entries carry ONLY the validated id and the enum verdict — nothing else
 * from the file. Duplicate policy ids: for sibling entries the FIRST
 * occurrence in document order wins (the LIFO walk processes it last and its
 * set() overwrites), a warning is added, and the winner is pinned by test.
 */
export const parseScubaResults = (text) => {
  if (typeof text !== 'string' || text.length === 0) {
    return { ok: false, errors: ['File is empty or unreadable.'] };
  }
  if (text.length > MAX_RESULTS_FILE_BYTES) {
    return { ok: false, errors: ['File exceeds the 20 MB limit for results imports.'] };
  }
  let root;
  try {
    // PowerShell writes a UTF-8 BOM by default; ScubaGear's real artifacts
    // carry it (verified on the upstream sample) and JSON.parse rejects it.
    root = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch (e) {
    return { ok: false, errors: ['Not valid JSON. Export ScubaResults.json from ScubaGoggles or ScubaGear and import that file.'] };
  }
  if (!root || typeof root !== 'object') {
    return { ok: false, errors: ['JSON root must be an object or array of results.'] };
  }

  const byId = new Map();
  const skipped = [];
  const warnings = [];
  const meta = {};
  let nodes = 0;

  const stack = [{ value: root, depth: 0 }];
  while (stack.length > 0) {
    const { value, depth } = stack.pop();
    if (value === null || typeof value !== 'object') continue;
    nodes += 1;
    if (nodes > MAX_WALK_NODES) {
      return { ok: false, errors: ['File structure is too large to import safely.'] };
    }
    if (depth > MAX_WALK_DEPTH) {
      return { ok: false, errors: ['File structure is nested too deeply to import safely.'] };
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i += 1) {
        if (stack.length >= MAX_WALK_NODES) {
          return { ok: false, errors: ['File structure is too large to import safely.'] };
        }
        stack.push({ value: value[i], depth: depth + 1 });
      }
      continue;
    }
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i += 1) {
      if (DANGEROUS_KEYS.includes(keys[i])) {
        return { ok: false, errors: ['File contains a disallowed key and was rejected.'] };
      }
    }

    Object.entries(META_FIELDS).forEach(([target, fields]) => {
      if (meta[target] === undefined) {
        const found = firstOwn(value, fields);
        if (typeof found === 'string' && found.length > 0) {
          meta[target] = printable(found, META_MAX_LEN);
        }
      }
    });

    const rawId = firstOwn(value, ID_FIELDS);
    if (typeof rawId === 'string' && rawId.length > 0) {
      const policyId = rawId.trim().toLowerCase();
      if (!SCUBA_POLICY_ID.test(policyId)) {
        skipped.push({ reason: 'unrecognized-policy-id', idSample: printable(rawId, ID_SAMPLE_MAX_LEN) });
      } else {
        let rawResult = firstOwn(value, RESULT_FIELDS);
        if (rawResult === undefined) rawResult = firstOwn(value, BOOLEAN_RESULT_FIELDS);
        const result = normalizeResultToken(rawResult);
        if (result === null) {
          skipped.push({ reason: 'unrecognized-result-value', idSample: printable(rawId, ID_SAMPLE_MAX_LEN) });
        } else {
          if (byId.has(policyId)) warnings.push(`Duplicate result for ${policyId}; keeping the first occurrence.`);
          if (byId.size >= MAX_RESULT_ENTRIES && !byId.has(policyId)) {
            return { ok: false, errors: ['File contains more results than any supported report; rejected.'] };
          }
          byId.set(policyId, { policyId, result });
        }
      }
    }

    for (let i = 0; i < keys.length; i += 1) {
      if (stack.length >= MAX_WALK_NODES) {
        return { ok: false, errors: ['File structure is too large to import safely.'] };
      }
      stack.push({ value: value[keys[i]], depth: depth + 1 });
    }
  }

  const entries = Array.from(byId.values());
  if (entries.length === 0) {
    return { ok: false, errors: ['No recognizable SCuBA policy results found in this file.'] };
  }
  const prefixes = new Set(entries.map((e) => e.policyId.slice(0, e.policyId.indexOf('.'))));
  meta.tool = prefixes.size > 1 ? 'mixed' : (prefixes.has('gws') ? 'scubagoggles' : 'scubagear');
  return { ok: true, entries, meta, skipped, warnings };
};

/**
 * Match parsed entries against an assessment's observations. An entry matches
 * an item when that item's observation carries a platform addendum (reference
 * OR user fork — a fork keeps its ref identity) naming the policyId. Pure:
 * computes a plan, writes nothing (the preview modal renders exactly this).
 */
export const matchScubaResults = (entries, observationsByItem) => {
  const byId = new Map(entries.map((e) => [e.policyId, e]));
  const rows = [];
  const matchedIds = new Set();
  Object.entries(observationsByItem || {}).forEach(([itemId, obs]) => {
    const refs = Array.isArray(obs?.platformProcedures) ? obs.platformProcedures : [];
    const matches = [];
    refs.forEach((ref) => {
      const id = typeof ref?.policyId === 'string' ? ref.policyId.toLowerCase() : '';
      const entry = byId.get(id);
      if (entry) {
        matches.push({ policyId: entry.policyId, result: entry.result });
        matchedIds.add(entry.policyId);
      }
    });
    if (matches.length > 0) rows.push({ itemId, matches });
  });
  const unmatchedResults = entries
    .filter((e) => !matchedIds.has(e.policyId))
    .map((e) => e.policyId);
  return { rows, matchedCount: matchedIds.size, unmatchedResults };
};

/**
 * Next platformResults array for one observation: upsert by policyId — this
 * import's verdicts replace prior entries for the SAME policies, entries for
 * policies this file does not mention are preserved (an M365 re-run must not
 * erase Workspace evidence). Every written entry is producer-stamped here;
 * nothing from the file rides beyond the validated id + enum verdict.
 */
export const nextPlatformResults = (current, matches, meta, importedAt) => {
  const kept = (Array.isArray(current) ? current : []).filter(
    (e) => !matches.some((m) => m.policyId === e?.policyId)
  );
  const stamped = matches.map((m) => ({
    corpusId: 'scuba',
    policyId: m.policyId,
    result: m.result,
    source: 'scuba-import',
    importedAt,
    ...(meta?.toolVersion ? { toolVersion: meta.toolVersion } : {}),
    ...(meta?.reportDate ? { reportDate: meta.reportDate } : {})
  }));
  // New verdicts first: if the cap ever bites, the freshest evidence wins
  // and the OLDEST entries fall off (reviewer/analyzer convergent finding).
  return [...stamped, ...kept].slice(0, MAX_STORED_ENTRIES);
};

/**
 * Producer guard for the store (same contract as normalizeExternalLinks):
 * every write path funnels through this, so no caller — importer, restore,
 * foreign share file, future UI — can persist junk shapes, oversized lists,
 * or unvalidated strings.
 */
export const normalizePlatformResults = (list) => {
  if (!Array.isArray(list)) return [];
  const out = [];
  const seen = new Set();
  list.forEach((e) => {
    if (!e || typeof e !== 'object') return;
    const policyId = typeof e.policyId === 'string' ? e.policyId.toLowerCase() : '';
    if (!SCUBA_POLICY_ID.test(policyId)) return;
    if (!RESULT_VALUES.includes(e.result)) return;
    if (seen.has(policyId)) return;
    seen.add(policyId);
    const entry = {
      corpusId: 'scuba',
      policyId,
      result: e.result,
      source: 'scuba-import',
      importedAt: typeof e.importedAt === 'string' ? printable(e.importedAt, 32) : ''
    };
    if (typeof e.toolVersion === 'string' && e.toolVersion) entry.toolVersion = printable(e.toolVersion, META_MAX_LEN);
    if (typeof e.reportDate === 'string' && e.reportDate) entry.reportDate = printable(e.reportDate, META_MAX_LEN);
    out.push(entry);
  });
  return out.slice(0, MAX_STORED_ENTRIES);
};

/** Display order + labels for result chips; a location, not a ranking. */
export const RESULT_LABELS = {
  pass: 'Pass',
  fail: 'Fail',
  warning: 'Warning',
  na: 'N/A',
  error: 'Error',
  omitted: 'Omitted',
  manual: 'Manual',
  incorrect: 'Incorrect result'
};
