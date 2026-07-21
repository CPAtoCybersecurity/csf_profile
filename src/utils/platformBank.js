/**
 * Platform procedure bank — runtime access to the generated
 * src/data/platformProcedures.json (SCuBA baselines, one record per policy)
 * and the committed policy→subcategory map, plus the REFERENCE machinery
 * (plan §7 R-3): observations never copy platform text — they carry
 * references, and every render/text-egress expands them here.
 *
 * Attach semantics are reference-on-attach (unlike the community bank's
 * copy-on-attach): reverse cardinality is untenable for copies — attractor
 * subcategories receive up to 122 policy addenda (PR.DS-10; measured on the
 * committed map). A reference is {corpusId, corpusVersion, policyId,
 * contentHash}; expansion resolves it against the CURRENT corpus (v1
 * durability model: no corpus snapshots — withdrawal/rev is
 * regeneration-not-migration, and an unresolvable reference renders an
 * explicit placeholder carrying its identity, never a silent drop).
 * User edits fork copy-on-write to a concrete provenance-flagged value, so
 * nothing user-authored can ever become unresolvable.
 *
 * expandProcedureText is the SINGLE choke point (plan §7 R-9): render, the
 * JSON share export, and every CSV/Jira text egress call it, and it is where
 * attribution is (re)asserted from provenance and where modification
 * indication derives from the tailored/modified flags.
 */
import platformBankJson from '../data/platformProcedures.json';
import subcategoryMap from '../data/platformSubcategoryMap.json';
import { licenseGate, mayTailor, refusalPlaceholder } from './licenseClass.mjs';
import { CISA_NOTICE_KEY, CISA_DISCLAIMER } from './thirdPartyNotices.mjs';

/**
 * Corpus identity. 'scuba' names the vendored SCuBA-baseline corpus; a future
 * corpus (e.g. a manifest-gated myctrl lane, plan PR-8) registers its own id
 * here. References carry the id so resolution is a POSITIVE registry match —
 * a ref from a corpus this build does not know resolves to the placeholder,
 * never against some other corpus (the R-6 inversion class).
 */
export const PLATFORM_CORPUS_ID = 'scuba';
const CORPORA = { [PLATFORM_CORPUS_ID]: platformBankJson };

export const PLATFORM_CORPUS_VERSION = platformBankJson.bankVersion;

/** Display labels for map platform ids; unknown ids fall back to the raw id
 *  so a record from a newer corpus never loses its label silently. */
const PLATFORM_LABELS = {
  'google-workspace': 'Google Workspace',
  'microsoft-365': 'Microsoft 365'
};
export const platformLabel = (platformId) => PLATFORM_LABELS[platformId] || String(platformId);

/**
 * Positive corpus lookup: record for (corpusId, policyId), or null.
 * Null means "cannot resolve — do not substitute": unknown corpus ids and
 * withdrawn/revised policy ids both land here, and callers render the
 * explicit placeholder rather than guessing.
 */
export const getPlatformRecord = (corpusId, policyId) => {
  const corpus = CORPORA[corpusId];
  const record = corpus?.procedures?.[policyId];
  return record || null;
};

/**
 * Invert the committed policy→subcategory map at runtime: every policy of an
 * in-scope platform whose pairs name this subcategory is OFFERED. Unranked by
 * ratified doctrine (G22: an arbitrary ranking is noise with an authority
 * veneer) — the order is the committed map's key order and carries no
 * semantics. Each offer passes the pair through so consumers that rank or
 * filter on grain read grainVias (the lossless multiset); grain itself is
 * display-only.
 *
 * @param {string} subcategoryId - CSF subcategory (e.g. 'PR.AA-05')
 * @param {string[]} platforms - map platform ids (e.g. ['google-workspace'])
 * @returns {Array<{corpusId, policyId, record, pair}>}
 */
