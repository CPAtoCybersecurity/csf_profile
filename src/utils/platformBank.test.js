/**
 * Platform bank reference machinery + THE expansion choke point (plan §7
 * R-3/R-9; PR-5).
 *
 * Every expansion assertion here executes expandProcedureText — the
 * PRODUCTION render path (the detail panel, the JSON share transform, and
 * all four CSV/Jira egresses call this exact function) — never a
 * re-implementation (standing doctrine, G19).
 *
 * Decorrelation fixtures target the named mutant classes:
 *  - negative-guard COW: an implementation that treats corpus-lookup FAILURE
 *    as "concrete value" renders nothing for an unresolvable ref — the
 *    placeholder assertions kill it; one that treats lookup SUCCESS as
 *    "render corpus text" for a fork loses the user's edit — the
 *    fork-beats-corpus fixture kills it.
 *  - placeholder-dropping: silent-drop and throw are both asserted against.
 */
import bank from '../data/platformProcedures.json';
import subcategoryMap from '../data/platformSubcategoryMap.json';
import {
  PLATFORM_CORPUS_ID,
  PLATFORM_CORPUS_VERSION,
  getPlatformRecord,
  getPlatformProcedures,
  platformRecordContentHash,
  buildPlatformRef,
  forkPlatformProcedure,
  isPlatformFork,
  unresolvedRefPlaceholder,
  expandProcedureText,
  platformLabel,
  platformRefDrift
} from './platformBank';
import { CISA_DISCLAIMER } from './thirdPartyNotices.mjs';

const REAL_POLICY = 'ms.aad.1.1v1'; // CC0+CC-BY M365 record: attribution + notice obligations
const realRecord = bank.procedures[REAL_POLICY];
const realRef = () => buildPlatformRef(realRecord);

describe('corpus identity + freshness', () => {
  test('cross-artifact freshness pin: the committed map derives from the committed bank', () => {
    expect(subcategoryMap.derivedFromBankVersion).toBe(bank.bankVersion);
    expect(PLATFORM_CORPUS_VERSION).toBe(bank.bankVersion);
  });

  test('positive lookup: real (corpusId, policyId) resolves; anything else is null', () => {
    expect(getPlatformRecord(PLATFORM_CORPUS_ID, REAL_POLICY)).toBe(realRecord);
    expect(getPlatformRecord(PLATFORM_CORPUS_ID, 'gws.withdrawn.9.9v9')).toBeNull();
    expect(getPlatformRecord('myctrl', REAL_POLICY)).toBeNull(); // foreign corpus
    expect(getPlatformRecord(undefined, REAL_POLICY)).toBeNull();
    expect(getPlatformRecord(PLATFORM_CORPUS_ID, undefined)).toBeNull();
  });
});

describe('getPlatformProcedures — runtime map inversion, unranked', () => {
  const BOTH = ['google-workspace', 'microsoft-365'];

  test('exact reverse-cardinality pins re-derived at the committed map', () => {
    // Derived + authored pairs, both platforms — these sizes are WHY the
    // compose-into-text model is dead and references are mandatory (R-3).
    expect(getPlatformProcedures('PR.DS-10', BOTH)).toHaveLength(122);
    expect(getPlatformProcedures('DE.CM-01', BOTH)).toHaveLength(117);
    expect(getPlatformProcedures('PR.DS-01', BOTH)).toHaveLength(95);
    expect(getPlatformProcedures('PR.DS-02', BOTH)).toHaveLength(94);
  });

  test('platform filter partitions exactly (per-platform counts sum to both-platform count)', () => {
    const gws = getPlatformProcedures('PR.DS-10', ['google-workspace']);
    const m365 = getPlatformProcedures('PR.DS-10', ['microsoft-365']);
    expect(gws.length + m365.length).toBe(122);
    expect(gws.every((o) => o.record.platform === 'google-workspace')).toBe(true);
    expect(m365.every((o) => o.record.platform === 'microsoft-365')).toBe(true);
  });

  test('unknown subcategory / empty platform scope offer nothing', () => {
    expect(getPlatformProcedures('ZZ.ZZ-99', BOTH)).toEqual([]);
    expect(getPlatformProcedures('PR.DS-10', [])).toEqual([]);
    expect(getPlatformProcedures('PR.DS-10', undefined)).toEqual([]);
    expect(getPlatformProcedures(null, BOTH)).toEqual([]);
  });

  test('unranked: offers ride in committed-map key order, no ordering logic', () => {
    const offers = getPlatformProcedures('PR.DS-10', BOTH).map((o) => o.policyId);
    const mapOrder = Object.entries(subcategoryMap.policies)
      .filter(([, e]) => e.pairs.some((p) => p.subcategoryId === 'PR.DS-10'))
      .map(([id]) => id);
    expect(offers).toEqual(mapOrder);
  });

  test('offers pass the pair through — grainVias is the rank/filter surface', () => {
    const offers = getPlatformProcedures('DE.CM-01', BOTH);
    offers.forEach((o) => {
      expect(o.corpusId).toBe(PLATFORM_CORPUS_ID);
      expect(o.record).toBe(bank.procedures[o.policyId]);
      expect(o.pair.subcategoryId).toBe('DE.CM-01');
    });
    // Derived pairs carry grainVias (G22 ISC-828 contract); authored pairs
    // have no grain axis at all — both shapes pass through untouched.
    const derived = offers.filter((o) => o.pair.provenance === 'derived');
    const rest = offers.filter((o) => o.pair.provenance !== 'derived');
    expect(derived.length).toBeGreaterThan(0);
    expect(rest.length).toBeGreaterThan(0);
    expect(derived.every((o) => o.pair.grainVias && o.pair.grain)).toBe(true);
    expect(rest.every((o) => o.pair.provenance === 'authored')).toBe(true);
  });
});

