#!/usr/bin/env node
// Vendors the NIST CPRT "CSF 2.0 Reference Tool" bulk download (the OLIR
// informative-reference crosswalk, plan §7 R-2) into vendor/olir/. Developer-
// time tool ONLY — this is the single place in the mapping pipeline allowed
// to touch the network. CI never runs it: scripts/verify-olir-integrity.mjs
// recomputes the sha256 pins in vendor/olir/MANIFEST.json.
//
// The CPRT service generates the workbook per request (Apache POI; creation
// timestamp = fetch time), so raw bytes are NOT stable across downloads. The
// committed copy is the pin. Conversion (XLSX -> csf2-sp80053-refs.json) runs
// HERE, at vendor time, via src/utils/olirWorkbook.mjs — CI needs no XLSX
// parser and consumes only the committed converted JSON.
//
// Usage:
//   node scripts/vendor-olir.mjs --update      # fetch, convert, re-pin
//   node scripts/vendor-olir.mjs --reconvert   # NO network: re-run the
//       conversion from the committed workbook (after a converter fix) and
//       re-pin the converted artifact's sha256

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CONVERTER_VERSION, convertWorkbook } from '../src/utils/olirWorkbook.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'vendor', 'olir');
const MANIFEST = path.join(VENDOR_DIR, 'MANIFEST.json');

const SOURCE_URL = 'https://csrc.nist.gov/extensions/nudp/services/json/csf/download?olirids=all';
const WORKBOOK_NAME = 'csf-2-0-export.xlsx';
const CONVERTED_NAME = 'csf2-sp80053-refs.json';

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

const mode = process.argv.includes('--update')
  ? 'update'
  : process.argv.includes('--reconvert')
    ? 'reconvert'
    : null;
if (!mode) {
  console.error(
    'This tool re-fetches or re-converts vendored upstream content.\n' +
    'Run with --update (network fetch + convert) or --reconvert (offline re-conversion).'
  );
  process.exit(1);
}

const writeArtifacts = ({ workbook, retrievedAt }) => {
  const converted = convertWorkbook(workbook);
  const releaseDir = `csf2-${(converted.changeLog || 'unknown').toLowerCase()}-${retrievedAt}`;
  const outDir = path.join(VENDOR_DIR, releaseDir);

  fs.rmSync(VENDOR_DIR, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, WORKBOOK_NAME), workbook);
  const convertedText = JSON.stringify(converted, null, 2) + '\n';
  fs.writeFileSync(path.join(outDir, CONVERTED_NAME), convertedText);

  const manifest = {
    manifestFormat: 'olir-vendor-v1',
    converterVersion: CONVERTER_VERSION,
    retrievedAt,
    sourceUrl: SOURCE_URL,
    release: {
      title: converted.title,
      changeLog: converted.changeLog,
      generatedDate: converted.generatedDate,
      lanes: converted.lanes,
      subcategoryCount: converted.subcategoryCount,
      withdrawnCount: converted.withdrawnCount
    },
    note:
      'The CPRT service generates this workbook per request (creation timestamp = ' +
      'fetch time), so the raw bytes are not stable across downloads: the COMMITTED ' +
      'copy is the pin. NIST CPRT/OLIR content is a work of the U.S. Government ' +
      '(public domain). Conversion to the committed JSON happens at vendor time ' +
      '(src/utils/olirWorkbook.mjs); reference strings are preserved raw — all ' +
      'normalization is join logic in src/utils/subcategoryMapping.mjs.',
    files: {
      [`${releaseDir}/${WORKBOOK_NAME}`]: sha256(workbook),
      [`${releaseDir}/${CONVERTED_NAME}`]: sha256(Buffer.from(convertedText))
    }
  };
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote vendor/olir/${releaseDir}/ (${converted.subcategoryCount} subcategories, lanes: ${converted.lanes.join(' | ')})`);
  console.log(`Wrote ${MANIFEST}`);
};

if (mode === 'update') {
  const res = await fetch(SOURCE_URL, { headers: { 'User-Agent': 'csf_profile-vendor-olir' } });
  if (!res.ok) {
    console.error(`${res.status} ${res.statusText} fetching ${SOURCE_URL}`);
    process.exit(1);
  }
  const workbook = Buffer.from(await res.arrayBuffer());
  writeArtifacts({ workbook, retrievedAt: new Date().toISOString().slice(0, 10) });
} else {
  // Offline re-conversion from the committed workbook: keep the recorded
  // retrievedAt (the fetch did not happen again) and the committed bytes.
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const workbookRel = Object.keys(manifest.files).find((f) => f.endsWith(WORKBOOK_NAME));
  const workbook = fs.readFileSync(path.join(VENDOR_DIR, workbookRel));
  writeArtifacts({ workbook, retrievedAt: manifest.retrievedAt });
}
