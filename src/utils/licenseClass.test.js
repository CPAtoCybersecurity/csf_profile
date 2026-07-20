/**
 * License class + obligations model — the R-5 expressiveness cases, the
 * byte-compat pin on licenseIsRestricted, and the gate proven on the
 * PRODUCTION attach/transform path (bankAttachObservation /
 * deterministicTailorUpdate), not on a re-implementation.
 */
import {
  UNDECLARED,
  PUBLIC_DOMAIN,
  ATTRIBUTION,
  REFERENCE_ONLY,
  classifyLicense,
  recordLicense,
  licenseIsRestricted,
  attributionComplete,
  mayShipText,
  mayTailor,
  requiresAttribution,
  licenseGate,
  licenseProvenance,
  refusalPlaceholder
} from './licenseClass.mjs';
import { licenseIsRestricted as reExported } from './metricsImport';
import { bankAttachObservation, deterministicTailorUpdate } from './procedureTailor';
import bank from '../data/communityProcedures.json';

/** A complete attribution block — the fixture baseline the gate accepts. */
const fullAttribution = (over = {}) => ({
  attributionText: 'Derived from CISA ScubaGear Secure Configuration Baseline for Microsoft Entra ID',
  sourceUrl: 'https://github.com/cisagov/ScubaGear/blob/main/PowerShell/ScubaGear/baselines/aad.md',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  retrievedAt: '2026-07-20',
  upstream: { repo: 'cisagov/ScubaGear', sha: 'abc123def456', path: 'PowerShell/ScubaGear/baselines/aad.md' },
  ...over
});

describe('classifyLicense — the class axis', () => {
  test.each([
    ['', UNDECLARED],
    [null, UNDECLARED],
    [undefined, UNDECLARED],
    ['MIT', UNDECLARED],
    ['Apache-2.0', UNDECLARED],
    ['Vendor Standard License', UNDECLARED],
    ['CC0-1.0', PUBLIC_DOMAIN],
    ['Public Domain', PUBLIC_DOMAIN],
    ['US Government work', PUBLIC_DOMAIN],
    ['CC BY 4.0', ATTRIBUTION],
    ['CC-BY-4.0', ATTRIBUTION],
    ['CC BY-SA 4.0', ATTRIBUTION],
    ['CC BY-ND 4.0', ATTRIBUTION],
    ['CC BY-NC 4.0', REFERENCE_ONLY],
    ['CC-BY-NC-ND-4.0', REFERENCE_ONLY],
    ['Creative Commons Noncommercial', REFERENCE_ONLY],
    ['proprietary', REFERENCE_ONLY],
    ['Internal use only', REFERENCE_ONLY]
  ])('%s → %s', (license, expected) => {
    expect(classifyLicense(license).licenseClass).toBe(expected);
  });

  test('blank asserts nothing: all-false obligations, empty noticeText', () => {
    expect(classifyLicense('').obligations).toEqual({
      attribution: false,
      changeIndication: false,
      noDerivatives: false,
      noticeText: []
    });
  });

  test('CC BY carries attribution AND change-indication (CC BY 4.0 §3(a)(1)(B))', () => {
    const { obligations } = classifyLicense('CC BY 4.0');
    expect(obligations.attribution).toBe(true);
    expect(obligations.changeIndication).toBe(true);
    expect(obligations.noDerivatives).toBe(false);
  });

  test('R-5: CC BY-ND holds attribution and noDerivatives SIMULTANEOUSLY — the case a 3-enum cannot express', () => {
    const { licenseClass, obligations } = classifyLicense('CC BY-ND 4.0');
    expect(licenseClass).toBe(ATTRIBUTION); // ND permits verbatim redistribution with credit
    expect(obligations.attribution).toBe(true);
    expect(obligations.noDerivatives).toBe(true);
  });

  test('NC forces the class closed but does not erase the other obligations', () => {
    const { licenseClass, obligations } = classifyLicense('CC BY-NC-ND 4.0');
    expect(licenseClass).toBe(REFERENCE_ONLY);
    expect(obligations.attribution).toBe(true);
    expect(obligations.noDerivatives).toBe(true);
  });
});