describe('reference shape + content hash', () => {
  test('buildPlatformRef is exactly {corpusId, corpusVersion, policyId, contentHash}', () => {
    const ref = realRef();
    expect(Object.keys(ref).sort()).toEqual([
      'contentHash',
      'corpusId',
      'corpusVersion',
      'policyId'
    ]);
    expect(ref.corpusId).toBe(PLATFORM_CORPUS_ID);
    expect(ref.corpusVersion).toBe(bank.bankVersion);
    expect(ref.policyId).toBe(REAL_POLICY);
    expect(ref.contentHash).toMatch(/^[0-9a-f]{16}$/);
  });

  test('contentHash is deterministic and content-sensitive', () => {
    expect(platformRecordContentHash(realRecord)).toBe(platformRecordContentHash(realRecord));
    const revised = { ...realRecord, assertion: `${realRecord.assertion} (revised)` };
    expect(platformRecordContentHash(revised)).not.toBe(platformRecordContentHash(realRecord));
    // Metadata-only changes (attribution refresh, vendoring layout) do NOT
    // re-fingerprint content — the ref means "this substance", not this path.
    const relocated = { ...realRecord, sourcePath: 'vendor/elsewhere/aad.md' };
    expect(platformRecordContentHash(relocated)).toBe(platformRecordContentHash(realRecord));
  });
});

