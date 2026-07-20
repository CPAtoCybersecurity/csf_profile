#!/usr/bin/env node
// Generates the 800-53 -> CSF 2.0 subcategory mapping artifacts (plan §7
// R-2; PR-4) from three inputs: the platform bank
// (src/data/platformProcedures.json — raw upstream facts, byte-untouched by
// this pipeline), the vendored OLIR crosswalk (vendor/olir/, sha256-pinned),
// and the hand-authored ratification file (data/mapping-overrides.json).
//
// Two outputs, both committed, both covered by --check:
//  - src/data/platformSubcategoryMap.json — the SEPARATE mapping artifact
//    PR-5 will consume. Separate so the bank hash stays stable across
//    mapping iterations and PR-3's "no subcategories field on any bank
//    record" anti-test stays green permanently. Carries mapVersion (a
//    content hash), deliberately NOT bankVersion: this file holds only
//    derived ID pairs — no third-party licensed text — so it stays outside
//    the notices generator's unregistered-bank guard by design (decision
//    logged in ISA G22).
//  - data/mapping-review-queue.json — the signature-keyed ratification
//    WORKPAPER (not a shipping gate: a signature with no override ships its
//    derived pairs as-is, unranked; the fan-out cap is retired). Nothing
//    under src/ imports it. Committed so an upstream refresh shows up as a
//    reviewable diff at signature grain (~85 entries), not 265 policy-grain
//    decisions.
//
// All join logic lives in src/utils/subcategoryMapping.mjs (jest-shared).
// Deterministic: sorted keys, content-hash versions, no timestamps, no
// network. Any unknown override/gap reference or violated grain assumption
// is a hard error (exit 1), never a warning.
//
// Usage:
//   node scripts/generate-subcategory-map.mjs           # write both outputs
//   node scripts/generate-subcategory-map.mjs --check   # exit 1 if either
//       committed output differs from a fresh derivation (CI drift guard)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  GENERATOR_VERSION,
  PINNED_LANE,
  JUSTIFICATION,
  deriveMapping
} from '../src/utils/subcategoryMapping.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BANK = path.join(ROOT, 'src', 'data', 'platformProcedures.json');
const OLIR_MANIFEST = path.join(ROOT, 'vendor', 'olir', 'MANIFEST.json');
const OVERRIDES = path.join(ROOT, 'data', 'mapping-overrides.json');
const MAP_OUT = path.join(ROOT, 'src', 'data', 'platformSubcategoryMap.json');
const QUEUE_OUT = path.join(ROOT, 'data', 'mapping-review-queue.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const bank = readJson(BANK);
const manifest = readJson(OLIR_MANIFEST);
const overrides = readJson(OVERRIDES);

const convertedRel = Object.keys(manifest.files).find((f) => f.endsWith('csf2-sp80053-refs.json'));
const converted = readJson(path.join(ROOT, 'vendor', 'olir', convertedRel));

if (converted.converterVersion !== manifest.converterVersion) {
  console.error(
    `OLIR converter version drift: artifact=${converted.converterVersion}, manifest=${manifest.converterVersion}.\n` +
    'Re-run: node scripts/vendor-olir.mjs --reconvert'
  );
  process.exit(1);
}

const olirDescriptor = {
  release: `${converted.title} — ${converted.changeLog} (CPRT bulk download, generated ${converted.generatedDate})`,
  retrievedAt: manifest.retrievedAt,
  sourceUrl: manifest.sourceUrl,
  lane: PINNED_LANE
};

let result;
let strippedGap;
try {
  result = deriveMapping({ procedures: bank.procedures, converted, overrides });
  // Pre-gap-table pass for the workpaper's recovery accounting: same join,
  // gap table stripped, overrides kept.
  strippedGap = deriveMapping({
    procedures: bank.procedures,
    converted,
    overrides: { ...overrides, gapTable: {} }
  });
} catch (err) {
  console.error(`MAPPING GENERATION FAILED — ${err.message}`);
  process.exit(1);
}

const { policies, signatures, stats } = result;
const zeroBeforeGapTable = strippedGap.stats.emptyPolicies;
const recovered = zeroBeforeGapTable.filter((pid) => {
  const entry = Object.values(policies).find((p) => p.policyId === pid);
  return entry && entry.pairs.length > 0;
});

const hashOf = (obj) =>
  crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex').slice(0, 16);

const mapBody = {
  mapFormat: 'platform-subcategory-map-v1',
  generatorVersion: GENERATOR_VERSION,
  justification: JUSTIFICATION,
  derivedFromBankVersion: bank.bankVersion,
  olir: olirDescriptor,
  policyCount: stats.policyCount,
  policies
};
const mapOut = JSON.stringify(
  { mapFormat: mapBody.mapFormat, mapVersion: hashOf(mapBody), ...mapBody },
  null,
  2
) + '\n';

const queueSignatures = {};
for (const [sig, memberIds] of [...signatures.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
  const members = memberIds.map((id) => ({
    policyId: bank.procedures[id].policyId,
    assertion: bank.procedures[id].assertion
  }));
  // The signature's shipping pairs: taken from a member NOT individually
  // overridden (members with a policy override diverge and are labeled in
  // overrideStatus); falls back to the first member if all are overridden.
  const memberEntries = memberIds.map((id) => policies[id]);
  const first = memberEntries.find((p) => p.overrideSource !== 'policy') || memberEntries[0];
  const policyOverrides = memberEntries
    .filter((p) => p.overrideSource === 'policy')
    .map((p) => p.policyId);
  const overrideStatus = (overrides.bySignature || {})[sig]
    ? 'signature-override'
    : policyOverrides.length > 0
      ? `policy-overrides: ${policyOverrides.join(', ')}`
      : 'ships-as-is';
  queueSignatures[sig] = {
    controls: sig.split('|'),
    members,
    pairs: first.pairs,
    overrideStatus
  };
}

const queueBody = {
  queueFormat: 'mapping-review-queue-v1',
  generatorVersion: GENERATOR_VERSION,
  justification: JUSTIFICATION,
  role:
    'Ratification workpaper, not a shipping gate: a signature with no override ships its ' +
    'derived pairs as-is (unranked; the fan-out cap is retired). The override file ' +
    '(data/mapping-overrides.json) is the ratification instrument. Nothing under src/ ' +
    'imports this file. Member assertion texts are excerpts from the platform bank ' +
    '(src/data/platformProcedures.json), whose per-record license metadata and ' +
    'THIRD-PARTY-NOTICES.md govern them.',
  derivedFromBankVersion: bank.bankVersion,
  olir: olirDescriptor,
  signatureCount: signatures.size,
  stats: {
    ...stats,
    // Derived-only fan-out (gap table stripped) — the plan-comparable view.
    fanoutBeforeGapTable: strippedGap.stats.fanout,
    zeroBeforeGapTable,
    zeroBeforeGapTableCount: zeroBeforeGapTable.length,
    recoveredByGapTable: recovered.length,
    emptyAfterGapTable: stats.emptyPolicies.length
  },
  signatures: queueSignatures
};
const queueOut = JSON.stringify(
  { queueFormat: queueBody.queueFormat, queueVersion: hashOf(queueBody), ...queueBody },
  null,
  2
) + '\n';

if (process.argv.includes('--check')) {
  let drifted = false;
  for (const [out, text, label] of [
    [MAP_OUT, mapOut, 'src/data/platformSubcategoryMap.json'],
    [QUEUE_OUT, queueOut, 'data/mapping-review-queue.json']
  ]) {
    const committed = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : '';
    if (committed !== text) {
      console.error(`DRIFT: ${label} does not match a fresh derivation.`);
      drifted = true;
    }
  }
  if (drifted) {
    console.error('Run: node scripts/generate-subcategory-map.mjs  (and commit the results)');
    process.exit(1);
  }
  console.log('OK: subcategory map and review queue match their inputs.');
} else {
  fs.mkdirSync(path.dirname(QUEUE_OUT), { recursive: true });
  fs.writeFileSync(MAP_OUT, mapOut);
  fs.writeFileSync(QUEUE_OUT, queueOut);
  console.log(`Wrote ${MAP_OUT}`);
  console.log(`Wrote ${QUEUE_OUT}`);
  console.log(
    `  policies: ${stats.policyCount} | signatures: ${stats.signatureCount} | pairs: ${stats.pairCount} ` +
    `(derived ${stats.derivedPairCount}: exact ${stats.grainPairs.exact} / subpart ${stats.grainPairs['subpart-truncated']} / ` +
    `enh-fallback ${stats.grainPairs['enh-fallback']}; authored ${stats.authoredPairs})`
  );
  console.log(
    `  zero-mapping before gap table: ${zeroBeforeGapTable.length} | recovered: ${recovered.length} | ` +
    `still empty: ${stats.emptyPolicies.length}`
  );
}
