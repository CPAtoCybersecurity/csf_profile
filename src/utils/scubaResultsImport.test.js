/**
 * Evidence lane (R-7): the results file is UNTRUSTED INPUT. This suite pins
 * the whole posture — strict id/verdict validation, bounded walk, dangerous-
 * key rejection, and the strongest invariant: no free text from the file
 * survives into an imported record. It also pins the workflow contract:
 * matching is ref-keyed, apply is upsert-by-policyId, and nothing here ever
 * touches a score.
 */
import fs from 'fs';
import path from 'path';
import {
  parseScubaResults,
  matchScubaResults,
  nextPlatformResults,
  normalizePlatformResults,
  MAX_RESULTS_FILE_BYTES,
  RESULT_VALUES
} from './scubaResultsImport';

/* Synthetic ScubaGear-shaped report (fictional Alma-canon tenant-free). */
const gearReport = () => ({
  MetaData: { 'Tool Version': '1.5.0', 'Report Date': '07/21/2026 14:00:00 Zulu' },
  Summary: { AAD: { Passes: 1, Failures: 1 } },
  Results: {
    AAD: [
      {
        GroupName: 'Legacy Authentication',
        Controls: [
          { 'Control ID': 'MS.AAD.1.1v1', Requirement: 'Legacy authentication SHALL be blocked.', Result: 'Pass', Criticality: 'Shall', Details: 'All conditional access policies reviewed.' },
          { 'Control ID': 'MS.AAD.2.1v1', Requirement: 'High-risk users SHALL be blocked.', Result: 'Fail', Criticality: 'Shall', Details: 'SENSITIVE: 3 privileged accounts unprotected.' }
        ]
      }
    ]
  }
});

/* Synthetic ScubaGoggles-shaped report with the boolean verdict field. */
const gogglesReport = () => ({
  Summary: { commoncontrols: {} },
  Results: {
    commoncontrols: [
      { PolicyId: 'GWS.COMMONCONTROLS.1.1v1', 'Requirement Met': true },
      { PolicyId: 'GWS.COMMONCONTROLS.2.1v1', 'Requirement Met': false },
      { PolicyId: 'GWS.GMAIL.1.1v1', Result: 'No events found' }
    ]
  }
});