export const getPlatformProcedures = (subcategoryId, platforms) => {
  const wanted = new Set(Array.isArray(platforms) ? platforms : []);
  if (!subcategoryId || wanted.size === 0) return [];
  const offers = [];
  Object.entries(subcategoryMap.policies).forEach(([policyId, entry]) => {
    if (!wanted.has(entry.platform)) return;
    const pair = entry.pairs.find((p) => p.subcategoryId === subcategoryId);
    if (!pair) return;
    const record = getPlatformRecord(PLATFORM_CORPUS_ID, policyId);
    if (!record) return; // map/bank drift — impossible while the freshness pin holds
    offers.push({ corpusId: PLATFORM_CORPUS_ID, policyId, record, pair });
  });
  return offers;
};

/**
 * Content fields the reference hash covers — the substance a user attached.
 * Deliberately excludes license/attribution metadata (attribution is asserted
 * from the CURRENT corpus at egress, not pinned at attach) and sourcePath
 * (vendoring layout is not content).
 */
const CONTENT_HASH_FIELDS = [
  'policyId',
  'group',
  'assertion',
  'obligation',
  'rationale',
  'instructions',
  'lastModified'
];

/* FNV-1a 64-bit over the picked-field JSON — deterministic, dependency-free,
 * synchronous (crypto.subtle is async and node-only hashes don't bundle).
 * The hash is OUR artifact-drift fingerprint, not a security boundary. */
/* eslint-env es2020 */
const fnv1a64 = (str) => {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= BigInt(str.charCodeAt(i));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, '0');
};

/** Deterministic fingerprint of a record's content fields. */
export const platformRecordContentHash = (record) =>
  fnv1a64(JSON.stringify(CONTENT_HASH_FIELDS.map((f) => record?.[f] ?? null)));

/**
 * Build the reference an observation stores for one corpus record — the R-3
 * shape, exactly: {corpusId, corpusVersion, policyId, contentHash}. Never
 * text. contentHash rides so drift between the attach-time content and a
 * regenerated corpus is detectable (and travels into the placeholder when a
 * ref stops resolving).
 */
export const buildPlatformRef = (record, corpusId = PLATFORM_CORPUS_ID) => ({
  corpusId,
  corpusVersion: CORPORA[corpusId]?.bankVersion ?? PLATFORM_CORPUS_VERSION,
  policyId: record.id,
  contentHash: platformRecordContentHash(record)
});

/**
 * Copy-on-write fork: the concrete, provenance-flagged value a reference
 * becomes on FIRST user edit. Keeps the ref identity fields (provenance for
 * attribution + drift evidence) and adds the user's text; `modified: true`
 * is what the egress choke point derives the change-indication line from
 * (CC BY §3(a)(1)(B) is a runtime behavior, not a static line — §7 R-9).
 * A fork owns its text, so it can never become unresolvable.
 *
 * POSITIVE guard (plan §7 R-3): forking requires a truthy corpus lookup —
 * you can only edit content that resolved (a placeholder has no base text)
 * — AND the resolved record's license must permit derivatives (editing IS a
 * derivative; the transform binding of the license gate). Returns null when
 * either fails; callers treat null as "cannot fork — do not write".
 */
export const forkPlatformProcedure = (ref, text) => {
  const record = getPlatformRecord(ref.corpusId, ref.policyId);
  if (!record || !mayTailor(record)) return null;
  return {
    corpusId: ref.corpusId,
    corpusVersion: ref.corpusVersion,
    policyId: ref.policyId,
    contentHash: ref.contentHash,
    text,
    modified: true,
    forkedAt: new Date().toISOString()
  };
};

/**
 * Content drift between a reference's attach-time fingerprint and the
 * CURRENT corpus record: true (drifted), false (byte-stable), or null when
 * the ref does not resolve (drift is unknowable — the placeholder already
 * carries the identity). Drift surfaces as detail-panel badge CHROME only
 * (PR-7): expansion output stays drift-silent PERMANENTLY — rendered and
 * exported text always carries the current corpus version, and the badge's
 * remedy is the explicit adopt action in the picker, which is the ONLY
 * path that may rewrite a reference's contentHash (ratified 2026-07-21).
 */
