#!/usr/bin/env node
// Generates THIRD-PARTY-NOTICES.md from the shipped bank data. Thin fs
// wrapper — all logic lives in src/utils/thirdPartyNotices.mjs (shared with
// the jest suite, relatedSection.mjs precedent) so CI and tests exercise the
// same code.
//
// The generator is also the license gate for bundled content: any
// attribution-obligated record missing a complete attribution block
// (attributionText, sourceUrl, licenseUrl, retrievedAt, upstream sha) and any
// reference-only record found in a bank FAILS the build, before drift is even
// considered.
//
// Deterministic: sorted rendering, no timestamps, no network — byte-identical
// on re-run against unchanged banks.
//
// Usage:
//   node scripts/generate-third-party-notices.mjs           # write the file
//   node scripts/generate-third-party-notices.mjs --check   # exit 1 on
//       validation failure OR if the committed file differs (CI gate)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLicensedRecords, renderNotices } from '../src/utils/thirdPartyNotices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'THIRD-PARTY-NOTICES.md');

// Every shipped bank, adapted to { name, records: { id: record } }. A future
// bank (e.g. the platform-procedure bank, plan §7 PR-3) is added HERE and is
// then covered by the validation gate automatically.
const BANKS = [
  {
    name: 'Community test-procedure bank (src/data/communityProcedures.json)',
    load: () =>
      JSON.parse(
        fs.readFileSync(path.join(ROOT, 'src', 'data', 'communityProcedures.json'), 'utf8')
      ).procedures
  },
  {
    name: 'Platform procedure bank (src/data/platformProcedures.json)',
    load: () =>
      JSON.parse(
        fs.readFileSync(path.join(ROOT, 'src', 'data', 'platformProcedures.json'), 'utf8')
      ).procedures
  }
];

// Stale-green guard: a bank JSON that exists on disk but is not enumerated in
// BANKS would be silently un-covered by the license gate — the curated-list
// rot mode. Any src/data/*.json carrying a bankVersion signature must be
// declared above.
const COVERED = new Set(['communityProcedures.json', 'platformProcedures.json']);
const dataDir = path.join(ROOT, 'src', 'data');
const unregistered = fs.readdirSync(dataDir)
  .filter((f) => f.endsWith('.json') && !COVERED.has(f))
  .filter((f) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')).bankVersion !== undefined;
    } catch {
      return false;
    }
  });
if (unregistered.length > 0) {
  console.error(
    'LICENSE GATE FAILED — bank file(s) not enumerated in generate-third-party-notices.mjs BANKS:\n' +
    unregistered.map((f) => `  - src/data/${f}`).join('\n') +
    '\nEvery bank must be covered by the notices/validation gate.'
  );
  process.exit(1);
}

const banks = BANKS.map(({ name, load }) => ({ name, records: load() }));

const errors = validateLicensedRecords(banks);
if (errors.length > 0) {
  console.error('LICENSE GATE FAILED — bundled content violates its obligations:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const output = renderNotices(banks);

if (process.argv.includes('--check')) {
  const committed = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (committed !== output) {
    console.error(
      'DRIFT: THIRD-PARTY-NOTICES.md does not match the shipped bank data.\n' +
      'Run: node scripts/generate-third-party-notices.mjs  (and commit the result)'
    );
    process.exit(1);
  }
  console.log('OK: third-party notices match the shipped bank data.');
} else {
  fs.writeFileSync(OUT, output);
  console.log(`Wrote ${OUT}`);
}
