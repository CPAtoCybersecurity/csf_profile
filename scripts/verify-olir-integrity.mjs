#!/usr/bin/env node
// Verifies vendor/olir/ against MANIFEST.json: every manifest-listed file
// must exist with a matching sha256, and no unlisted file may sit in the
// vendored tree. Sibling of scripts/verify-vendor-integrity.mjs (which owns
// vendor/scuba/) — kept separate so PR-3's ratified script stays untouched.
//
// Runs in CI (generated-data-sync) with NO network and NO dependencies.
//
// Usage: node scripts/verify-olir-integrity.mjs   (exit 0 = intact, 1 = not)

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VENDOR_DIR = path.resolve(__dirname, '..', 'vendor', 'olir');
const MANIFEST = path.join(VENDOR_DIR, 'MANIFEST.json');

const fail = (msg) => {
  console.error(`OLIR VENDOR INTEGRITY FAILED — ${msg}`);
  process.exitCode = 1;
};

if (!fs.existsSync(MANIFEST)) {
  fail('vendor/olir/MANIFEST.json is missing.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const listed = new Set();

for (const [relPath, expected] of Object.entries(manifest.files)) {
  listed.add(relPath);
  const abs = path.join(VENDOR_DIR, relPath);
  if (!fs.existsSync(abs)) {
    fail(`listed file missing on disk: vendor/olir/${relPath}`);
    continue;
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
  if (actual !== expected) {
    fail(
      `sha256 mismatch for vendor/olir/${relPath}\n` +
      `  manifest: ${expected}\n  on disk:  ${actual}\n` +
      '  Vendored upstream content must not be edited. Re-pin via scripts/vendor-olir.mjs.'
    );
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
  if (rel === 'MANIFEST.json') continue;
  if (!listed.has(rel)) fail(`unlisted file in vendored tree: vendor/olir/${rel}`);
}

if (process.exitCode !== 1) {
  console.log(`OK: ${listed.size} vendored files match MANIFEST.json sha256 pins.`);
}
