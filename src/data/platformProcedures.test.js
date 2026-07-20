/**
 * Contract suite for the generated platform-procedure bank (plan §7 PR-3),
 * mirroring communityProcedures.test.js. Drift against vendor/scuba/ is
 * caught by CI running `node scripts/generate-platform-bank.mjs --check`
 * (and vendored-tree tampering by scripts/verify-vendor-integrity.mjs);
 * this suite guards the contract the app and the license machinery rely on.
 *
 * License assertions run through the PRODUCTION schema (recordLicense /
 * requiresAttribution / attributionComplete / validateLicensedRecords from
 * PR-2) — the same code path the notices CI gate and the generator execute,
 * not a re-implementation.
 */
import fs from 'fs';
import path from 'path';
import bank from './platformProcedures.json';
import { PARSER_VERSION, POLICY_HEADING } from '../utils/scubaBaseline.mjs';
import {
  LICENSE_SCHEMA_VERSION,
  recordLicense,
  requiresAttribution,
  attributionComplete,
  ATTRIBUTION,
  PUBLIC_DOMAIN
} from '../utils/licenseClass.mjs';
import { validateLicensedRecords, isCisaSourced } from '../utils/thirdPartyNotices.mjs';
import { sanitizeInput } from '../utils/sanitize';

const PLATFORM_POLICY_ID = /^(gws|ms)\.[a-z0-9]+\.\d+\.\d+v\d+$/;
const ids = Object.keys(bank.procedures);
const records = ids.map((id) => bank.procedures[id]);
const VENDOR_DIR = path.resolve(__dirname, '..', '..', 'vendor', 'scuba');