describe('expandProcedureText — the choke point (production render path)', () => {
  test('no platform entries: trunk returns byte-identical (pinned pass-through)', () => {
    const trunk = '## Trunk text\n\nExamine the things.';
    expect(expandProcedureText({ testProcedures: trunk })).toBe(trunk);
    expect(
      expandProcedureText({ testProcedures: trunk, platformProcedures: [] })
    ).toBe(trunk);
    expect(
      expandProcedureText({
        testProcedures: trunk,
        procedureSource: { bank: 'community', bankId: 'GV.OC-01', modified: true }
      })
    ).toBe(trunk); // community trunk carries no changeIndication obligation
  });

  test('total on junk: null/undefined/non-object/non-string never throw', () => {
    expect(expandProcedureText(null)).toBe('');
    expect(expandProcedureText(undefined)).toBe('');
    expect(expandProcedureText({})).toBe('');
    expect(expandProcedureText({ testProcedures: 42 })).toBe('');
  });

  test('resolvable ref expands CURRENT corpus text with attribution asserted from provenance', () => {
    const out = expandProcedureText({
      testProcedures: 'Trunk first.',
      platformProcedures: [realRef()]
    });
    expect(out.startsWith('Trunk first.')).toBe(true);
    expect(out).toContain('---');
    expect(out).toContain(`**Platform procedure — ${realRecord.policyId} (Microsoft 365)**`);
    expect(out).toContain(realRecord.assertion);
    expect(out).toContain(realRecord.instructions);
    // R-9: attribution re-asserted at the egress, from the corpus record
    expect(out).toContain(realRecord.attribution.attributionText);
    expect(out).toContain(`License: ${realRecord.license}.`);
    // notice obligation rides the expansion (once per output)
    expect(out).toContain(CISA_DISCLAIMER);
    expect(out.split(CISA_DISCLAIMER)).toHaveLength(2);
  });

  test('notice emitted once even when several notice-bearing addenda expand', () => {
    const other = bank.procedures['ms.aad.2.1v1'] || bank.procedures[REAL_POLICY];
    const out = expandProcedureText({
      testProcedures: 't',
      platformProcedures: [realRef(), buildPlatformRef(other)]
    });
    expect(out.split(CISA_DISCLAIMER)).toHaveLength(2);
  });

  test('unresolvable ref renders the explicit identity-carrying placeholder — never a silent drop, never a throw', () => {
    const withdrawn = { ...realRef(), policyId: 'ms.aad.99.9v9' };
    const foreign = { ...realRef(), corpusId: 'myctrl' };
    [withdrawn, foreign].forEach((ref) => {
      const out = expandProcedureText({ testProcedures: 'Trunk.', platformProcedures: [ref] });
      expect(out).not.toBe('Trunk.'); // not silently dropped
      expect(out).toContain('Unresolved platform procedure reference');
      expect(out).toContain(ref.policyId); // identity travels
      expect(out).toContain(ref.corpusVersion);
      expect(out).toContain(ref.contentHash);
    });
  });

  test('placeholder helper itself carries all three identity fields', () => {
    const ref = { corpusId: 'x', corpusVersion: 'v', policyId: 'p.1v1', contentHash: 'abc123' };
    const text = unresolvedRefPlaceholder(ref);
    expect(text).toContain('p.1v1');
    expect(text).toContain('x');
    expect(text).toContain('v');
    expect(text).toContain('abc123');
  });

  test('resolvable and unresolvable refs coexist: both blocks render, order preserved', () => {
    const out = expandProcedureText({
      testProcedures: 'Trunk.',
      platformProcedures: [realRef(), { ...realRef(), policyId: 'gone.1v1' }]
    });
    expect(out).toContain(realRecord.assertion);
    expect(out).toContain('Unresolved platform procedure reference');
    expect(out.indexOf(realRecord.assertion)).toBeLessThan(
      out.indexOf('Unresolved platform procedure reference')
    );
  });
});

describe('copy-on-write forks (production render path)', () => {
  test('forkPlatformProcedure produces the concrete provenance-flagged value', () => {
    const fork = forkPlatformProcedure(realRef(), 'My edited addendum text.');
    expect(fork.corpusId).toBe(PLATFORM_CORPUS_ID);
    expect(fork.corpusVersion).toBe(bank.bankVersion);
    expect(fork.policyId).toBe(REAL_POLICY);
    expect(fork.contentHash).toBe(realRef().contentHash);
    expect(fork.text).toBe('My edited addendum text.');
    expect(fork.modified).toBe(true);
    expect(typeof fork.forkedAt).toBe('string');
    expect(isPlatformFork(fork)).toBe(true);
    expect(isPlatformFork(realRef())).toBe(false);
  });

  test('COW polarity: forked entry renders the USER text (not corpus text) with flag-derived modification indication', () => {
    // Kills the negative-guard mutant in the truthy-lookup direction: the
    // corpus RESOLVES for this fork, yet the user's fork text must win.
    const fork = forkPlatformProcedure(realRef(), 'USER-FORKED addendum body.');
    const out = expandProcedureText({ testProcedures: 't', platformProcedures: [fork] });
    expect(out).toContain('USER-FORKED addendum body.');
    expect(out).not.toContain(realRecord.instructions);
    expect(out).toContain('modified from the referenced original');
    // attribution still re-asserts from the resolvable corpus record
    expect(out).toContain(realRecord.attribution.attributionText);
  });

  test('COW polarity, other direction: unedited entry stays a reference (corpus text current, storage ref-shaped)', () => {
    const ref = realRef();
    const out = expandProcedureText({ testProcedures: 't', platformProcedures: [ref] });
    expect(out).toContain(realRecord.instructions);
    expect(out).not.toContain('modified from the referenced original');
    expect(Object.keys(ref)).not.toContain('text'); // never became concrete
  });

  test('fork whose corpus vanished still renders the user text — nothing user-authored becomes unresolvable', () => {
    const orphan = { ...forkPlatformProcedure(realRef(), 'Survivor text.'), corpusId: 'gone-corpus' };
    const out = expandProcedureText({ testProcedures: 't', platformProcedures: [orphan] });
    expect(out).toContain('Survivor text.');
    expect(out).not.toContain('Unresolved platform procedure reference');
    expect(out).toContain('upstream attribution applies'); // ref-field attribution fallback
    expect(out).toContain('modified from the referenced original');
  });

  test('negative-guard discrimination: an unresolvable REF (no text) is a placeholder, never treated as concrete', () => {
    // A wrong implementation guarding "corpus lookup failed ⇒ concrete
    // value" renders undefined/empty text here and no placeholder.
    const ref = { ...realRef(), corpusId: 'unknown-corpus' };
    const out = expandProcedureText({ testProcedures: 't', platformProcedures: [ref] });
    expect(out).toContain('Unresolved platform procedure reference');
    expect(out).not.toContain('undefined');
  });
});