export const platformRefDrift = (entry) => {
  const record = getPlatformRecord(entry?.corpusId, entry?.policyId);
  if (!record) return null;
  return platformRecordContentHash(record) !== entry.contentHash;
};

/** A fork carries its own text; everything else is still a reference. */
export const isPlatformFork = (entry) => typeof entry?.text === 'string';

/**
 * Upstream source link for one addendum entry, from the CURRENT corpus
 * record's attribution — never from the entry itself (an entry from a
 * foreign file could carry an attacker-chosen URL). Null when the ref does
 * not resolve: an unresolved row gets no link rather than a dead href.
 */
export const platformRefSourceUrl = (entry) =>
  getPlatformRecord(entry?.corpusId, entry?.policyId)?.attribution?.sourceUrl || null;

/**
 * Canonical addendum order for one subcategory: the committed map's key
 * order restricted to policies that pair with the subcategory — the same
 * order getPlatformProcedures offers in, platform-grouped by map
 * construction. Entries the map cannot place (foreign corpus, withdrawn
 * policy, or a policy no longer paired here) keep their relative order
 * after the placeable ones. Pure re-ordering: entry objects pass through
 * untouched — sorting never reads the corpus records, so it cannot alter
 * content or fingerprints (the adopt action is the only hash writer).
 */
export const sortPlatformAddenda = (entries, subcategoryId) => {
  const list = Array.isArray(entries) ? entries : [];
  const index = new Map();
  let position = 0;
  Object.entries(subcategoryMap.policies).forEach(([policyId, entry]) => {
    if (entry.pairs.some((p) => p.subcategoryId === subcategoryId)) {
      index.set(policyId, position);
      position += 1;
    }
  });
  return list
    .map((entry, i) => ({
      entry,
      i,
      key: entry?.corpusId === PLATFORM_CORPUS_ID && index.has(entry?.policyId)
        ? index.get(entry.policyId)
        : Infinity
    }))
    .sort((a, b) => a.key - b.key || a.i - b.i)
    .map((x) => x.entry);
};

/**
 * The DERIVED per-assessment platform set (ratified: recomputed, never
 * mutated): sorted unique platform of every addendum entry that resolves in
 * the current corpus, across all observations. Derived in both directions —
 * removing a platform's last entry removes its id. Unresolvable entries
 * contribute nothing (their platform is unknowable from identity fields);
 * they stay visible through the unresolved badge and placeholder instead.
 */
export const derivePlatformsFromObservations = (observations) => {
  const platforms = new Set();
  Object.values(observations || {}).forEach((obs) => {
    const entries = Array.isArray(obs?.platformProcedures) ? obs.platformProcedures : [];
    entries.forEach((entry) => {
      const record = getPlatformRecord(entry?.corpusId, entry?.policyId);
      if (record) platforms.add(record.platform);
    });
  });
  return Array.from(platforms).sort();
};

/**
 * Row descriptor for one addendum entry — the ONE derivation the badge row,
 * the summary counts, and the picker's attached list all read, so the
 * counts can never disagree with the rows. Branches on the ENTRY (per-
 * observation state), never on the assessment-level platforms array —
 * platforms.length === 0 is ambiguous by contract (pre-v16 restore vs
 * attached-nothing) and must never gate badge logic.
 *
 * Badge states are limited to the production-drivable set (ratified):
 * drifted (attach-time fingerprint differs from the current corpus) and
 * unresolved (no current corpus record). A fork row shows neither — its
 * text is user-owned, and the drift badge's remedy (adopt) refuses forks,
 * so badging drift on a fork would surface a state with no remedy.
 */