describe('platformProcedures.json (generated bank)', () => {
  describe('bank envelope', () => {
    test('carries bankFormat, a content-hash bankVersion, and an accurate count', () => {
      expect(bank.bankFormat).toBe('platform-procedures-v1');
      expect(bank.bankVersion).toMatch(/^[0-9a-f]{16}$/);
      expect(bank.procedureCount).toBe(ids.length);
    });

    test('stamps the parser + license-schema versions that produced it (entry condition 3)', () => {
      expect(bank.parserVersion).toBe(PARSER_VERSION);
      expect(bank.licenseSchemaVersion).toBe(LICENSE_SCHEMA_VERSION);
    });

    test('exact census at the pinned SHAs: 137 GWS + 128 M365 = 265', () => {
      expect(ids.length).toBe(265);
      const byPlatform = records.reduce(
        (acc, r) => ({ ...acc, [r.platform]: (acc[r.platform] || 0) + 1 }),
        {}
      );
      expect(byPlatform).toEqual({ 'google-workspace': 137, 'microsoft-365': 128 });
    });

    test('record count matches an INDEPENDENT census of the vendored files', () => {
      // Counted here by regex over vendor/scuba/, not via the parser — a
      // parser that silently drops policies diverges from this number.
      const manifest = JSON.parse(fs.readFileSync(path.join(VENDOR_DIR, 'MANIFEST.json'), 'utf8'));
      let census = 0;
      for (const source of manifest.sources) {
        for (const relPath of Object.keys(source.files)) {
          const text = fs.readFileSync(path.join(VENDOR_DIR, relPath), 'utf8');
          for (const line of text.split('\n')) {
            if (POLICY_HEADING.test(line.trim())) census++;
          }
        }
      }
      expect(ids.length).toBe(census);
    });

    test('the MANIFEST census agrees and stamps the same versions', () => {
      const manifest = JSON.parse(fs.readFileSync(path.join(VENDOR_DIR, 'MANIFEST.json'), 'utf8'));
      const manifestCensus = manifest.sources.reduce((n, s) => n + s.policyCensus, 0);
      expect(manifestCensus).toBe(ids.length);
      expect(manifest.parserVersion).toBe(PARSER_VERSION);
      expect(manifest.licenseSchemaVersion).toBe(LICENSE_SCHEMA_VERSION);
    });

    test('removedpolicies.md is not vendored — deprecated policies are not procedures', () => {
      const manifest = JSON.parse(fs.readFileSync(path.join(VENDOR_DIR, 'MANIFEST.json'), 'utf8'));
      const allFiles = manifest.sources.flatMap((s) => Object.keys(s.files));
      expect(allFiles.some((f) => f.includes('removedpolicies'))).toBe(false);
      expect(allFiles.some((f) => f.endsWith('README.md'))).toBe(false);
    });
  });

  describe('record shape (reference-shaped, R-3)', () => {
    test('every key is a lowercased platform policy ID matching its record', () => {
      for (const id of ids) {
        expect(id).toMatch(PLATFORM_POLICY_ID);
        expect(bank.procedures[id].id).toBe(id);
        expect(bank.procedures[id].policyId.toLowerCase()).toBe(id);
      }
    });

    test('every record carries the upstream facts: assertion, obligation, rationale, lastModified, group, instructions', () => {
      for (const r of records) {
        expect(r.assertion).toBeTruthy();
        expect(['SHALL', 'SHALL NOT', 'SHOULD', 'SHOULD NOT', 'MAY']).toContain(r.obligation);
        expect(r.rationale).toBeTruthy();
        expect(r.lastModified).toBeTruthy();
        expect(r.group).toBeTruthy();
        expect(r.groupNumber).toBeGreaterThan(0);
        expect(r.instructions).toBeTruthy();
      }
    });

    test('100% NIST SP 800-53 coverage at the pinned SHAs (265/265 measured)', () => {
      const missing = records.filter((r) => !Array.isArray(r.nist80053) || r.nist80053.length === 0);
      expect(missing.map((r) => r.policyId)).toEqual([]);
    });

    test('mitreAttack IDs are normalized dot-form technique IDs (21 upstream "None" mappings are empty)', () => {
      for (const r of records) {
        for (const t of r.mitreAttack) expect(t).toMatch(/^T\d+(\.\d+)?$/);
      }
      expect(records.filter((r) => r.mitreAttack.length === 0).length).toBe(21);
    });

    test('Anti: no record carries a subcategories field — mapping is PR-4 (§7 R-2)', () => {
      expect(records.filter((r) => 'subcategories' in r)).toEqual([]);
    });

    test('Anti: no record claims readOnly/privilegeRequired — the vendored text states neither (R-10)', () => {
      expect(records.filter((r) => 'readOnly' in r || 'privilegeRequired' in r)).toEqual([]);
    });
  });

  describe('license stamping (PR-2 schema; entry conditions 1-2)', () => {
    test('every record carries a RAW license string and declared obligation components', () => {
      for (const r of records) {
        expect(typeof r.license).toBe('string');
        expect(r.license.length).toBeGreaterThan(0);
        expect(r.licenseObligations).toBeDefined();
        expect(Array.isArray(r.licenseObligations.noticeText)).toBe(true);
      }
    });

    test('Anti: no record stamps the computed classification join (no licenseClass key)', () => {
      expect(records.filter((r) => 'licenseClass' in r)).toEqual([]);
    });

    test('all 128 M365 records derive attribution-class (recordLicense, production path)', () => {
      const m365 = records.filter((r) => r.platform === 'microsoft-365');
      expect(m365.length).toBe(128);
      for (const r of m365) {
        const { licenseClass, obligations } = recordLicense(r);
        expect(licenseClass).toBe(ATTRIBUTION);
        expect(obligations.attribution).toBe(true);
        expect(obligations.changeIndication).toBe(true);
        expect(obligations.noDerivatives).toBe(false);
      }
    });

    test('all 137 GWS records derive public-domain (recordLicense, production path)', () => {
      const gws = records.filter((r) => r.platform === 'google-workspace');
      expect(gws.length).toBe(137);
      for (const r of gws) {
        const { licenseClass, obligations } = recordLicense(r);
        expect(licenseClass).toBe(PUBLIC_DOMAIN);
        expect(obligations.attribution).toBe(false);
        expect(obligations.noDerivatives).toBe(false);
      }
    });

    test('every record — attribution-obligated or not — carries a COMPLETE 5-field attribution block', () => {
      for (const r of records) {
        expect(attributionComplete(r)).toBe(true);
        expect(r.attribution.sourceUrl).toContain(r.attribution.upstream.sha);
        expect(r.attribution.upstream.repo).toMatch(/^cisagov\//);
        expect(r.attribution.upstream.path).toBeTruthy();
        expect(r.attribution.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    test('every attribution-OBLIGATED record satisfies the production gate pairing', () => {
      const obligated = records.filter((r) => requiresAttribution(r));
      expect(obligated.length).toBe(128);
      for (const r of obligated) expect(attributionComplete(r)).toBe(true);
    });

    test('the CISA disclaimer triggers BOTH ways: structural provenance and declared notice key', () => {
      for (const r of records) {
        expect(isCisaSourced(r)).toBe(true);
        expect(r.licenseObligations.noticeText).toContain('cisa-no-endorsement');
      }
    });

    test('the real bank passes the production validation gate with zero errors', () => {
      expect(validateLicensedRecords([{ name: 'platform', records: bank.procedures }])).toEqual([]);
    });

    test('POLARITY: a reference-only record is REFUSED by the production validation gate', () => {
      const poisoned = {
        ...bank.procedures[ids[0]],
        license: 'CC BY-NC-SA 4.0'
      };
      const errors = validateLicensedRecords([{ name: 'platform', records: { [ids[0]]: poisoned } }]);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('reference-only');
    });

    test('POLARITY: an attribution-incomplete record fails the production validation gate', () => {
      const first = bank.procedures['ms.aad.1.1v1'];
      const poisoned = { ...first, attribution: { ...first.attribution, retrievedAt: '' } };
      const errors = validateLicensedRecords([{ name: 'platform', records: { 'ms.aad.1.1v1': poisoned } }]);
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('retrievedAt');
    });
  });

  describe('sanitizer round-trip — REAL, per record, per text field', () => {
    // The app routes every stored testProcedures write through
    // sanitizeInput (DOMPurify, ALLOWED_TAGS: []). Generation normalizes to
    // a fixpoint of that sanitizer, so attaching platform text in PR-5 is
    // byte-lossless. This is the actual production sanitizer — not the
    // community bank's proxy regex.
    const TEXT_FIELDS = ['assertion', 'rationale', 'note', 'details', 'instructions', 'productLicenseNotes', 'group'];

    test('sanitizeInput(field) === field for every text field of every record', () => {
      const offenders = [];
      for (const r of records) {
        for (const f of TEXT_FIELDS) {
          if (r[f] !== undefined && sanitizeInput(r[f]) !== r[f]) offenders.push(`${r.id}.${f}`);
        }
      }
      expect(offenders).toEqual([]);
    });

    test('the round-trip test is not vacuous: the sanitizer DOES mutate un-normalized upstream shapes', () => {
      // A raw upstream fragment (placeholder token + tag) — the exact class
      // the normalization exists for. If sanitizeInput passed this through,
      // the suite above would prove nothing.
      expect(sanitizeInput('Enter your <domain> here')).not.toContain('<domain>');
      expect(sanitizeInput('<b>bold</b>')).toBe('bold');
    });
  });

  describe('drift and tamper guards, promoted into jest (test-analyzer round)', () => {
    // A hand-edit to a record in the committed JSON passes every count,
    // license, and fixpoint test — regeneration compare is the only defense.
    // CI runs `generate-platform-bank.mjs --check`; this is the same
    // guarantee through the SAME parser, repeatable in jest.
    test('the committed bank equals a fresh parse of the vendored tree (record grain)', () => {
      const manifest = JSON.parse(fs.readFileSync(path.join(VENDOR_DIR, 'MANIFEST.json'), 'utf8'));
      const { parseBaselineFile } = require('../utils/scubaBaseline.mjs');
      const rebuilt = {};
      for (const source of manifest.sources) {
        for (const relPath of Object.keys(source.files).sort()) {
          const text = fs.readFileSync(path.join(VENDOR_DIR, relPath), 'utf8');
          for (const record of parseBaselineFile(text, {
            platformId: source.platformId,
            repo: source.repo,
            sha: source.sha,
            baselinesPath: source.baselinesPath,
            retrievedAt: manifest.retrievedAt,
            fileName: path.basename(relPath),
            sourcePath: `vendor/scuba/${relPath}`,
            licenseId: source.licenseId
          })) {
            rebuilt[record.id] = record;
          }
        }
      }
      expect(bank.procedures).toEqual(rebuilt);
    });

    test('every vendored file matches its MANIFEST sha256 pin (tamper guard, jest grain)', () => {
      const crypto = require('crypto');
      const manifest = JSON.parse(fs.readFileSync(path.join(VENDOR_DIR, 'MANIFEST.json'), 'utf8'));
      const mismatches = [];
      for (const source of manifest.sources) {
        for (const [relPath, expected] of Object.entries(source.files)) {
          const actual = crypto
            .createHash('sha256')
            .update(fs.readFileSync(path.join(VENDOR_DIR, relPath)))
            .digest('hex');
          if (actual !== expected) mismatches.push(relPath);
        }
      }
      expect(mismatches).toEqual([]);
    });

    test('POLARITY: the sha256 comparison detects a one-byte change', () => {
      const crypto = require('crypto');
      const manifest = JSON.parse(fs.readFileSync(path.join(VENDOR_DIR, 'MANIFEST.json'), 'utf8'));
      const [relPath, expected] = Object.entries(manifest.sources[0].files)[0];
      const tampered = Buffer.concat([fs.readFileSync(path.join(VENDOR_DIR, relPath)), Buffer.from('X')]);
      expect(crypto.createHash('sha256').update(tampered).digest('hex')).not.toBe(expected);
    });
  });

  describe('normalization conversion evidence — converted, not deleted (test-analyzer round)', () => {
    // The fixpoint test cannot distinguish converted content from deleted
    // content (deletion is also a fixpoint). These pin the measured
    // conversion outputs in the real corpus at the pinned SHAs, so a
    // normalizer regression that deletes instead of converts goes red.
    const fieldText = (r) =>
      ['assertion', 'rationale', 'note', 'details', 'instructions', 'productLicenseNotes']
        .map((f) => r[f] || '')
        .join('\n');

    test('exactly 18 records carry a fenced code block (converted <pre> click-paths)', () => {
      expect(records.filter((r) => fieldText(r).includes('```')).length).toBe(18);
    });

    test('exactly 227 records carry markdown bold (converted <b> emphasis and native **)', () => {
      expect(records.filter((r) => /\*\*/.test(fieldText(r))).length).toBe(227);
    });

    test('exactly 25 records carry inline code outside fences (converted placeholder tokens and <code>)', () => {
      const inlineCode = /`[^`\n]+`/;
      expect(
        records.filter((r) => inlineCode.test(fieldText(r).replace(/```[\s\S]*?```/g, ''))).length
      ).toBe(25);
    });

    test('exactly 128 records carry productLicenseNotes (every M365 record, no GWS record)', () => {
      const withNotes = records.filter((r) => r.productLicenseNotes);
      expect(withNotes.length).toBe(128);
      expect(withNotes.every((r) => r.platform === 'microsoft-365')).toBe(true);
    });

    test('GOLDEN spot-check: ms.aad.1.1v1 instructions carry the fenced Conditional Access click-path', () => {
      const instructions = bank.procedures['ms.aad.1.1v1'].instructions;
      // The upstream <pre> block became a fence; the <b> tags inside it were
      // dropped (emphasis renders literally inside fences); the click-path
      // text itself survives verbatim.
      expect(instructions).toContain('```\n  Users > Include > All users');
      expect(instructions).toContain('Access controls > Grant > Block Access\n```');
      expect(instructions).not.toContain('<pre>');
      expect(instructions).not.toContain('<b>');
    });
  });

  describe('reserved-name fence: productLicenseNotes never reaches an egress surface', () => {
    test('no src/ file outside the platform lane references productLicenseNotes', () => {
      const SRC = path.resolve(__dirname, '..');
      const ALLOWED = new Set([
        path.join('utils', 'scubaBaseline.mjs'),
        path.join('utils', 'scubaBaseline.test.js'),
        path.join('utils', 'licenseClass.mjs'), // reserves the name in docs
        path.join('data', 'platformProcedures.json'),
        path.join('data', 'platformProcedures.test.js')
      ]);
      const offenders = [];
      const walk = (dir) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          const p = path.join(dir, e.name);
          if (e.isDirectory()) { walk(p); continue; }
          if (!/\.(js|jsx|mjs|json)$/.test(e.name)) continue;
          const rel = path.relative(SRC, p);
          if (ALLOWED.has(rel)) continue;
          if (fs.readFileSync(p, 'utf8').includes('productLicenseNotes')) offenders.push(rel);
        }
      };
      walk(SRC);
      expect(offenders).toEqual([]);
    });
  });
});
