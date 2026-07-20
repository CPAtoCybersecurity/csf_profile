/**
 * Contract suite for the generated 800-53 -> CSF 2.0 subcategory map and its
 * signature-keyed review queue (plan §7 R-2; PR-4). Drift against the inputs
 * is caught by CI running `node scripts/generate-subcategory-map.mjs
 * --check`; this suite guards the contract PR-5 will consume, pins the
 * measured actuals at the pinned OLIR release, and proves the load-bearing
 * polarity paths through the PRODUCTION join (deriveMapping), not a
 * re-implementation.
 *
 * Measured at OLIR "CSF 2.0 Final" (CPRT bulk download, retrieved
 * 2026-07-20), lane SP 800-53 Rev 5.2.0, bank 9f530721501fd1f0: every number
 * pinned below reproduced the plan's Rev 5.1.1 measurements exactly.
 */
import fs from 'fs';
import path from 'path';
import map from './platformSubcategoryMap.json';
import bank from './platformProcedures.json';
import community from './communityProcedures.json';
import {
  GENERATOR_VERSION,
  PINNED_LANE,
  JUSTIFICATION,
  deriveMapping,
  signatureOf
} from '../utils/subcategoryMapping.mjs';

const ROOT = path.resolve(__dirname, '..', '..');
const OLIR_DIR = path.join(ROOT, 'vendor', 'olir');
const olirManifest = JSON.parse(fs.readFileSync(path.join(OLIR_DIR, 'MANIFEST.json'), 'utf8'));
const converted = JSON.parse(
  fs.readFileSync(
    path.join(OLIR_DIR, Object.keys(olirManifest.files).find((f) => f.endsWith('csf2-sp80053-refs.json'))),
    'utf8'
  )
);
const overrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'mapping-overrides.json'), 'utf8'));
const queue = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'mapping-review-queue.json'), 'utf8'));

const entries = Object.values(map.policies);
const allPairs = entries.flatMap((e) => e.pairs);
const derivedPairs = allPairs.filter((p) => p.provenance === 'derived');

