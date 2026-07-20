#!/usr/bin/env node
// Generates src/data/platformProcedures.json — the platform-procedure bank —
// from the vendored CISA SCuBA baselines under vendor/scuba/ (pinned by
// MANIFEST.json; integrity enforced by scripts/verify-vendor-integrity.mjs).
//
// SECOND bank, separate from communityProcedures.json (plan §7 R-8): one
// record per SCuBA policy, keyed by lowercased policy ID. Records are
// reference-shaped (R-3) — the bank holds the full content; observations
// will reference it (PR-5). No subcategory mapping here — PR-4 owns the
// 800-53 → CSF join; this bank carries only the raw upstream facts
// (nist80053[], mitreAttack[]).
//
// License metadata is stamped per record from PER-FILE detection
// (src/utils/scubaBaseline.mjs): the RAW license string + declared
// obligation components, never the computed classification join. The
// notices/validation gate (generate-third-party-notices.mjs) enumerates
// this bank in BANKS and refuses attribution-incomplete or reference-only
// records at build time; this generator runs the same validation before
// writing, so a bad corpus can never even reach the tree.
//
// Deterministic: entries sorted by ID, no timestamps, no network;
// bankVersion is a content hash, so re-running against an unchanged vendored
// tree is byte-identical. retrievedAt values come from MANIFEST.json.
//
// Usage:
//   node scripts/generate-platform-bank.mjs           # write the bank
//   node scripts/generate-platform-bank.mjs --check   # exit 1 if the
//       committed bank differs from a fresh generation (CI drift guard)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PARSER_VERSION, parseBaselineFile } from '../src/utils/scubaBaseline.mjs';
import { LICENSE_SCHEMA_VERSION } from '../src/utils/licenseClass.mjs';
import { validateLicensedRecords } from '../src/utils/thirdPartyNotices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'vendor', 'scuba');
const MANIFEST = path.join(VENDOR_DIR, 'MANIFEST.json');
const OUT = path.join(ROOT, 'src', 'data', 'platformProcedures.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

if (manifest.parserVersion !== PARSER_VERSION || manifest.licenseSchemaVersion !== LICENSE_SCHEMA_VERSION) {
  console.error(
    `MANIFEST version drift: manifest parser=${manifest.parserVersion}/schema=${manifest.licenseSchemaVersion}, ` +
    `code parser=${PARSER_VERSION}/schema=${LICENSE_SCHEMA_VERSION}.\n` +
    'Re-run: node scripts/vendor-scuba.mjs --update  (re-stamps the manifest versions)'
  );
  process.exit(1);
}

const procedures = {};
let censusTotal = 0;

for (const source of manifest.sources) {
  censusTotal += source.policyCensus;
  for (const relPath of Object.keys(source.files).sort()) {
    const fileName = path.basename(relPath);
    const text = fs.readFileSync(path.join(VENDOR_DIR, relPath), 'utf8');
    const records = parseBaselineFile(text, {
      platformId: source.platformId,
      repo: source.repo,
      sha: source.sha,
      baselinesPath: source.baselinesPath,
      retrievedAt: manifest.retrievedAt,
      fileName,
      sourcePath: `vendor/scuba/${relPath}`,
      licenseId: source.licenseId
    });
    for (const record of records) {
      if (procedures[record.id]) {
        console.error(`DUPLICATE policy ID across vendored files: ${record.policyId}`);
        process.exit(1);
      }
      procedures[record.id] = record;
    }
  }
}

const ids = Object.keys(procedures).sort();

// The manifest census counts policy headings by regex, independently of the
// parser — a parser that silently drops policies fails here, not in review.
if (ids.length !== censusTotal) {
  console.error(
    `PARSE LOSS: parser produced ${ids.length} records, manifest census expects ${censusTotal}.`
  );
  process.exit(1);
}

// Same license gate the notices generator enforces — run it BEFORE writing
// so an attribution-incomplete or reference-only record never reaches src/.
const errors = validateLicensedRecords([
  { name: 'platformProcedures (pre-write)', records: procedures }
]);
if (errors.length > 0) {
  console.error('LICENSE GATE FAILED — generated records violate their obligations:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const hash = crypto.createHash('sha256');
for (const id of ids) hash.update(`${id}\n${JSON.stringify(procedures[id])}\n`);

const bank = {
  bankFormat: 'platform-procedures-v1',
  bankVersion: hash.digest('hex').slice(0, 16),
  parserVersion: PARSER_VERSION,
  licenseSchemaVersion: LICENSE_SCHEMA_VERSION,
  procedureCount: ids.length,
  source: 'vendor/scuba',
  procedures: Object.fromEntries(ids.map((id) => [id, procedures[id]]))
};
const output = JSON.stringify(bank, null, 2) + '\n';

if (process.argv.includes('--check')) {
  const committed = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (committed !== output) {
    console.error(
      'DRIFT: src/data/platformProcedures.json does not match vendor/scuba/.\n' +
      'Run: node scripts/generate-platform-bank.mjs  (and commit the result)'
    );
    process.exit(1);
  }
  console.log('OK: platform bank matches the vendored baselines.');
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, output);
  console.log(`Wrote ${OUT}`);
  console.log(`  Procedures: ${ids.length}`);
  console.log(`  bankVersion: ${bank.bankVersion}`);
}
