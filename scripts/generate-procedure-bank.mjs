#!/usr/bin/env node
// Generates src/data/communityProcedures.json — the community test-procedure
// bank — from ASSESSMENT_CATALOG/3_Test_Procedures/.
//
// One entry per CSF 2.0 subcategory, keyed by subcategory ID (the filename
// stem, e.g. "GV.OC-01"). The FULL markdown body is preserved: unlike the
// comprehensive-assessment flatten, nothing (pass/fail criteria, interview
// questions, evidence requests) is discarded. The app attaches these in the
// New Assessment wizard and detail panel.
//
// Deterministic: entries sorted by ID, no timestamps; bankVersion is a
// content hash, so re-running against an unchanged catalog is byte-identical.
//
// Usage:
//   node scripts/generate-procedure-bank.mjs           # write the bank
//   node scripts/generate-procedure-bank.mjs --check   # exit 1 if the
//       committed bank differs from a fresh generation (CI drift guard)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TP_DIR = path.join(ROOT, 'ASSESSMENT_CATALOG', '3_Test_Procedures');
const OUT = path.join(ROOT, 'src', 'data', 'communityProcedures.json');

const FUNCTIONS = ['GV', 'ID', 'PR', 'DE', 'RS', 'RC'];
const SUBCATEGORY_ID = /^[A-Z]{2}\.[A-Z]{2,3}-\d{2}$/;

function collectProcedures() {
  const procedures = {};
  for (const fn of FUNCTIONS) {
    const dir = path.join(TP_DIR, fn);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith('.md') || file === 'README.md') continue;
      const id = file.replace(/\.md$/, '');
      if (!SUBCATEGORY_ID.test(id)) {
        console.error(`SKIP (unexpected filename, not a subcategory ID): ${fn}/${file}`);
        continue;
      }
      // The app routes stored procedure text through its DOMPurify-based
      // input sanitizer, which DELETES raw angle-bracket tokens (e.g.
      // "<name@example.com>" contact lines, "<br>") outright. Normalize them
      // here so attaching a community procedure is lossless: autolinks and
      // emails lose their brackets, <br> becomes a real newline.
      const markdown = fs.readFileSync(path.join(dir, file), 'utf8').trim()
        .replace(/<(https?:\/\/[^<>\s]+)>/g, '$1')
        .replace(/<([^<>\s]+@[^<>\s]+)>/g, '$1')
        .replace(/<br\s*\/?>/gi, '\n');
      const headingLine = markdown.split('\n').find((l) => l.startsWith('# '));
      const title = headingLine ? headingLine.replace(/^#\s+/, '').trim() : id;
      procedures[id] = {
        title,
        markdown,
        sourcePath: `ASSESSMENT_CATALOG/3_Test_Procedures/${fn}/${file}`
      };
    }
  }
  return procedures;
}

function render(procedures) {
  const ids = Object.keys(procedures).sort();
  const hash = crypto.createHash('sha256');
  for (const id of ids) hash.update(`${id}\n${procedures[id].markdown}\n`);
  const bank = {
    bankVersion: hash.digest('hex').slice(0, 16),
    procedureCount: ids.length,
    source: 'ASSESSMENT_CATALOG/3_Test_Procedures',
    procedures: Object.fromEntries(ids.map((id) => [id, procedures[id]]))
  };
  return JSON.stringify(bank, null, 2) + '\n';
}

const output = render(collectProcedures());

if (process.argv.includes('--check')) {
  const committed = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (committed !== output) {
    console.error(
      'DRIFT: src/data/communityProcedures.json does not match ASSESSMENT_CATALOG/3_Test_Procedures/.\n' +
      'Run: node scripts/generate-procedure-bank.mjs  (and commit the result)'
    );
    process.exit(1);
  }
  console.log('OK: procedure bank matches the catalog.');
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, output);
  const parsed = JSON.parse(output);
  console.log(`Wrote ${OUT}`);
  console.log(`  Procedures: ${parsed.procedureCount}`);
  console.log(`  bankVersion: ${parsed.bankVersion}`);
}