describe('platformSubcategoryMap.json (generated mapping artifact)', () => {
  describe('envelope', () => {
    test('carries mapFormat, a content-hash mapVersion, and the generator version', () => {
      expect(map.mapFormat).toBe('platform-subcategory-map-v1');
      expect(map.mapVersion).toMatch(/^[0-9a-f]{16}$/);
      expect(map.generatorVersion).toBe(GENERATOR_VERSION);
    });

    test('Anti: carries NO top-level bankVersion key — the map is deliberately outside the unregistered-bank guard (no third-party text, IDs only; ISA G22 decision)', () => {
      expect('bankVersion' in map).toBe(false);
    });

    test('cross-artifact freshness: derivedFromBankVersion equals the shipped bank hash', () => {
      expect(map.derivedFromBankVersion).toBe(bank.bankVersion);
    });

    test('carries the §5 justification verbatim and the pinned OLIR lane', () => {
      expect(map.justification).toBe(JUSTIFICATION);
      expect(map.olir.lane).toBe(PINNED_LANE);
      expect(map.olir.sourceUrl).toBe(olirManifest.sourceUrl);
      expect(map.olir.retrievedAt).toBe(olirManifest.retrievedAt);
    });
  });

  describe('total coverage', () => {
    test('every bank policy appears in the map — exact key-set equality', () => {
      expect(Object.keys(map.policies).sort()).toEqual(Object.keys(bank.procedures).sort());
      expect(map.policyCount).toBe(265);
    });

    test('zero-mapping only via explicit empty-with-reason, never absent; at these pins the count is 0', () => {
      for (const e of entries) {
        expect(Array.isArray(e.pairs)).toBe(true);
        // A populated entry never carries emptyReason; an empty one must.
        expect('emptyReason' in e).toBe(e.pairs.length === 0);
        expect(typeof e.emptyReason === 'string' || e.pairs.length > 0).toBe(true);
      }
      expect(entries.filter((e) => e.pairs.length === 0)).toEqual([]);
    });

    test('every mapped subcategory exists in BOTH the OLIR universe and the community bank universe', () => {
      const olirUniverse = new Set(Object.keys(converted.subcategories));
      const appUniverse = new Set(Object.keys(community.procedures));
      for (const p of allPairs) {
        expect(olirUniverse.has(p.subcategoryId)).toBe(true);
        expect(appUniverse.has(p.subcategoryId)).toBe(true);
      }
    });

    test('the OLIR modern universe IS the app universe: 106 == 106, set-equal', () => {
      expect(Object.keys(converted.subcategories).sort()).toEqual(Object.keys(community.procedures).sort());
      expect(converted.subcategoryCount).toBe(106);
    });
  });

  describe('exact-count pins at the pinned release', () => {
    test('85 control-set signatures across 265 policies', () => {
      const sigs = new Set(entries.map((e) => e.signature));
      expect(sigs.size).toBe(85);
      expect(queue.signatureCount).toBe(85);
    });

    test('derived-pair grain distribution: exact 369 / subpart-truncated 84 / enh-fallback 402 (855 derived)', () => {
      const byGrain = derivedPairs.reduce(
        (acc, p) => ({ ...acc, [p.grain]: (acc[p.grain] || 0) + 1 }),
        {}
      );
      expect(byGrain).toEqual({ exact: 369, 'subpart-truncated': 84, 'enh-fallback': 402 });
      expect(derivedPairs.length).toBe(855);
    });

    test('authored pairs 90; overridden 0 (no overrides ratified yet); 945 total pairs', () => {
      expect(allPairs.filter((p) => p.provenance === 'authored').length).toBe(90);
      expect(allPairs.filter((p) => p.provenance === 'overridden').length).toBe(0);
      expect(allPairs.length).toBe(945);
    });

    test('every signature in the map matches its policy control set (production signatureOf)', () => {
      for (const [id, e] of Object.entries(map.policies)) {
        expect(e.signature).toBe(signatureOf(bank.procedures[id].nist80053));
      }
    });

    test('grain field appears exactly on derived pairs', () => {
      for (const p of allPairs) {
        expect('grain' in p).toBe(p.provenance === 'derived');
        expect('grainVias' in p).toBe(p.provenance === 'derived');
      }
    });

    test('every pair carries a valid provenance; the grain scalar is the finest key of the lossless grainVias multiset', () => {
      const GRAIN_ORDER = ['exact', 'subpart-truncated', 'enh-fallback'];
      for (const p of allPairs) {
        expect(['derived', 'authored', 'overridden']).toContain(p.provenance);
        if (p.provenance !== 'derived') continue;
        const keys = Object.keys(p.grainVias);
        expect(keys.length).toBeGreaterThan(0);
        const finest = GRAIN_ORDER.find((g) => keys.includes(g));
        expect(p.grain).toBe(finest);
        const viaCount = Object.values(p.grainVias).reduce((a, b) => a + b, 0);
        expect(viaCount).toBeGreaterThanOrEqual(1);
        expect(viaCount).toBeLessThanOrEqual(p.via.length);
      }
    });

    test('structural license exemption: the map carries only ID-shaped values, no third-party text (ISA G22 / advisor adoption)', () => {
      // The mapVersion naming keeps the file outside the unregistered-bank
      // guard; this pins the REASON — nothing here is licensable content.
      const CONTROL_SHAPE = /^[A-Z]{2}-\d+(\(\d+\))?(\(?[a-z]\)?)?\.?$/;
      const SUBCAT_SHAPE = /^[A-Z]{2}\.[A-Z]{2}-\d{2}$/;
      const PAIR_KEYS = new Set(['subcategoryId', 'provenance', 'via', 'grain', 'grainVias']);
      const ENTRY_KEYS = new Set(['policyId', 'platform', 'signature', 'pairs', 'emptyReason', 'overrideSource']);
      for (const e of entries) {
        for (const k of Object.keys(e)) expect(ENTRY_KEYS.has(k)).toBe(true);
        for (const c of e.signature.split('|')) expect(c).toMatch(CONTROL_SHAPE);
        for (const p of e.pairs) {
          for (const k of Object.keys(p)) expect(PAIR_KEYS.has(k)).toBe(true);
          expect(p.subcategoryId).toMatch(SUBCAT_SHAPE);
          for (const v of p.via || []) expect(v).toMatch(CONTROL_SHAPE);
        }
      }
    });
  });

  describe('rebuild-compare (jest analog of the CI --check drift gate)', () => {
    test('re-deriving from the committed inputs reproduces the committed policies exactly', () => {
      const rebuilt = deriveMapping({ procedures: bank.procedures, converted, overrides });
      expect(rebuilt.policies).toEqual(map.policies);
    });

    test('LANE EQUIVALENCE (measured fact pinned): Rev 5.1.1 derives the identical mapping at these pins', () => {
      const a = deriveMapping({ procedures: bank.procedures, converted, overrides });
      const b = deriveMapping({ procedures: bank.procedures, converted, overrides, lane: 'SP 800-53 Rev 5.1.1' });
      expect(b.policies).toEqual(a.policies);
    });
  });

  describe('gap-table polarity on the real corpus (production join)', () => {
    test('without the gap table, exactly 29 policies map to zero subcategories — the SI-8 spam-phishing surface among them', () => {
      const without = deriveMapping({
        procedures: bank.procedures,
        converted,
        overrides: { ...overrides, gapTable: {} }
      });
      expect(without.stats.emptyPolicies).toHaveLength(29);
      expect(without.stats.emptyPolicies).toEqual(queue.stats.zeroBeforeGapTable);
      expect(without.stats.emptyPolicies).toContain('GWS.GMAIL.18.1v1');
      expect(without.stats.emptyPolicies).toContain('MS.DEFENDER.2.1v1');
      expect(without.stats.emptyPolicies).toContain('MS.EXO.7.1v1');
    });

    test('removing ONLY the SI-8 row goes red: the spam surface un-maps while other gap rows still recover theirs', () => {
      const { 'SI-8': _dropped, ...gapWithoutSi8 } = overrides.gapTable;
      const without = deriveMapping({
        procedures: bank.procedures,
        converted,
        overrides: { ...overrides, gapTable: gapWithoutSi8 }
      });
      expect(without.stats.emptyPolicies).toContain('GWS.GMAIL.18.1v1');
      expect(without.stats.emptyPolicies).not.toContain('MS.AAD.4.1v1');
      // The shipped map has them recovered.
      expect(map.policies['gws.gmail.18.1v1'].pairs.length).toBeGreaterThan(0);
    });

    test('all four gap-table rows are load-bearing: 29 recovered, 0 still empty', () => {
      expect(queue.stats.zeroBeforeGapTableCount).toBe(29);
      expect(queue.stats.recoveredByGapTable).toBe(29);
      expect(queue.stats.emptyAfterGapTable).toBe(0);
      expect(Object.keys(overrides.gapTable).sort()).toEqual(['AC-21', 'AU-4', 'SC-15', 'SI-8']);
    });

    test('EVERY gap row is individually load-bearing: deleting any one re-opens specific policies (advisor adoption — no inert rows)', () => {
      const reopenedBy = {
        'SI-8': ['GWS.GMAIL.18.1v1', 'MS.DEFENDER.2.1v1'],
        'SC-15': ['GWS.MEET.4.1v1', 'MS.TEAMS.1.2v2'],
        'AC-21': ['MS.TEAMS.1.7v2'],
        'AU-4': ['MS.AAD.4.1v1']
      };
      for (const [control, expectedReopened] of Object.entries(reopenedBy)) {
        const { [control]: _dropped, ...gapWithout } = overrides.gapTable;
        const without = deriveMapping({
          procedures: bank.procedures,
          converted,
          overrides: { ...overrides, gapTable: gapWithout }
        });
        for (const pid of expectedReopened) {
          expect(without.stats.emptyPolicies).toContain(pid);
        }
        expect(without.stats.emptyPolicies.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('mapping-review-queue.json (ratification workpaper)', () => {
  test('envelope: queueVersion hash, §5 justification verbatim, workpaper-not-gate role', () => {
    expect(queue.queueFormat).toBe('mapping-review-queue-v1');
    expect(queue.queueVersion).toMatch(/^[0-9a-f]{16}$/);
    expect(queue.justification).toBe(JUSTIFICATION);
    expect(queue.role).toMatch(/not a shipping gate/);
    expect(queue.role).toMatch(/cap is retired/);
    expect(queue.derivedFromBankVersion).toBe(bank.bankVersion);
  });

  test('signature entries: member counts sum to 265; controls match the key; assertions carried for one-sitting review', () => {
    const sigs = Object.entries(queue.signatures);
    expect(sigs).toHaveLength(85);
    expect(sigs.reduce((n, [, s]) => n + s.members.length, 0)).toBe(265);
    for (const [sig, s] of sigs) {
      expect(s.controls.join('|')).toBe(sig);
      for (const m of s.members) {
        expect(m.policyId).toBe(bank.procedures[m.policyId.toLowerCase()].policyId);
        expect(m.assertion.length).toBeGreaterThan(0);
      }
    }
  });

  test('with no ratified overrides, every signature ships as-is (queue semantics: workpaper, not gate)', () => {
    for (const s of Object.values(queue.signatures)) {
      expect(s.overrideStatus).toBe('ships-as-is');
    }
  });

  test('queue pairs are consistent with the map: each signature entry equals a non-overridden member policy entry (analyzer adoption — closes the script-only assembly blind spot)', () => {
    for (const [sig, s] of Object.entries(queue.signatures)) {
      const member = s.members
        .map((m) => map.policies[m.policyId.toLowerCase()])
        .find((e) => e.overrideSource !== 'policy');
      expect(member).toBeDefined();
      expect(member.signature).toBe(sig);
      expect(s.pairs).toEqual(member.pairs);
    }
  });

  test('fan-out stats pinned (unranked, cap retired): derived-only median 3 / mean 3.23 / p90 6 / max 13; final incl. authored mean 3.57 / p90 7', () => {
    expect(queue.stats.fanoutBeforeGapTable).toEqual({ median: 3, mean: 3.23, p90: 6, max: 13 });
    expect(queue.stats.fanout).toEqual({ median: 3, mean: 3.57, p90: 7, max: 13 });
  });

  test('Anti: nothing under src/ imports the review queue', () => {
    const walk = (dir) =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? walk(p) : [p];
      });
    const offenders = walk(path.join(ROOT, 'src')).filter(
      (f) => /\.(js|mjs|jsx|ts|tsx)$/.test(f) &&
        !f.endsWith('platformSubcategoryMap.test.js') &&
        fs.readFileSync(f, 'utf8').includes('mapping-review-queue')
    );
    expect(offenders).toEqual([]);
  });
});