describe('license gate + verbatim rule at the choke point (synthetic corpora)', () => {
  const syntheticBank = (record) => ({
    bankFormat: 'platform-procedures-v1',
    bankVersion: 'feedfeedfeedfeed',
    procedures: { [record.id]: record }
  });

  const expandWithCorpus = (record, entry) => {
    let out;
    jest.isolateModules(() => {
      jest.doMock('../data/platformProcedures.json', () => syntheticBank(record));
      // eslint-disable-next-line global-require
      const mod = require('./platformBank');
      out = mod.expandProcedureText({ testProcedures: 't', platformProcedures: [entry] });
    });
    jest.dontMock('../data/platformProcedures.json');
    return out;
  };

  const baseRecord = {
    id: 'syn.policy.1.1v1',
    platform: 'google-workspace',
    policyId: 'SYN.POLICY.1.1v1',
    group: 'Synthetic',
    assertion: 'Synthetic assertion SHALL hold.',
    obligation: 'SHALL',
    rationale: 'r',
    instructions: 'Synthetic instructions body.',
    lastModified: 'July 2026',
    license: 'CC0-1.0'
  };
  const entryFor = () => ({
    corpusId: 'scuba',
    corpusVersion: 'feedfeedfeedfeed',
    policyId: 'syn.policy.1.1v1',
    contentHash: '0000000000000000'
  });

  test('gate-refused record (attribution obligation, no attribution block) expands to the fail-closed refusal — zero licensed text', () => {
    const refused = { ...baseRecord, license: 'CC-BY-4.0' }; // attribution required, block missing
    const out = expandWithCorpus(refused, entryFor());
    expect(out).toContain('license requires an attribution record');
    expect(out).not.toContain('Synthetic instructions body.');
    expect(out).not.toContain('Synthetic assertion');
  });

  test('reference-only record expands to the reference-only refusal — zero licensed text', () => {
    const refOnly = { ...baseRecord, license: 'CC-BY-NC-4.0' };
    const out = expandWithCorpus(refOnly, entryFor());
    expect(out).toContain('reference-only under its license');
    expect(out).not.toContain('Synthetic instructions body.');
  });

  test('noDerivatives record expands byte-VERBATIM (no truncation/reflow at the choke point)', () => {
    const nd = {
      ...baseRecord,
      license: 'CC-BY-ND-4.0',
      attribution: {
        attributionText: 'Synthetic upstream attribution.',
        sourceUrl: 'https://example.test/baseline',
        licenseUrl: 'https://example.test/license',
        retrievedAt: '2026-07-20',
        upstream: { repo: 'example/upstream', sha: 'abc123', path: 'baselines/x.md' }
      }
    };
    const out = expandWithCorpus(nd, entryFor());
    expect(out).toContain(nd.assertion); // verbatim, in full
    expect(out).toContain(nd.instructions);
    expect(out).toContain('Synthetic upstream attribution.');
  });
});

describe('trunk modification indication derives from flags at egress (R-9)', () => {
  const licensedTrunkSource = (flags) => ({
    bank: 'future-licensed-bank',
    bankId: 'PR.AA-05',
    licenseObligations: { attribution: true, changeIndication: true, noticeText: [] },
    ...flags
  });

  test('changeIndication obligation + modified flag emits the indication line', () => {
    const out = expandProcedureText({
      testProcedures: 'Licensed trunk text.',
      procedureSource: licensedTrunkSource({ modified: true })
    });
    expect(out).toContain('Licensed trunk text.');
    expect(out).toContain('modified from the attached source version');
  });

  test('tailored flag triggers it too; clean flags do not', () => {
    expect(
      expandProcedureText({
        testProcedures: 'x',
        procedureSource: licensedTrunkSource({ tailored: true })
      })
    ).toContain('modified from the attached source version');
    expect(
      expandProcedureText({
        testProcedures: 'x',
        procedureSource: licensedTrunkSource({ modified: false, tailored: false })
      })
    ).toBe('x');
  });
});