export const addendumRowDescriptor = (entry) => {
  const record = getPlatformRecord(entry?.corpusId, entry?.policyId);
  const fork = isPlatformFork(entry);
  return {
    corpusId: entry?.corpusId,
    policyId: entry?.policyId,
    platformText: record ? platformLabel(record.platform) : null,
    fork,
    unresolved: !record && !fork,
    drifted: !fork && platformRefDrift(entry) === true,
    sourceUrl: platformRefSourceUrl(entry)
  };
};

/**
 * Explicit placeholder for a reference this installation cannot resolve
 * (unknown corpus, withdrawn or revised policy). Carries the full ref
 * identity — policyId, corpusVersion, contentHash — and is NEVER a silent
 * drop (§7 R-3; ratified v1 durability model).
 */
export const unresolvedRefPlaceholder = (entry) =>
  `> ⚠ Unresolved platform procedure reference: policy \`${entry.policyId}\` ` +
  `(corpus \`${entry.corpusId}\` @ ${entry.corpusVersion}, content ${entry.contentHash}). ` +
  'This installation\'s platform corpus does not contain the referenced policy — the corpus is ' +
  'absent, or the policy was withdrawn or revised upstream. The reference is preserved; ' +
  're-attach from a current platform pack to replace it.';

/* One addendum block. Attribution is asserted HERE, from provenance —
 * the current corpus record's attribution block for references, the ref
 * identity fields for forks whose corpus is gone. Record text is emitted
 * VERBATIM (never truncated/reflowed), which is also what a noDerivatives
 * license permits, so the verbatim-or-omit rule holds by construction. */
/*
 * Derived reference mappings carried by a corpus record, as one italic
 * line. The control and technique IDs are facts (CISA publishes them per
 * policy); the derivation caveat that makes them safe to show renders once
 * per expansion via MAPPINGS_CAVEAT, not once per addendum.
 */
const referenceMappingLine = (record) => {
  const parts = [];
  if (record.nist80053?.length) {
    parts.push(`NIST SP 800-53 Rev. 5 (FedRAMP High baseline) ${record.nist80053.join(', ')}`);
  }
  if (record.mitreAttack?.length) {
    parts.push(`MITRE ATT&CK ${record.mitreAttack.join(', ')}`);
  }
  return parts.length ? `*Reference mappings: ${parts.join(' · ')}*` : null;
};

/*
 * Emitted once per expansion whenever any rendered addendum carries a
 * reference-mappings line. Without this label the mappings read as a
 * coverage or authorization claim, which they are not: placement rides a
 * derived, unranked crosswalk (see platformSubcategoryMap justification).
 */
const MAPPINGS_CAVEAT =
  '*Reference mappings are derived from CISA\'s NIST SP 800-53 FedRAMP High baseline mappings and the NIST CSF 2.0 crosswalk. They are informational only, not a FedRAMP authorization or coverage assertion.*';

/* True when expansion will render a mappings line for this entry: resolved,
 * license-allowed, not a user-owned fork, and referenceMappingLine emits.
 * The last check delegates to the SAME function renderAddendum pushes from,
 * so the caveat tracks actual rendering by construction and the two sites
 * cannot drift apart (reviewer Finding 2). */
const rendersMappings = (entry) => {
  if (isPlatformFork(entry)) return false;
  const record = getPlatformRecord(entry?.corpusId, entry?.policyId);
  if (!record || !licenseGate(record).allow) return false;
  return referenceMappingLine(record) !== null;
};