describe('recordLicense — record-declared obligations merge over the string floor', () => {
  test('CC0 record asserting notices keeps PUBLIC_DOMAIN class WITH the notices (CISA case)', () => {
    const rec = { license: 'CC0-1.0', licenseObligations: { noticeText: ['cisa-no-endorsement'] } };
    const { licenseClass, obligations } = recordLicense(rec);
    expect(licenseClass).toBe(PUBLIC_DOMAIN);
    expect(obligations.noticeText).toEqual(['cisa-no-endorsement']);
  });

  test('R-1 mixed-license file: CC0 string + declared attribution obligation requires attribution', () => {
    const rec = { license: 'CC0-1.0', licenseObligations: { attribution: true, changeIndication: true } };
    expect(recordLicense(rec).obligations.attribution).toBe(true);
    expect(requiresAttribution(rec)).toBe(true);
  });

  test('MITRE notice-conditioned terms are expressible via record noticeText', () => {
    const rec = { license: '', licenseObligations: { noticeText: ['mitre-terms-of-use'] } };
    expect(recordLicense(rec).obligations.noticeText).toEqual(['mitre-terms-of-use']);
  });

  test('noticeText union deduplicates and sorts (byte-stable notices render)', () => {
    const rec = { license: '', licenseObligations: { noticeText: ['b-notice', 'a-notice', 'b-notice'] } };
    expect(recordLicense(rec).obligations.noticeText).toEqual(['a-notice', 'b-notice']);
  });

  test('declared class may only tighten — UNDECLARED at bottom never loosens a derived class', () => {
    expect(recordLicense({ license: 'CC BY 4.0', licenseClass: UNDECLARED }).licenseClass).toBe(ATTRIBUTION);
    expect(recordLicense({ license: 'CC BY 4.0', licenseClass: REFERENCE_ONLY }).licenseClass).toBe(REFERENCE_ONLY);
    expect(recordLicense({ license: 'CC0-1.0', licenseClass: ATTRIBUTION }).licenseClass).toBe(ATTRIBUTION);
  });

  test('merge is never less restrictive than the string floor (universal over the fixture corpus)', () => {
    const strings = ['', 'MIT', 'CC0-1.0', 'CC BY 4.0', 'CC BY-ND 4.0', 'CC BY-NC 4.0', 'proprietary'];
    const declarations = [
      undefined,
      {},
      { attribution: true },
      { noDerivatives: true },
      { noticeText: ['x'] },
      { attribution: false, noDerivatives: false } // false can never un-restrict
    ];
    for (const license of strings) {
      const floor = classifyLicense(license);
      for (const licenseObligations of declarations) {
        const merged = recordLicense({ license, licenseObligations });
        expect(merged.obligations.attribution || !floor.obligations.attribution).toBe(true);
        expect(merged.obligations.noDerivatives || !floor.obligations.noDerivatives).toBe(true);
        for (const n of floor.obligations.noticeText) {
          expect(merged.obligations.noticeText).toContain(n);
        }
      }
    }
  });
});