describe('parseScubaResults — validation and hardening', () => {
  test('rejects empty, non-string, and non-JSON input with named errors', () => {
    expect(parseScubaResults('').ok).toBe(false);
    expect(parseScubaResults(undefined).ok).toBe(false);
    expect(parseScubaResults('not json at all').ok).toBe(false);
    expect(parseScubaResults('"a bare string"').ok).toBe(false);
  });

  test('rejects input over the byte cap before parsing', () => {
    const big = `{"pad":"${'x'.repeat(MAX_RESULTS_FILE_BYTES)}"}`;
    const out = parseScubaResults(big);
    expect(out.ok).toBe(false);
    expect(out.errors[0]).toContain('20 MB');
  });

  test('rejects pathological nesting instead of walking it', () => {
    const deep = `${'{"a":'.repeat(60)}1${'}'.repeat(60)}`;
    const out = parseScubaResults(deep);
    expect(out.ok).toBe(false);
    expect(out.errors[0]).toContain('nested too deeply');
  });

  test.each(['__proto__', 'constructor', 'prototype'])(
    'rejects files carrying the dangerous key %s',
    (key) => {
      const out = parseScubaResults(`{"Results": {"${key}": {"polluted": true}}}`);
      expect(out.ok).toBe(false);
      expect(out.errors[0]).toContain('disallowed key');
    }
  );

  test('rejects a file with more results than any supported report (entry cap)', () => {
    const entries = Array.from({ length: 5001 }, (_, i) => (
      `{"Control ID": "MS.AAD.${i + 1}.1v1", "Result": "Pass"}`
    ));
    const out = parseScubaResults(`{"Results": [${entries.join(',')}]}`);
    expect(out.ok).toBe(false);
    expect(out.errors[0]).toContain('more results');
  });

  test('rejects breadth-pathological files the depth cap cannot see (node/stack cap)', () => {
    const wide = `{"Results": [${Array(200001).fill('{}').join(',')}]}`;
    const out = parseScubaResults(wide);
    expect(out.ok).toBe(false);
    expect(out.errors[0]).toContain('too large to import safely');
  });

  test('a valid policy id with NO result field at all is skipped, never defaulted', () => {
    // The walk visits every object — real reports contain summary/index
    // objects naming a control id without a verdict. A future "default
    // missing verdicts" convenience change must fail here.
    const report = { Results: [
      { 'Control ID': 'MS.AAD.1.1v1' },
      { 'Control ID': 'MS.AAD.2.1v1', Result: 'Pass' }
    ] };
    const out = parseScubaResults(JSON.stringify(report));
    expect(out.entries).toEqual([{ policyId: 'ms.aad.2.1v1', result: 'pass' }]);
    expect(out.skipped).toEqual([
      expect.objectContaining({ reason: 'unrecognized-result-value' })
    ]);
  });

  test('rejects a file with zero recognizable results', () => {
    const out = parseScubaResults('{"Results": {"AAD": []}}');
    expect(out.ok).toBe(false);
    expect(out.errors[0]).toContain('No recognizable');
  });

  test('parses the ScubaGear shape: Control ID + Result, meta captured bounded', () => {
    const out = parseScubaResults(JSON.stringify(gearReport()));
    expect(out.ok).toBe(true);
    expect(out.entries).toEqual(expect.arrayContaining([
      { policyId: 'ms.aad.1.1v1', result: 'pass' },
      { policyId: 'ms.aad.2.1v1', result: 'fail' }
    ]));
    expect(out.meta.tool).toBe('scubagear');
    expect(out.meta.toolVersion).toBe('1.5.0');
    expect(out.meta.reportDate.length).toBeLessThanOrEqual(64);
  });

  test('parses the ScubaGoggles shape: PolicyId + Requirement Met booleans and N/A tokens', () => {
    const out = parseScubaResults(JSON.stringify(gogglesReport()));
    expect(out.ok).toBe(true);
    expect(out.entries).toEqual(expect.arrayContaining([
      { policyId: 'gws.commoncontrols.1.1v1', result: 'pass' },
      { policyId: 'gws.commoncontrols.2.1v1', result: 'fail' },
      { policyId: 'gws.gmail.1.1v1', result: 'na' }
    ]));
    expect(out.meta.tool).toBe('scubagoggles');
  });

  test('a mixed-product file is labeled mixed', () => {
    const mixed = { Results: [
      { 'Control ID': 'MS.AAD.1.1v1', Result: 'Pass' },
      { 'Control ID': 'GWS.GMAIL.1.1v1', Result: 'Pass' }
    ] };
    expect(parseScubaResults(JSON.stringify(mixed)).meta.tool).toBe('mixed');
  });

  test('policy ids normalize to lowercase and malformed ids are skipped-with-reason', () => {
    const report = { Results: [
      { 'Control ID': 'MS.AAD.1.1V1', Result: 'Pass' },
      { 'Control ID': 'TOTALLY.WRONG', Result: 'Pass' },
      { 'Control ID': 'ms.aad.1.1v1; rm -rf /', Result: 'Pass' }
    ] };
    const out = parseScubaResults(JSON.stringify(report));
    expect(out.ok).toBe(true);
    expect(out.entries).toEqual([{ policyId: 'ms.aad.1.1v1', result: 'pass' }]);
    expect(out.skipped).toHaveLength(2);
    out.skipped.forEach((s) => expect(s.reason).toBe('unrecognized-policy-id'));
  });

  test('unknown verdict tokens are skipped-with-reason, never imported', () => {
    const report = { Results: [
      { 'Control ID': 'MS.AAD.1.1v1', Result: 'Compromised' },
      { 'Control ID': 'MS.AAD.2.1v1', Result: 'Warning' }
    ] };
    const out = parseScubaResults(JSON.stringify(report));
    expect(out.entries).toEqual([{ policyId: 'ms.aad.2.1v1', result: 'warning' }]);
    expect(out.skipped).toEqual([
      expect.objectContaining({ reason: 'unrecognized-result-value' })
    ]);
  });

  test('ANTI: no free text from the file survives into an imported record', () => {
    const out = parseScubaResults(JSON.stringify(gearReport()));
    out.entries.forEach((entry) => {
      expect(Object.keys(entry).sort()).toEqual(['policyId', 'result']);
    });
    const serialized = JSON.stringify(out.entries);
    expect(serialized).not.toContain('SENSITIVE');
    expect(serialized).not.toContain('privileged accounts');
    expect(serialized).not.toContain('Legacy authentication');
  });

  test('REAL SHAPE: ScubaGear TestResults.json — BOM-prefixed flat list of PolicyId/RequirementMet (upstream sample)', () => {
    // Structure copied verbatim from cisagov/ScubaGear
    // PowerShell/ScubaGear/Sample-Reports/TestResults.json: root is a LIST,
    // fields are PolicyId + boolean RequirementMet, and the file carries the
    // PowerShell UTF-8 BOM that plain JSON.parse rejects. Values fictional.
    const real = [
      { ActualValue: '', Commandlet: ['Get-MgBetaSubscribedSku', 'Get-PrivilegedUser'], Criticality: 'Shall', PolicyId: 'MS.AAD.7.3v1', ReportDetails: '0 admin(s) that are not cloud-only found', RequirementMet: true },
      { ActualValue: '', Commandlet: ['Get-MgBetaIdentityConditionalAccessPolicy'], Criticality: 'Shall', PolicyId: 'MS.AAD.1.1v1', ReportDetails: '1 conditional access policy(s) found that meet(s) all requirements', RequirementMet: false }
    ];
    const out = parseScubaResults(`﻿${JSON.stringify(real)}`);
    expect(out.ok).toBe(true);
    expect(out.entries).toEqual(expect.arrayContaining([
      { policyId: 'ms.aad.7.3v1', result: 'pass' },
      { policyId: 'ms.aad.1.1v1', result: 'fail' }
    ]));
    expect(out.skipped).toEqual([]);
    // ReportDetails/ActualValue prose must not survive
    expect(JSON.stringify(out.entries)).not.toContain('cloud-only');
  });

  test('REAL SHAPE: ScubaResults.json Control Objects — the FULL documented verdict vocabulary imports with zero skips', () => {
    // Vocabulary from cisagov/ScubaGoggles docs/misc/tooloutputschema.md,
    // Control Object → Result possible values. A new upstream value showing
    // up as skipped>0 in the preview is the designed undercount signal.
    const vocabulary = ['Pass', 'Fail', 'Warning', 'N/A', 'Omitted', 'Incorrect Result', 'Error - Test results missing', 'Error', 'No events found'];
    const report = {
      MetaData: { 'Tool Version': '1.5.0' },
      Results: {
        gmail: [{
          GroupName: 'Test Group',
          GroupNumber: '1',
          Controls: vocabulary.map((verdict, i) => ({
            'Control ID': `GWS.GMAIL.${i + 1}.1v1`,
            Requirement: 'Fictional requirement text.',
            Result: verdict,
            Criticality: 'Shall',
            Details: 'Fictional details.'
          }))
        }]
      }
    };
    const out = parseScubaResults(JSON.stringify(report));
    expect(out.ok).toBe(true);
    expect(out.skipped).toEqual([]);
    expect(out.entries).toHaveLength(vocabulary.length);
    const byId = Object.fromEntries(out.entries.map((e) => [e.policyId, e.result]));
    expect(byId['gws.gmail.6.1v1']).toBe('incorrect'); // Incorrect Result
    expect(byId['gws.gmail.7.1v1']).toBe('error'); // Error - Test results missing
    expect(byId['gws.gmail.9.1v1']).toBe('na'); // No events found
  });

  test('duplicate policy ids: document-first wins for siblings, with a warning', () => {
    const report = { Results: [
      { 'Control ID': 'MS.AAD.1.1v1', Result: 'Pass' },
      { 'Control ID': 'MS.AAD.1.1v1', Result: 'Fail' }
    ] };
    const out = parseScubaResults(JSON.stringify(report));
    expect(out.entries).toEqual([{ policyId: 'ms.aad.1.1v1', result: 'pass' }]);
    expect(out.warnings[0]).toContain('Duplicate result');
  });
});