const renderAddendum = (entry) => {
  const record = getPlatformRecord(entry.corpusId, entry.policyId);

  if (isPlatformFork(entry)) {
    // User-owned concrete value: the text always renders (nothing
    // user-authored can become unresolvable). Attribution re-asserts from
    // the current corpus when it still resolves, from the ref fields when
    // it does not; the change-indication line derives from the flag.
    const lines = [entry.text];
    if (record?.attribution?.attributionText) {
      lines.push(`*${record.attribution.attributionText}*`);
    } else {
      lines.push(
        `*Adapted from platform policy ${entry.policyId} (corpus ${entry.corpusId}); upstream attribution applies.*`
      );
    }
    if (entry.modified) {
      lines.push('*This platform procedure has been modified from the referenced original.*');
    }
    return lines.join('\n\n');
  }

  if (!record) return unresolvedRefPlaceholder(entry);

  const gate = licenseGate(record);
  const header = `**Platform procedure — ${record.policyId} (${platformLabel(record.platform)})**`;
  if (!gate.allow) {
    // Fail-closed: zero licensed text, explicit and visible.
    return [header, refusalPlaceholder(gate.reason)].join('\n\n');
  }

  const lines = [header, record.assertion, record.instructions].filter(Boolean);
  const mappingLine = referenceMappingLine(record);
  if (mappingLine) lines.push(mappingLine);
  const attribution = record.attribution || {};
  const credit = [];
  if (attribution.attributionText) credit.push(`*${attribution.attributionText}*`);
  if (record.license) credit.push(`License: ${record.license}.`);
  if (attribution.sourceUrl) credit.push(`[Source](${attribution.sourceUrl})`);
  if (credit.length) lines.push(credit.join(' '));
  return lines.join('\n\n');
};

/* Notice obligations across the expansion, emitted once per output rather
 * than once per addendum. The CISA key resolves to the canonical disclaimer;
 * literal notice strings pass through. Forks are NOT skipped: adapted
 * content still derives from the notice-bearing upstream, so a fork whose
 * record resolves carries the record's notices (an orphan fork has no
 * resolvable record and therefore no knowable notices — its attribution
 * falls back to the ref fields in renderAddendum). */
const noticeLines = (entries) => {
  const keys = new Set();
  entries.forEach((entry) => {
    const record = getPlatformRecord(entry.corpusId, entry.policyId);
    (record?.licenseObligations?.noticeText || []).forEach((n) => keys.add(n));
  });
  const lines = [];
  if (keys.delete(CISA_NOTICE_KEY)) lines.push(`> ${CISA_DISCLAIMER}`);
  keys.forEach((literal) => lines.push(`> ${literal}`));
  return lines;
};

/**
 * THE expansion choke point (plan §7 R-3/R-9). Render and every text egress
 * — the JSON share export, the four CSV/Jira exporters — pass an observation
 * through here; no surface composes platform text on its own.
 *
 * Contract:
 *  - no platform entries → returns testProcedures byte-identical (pinned);
 *  - references expand from the CURRENT corpus with attribution asserted
 *    from provenance; a gate-refused record renders the fail-closed refusal;
 *  - unresolvable references render the explicit identity-carrying
 *    placeholder — never a silent drop, never a throw;
 *  - forks render their own text with flag-derived modification indication;
 *  - a licensed TRUNK with a changeIndication obligation and modified or
 *    tailored flags gets its indication line here too (no trunk carries
 *    license obligations today; the community bank is unlicensed own-content).
 */
export const expandProcedureText = (observation) => {
  if (!observation || typeof observation !== 'object') return '';
  const trunk = typeof observation.testProcedures === 'string' ? observation.testProcedures : '';
  const entries = Array.isArray(observation.platformProcedures)
    ? observation.platformProcedures
    : [];
  const source = observation.procedureSource;
  const trunkIndication =
    source?.licenseObligations?.changeIndication && (source.modified || source.tailored)
      ? '*This procedure text has been modified from the attached source version.*'
      : null;
  if (entries.length === 0 && !trunkIndication) return trunk;

  const parts = [];
  if (trunk) parts.push(trunk);
  if (trunkIndication) parts.push(trunkIndication);
  entries.forEach((entry) => {
    parts.push('---');
    parts.push(renderAddendum(entry));
  });
  if (entries.some(rendersMappings)) parts.push(MAPPINGS_CAVEAT);
  parts.push(...noticeLines(entries));
  return parts.join('\n\n');
};
