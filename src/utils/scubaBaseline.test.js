/**
 * Parser tests for the SCuBA baseline parser — synthetic fixtures covering
 * both upstream dialects (plan §5 C4), the measured punctuation variance,
 * and the per-file license detection (plan §7 R-1).
 *
 * Discrimination discipline (G19/G20 C/R/L): fixtures are built so the WRONG
 * implementation SUCCEEDS at its wrong behavior — a parser that stamps
 * license from the repo-level label (instead of per-file detection) passes a
 * naive "M365 file is attribution-class" test, so the fixtures cross-wire
 * dialect and license section: a GWS-shaped file WITH the section must stamp
 * attribution, an MS-shaped file WITHOUT it must stamp CC0.
 */
import {
  PARSER_VERSION,
  POLICY_HEADING,
  normalizeScubaMarkdown,
  detectFileLicense,
  parseBaselineFile
} from './scubaBaseline.mjs';

const SOURCE = {
  platformId: 'test-platform',
  repo: 'cisagov/ScubaTest',
  sha: 'a'.repeat(40),
  baselinesPath: 'baselines',
  retrievedAt: '2026-07-20',
  fileName: 'test.md',
  sourcePath: 'vendor/scuba/test/baselines/test.md',
  licenseId: 'CC0-1.0'
};

const LICENSE_SECTION = [
  '## License Compliance and Copyright',
  'Portions of this document are adapted from documents in Microsoft’s repositories.',
  'The respective documents are adapted under the terms of the Creative Commons Attribution 4.0 International license.',
  ''
].join('\n');

const CISA_DISCLAIMER_LINE =
  'For non-federal users, this is provided as is. CISA does not endorse any commercial product or service.';