describe('matchScubaResults — ref-keyed, pure', () => {
  const entries = [
    { policyId: 'ms.aad.1.1v1', result: 'pass' },
    { policyId: 'ms.aad.2.1v1', result: 'fail' },
    { policyId: 'gws.gmail.1.1v1', result: 'na' }
  ];
  const ref = (policyId) => ({ corpusId: 'scuba', corpusVersion: 'v', policyId, contentHash: 'h' });

  test('matches results only to observations whose addenda name the policy', () => {
    const plan = matchScubaResults(entries, {
      'PR.AA-01 Ex1': { platformProcedures: [ref('ms.aad.1.1v1')] },
      'PR.DS-01 Ex1': { platformProcedures: [ref('ms.defender.1.1v1')] },
      'GV.OC-01 Ex1': { testProcedures: 'no refs at all' }
    });
    expect(plan.rows).toEqual([
      { itemId: 'PR.AA-01 Ex1', matches: [{ policyId: 'ms.aad.1.1v1', result: 'pass' }] }
    ]);
    expect(plan.matchedCount).toBe(1);
    expect(plan.unmatchedResults.sort()).toEqual(['gws.gmail.1.1v1', 'ms.aad.2.1v1']);
  });

  test('a user FORK still matches — the fork keeps its ref identity', () => {
    const fork = { ...ref('ms.aad.2.1v1'), text: 'user-owned edited addendum', modified: true };
    const plan = matchScubaResults(entries, {
      'PR.AA-05 Ex1': { platformProcedures: [fork] }
    });
    expect(plan.rows[0].matches).toEqual([{ policyId: 'ms.aad.2.1v1', result: 'fail' }]);
  });

  test('items without matching results appear nowhere in the plan', () => {
    const plan = matchScubaResults(entries, {
      'DE.CM-01 Ex1': { platformProcedures: [ref('ms.exo.9.9v1')] }
    });
    expect(plan.rows).toEqual([]);
    expect(plan.matchedCount).toBe(0);
  });

  test('junk refs from a tampered backup neither throw nor false-match', () => {
    // importCompleteDatabase carries platformProcedures WHOLESALE, so junk
    // refs can reach the matcher through a tampered complete backup.
    const plan = matchScubaResults(entries, {
      'A Ex1': { platformProcedures: 'not-an-array' },
      'B Ex1': { platformProcedures: [null, 42, { policyId: 7 }, { noPolicyId: true }] },
      'C Ex1': null,
      'D Ex1': { platformProcedures: [ref('ms.aad.1.1v1')] }
    });
    expect(plan.rows).toEqual([
      { itemId: 'D Ex1', matches: [{ policyId: 'ms.aad.1.1v1', result: 'pass' }] }
    ]);
    expect(matchScubaResults([], { 'D Ex1': { platformProcedures: [ref('ms.aad.1.1v1')] } }).rows).toEqual([]);
  });
});