describe('platform labels', () => {
  test('known ids map to display names; unknown ids fall back to the raw id, never silently lost', () => {
    expect(platformLabel('google-workspace')).toBe('Google Workspace');
    expect(platformLabel('microsoft-365')).toBe('Microsoft 365');
    expect(platformLabel('future-platform')).toBe('future-platform');
  });
});

describe('advisor adoptions: drift, hash pin, corpus-id stability, degenerate refs, fork gate', () => {
  test('PLATFORM_CORPUS_ID is a stable code literal, decoupled from bankVersion', () => {
    // Resolution keys on (corpusId, policyId) against the CURRENT corpus.
    // The id must never derive from corpus content: if regeneration changed
    // it, every ref would placeholder simultaneously — the exact mass
    // breakage the no-version-gating decision exists to prevent.
    expect(PLATFORM_CORPUS_ID).toBe('scuba');
    expect(PLATFORM_CORPUS_ID).not.toBe(PLATFORM_CORPUS_VERSION);
  });

  test('hash normalization pin: a frozen record hashes to an exact literal', () => {
    // If the hash function or its field list/normalization ever changes,
    // every stored ref falsely "drifts" at once. This fixture makes that a
    // red test instead of a silent mass-drift.
    const frozen = {
      policyId: 'PIN.POLICY.1.1v1',
      group: 'Pin Group',
      assertion: 'Pinned assertion SHALL hold.',
      obligation: 'SHALL',
      rationale: 'Pinned rationale.',
      instructions: 'Pinned instructions.',
      lastModified: 'July 2026'
    };
    expect(platformRecordContentHash(frozen)).toBe('96f09e154cf4b8c6');
  });

  test('platformRefDrift: false on a fresh ref, true after content drift, null when unresolvable', () => {
    expect(platformRefDrift(realRef())).toBe(false);
    expect(platformRefDrift({ ...realRef(), contentHash: '0000000000000000' })).toBe(true);
    expect(platformRefDrift({ ...realRef(), corpusId: 'gone' })).toBeNull();
    expect(platformRefDrift(null)).toBeNull();
  });

  test('expansion is drift-SILENT permanently (ratified PR-7): drift surfaces as badge CHROME, never in egress text', () => {
    // PR-5 pinned this as a deferral; PR-7 flipped the pin into the decision:
    // rendered and exported text always carries the current corpus version,
    // the detail-panel badge is the consent surface, and the picker's adopt
    // action is the only path that may rewrite the stored fingerprint.
    const drifted = { ...realRef(), contentHash: '0000000000000000' };
    const out = expandProcedureText({ testProcedures: 't', platformProcedures: [drifted] });
    // resolves and renders the CURRENT corpus text, with no drift marker
    expect(out).toContain(realRecord.assertion);
    expect(out).not.toMatch(/drift/i);
  });

  test('degenerate ref entries ({} / partial) render the placeholder — never resolve by accident', () => {
    [{}, { corpusId: PLATFORM_CORPUS_ID }, { policyId: REAL_POLICY }].forEach((entry) => {
      const out = expandProcedureText({ testProcedures: 't', platformProcedures: [entry] });
      expect(out).toContain('Unresolved platform procedure reference');
      expect(out).not.toContain(realRecord.assertion);
    });
  });

  test('fork gate: forking requires a truthy corpus lookup (positive guard) — unresolvable refs cannot fork', () => {
    expect(forkPlatformProcedure({ ...realRef(), corpusId: 'gone' }, 'x')).toBeNull();
    expect(forkPlatformProcedure({ ...realRef(), policyId: 'gone.1v1' }, 'x')).toBeNull();
    expect(forkPlatformProcedure(realRef(), 'x')).not.toBeNull();
  });

  test('a fork restored byte-identical to the corpus text STAYS modified (flag-derived, never string-compare)', () => {
    const fork = forkPlatformProcedure(realRef(), realRecord.instructions);
    const out = expandProcedureText({ testProcedures: 't', platformProcedures: [fork] });
    expect(out).toContain('modified from the referenced original');
  });

  test('a fork of a notice-bearing record still carries the notice (adapted content keeps obligations)', () => {
    const fork = forkPlatformProcedure(realRef(), 'Adapted text.');
    const out = expandProcedureText({ testProcedures: 't', platformProcedures: [fork] });
    expect(out).toContain(CISA_DISCLAIMER);
  });
});