describe('scubaBaseline parser', () => {
  describe('policy IDs (C4: v-suffix, both dialects)', () => {
    test.each([
      ['#### GWS.COMMONCONTROLS.1.1v1', 'GWS.COMMONCONTROLS.1.1v1'],
      ['#### MS.AAD.1.1v1', 'MS.AAD.1.1v1'],
      ['#### MS.TEAMS.1.7v2', 'MS.TEAMS.1.7v2'],
      ['####  MS.AAD.2.1v1', 'MS.AAD.2.1v1'] // double space (measured in aad.md)
    ])('%s parses', (line, id) => {
      expect(line.trim().match(POLICY_HEADING)[1]).toBe(id);
    });

    test('an Instructions heading is NOT a policy heading', () => {
      expect('#### GWS.GMAIL.1.1v1 Instructions'.match(POLICY_HEADING)).toBeNull();
    });
  });

  describe('field extraction across measured upstream variants', () => {
    const file = (bullets) =>
      [
        '## 1. Test Group',
        '### Policies',
        '#### GWS.TESTBASE.1.1v1',
        'Widgets SHALL be disabled for all users.',
        '',
        ...bullets,
        ''
      ].join('\n');

    test('canonical GWS form: rationale, last modified, NIST, bare MITRE line with colon-form sub-techniques', () => {
      const [r] = parseBaselineFile(
        file([
          '- _Rationale:_ Widgets are risky.',
          '- _Last modified:_ January 2025',
          '- _NIST SP 800-53 Rev. 5 FedRAMP High Baseline Mapping:_ IA-2(1), AC-17a, SI-8',
          '- MITRE ATT&CK TTP Mapping',
          '  - [T1110: Brute Force](https://attack.mitre.org/techniques/T1110/)',
          '    - [T1110:001: Password Guessing](https://attack.mitre.org/techniques/T1110/001/)'
        ]),
        SOURCE
      );
      expect(r.assertion).toBe('Widgets SHALL be disabled for all users.');
      expect(r.obligation).toBe('SHALL');
      expect(r.rationale).toBe('Widgets are risky.');
      expect(r.lastModified).toBe('January 2025');
      expect(r.nist80053).toEqual(['IA-2(1)', 'AC-17a', 'SI-8']);
      // Colon-form sub-technique normalized to the dot form via the URL path.
      expect(r.mitreAttack).toEqual(['T1110', 'T1110.001']);
      expect(r.group).toBe('Test Group');
      expect(r.groupNumber).toBe(1);
    });

    test('ScubaGear form: underscored MITRE line, dot-form sub-techniques', () => {
      const [r] = parseBaselineFile(
        file([
          '- _Rationale:_ Risky.',
          '- _Last modified:_ June 2023',
          '- _NIST SP 800-53 Rev. 5 FedRAMP High Baseline Mapping:_ CM-7',
          '- _MITRE ATT&CK TTP Mapping:_',
          '  - [T1078: Valid Accounts](https://attack.mitre.org/techniques/T1078/)',
          '    - [T1078.004: Cloud Accounts](https://attack.mitre.org/techniques/T1078/004/)'
        ]),
        SOURCE
      );
      expect(r.mitreAttack).toEqual(['T1078', 'T1078.004']);
    });

    test('measured punctuation variants: _Rationale_:, _Last Modified:_, double-space dash', () => {
      const [r] = parseBaselineFile(
        file([
          '-  _Rationale_: Spacing and underscores vary upstream.',
          '- _Last Modified:_ August 2025',
          '- _NIST SP 800-53 Rev. 5 FedRAMP High Baseline Mapping:_ AC-5'
        ]),
        SOURCE
      );
      expect(r.rationale).toBe('Spacing and underscores vary upstream.');
      expect(r.lastModified).toBe('August 2025');
    });

    test('a NIST control list wrapped across lines keeps the wrapped controls', () => {
      const [r] = parseBaselineFile(
        file([
          '- _Rationale:_ Risky.',
          '- _NIST SP 800-53 Rev. 5 FedRAMP High Baseline Mapping:_ CM-6a, SI-3a,',
          '  SI-8, AC-2'
        ]),
        SOURCE
      );
      expect(r.nist80053).toEqual(['CM-6a', 'SI-3a', 'SI-8', 'AC-2']);
    });

    test('a "None" MITRE mapping yields an empty list, not a parse failure', () => {
      const [r] = parseBaselineFile(
        file([
          '- _Rationale:_ Risky.',
          '- _NIST SP 800-53 Rev. 5 FedRAMP High Baseline Mapping:_ AC-5',
          '- _MITRE ATT&CK TTP Mapping:_',
          '  - None'
        ]),
        SOURCE
      );
      expect(r.mitreAttack).toEqual([]);
      expect(r.nist80053).toEqual(['AC-5']);
    });

    test('Note bullets are captured; unrecognized bullets land in details — nothing drops', () => {
      const [r] = parseBaselineFile(
        file([
          '- _Rationale:_ Risky.',
          '- _Note:_ Applies to the Global policy.',
          '- _Additional mitigations to reduce risks:_ consider conditional access.'
        ]),
        SOURCE
      );
      expect(r.note).toBe('Applies to the Global policy.');
      expect(r.details).toContain('Additional mitigations');
    });

    test('SHOULD NOT is extracted as the full obligation', () => {
      const [r] = parseBaselineFile(
        [
          '## 1. G',
          '#### MS.TESTBASE.1.1v1',
          'Control SHOULD NOT be enabled.',
          ''
        ].join('\n'),
        SOURCE
      );
      expect(r.obligation).toBe('SHOULD NOT');
    });
  });

  describe('instructions: per-policy wins, group-common is the fallback', () => {
    const doc = [
      '## 9. Group Nine',
      '### Policies',
      '#### GWS.TESTBASE.9.1v1',
      'A SHALL hold.',
      '',
      '#### GWS.TESTBASE.9.2v1',
      'B SHALL hold.',
      '',
      '### Implementation',
      '#### Policy Group 9 Instructions',
      'Common steps for the group.',
      '',
      '#### GWS.TESTBASE.9.2v1 Instructions:',
      'Specific steps for 9.2.',
      ''
    ].join('\n');

    test('policy without its own block inherits the group-common instructions', () => {
      const records = parseBaselineFile(doc, SOURCE);
      expect(records[0].instructions).toBe('Common steps for the group.');
    });

    test('per-policy instructions (with measured trailing colon) win over group-common', () => {
      const records = parseBaselineFile(doc, SOURCE);
      expect(records[1].instructions).toBe('Specific steps for 9.2.');
    });

    test.each([
      '#### Policy Group 2 common Instructions',
      '#### Policy 1 Common Instructions',
      '#### Policy Group 1 Common Implementation:',
      '#### GWS COMMONCONTROLS 18 Common Instructions'
    ])('measured group-heading variant "%s" is recognized', (heading) => {
      const records = parseBaselineFile(
        [
          `## ${heading.match(/(\d+)/)[1]}. G`,
          '#### GWS.TESTBASE.' + heading.match(/(\d+)/)[1] + '.1v1',
          'A SHALL hold.',
          '',
          '### Implementation',
          heading,
          'Common text.',
          ''
        ].join('\n'),
        SOURCE
      );
      expect(records[0].instructions).toBe('Common text.');
    });
  });

  describe('per-file license detection (R-1) — content decides, never the repo label', () => {
    const policies = (prefix) =>
      [
        '## 1. G',
        `#### ${prefix}.TESTBASE.1.1v1`,
        'A SHALL hold.',
        ''
      ].join('\n');

    test('file WITH a CC BY license section stamps attribution-class components (SPDX AND expression)', () => {
      const [r] = parseBaselineFile(
        [LICENSE_SECTION, CISA_DISCLAIMER_LINE, policies('MS')].join('\n'),
        SOURCE
      );
      expect(r.license).toBe('CC0-1.0 AND CC-BY-4.0');
      expect(r.licenseObligations).toEqual({
        attribution: true,
        changeIndication: true,
        noticeText: ['cisa-no-endorsement']
      });
      expect(r.attribution.attributionText).toContain('Microsoft');
      // CC BY 4.0 §3(a)(1)(B): modification must be indicated.
      expect(r.attribution.attributionText).toContain('modified');
      expect(r.attribution.licenseUrl).toBe('https://creativecommons.org/licenses/by/4.0/');
    });

    test('file WITHOUT a license section stamps the manifest-declared repo license floor', () => {
      const [r] = parseBaselineFile([CISA_DISCLAIMER_LINE, policies('GWS')].join('\n'), SOURCE);
      expect(r.license).toBe('CC0-1.0');
      expect(r.licenseObligations).toEqual({ noticeText: ['cisa-no-endorsement'] });
    });

    test('the floor is the source licenseId, not a hardcoded CC0 (positive evidence, no silent default)', () => {
      const [r] = parseBaselineFile(policies('GWS'), { ...SOURCE, licenseId: 'CC0-1.0-TEST-FLOOR' });
      expect(r.license).toBe('CC0-1.0-TEST-FLOOR');
    });

    // Mutation-killing fixtures (test-analyzer round, both mutants CONFIRMED
    // surviving the natural corpus): the natural corpus has perfect
    // presence⇔content correlation, so a detector keying on section PRESENCE
    // alone, or grepping the WHOLE FILE for the CC BY sentence, passes every
    // natural fixture — and would stamp a fabricated Microsoft-adaptation
    // claim on CC0 files at a future pin move.
    test('MUTANT KILL: a license section that does NOT declare CC BY portions stays at the floor', () => {
      const cc0OnlySection = [
        '## License Compliance and Copyright',
        'This document is released under CC0 1.0 Universal. No other terms apply.',
        ''
      ].join('\n');
      const [r] = parseBaselineFile([cc0OnlySection, policies('GWS')].join('\n'), SOURCE);
      expect(r.license).toBe('CC0-1.0');
      expect(r.licenseObligations.attribution).toBeUndefined();
    });

    test('MUTANT KILL: the CC BY sentence OUTSIDE a license section does not stamp attribution', () => {
      const doc = [
        '## 1. G',
        '#### GWS.TESTBASE.1.1v1',
        'A SHALL hold.',
        '',
        '- _Rationale:_ Cited prose mentions the Creative Commons Attribution 4.0 International license by name.',
        ''
      ].join('\n');
      const [r] = parseBaselineFile(doc, SOURCE);
      expect(r.license).toBe('CC0-1.0');
      expect(r.licenseObligations.attribution).toBeUndefined();
    });

    // The discrimination pair: cross-wire dialect and license section. A
    // parser keying license off the repo/dialect (GWS ⇒ CC0, MS ⇒ CC BY)
    // succeeds at its wrong behavior on the natural corpus but FAILS here.
    test('DISCRIMINATION: GWS-shaped file WITH the section stamps attribution', () => {
      const [r] = parseBaselineFile([LICENSE_SECTION, policies('GWS')].join('\n'), SOURCE);
      expect(r.licenseObligations.attribution).toBe(true);
    });

    test('DISCRIMINATION: MS-shaped file WITHOUT the section stamps CC0', () => {
      const [r] = parseBaselineFile(policies('MS'), SOURCE);
      expect(r.license).toBe('CC0-1.0');
      expect(r.licenseObligations.attribution).toBeUndefined();
    });

    test('no CISA disclaimer in the file ⇒ no notice key declared', () => {
      expect(detectFileLicense(policies('GWS')).licenseObligations.noticeText).toEqual([]);
    });

    test('records never carry a computed licenseClass (entry condition 2)', () => {
      const [r] = parseBaselineFile(
        [LICENSE_SECTION, policies('MS')].join('\n'),
        SOURCE
      );
      expect('licenseClass' in r).toBe(false);
    });
  });

  describe('product licensing (License Requirements) stays out of the license lane', () => {
    test('### License Requirements parses into productLicenseNotes, not license fields', () => {
      const [r] = parseBaselineFile(
        [
          '## 1. G',
          '### Policies',
          '#### MS.TESTBASE.1.1v1',
          'A SHALL hold.',
          '',
          '### License Requirements',
          '- Requires a Microsoft Entra ID P2 license',
          '',
          '### Implementation',
          '#### MS.TESTBASE.1.1v1 Instructions',
          'Steps.',
          ''
        ].join('\n'),
        SOURCE
      );
      expect(r.productLicenseNotes).toBe('- Requires a Microsoft Entra ID P2 license');
      expect(r.license).toBe('CC0-1.0'); // product licensing never mutates content license
    });
  });

  describe('normalizeScubaMarkdown — sanitizer-fixpoint normalization', () => {
    test.each([
      ['<!--Policy: MS.AAD.1.1v1; Criticality: SHALL -->text', 'text'],
      ['<pre>\n  Users > Include > <b>All users</b>\n</pre>', '```\n  Users > Include > All users\n```'],
      ['make it <b>bold</b>', 'make it **bold**'],
      ['see <code>Get-Thing</code>', 'see `Get-Thing`'],
      ['<a name="anchor">jump</a>', 'jump'],
      ['before <img src="images/MFA.PNG"> after', 'before  after'],
      ['go to <https://example.com/x>', 'go to https://example.com/x'],
      ['mail <soc@example.com> now', 'mail soc@example.com now'],
      ['line one<br>line two', 'line one\nline two'],
      ['use your <domain> and <tenant-id>', 'use your `domain` and `tenant-id`'],
      ['fewer than <4 minutes', 'fewer than &lt;4 minutes'],
      ['ATT&CK and 5 > 3 and > quote stay put', 'ATT&CK and 5 > 3 and > quote stay put']
    ])('%s', (input, expected) => {
      expect(normalizeScubaMarkdown(input)).toBe(expected);
    });

    test('PARSER_VERSION is stamped for re-derivation lineage (entry condition 3)', () => {
      expect(typeof PARSER_VERSION).toBe('number');
    });
  });
});
