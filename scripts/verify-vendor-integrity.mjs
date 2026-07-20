#!/usr/bin/env node
// Verifies vendor/scuba/ against MANIFEST.json: every manifest-listed file
// must exist with a matching sha256, and no unlisted markdown may sit in the
// vendored tree. Editing vendored upstream text — or a partial/drifted
// re-fetch — is a build failure, never a silent fork of CISA's baselines.
//
// Runs in CI (generated-data-sync) with NO network and NO dependencies.
//
// Usage: node scripts/verify-vendor-integrity.mjs   (exit 0 = intact, 1 = not)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VENDOR_DIR = path.resolve(__dirname, '..', 'vendor', 'scuba');
const MANIFEST = path.join(VENDOR_DIR, 'MANIFEST.json');

const fail = (msg) => {
  console.error(`VENDOR INTEGRITY FAILED — ${msg}`);
  process.exitCode = 1;
};

if (!fs.existsSync(MANIFEST)) {
  fail('vendor/scuba/MANIFEST.json is missing.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const listed = new Set();

for (const source of manifest.sources) {
  for (const [relPath, expected] of Object.entries(source.files)) {
    listed.add(relPath);
    const abs = path.join(VENDOR_DIR, relPath);
    if (!fs.existsSync(abs)) {
      fail(`listed file missing on disk: vendor/scuba/${relPath}`);
      continue;
    }
    const actual = crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
    if (actual !== expected) {
      fail(
        `sha256 mismatch for vendor/scuba/${relPath}\n` +
        `  manifest: ${expected}\n  on disk:  ${actual}\n` +
        '  Vendored upstream text must not be edited. Re-pin via scripts/vendor-scuba.mjs --update.'
      );
    }
  }
}

// Unlisted content in the vendored tree is as much a fork as an edit.
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
for (const abs of walk(VENDOR_DIR)) {
  const rel = path.relative(VENDOR_DIR, abs);
  if (rel === 'MANIFEST.json' || rel === 'LICENSE-CC0-1.0.txt') continue;
  if (!listed.has(rel)) fail(`unlisted file in vendored tree: vendor/scuba/${rel}`);
}

if (process.exitCode !== 1) {
  const total = listed.size;
  console.log(`OK: ${total} vendored files match MANIFEST.json sha256 pins.`);
}