describe('nextPlatformResults — upsert semantics, producer stamping', () => {
  const meta = { toolVersion: '1.5.0', reportDate: '2026-07-21' };

  test('writes producer-stamped entries: corpusId, source, importedAt ride every record', () => {
    const next = nextPlatformResults([], [{ policyId: 'ms.aad.1.1v1', result: 'pass' }], meta, 'NOW');
    expect(next).toEqual([{
      corpusId: 'scuba',
      policyId: 'ms.aad.1.1v1',
      result: 'pass',
      source: 'scuba-import',
      importedAt: 'NOW',
      toolVersion: '1.5.0',
      reportDate: '2026-07-21'
    }]);
  });

  test('re-import replaces same-policy entries and preserves other-platform evidence', () => {
    const current = [
      { corpusId: 'scuba', policyId: 'gws.gmail.1.1v1', result: 'pass', source: 'scuba-import', importedAt: 'OLD' },
      { corpusId: 'scuba', policyId: 'ms.aad.1.1v1', result: 'fail', source: 'scuba-import', importedAt: 'OLD' }
    ];
    const next = nextPlatformResults(current, [{ policyId: 'ms.aad.1.1v1', result: 'pass' }], {}, 'NEW');
    expect(next.find((e) => e.policyId === 'gws.gmail.1.1v1').importedAt).toBe('OLD');
    const updated = next.find((e) => e.policyId === 'ms.aad.1.1v1');
    expect(updated.result).toBe('pass');
    expect(updated.importedAt).toBe('NEW');
  });

  test('absent meta stamps no toolVersion/reportDate keys at all', () => {
    const next = nextPlatformResults([], [{ policyId: 'ms.aad.1.1v1', result: 'pass' }], {}, 'NOW');
    expect('toolVersion' in next[0]).toBe(false);
    expect('reportDate' in next[0]).toBe(false);
  });

  test('at the storage cap the FRESHEST evidence wins and the oldest falls off', () => {
    const current = Array.from({ length: 600 }, (_, i) => ({
      corpusId: 'scuba', policyId: `gws.old.${i + 1}.1v1`, result: 'pass',
      source: 'scuba-import', importedAt: 'OLD'
    }));
    const next = nextPlatformResults(current, [{ policyId: 'ms.aad.1.1v1', result: 'fail' }], {}, 'NEW');
    expect(next).toHaveLength(600);
    expect(next[0]).toEqual(expect.objectContaining({ policyId: 'ms.aad.1.1v1', importedAt: 'NEW' }));
    expect(next.find((e) => e.policyId === 'gws.old.600.1v1')).toBeUndefined();
  });
});

