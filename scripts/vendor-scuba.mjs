#!/usr/bin/env node
// Vendors the CISA SCuBA secure-configuration-baseline markdown into
// vendor/scuba/ at PINNED upstream commits. Developer-time tool ONLY — this
// is the single place in the platform-bank pipeline allowed to touch the
// network. CI never runs it: scripts/verify-vendor-integrity.mjs recomputes
// the per-file sha256 values recorded in MANIFEST.json, so editing vendored
// upstream text (or a drifted re-fetch) is a build failure, not a silent fork.
//
// We import the baseline TEXT only (plan §6 item 3): the upstream repos
// vendor third-party dependencies under their own licenses, so the per-file
// license detection in src/utils/scubaBaseline.mjs — never the repo-level
// CC0 label — decides what each record stamps. removedpolicies.md is
// excluded: it catalogs deprecated policies, which are not procedures.
//
// Usage:
//   node scripts/vendor-scuba.mjs --update   # re-fetch at the pins below
//
// To move a pin: update the sha here, run --update, re-run the platform-bank
// generator, and review the corpus diff like any upstream refresh.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PARSER_VERSION, POLICY_HEADING } from '../src/utils/scubaBaseline.mjs';
import { LICENSE_SCHEMA_VERSION } from '../src/utils/licenseClass.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VENDOR_DIR = path.join(ROOT, 'vendor', 'scuba');
const MANIFEST = path.join(VENDOR_DIR, 'MANIFEST.json');

const SOURCES = [
  {
    platformId: 'google-workspace',
    repo: 'cisagov/ScubaGoggles',
    sha: '95d80462699e469b569e5b5caf921c4b8c6c884a',
    baselinesPath: 'scubagoggles/baselines',
    vendorDirName: 'scubagoggles',
    licenseId: 'CC0-1.0'
  },
  {
    platformId: 'microsoft-365',
    repo: 'cisagov/ScubaGear',
    sha: 'd7cf55f53fcc7faddde61086581b06da86a8da1d',
    baselinesPath: 'PowerShell/ScubaGear/baselines',
    vendorDirName: 'scubagear',
    licenseId: 'CC0-1.0'
  }
];

const EXCLUDED_FILES = new Set(['README.md', 'removedpolicies.md']);

if (!process.argv.includes('--update')) {
  console.error('This tool re-fetches vendored upstream content. Run with --update to confirm.');
  process.exit(1);
}

const fetchText = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'csf_profile-vendor-scuba' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  return res.text();
};

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'csf_profile-vendor-scuba' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} fetching ${url}`);
  return res.json();
};

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

// Independent census: count policy headings by regex, deliberately NOT via
// the parser. The contract test compares the parser-derived bank count to
// this manifest census, so a parser that silently drops policies diverges
// from a number it did not produce.
const censusPolicies = (text) => {
  let count = 0;
  for (const line of text.split('\n')) {
    if (POLICY_HEADING.test(line.trim())) count++;
  }
  return count;
};

const retrievedAt = new Date().toISOString().slice(0, 10);
const manifestSources = [];

for (const source of SOURCES) {
  const listing = await fetchJson(
    `https://api.github.com/repos/${source.repo}/contents/${source.baselinesPath}?ref=${source.sha}`
  );
  const names = listing
    .filter((e) => e.type === 'file' && e.name.endsWith('.md') && !EXCLUDED_FILES.has(e.name))
    .map((e) => e.name)
    .sort();

  const outDir = path.join(VENDOR_DIR, source.vendorDirName, source.sha, 'baselines');
  fs.rmSync(path.join(VENDOR_DIR, source.vendorDirName), { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const files = {};
  let policyCount = 0;
  for (const name of names) {
    const text = await fetchText(
      `https://raw.githubusercontent.com/${source.repo}/${source.sha}/${source.baselinesPath}/${name}`
    );
    fs.writeFileSync(path.join(outDir, name), text);
    files[`${source.vendorDirName}/${source.sha}/baselines/${name}`] = sha256(text);
    policyCount += censusPolicies(text);
    console.log(`  ${source.repo}@${source.sha.slice(0, 7)} ${name} (${censusPolicies(text)} policies)`);
  }

  manifestSources.push({
    platformId: source.platformId,
    repo: source.repo,
    sha: source.sha,
    baselinesPath: source.baselinesPath,
    licenseId: source.licenseId,
    policyCensus: policyCount,
    files
  });
  console.log(`${source.repo}: ${names.length} files, ${policyCount} policies (census)`);
}

// The CC0 text ships alongside the vendored content. Both upstream repos
// carry a verbatim CC0-1.0 LICENSE at repo root.
const licenseText = await fetchText(
  `https://raw.githubusercontent.com/${SOURCES[0].repo}/${SOURCES[0].sha}/LICENSE`
);
fs.writeFileSync(path.join(VENDOR_DIR, 'LICENSE-CC0-1.0.txt'), licenseText);

const manifest = {
  manifestFormat: 'scuba-vendor-v1',
  parserVersion: PARSER_VERSION,
  licenseSchemaVersion: LICENSE_SCHEMA_VERSION,
  retrievedAt,
  note:
    'Baseline TEXT only is imported (plan §6 item 3). The upstream repos vendor ' +
    'third-party dependencies under their own licenses; per-file license detection ' +
    '(src/utils/scubaBaseline.mjs), never the repo-level CC0 label, decides what each ' +
    'record stamps. removedpolicies.md (deprecated policies) and README.md are excluded.',
  sources: manifestSources
};

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${MANIFEST}`);