describe('licenseIsRestricted — byte-compatible re-expression (D2)', () => {
  // The shipped token matcher, reimplemented VERBATIM as the reference.
  const LEGACY_TOKENS = ['NC', 'ND', 'PROPRIETARY', 'INTERNAL', 'NONCOMMERCIAL', 'NODERIVATIVES', 'NODERIVS'];
  const LEGACY_PAIRS = [['NON', 'COMMERCIAL'], ['NO', 'DERIVATIVES'], ['NO', 'DERIVS']];
  const legacyRestricted = (license) => {
    const tokens = String(license || '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
    if (LEGACY_TOKENS.some((t) => tokens.includes(t))) return true;
    return LEGACY_PAIRS.some(([a, b]) =>
      tokens.some((t, i) => t === a && tokens[i + 1] === b)
    );
  };

  const CORPUS = [
    '', null, undefined, 42, '   ',
    'CC-BY-NC-ND-4.0', 'CC BY-NC 4.0', 'proprietary', 'PROPRIETARY', 'Internal use only',
    'Creative Commons Noncommercial', 'CC Non-Commercial 4.0', 'CC BY No Derivatives',
    'CC BY-NoDerivs 3.0', 'CC BY-ND 4.0', 'nd', 'ND', 'NoDerivatives',
    'MIT', 'CC-BY-4.0', 'CC BY 4.0', 'CC BY-SA 4.0', 'CC0-1.0', 'Public Domain',
    'US Government work', 'Apache-2.0', 'Vendor Standard License', 'NDA',
    'AND', 'BOND', 'Second Edition', 'non commercial', 'no derivatives', 'no derivs',
    'cc by-nc', 'GPL-3.0', 'license: internal', 'InternalDocs',
    // Cross-category combinations: kill classifier branch-order mutants (a
    // PD-first classifier would call these unrestricted; the legacy matcher
    // does not care about order and restricts them all).
    'CC0-1.0 (internal draft)', 'US Government work - Noncommercial',
    'Public Domain, internal use only', 'CC BY 4.0 proprietary',
    'CC0 NC', 'Public Domain No Derivatives', 'CC BY-ND public domain'
  ];

  test('property: identical verdict to the shipped matcher across the whole corpus', () => {
    for (const s of CORPUS) {
      expect(licenseIsRestricted(s)).toBe(legacyRestricted(s));
    }
  });

  test('REGRESSION PIN: blank stays unrestricted — dataExport.js:221/:224/:251 (share hard-block) and the shareRegistry keepMetric filter depend on legacy/user records with empty licenses riding share exports', () => {
    expect(licenseIsRestricted('')).toBe(false);
    expect(licenseIsRestricted(null)).toBe(false);
    expect(licenseIsRestricted(undefined)).toBe(false);
  });

  test('CC BY-SA stays unrestricted (never in the restricted set) while classifying ATTRIBUTION', () => {
    expect(licenseIsRestricted('CC BY-SA 4.0')).toBe(false);
    expect(classifyLicense('CC BY-SA 4.0').licenseClass).toBe(ATTRIBUTION);
  });

  test('metricsImport re-exports the SAME binding (no drifting copy)', () => {
    expect(reExported).toBe(licenseIsRestricted);
  });
});

describe('attributionComplete — all five fields load-bearing', () => {
  test('complete block passes', () => {
    expect(attributionComplete({ attribution: fullAttribution() })).toBe(true);
  });

  test.each([
    ['attributionText'],
    ['sourceUrl'],
    ['licenseUrl'],
    ['retrievedAt']
  ])('missing %s fails', (field) => {
    const a = fullAttribution();
    delete a[field];
    expect(attributionComplete({ attribution: a })).toBe(false);
  });

  test('missing upstream.sha fails', () => {
    const a = fullAttribution();
    a.upstream = { repo: 'cisagov/ScubaGear' };
    expect(attributionComplete({ attribution: a })).toBe(false);
  });

  test('whitespace-only fields do not count as present', () => {
    expect(attributionComplete({ attribution: fullAttribution({ attributionText: '   ' }) })).toBe(false);
    expect(attributionComplete({ attribution: fullAttribution({ retrievedAt: '\n' }) })).toBe(false);
  });

  test('no attribution block at all fails', () => {
    expect(attributionComplete({})).toBe(false);
  });
});

describe('licenseGate + predicates', () => {
  test('no license metadata → identity pass (the community bank today)', () => {
    expect(licenseGate({ markdown: '# GV.OC-01' })).toEqual({ allow: true, verbatimOnly: false });
  });

  test('reference-only → refused', () => {
    expect(licenseGate({ license: 'CC BY-NC 4.0' })).toEqual({ allow: false, reason: 'reference-only' });
  });

  test('attribution-obligated without a complete block → refused', () => {
    expect(licenseGate({ license: 'CC BY 4.0' })).toEqual({ allow: false, reason: 'attribution-incomplete' });
  });

  test('attribution-obligated with a complete block → allowed', () => {
    expect(licenseGate({ license: 'CC BY 4.0', attribution: fullAttribution() }))
      .toEqual({ allow: true, verbatimOnly: false });
  });

  test('noDerivatives → allowed, verbatim only', () => {
    expect(licenseGate({ license: 'CC BY-ND 4.0', attribution: fullAttribution() }))
      .toEqual({ allow: true, verbatimOnly: true });
  });

  test('predicates agree with the gate across the fixture corpus (no caller ever needs the bare class)', () => {
    const fixtures = [
      { markdown: 'x' },
      { license: 'CC0-1.0' },
      { license: 'CC BY 4.0' },
      { license: 'CC BY 4.0', attribution: fullAttribution() },
      { license: 'CC BY-ND 4.0', attribution: fullAttribution() },
      { license: 'CC BY-NC 4.0' },
      { license: 'proprietary' }
    ];
    for (const f of fixtures) {
      const { licenseClass, obligations } = recordLicense(f);
      expect(mayShipText(f)).toBe(licenseGate(f).allow);
      expect(mayTailor(f)).toBe(
        licenseClass !== REFERENCE_ONLY && !obligations.noDerivatives && mayShipText(f)
      );
    }
  });

  test('refusalPlaceholder carries zero licensed text and is visibly a refusal', () => {
    for (const reason of ['reference-only', 'attribution-incomplete']) {
      const text = refusalPlaceholder(reason);
      expect(text.startsWith('>')).toBe(true);
      expect(text.toLowerCase()).toContain('license');
    }
  });
});

describe('licenseProvenance — attach stamps metadata, never text', () => {
  test('empty for unlicensed entries', () => {
    expect(licenseProvenance({ markdown: '# x', title: 'x' })).toEqual({});
  });

  test('copies license metadata fields only', () => {
    const entry = {
      markdown: '# x',
      license: 'CC BY 4.0',
      licenseObligations: { changeIndication: true },
      attribution: fullAttribution()
    };
    const stamped = licenseProvenance(entry);
    expect(stamped).toEqual({
      license: 'CC BY 4.0',
      licenseObligations: { changeIndication: true },
      attribution: fullAttribution()
    });
    expect(stamped.markdown).toBeUndefined();
  });
});

describe('PRODUCTION attach path — bankAttachObservation routes the gate', () => {
  const licensedEntry = (over = {}) => ({
    bankId: 'PR.AA-01',
    title: 'Fixture licensed entry',
    markdown: '# PR.AA-01 fixture\n\nUpstream licensed text with Alma Security named.',
    license: 'CC BY 4.0',
    attribution: fullAttribution(),
    ...over
  });

  test('all real community entries attach byte-identically to the pre-gate producer (gate is identity on unlicensed content)', () => {
    for (const [id, entry] of Object.entries(bank.procedures)) {
      const out = bankAttachObservation({ bankId: id, ...entry });
      expect(out.testProcedures).toBe(entry.markdown);
      expect(out.procedureSource.bank).toBe('community');
      expect(out.procedureSource.bankId).toBe(id);
      expect(out.procedureSource.tailored).toBe(false);
      expect(out.procedureSource.license).toBeUndefined();
      expect(out.procedureSource.attribution).toBeUndefined();
    }
  });

  test('attribution-complete licensed entry attaches with license + attribution stamped into provenance', () => {
    const out = bankAttachObservation(licensedEntry());
    expect(out.testProcedures).toBe(licensedEntry().markdown);
    expect(out.procedureSource.license).toBe('CC BY 4.0');
    expect(out.procedureSource.attribution).toEqual(fullAttribution());
  });

  test('DISCRIMINATION FIXTURE (G19 learning): attribution-incomplete entry with perfectly resolvable markdown is REFUSED — a gate-blind attach would succeed here', () => {
    const out = bankAttachObservation(licensedEntry({ attribution: undefined }));
    expect(out.testProcedures).toBe(refusalPlaceholder('attribution-incomplete'));
    expect(out.testProcedures).not.toContain('Upstream licensed text');
    expect(out.procedureSource.bankId).toBe('PR.AA-01');
  });

  test('refused attach stamps NO license metadata (intended: no licensed text shipped, so provenance must not claim a license relationship; the placeholder text carries the reason)', () => {
    const out = bankAttachObservation(licensedEntry({ attribution: undefined }));
    expect(out.procedureSource.license).toBeUndefined();
    expect(out.procedureSource.attribution).toBeUndefined();
    expect(out.procedureSource.licenseObligations).toBeUndefined();
  });

  test('reference-only entry is refused with zero licensed text', () => {
    const out = bankAttachObservation(licensedEntry({ license: 'CC BY-NC 4.0', attribution: undefined }));
    expect(out.testProcedures).toBe(refusalPlaceholder('reference-only'));
    expect(out.testProcedures).not.toContain('Upstream licensed text');
  });

  test('total return: refused entries still expose .testProcedures (Assessments.js:2534 dereferences it)', () => {
    expect(() => bankAttachObservation(licensedEntry({ attribution: undefined })).testProcedures).not.toThrow();
    expect(typeof bankAttachObservation(licensedEntry({ attribution: undefined })).testProcedures).toBe('string');
  });

  test('ND entry attaches VERBATIM — tailor options are ignored (verbatim-or-omit on the production path)', () => {
    const profile = { orgName: 'Contoso', infrastructure: ['Google Cloud'], securityTools: [] };
    const entry = licensedEntry({ license: 'CC BY-ND 4.0' });
    const out = bankAttachObservation(entry, profile, { substituteName: true, adaptStack: true });
    expect(out.testProcedures).toBe(entry.markdown); // byte-equal: no substitution ran
    expect(out.procedureSource.tailored).toBe(false);
  });

  test('non-ND licensed entry with the same options DOES tailor (the ND flag, not the license presence, drives verbatim)', () => {
    const profile = { orgName: 'Contoso', infrastructure: [], securityTools: [] };
    const out = bankAttachObservation(licensedEntry(), profile, { substituteName: true, adaptStack: false });
    expect(out.testProcedures).toContain('Contoso');
    expect(out.procedureSource.tailored).toBe(true);
  });
});

describe('PRODUCTION transform path — deterministicTailorUpdate honors noDerivatives', () => {
  const ndSource = {
    bank: 'fixture-bank',
    bankId: 'PR.AA-01',
    license: 'CC BY-ND 4.0',
    attribution: fullAttribution(),
    tailored: false,
    modified: false
  };

  test('ND source → null via the existing "nothing would change" contract, even when text WOULD change', () => {
    const profile = { orgName: 'Contoso', infrastructure: [], securityTools: [] };
    expect(deterministicTailorUpdate('Alma Security runs reviews.', ndSource, 'PR.AA-01', profile)).toBeNull();
  });

  test('attribution-obligated source whose attribution block was stripped → null (the mayShipText half of the transform gate, not just the ND half)', () => {
    const profile = { orgName: 'Contoso', infrastructure: [], securityTools: [] };
    const strippedSource = { bank: 'fixture-bank', bankId: 'PR.AA-01', license: 'CC BY 4.0', tailored: false, modified: false };
    expect(deterministicTailorUpdate('Alma Security runs reviews.', strippedSource, 'PR.AA-01', profile)).toBeNull();
  });

  test('community source (no license metadata) tailors exactly as before', () => {
    const profile = { orgName: 'Contoso', infrastructure: [], securityTools: [] };
    const communitySource = { bank: 'community', bankId: 'PR.AA-01', tailored: false, modified: false };
    const result = deterministicTailorUpdate('Alma Security runs reviews.', communitySource, 'PR.AA-01', profile);
    expect(result.update.testProcedures).toContain('Contoso');
  });
});
