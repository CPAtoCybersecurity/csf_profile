/**
 * Notices pipeline — validation polarity per required field, render
 * determinism, structural CISA emission, and the verbatim discipline on
 * notice text. Exercises the SAME module the build-time generator runs.
 */
import fs from 'fs';
import path from 'path';
import {
  CISA_NOTICE_KEY,
  SCOPE_STATEMENT,
  MITRE_NOTICE,
  CISA_DISCLAIMER,
  isCisaSourced,
  validateLicensedRecords,
  renderNotices as noticesMarkdown
} from './thirdPartyNotices.mjs';

const fullAttribution = (over = {}) => ({
  attributionText: 'Derived from CISA ScubaGear Secure Configuration Baselines',
  sourceUrl: 'https://github.com/cisagov/ScubaGear/blob/main/PowerShell/ScubaGear/baselines/aad.md',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  retrievedAt: '2026-07-20',
  upstream: { repo: 'cisagov/ScubaGear', sha: 'abc123', path: 'baselines/aad.md' },
  ...over
});

const bankWith = (records) => [{ name: 'Fixture bank', records }];

describe('validateLicensedRecords — the CI gate', () => {
  test('unlicensed records (the community bank today) validate clean', () => {
    const real = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'data', 'communityProcedures.json'), 'utf8')
    );
    expect(validateLicensedRecords([
      { name: 'Community bank', records: real.procedures }
    ])).toEqual([]);
  });

  test('complete attribution-obligated record validates clean', () => {
    expect(validateLicensedRecords(bankWith({
      'MS.AAD.1.1v1': { license: 'CC BY 4.0', attribution: fullAttribution() }
    }))).toEqual([]);
  });

  test.each([
    ['attributionText'],
    ['sourceUrl'],
    ['licenseUrl'],
    ['retrievedAt']
  ])('POLARITY: missing %s fails the build with the field named', (field) => {
    const a = fullAttribution();
    delete a[field];
    const errors = validateLicensedRecords(bankWith({
      'MS.AAD.1.1v1': { license: 'CC BY 4.0', attribution: a }
    }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain(`"${field}"`);
  });

  test('POLARITY: missing upstream sha fails the build', () => {
    const errors = validateLicensedRecords(bankWith({
      'MS.AAD.1.1v1': {
        license: 'CC BY 4.0',
        attribution: fullAttribution({ upstream: { repo: 'cisagov/ScubaGear' } })
      }
    }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('"upstream.sha"');
  });

  test('POLARITY: a reference-only record bundled in a bank fails the build (CIS/SCF fence is mechanical, not reviewer diligence)', () => {
    const errors = validateLicensedRecords(bankWith({
      'cis-thing': { license: 'CC BY-NC-SA 4.0', markdown: 'benchmark text' }
    }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('reference-only');
  });

  test('a record missing multiple fields reports each one (no first-error masking)', () => {
    const errors = validateLicensedRecords(bankWith({
      'MS.AAD.1.1v1': { license: 'CC BY 4.0', attribution: { attributionText: 'x' } }
    }));
    expect(errors.length).toBe(4); // sourceUrl, licenseUrl, retrievedAt, upstream.sha
  });

  test('DECLARED-OVER-FLOOR: a CC0 record with record-declared attribution and no block fails — a floor-only validator would pass it (the R-1 case)', () => {
    const errors = validateLicensedRecords(bankWith({
      'MS.AAD.1.1v1': { license: 'CC0-1.0', licenseObligations: { attribution: true }, markdown: 'x' }
    }));
    expect(errors.length).toBe(5); // all five attribution fields missing
  });

  test('DECLARED-OVER-FLOOR: a declared reference-only class over a blank license string fails the bundling fence', () => {
    const errors = validateLicensedRecords(bankWith({
      'scf-thing': { license: '', licenseClass: 'reference-only', markdown: 'x' }
    }));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('reference-only');
  });
});

describe('notices markdown — deterministic, scope + standing notices', () => {
  test('deterministic: same input renders byte-identically, sorted regardless of input order', () => {
    const a = noticesMarkdown([
      { name: 'B bank', records: { z: { license: 'CC0-1.0' }, a: { license: 'CC0-1.0' } } },
      { name: 'A bank', records: {} }
    ]);
    const b = noticesMarkdown([
      { name: 'A bank', records: {} },
      { name: 'B bank', records: { a: { license: 'CC0-1.0' }, z: { license: 'CC0-1.0' } } }
    ]);
    expect(a).toBe(b);
    expect(a.indexOf('### A bank')).toBeLessThan(a.indexOf('### B bank'));
  });

  test('scope statement and standing MITRE notice always present', () => {
    const out = noticesMarkdown([{ name: 'Empty bank', records: {} }]);
    expect(out).toContain(SCOPE_STATEMENT);
    expect(out).toContain(MITRE_NOTICE);
    expect(out).toContain('src/data/');
    expect(out).toContain('vendor/');
  });

  test('honest empty state for a bank with no licensed content', () => {
    const out = noticesMarkdown([{ name: 'Empty bank', records: { 'GV.OC-01': { markdown: 'x' } } }]);
    expect(out).toContain('no third-party licensed content');
  });

  test('the committed THIRD-PARTY-NOTICES.md matches a fresh render of the shipped banks (drift = red here AND in CI)', () => {
    const real = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'data', 'communityProcedures.json'), 'utf8')
    );
    const committed = fs.readFileSync(
      path.join(__dirname, '..', '..', 'THIRD-PARTY-NOTICES.md'), 'utf8'
    );
    expect(committed).toBe(noticesMarkdown([
      { name: 'Community test-procedure bank (src/data/communityProcedures.json)', records: real.procedures }
    ]));
  });
});

describe('CISA no-endorsement disclaimer — structural emission', () => {
  test('DISCRIMINATION FIXTURE: cisagov upstream with NO notice key still emits the disclaimer (forgetting the key cannot omit a required notice)', () => {
    const out = noticesMarkdown(bankWith({
      'GWS.COMMONCONTROLS.1.1v1': { license: 'CC0-1.0', attribution: fullAttribution() }
    }));
    expect(isCisaSourced({ attribution: fullAttribution() })).toBe(true);
    expect(out).toContain(CISA_DISCLAIMER);
  });

  test('upstream.repo is THE structural trigger: cisagov repo with a non-cisagov sourceUrl emits; cisagov sourceUrl under a foreign repo does not', () => {
    const cisaRepoOnly = fullAttribution({ sourceUrl: 'https://example.com/mirror/aad.md' });
    expect(isCisaSourced({ attribution: cisaRepoOnly })).toBe(true);
    const cisaUrlOnly = fullAttribution({ upstream: { repo: 'microsoft/mirror', sha: 'abc123' } });
    expect(isCisaSourced({ attribution: cisaUrlOnly })).toBe(false);
    const out = noticesMarkdown(bankWith({
      'x': { license: 'CC0-1.0', attribution: cisaUrlOnly }
    }));
    expect(out).not.toContain(CISA_DISCLAIMER);
  });

  test('the notice key alone also triggers emission (belt and braces)', () => {
    const out = noticesMarkdown(bankWith({
      'x': { license: 'CC0-1.0', licenseObligations: { noticeText: [CISA_NOTICE_KEY] } }
    }));
    expect(out).toContain(CISA_DISCLAIMER);
  });

  test('no CISA-sourced content → no CISA section (the disclaimer never asserts a falsehood)', () => {
    const out = noticesMarkdown(bankWith({ 'GV.OC-01': { markdown: 'community text' } }));
    expect(out).not.toContain('### CISA');
    expect(out).not.toContain(CISA_DISCLAIMER);
  });

  test('disclaimer form covers no-endorsement and the trademark carve-out', () => {
    expect(CISA_DISCLAIMER).toContain('do not endorse');
    expect(CISA_DISCLAIMER).toContain('CC0 1.0 does not waive trademark rights');
  });
});

describe('licensed record rendering — verbatim discipline', () => {
  test('attribution block fields all render, ND records state the verbatim requirement, literal notices render verbatim', () => {
    const notice = 'This exact sentence must appear   unreflowed, with its spacing.';
    const out = noticesMarkdown(bankWith({
      'MS.AAD.1.1v1': {
        license: 'CC BY-ND 4.0',
        attribution: fullAttribution(),
        licenseObligations: { noticeText: [notice] }
      }
    }));
    expect(out).toContain('Derived from CISA ScubaGear');
    expect(out).toContain('cisagov/ScubaGear@abc123');
    expect(out).toContain('Retrieved: 2026-07-20');
    expect(out).toContain('must remain verbatim');
    expect(out).toContain(`> ${notice}`);
  });
});