describe('normalizePlatformResults — the producer guard', () => {
  test('filters junk shapes, invalid ids, unknown verdicts, and duplicate ids', () => {
    const out = normalizePlatformResults([
      { policyId: 'MS.AAD.1.1v1', result: 'pass' }, // case-normalized, kept
      { policyId: 'ms.aad.1.1v1', result: 'fail' }, // duplicate id, dropped
      { policyId: 'ms.aad.99;drop-everything', result: 'pass' },
      { policyId: 'ms.aad.2.1v1', result: 'root-shell' },
      null,
      'string',
      42
    ]);
    expect(out).toEqual([
      expect.objectContaining({ policyId: 'ms.aad.1.1v1', result: 'pass', corpusId: 'scuba', source: 'scuba-import' })
    ]);
  });

  test('spoofed corpusId is forced back to scuba and non-string importedAt collapses to empty', () => {
    const out = normalizePlatformResults([
      { corpusId: 'evil-corpus', policyId: 'ms.aad.1.1v1', result: 'pass', importedAt: 12345 }
    ]);
    expect(out[0].corpusId).toBe('scuba');
    expect(out[0].importedAt).toBe('');
  });

  test('strips unknown keys and bounds every retained string', () => {
    const out = normalizePlatformResults([{
      policyId: 'ms.aad.1.1v1',
      result: 'pass',
      importedAt: `${'x'.repeat(100)}`,
      toolVersion: 'v'.repeat(100),
      reportDate: 'd'.repeat(100),
      details: 'SMUGGLED PROSE',
      tenant: 'corp.example'
    }]);
    expect(Object.keys(out[0]).sort()).toEqual(
      ['corpusId', 'importedAt', 'policyId', 'reportDate', 'result', 'source', 'toolVersion']
    );
    expect(out[0].importedAt.length).toBeLessThanOrEqual(32);
    expect(out[0].toolVersion.length).toBeLessThanOrEqual(64);
    expect(out[0].reportDate.length).toBeLessThanOrEqual(64);
    expect(JSON.stringify(out)).not.toContain('SMUGGLED');
  });

  test('non-arrays collapse to empty; every RESULT_VALUES member passes', () => {
    expect(normalizePlatformResults(undefined)).toEqual([]);
    expect(normalizePlatformResults({ sneak: true })).toEqual([]);
    RESULT_VALUES.forEach((verdict, i) => {
      const out = normalizePlatformResults([{ policyId: `ms.aad.${i + 1}.1v1`, result: verdict }]);
      expect(out[0].result).toBe(verdict);
    });
  });
});

describe('score-surface invariants', () => {
  test('ANTI: no report or PDF generator references platformResults', () => {
    ['auditReportMarkdown.js', 'executiveSummaryPDF.js'].forEach((file) => {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
      expect(source).not.toContain('platformResults');
    });
  });
});
