/**
 * Tests for the private data-pack import (packImport.js) and the
 * lineage-aware shareable export (dataExport.js).
 *
 * Conventions follow dataImport.test.js: hand-rolled mock stores with
 * jest.fn() setters, pure-function style, no real zustand.
 */

import {
  validatePack,
  previewPackImport,
  importPack,
  ENGINE_VERSION,
  PACK_FORMAT_VERSION
} from './packImport';
import { buildShareableExport, exportAllDataJSON } from './dataExport';

const FRAMEWORKS = [
  { id: 'nist-csf-2.0', name: 'NIST CSF 2.0', isDefault: true }
];

const REQUIREMENTS = [
  { id: 'nist-csf-2.0-GV.SC-04-a', frameworkId: 'nist-csf-2.0', subcategoryId: 'GV.SC-04' },
  { id: 'nist-csf-2.0-GV.SC-04-b', frameworkId: 'nist-csf-2.0', subcategoryId: 'GV.SC-04' },
  { id: 'nist-csf-2.0-PR.AA-01', frameworkId: 'nist-csf-2.0', subcategoryId: 'PR.AA-01' }
];

const makePack = (overrides = {}) => ({
  packFormat: 1,
  packVersion: '2026.07',
  org: { slug: 'alma-security', name: 'Alma Security' },
  sections: {
    metricValues: [
      {
        subcategoryId: 'GV.SC-04',
        quarters: { Q2: { actualScore: 2, targetScore: 3, observations: 'pack observation text' } }
      }
    ],
    risks: [
      { id: 'R-001', title: 'Wire-transfer BEC', likelihood: 4, impact: 5, notes: 'pack risk note' }
    ]
  },
  ...overrides
});

const makeStores = ({
  assessments = [],
  findings = [],
  frameworks = FRAMEWORKS,
  requirements = REQUIREMENTS
} = {}) => {
  const setAssessments = jest.fn();
  const setFindings = jest.fn();
  const stores = {
    assessmentsStore: { getState: () => ({ assessments, setAssessments }) },
    findingsStore: { getState: () => ({ findings, setFindings }) },
    frameworksStore: { getState: () => ({ frameworks }) },
    requirementsStore: { getState: () => ({ requirements }) }
  };
  return { stores, setAssessments, setFindings };
};

afterEach(() => {
  window.localStorage.clear();
});

describe('ENGINE_VERSION sync', () => {
  test('matches package.json version (constant cannot drift silently)', () => {
    const pkg = require('../../package.json');
    expect(ENGINE_VERSION).toBe(pkg.version);
  });
});

describe('validatePack', () => {
  test('accepts a minimal valid pack', () => {
    const result = validatePack(makePack());
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.counts.metricValues).toBe(1);
    expect(result.counts.risks).toBe(1);
  });

  test('rejects a newer packFormat with an upgrade message', () => {
    const result = validatePack(makePack({ packFormat: PACK_FORMAT_VERSION + 1 }));
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Update the app/);
  });

  test('rejects a pack whose engineMin is newer than this build', () => {
    const result = validatePack(makePack({ engineMin: '99.0.0' }));
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/requires app version 99\.0\.0/);
  });

  test('accepts engineMin equal to this build', () => {
    const result = validatePack(makePack({ engineMin: ENGINE_VERSION }));
    expect(result.ok).toBe(true);
  });

  test('rejects a pack with no org.slug', () => {
    const result = validatePack(makePack({ org: { name: 'Alma Security' } }));
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/slug/);
  });

  test('rejects a pack with no packVersion', () => {
    const pack = makePack();
    delete pack.packVersion;
    const result = validatePack(pack);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/packVersion/);
  });

  test('rejects a database backup file with a pointer to Restore', () => {
    const result = validatePack({ formatVersion: 2, data: { assessments: [] } });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Restore From Backup/);
  });

  test('rejects assessmentScope other than "new" explicitly', () => {
    const result = validatePack(makePack({ assessmentScope: 'merge-into-existing' }));
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/not supported/);
  });

  test('warns on unknown sections instead of failing (forward compat)', () => {
    const pack = makePack();
    pack.sections.futureThing = [{ x: 1 }];
    const result = validatePack(pack);
    expect(result.ok).toBe(true);
    expect(result.warnings.join(' ')).toMatch(/futureThing/);
  });

  test('reports accepted-but-unapplied sections (resources, frameworks)', () => {
    const pack = makePack();
    pack.sections.resources = [{ subcategoryId: 'GV.SC-04', links: [] }];
    const result = validatePack(pack);
    expect(result.ok).toBe(true);
    expect(result.notApplied).toContain('resources');
  });

  test('rejects a pack with nothing importable', () => {
    const pack = makePack();
    pack.sections = { resources: [{ subcategoryId: 'GV.SC-04', links: [] }] };
    const result = validatePack(pack);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/no importable data/);
  });

  test('returns a structured rejection (no throw) when a known section is a truthy non-array', () => {
    const pack = makePack();
    pack.sections = { metricValues: { 'GV.SC-04': { Q2: {} } }, risks: 'none' };
    let result;
    expect(() => { result = validatePack(pack); }).not.toThrow();
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/"metricValues" is not an array/);
    expect(result.errors.join(' ')).toMatch(/"risks" is not an array/);
  });

  test('rejects invalid quarter keys', () => {
    const pack = makePack();
    pack.sections.metricValues[0].quarters = { Q5: { actualScore: 1 } };
    const result = validatePack(pack);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/invalid quarter "Q5"/);
  });

  test('rejects risks with out-of-range likelihood', () => {
    const pack = makePack();
    pack.sections.risks[0].likelihood = 7;
    const result = validatePack(pack);
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/likelihood/);
  });
});

describe('previewPackImport', () => {
  test('reports resolution counts and unresolved subcategory IDs without writing', () => {
    const pack = makePack();
    pack.sections.metricValues.push({
      subcategoryId: 'XX.YY-99',
      quarters: { Q2: { actualScore: 1 } }
    });
    const { stores, setAssessments, setFindings } = makeStores();
    const preview = previewPackImport(pack, stores);

    expect(preview.validation.ok).toBe(true);
    expect(preview.metricValues.count).toBe(2);
    expect(preview.metricValues.resolved).toBe(1);
    expect(preview.metricValues.unresolved).toEqual(['XX.YY-99']);
    expect(preview.willReplace).toBe(false);
    expect(setAssessments).not.toHaveBeenCalled();
    expect(setFindings).not.toHaveBeenCalled();
  });

  test('discloses ambiguous subcategory matches and where values attach', () => {
    // GV.SC-04 has two requirement rows in the fixture store data.
    const { stores } = makeStores();
    const preview = previewPackImport(makePack(), stores);

    expect(preview.metricValues.ambiguous).toEqual([
      { subcategoryId: 'GV.SC-04', matches: 2, attachedTo: 'nist-csf-2.0-GV.SC-04-a' }
    ]);
  });

  test('flags replace + local edits when the pack-owned assessment was edited after import', () => {
    const existing = {
      id: 'ASM-pack-alma-security',
      name: 'Alma Security (private pack)',
      source: 'pack',
      packSlug: 'alma-security',
      packImportedAt: '2026-06-01T00:00:00.000Z',
      lastModified: '2026-06-15T00:00:00.000Z'
    };
    const { stores } = makeStores({ assessments: [existing] });
    const preview = previewPackImport(makePack(), stores);

    expect(preview.willReplace).toBe(true);
    expect(preview.localEditsSinceImport).toBe(true);
  });
});

describe('importPack', () => {
  test('creates a pack-owned assessment with provenance and resolved observations', () => {
    const { stores, setAssessments, setFindings } = makeStores();
    const result = importPack(makePack(), stores);

    expect(result.replaced).toBe(false);
    expect(result.assessmentId).toBe('ASM-pack-alma-security');
    expect(result.applied).toEqual({ metricValues: 1, risks: 1 });

    const written = setAssessments.mock.calls[0][0];
    expect(written).toHaveLength(1);
    const assessment = written[0];
    expect(assessment.source).toBe('pack');
    expect(assessment.packSlug).toBe('alma-security');
    expect(assessment.packVersion).toBe('2026.07');
    // Deterministic pick: first matching requirement row sorted by id.
    expect(Object.keys(assessment.observations)).toEqual(['nist-csf-2.0-GV.SC-04-a']);
    expect(assessment.observations['nist-csf-2.0-GV.SC-04-a'].quarters.Q2.actualScore).toBe(2);

    // Every producer emits the full current shape (issues #291/#290):
    // year takes the record's vintage, users starts empty.
    expect(assessment.year).toBe(new Date().getFullYear());
    expect(assessment.users).toEqual([]);

    const findings = setFindings.mock.calls[0][0];
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      id: 'FND-pack-alma-security-R-001',
      summary: 'Wire-transfer BEC',
      assessmentId: 'ASM-pack-alma-security',
      source: 'pack',
      packSlug: 'alma-security',
      priority: 'High'
    });
  });

  test('re-import replaces the pack-owned assessment and findings, never duplicates', () => {
    const priorPackAssessment = {
      id: 'ASM-pack-alma-security',
      name: 'Alma Security (private pack)',
      source: 'pack',
      packSlug: 'alma-security',
      packVersion: '2026.06',
      createdDate: '2026-01-01T00:00:00.000Z',
      packImportedAt: '2026-06-01T00:00:00.000Z',
      lastModified: '2026-06-01T00:00:00.000Z'
    };
    const userAssessment = { id: 'ASM-1', name: 'My own assessment' };
    const priorPackFinding = { id: 'FND-pack-alma-security-R-000', packSlug: 'alma-security' };
    const userFinding = { id: 'FND-1', summary: 'my finding' };
    const { stores, setAssessments, setFindings } = makeStores({
      assessments: [userAssessment, priorPackAssessment],
      findings: [userFinding, priorPackFinding]
    });

    const result = importPack(makePack(), stores);
    expect(result.replaced).toBe(true);

    const writtenAssessments = setAssessments.mock.calls[0][0];
    const packAssessments = writtenAssessments.filter((a) => a.packSlug === 'alma-security');
    expect(packAssessments).toHaveLength(1);
    expect(packAssessments[0].id).toBe('ASM-pack-alma-security');
    expect(packAssessments[0].createdDate).toBe('2026-01-01T00:00:00.000Z');
    expect(packAssessments[0].packVersion).toBe('2026.07');
    expect(writtenAssessments).toContain(userAssessment);

    const writtenFindings = setFindings.mock.calls[0][0];
    expect(writtenFindings.map((f) => f.id)).not.toContain('FND-pack-alma-security-R-000');
    expect(writtenFindings.map((f) => f.id)).toContain('FND-pack-alma-security-R-001');
    expect(writtenFindings).toContain(userFinding);
  });

  test('throws without writing when no subcategory ID resolves', () => {
    const pack = makePack();
    pack.sections.metricValues = [
      { subcategoryId: 'XX.YY-99', quarters: { Q2: { actualScore: 1 } } }
    ];
    const { stores, setAssessments, setFindings } = makeStores();

    expect(() => importPack(pack, stores)).toThrow(/nothing was imported/);
    expect(setAssessments).not.toHaveBeenCalled();
    expect(setFindings).not.toHaveBeenCalled();
  });

  test('rolls back the assessment write when the findings write fails', () => {
    const previous = [{ id: 'ASM-1', name: 'My own assessment' }];
    const { stores, setAssessments, setFindings } = makeStores({ assessments: previous });
    setFindings.mockImplementation(() => {
      throw new Error('boom');
    });

    expect(() => importPack(makePack(), stores)).toThrow(/rolled back/);
    expect(setAssessments).toHaveBeenCalledTimes(2);
    expect(setAssessments.mock.calls[1][0]).toBe(previous);
  });

  test('rejects an invalid pack before touching any store', () => {
    const { stores, setAssessments, setFindings } = makeStores();
    expect(() => importPack({ packFormat: 1 }, stores)).toThrow();
    expect(setAssessments).not.toHaveBeenCalled();
    expect(setFindings).not.toHaveBeenCalled();
  });
});

describe('shareable export (lineage-aware pack exclusion)', () => {
  const packAssessment = {
    id: 'ASM-pack-alma-security',
    name: 'Alma Security (private pack)',
    source: 'pack',
    packSlug: 'alma-security',
    observations: {
      'nist-csf-2.0-GV.SC-04-a': {
        quarters: { Q2: { actualScore: 2, observations: 'DERIVED-PRIVATE-OBSERVATION' } }
      }
    }
  };
  // Lineage-only: this finding carries NO source tag — only the assessment link.
  const taglessDerivedFinding = {
    id: 'FND-derived',
    summary: 'DERIVED-PRIVATE-FINDING',
    assessmentId: 'ASM-pack-alma-security'
  };
  const userAssessment = { id: 'ASM-1', name: 'My own assessment' };
  const userFinding = { id: 'FND-1', summary: 'public finding', assessmentId: 'ASM-1' };

  const makeExportStores = () => ({
    controlsStore: { getState: () => ({ controls: [] }) },
    assessmentsStore: { getState: () => ({ assessments: [userAssessment, packAssessment] }) },
    requirementsStore: { getState: () => ({ requirements: [] }) },
    frameworksStore: { getState: () => ({ frameworks: FRAMEWORKS }) },
    artifactStore: { getState: () => ({ artifacts: [] }) },
    userStore: { getState: () => ({ users: [] }) },
    findingsStore: { getState: () => ({ findings: [userFinding, taglessDerivedFinding] }) }
  });

  test('excludes pack records AND derived records by default', () => {
    const share = JSON.stringify(buildShareableExport(makeExportStores()));
    // The derived observation lives INSIDE the pack assessment and carries no
    // tag of its own — the lineage filter must still remove it (ISC-13.5).
    expect(share).not.toContain('DERIVED-PRIVATE-OBSERVATION');
    // The untagged finding is excluded purely by its assessmentId lineage.
    expect(share).not.toContain('DERIVED-PRIVATE-FINDING');
    expect(share).toContain('public finding');
    expect(share).toContain('My own assessment');
  });

  test('backup export still contains pack data (dual intents)', () => {
    const backup = JSON.stringify(exportAllDataJSON(makeExportStores()));
    expect(backup).toContain('DERIVED-PRIVATE-OBSERVATION');
    expect(backup).toContain('DERIVED-PRIVATE-FINDING');
  });

  test('explicit includePrivate opt-in keeps pack data and labels the file', () => {
    const withPrivate = buildShareableExport(makeExportStores(), { includePrivate: true });
    expect(JSON.stringify(withPrivate)).toContain('DERIVED-PRIVATE-OBSERVATION');
    expect(withPrivate.dataType).toMatch(/INCLUDED/);
  });

  test('updates metadata counts after filtering', () => {
    const share = buildShareableExport(makeExportStores());
    expect(share.metadata.assessmentCount).toBe(1);
    expect(share.metadata.findingCount).toBe(1);
  });
});

describe('fixture pack (fictional Alma Security)', () => {
  // The fixture is deliberately named *.packfixture.json so it can live in the
  // tree without matching the CI leak-guard's *.csfpack.json glob (ISC-14.1).
  const fixture = require('./alma-security.packfixture.json');

  test('validates green', () => {
    const result = validatePack(fixture);
    expect(result.ok).toBe(true);
    expect(result.counts.metricValues).toBe(2);
    expect(result.counts.risks).toBe(2);
    expect(result.notApplied).toEqual(['resources']);
  });

  test('imports green against the default framework', () => {
    const { stores, setAssessments, setFindings } = makeStores();
    const result = importPack(JSON.parse(JSON.stringify(fixture)), stores);

    expect(result.applied).toEqual({ metricValues: 2, risks: 2 });
    expect(result.unresolved).toEqual([]);
    expect(setAssessments).toHaveBeenCalledTimes(1);
    expect(setFindings).toHaveBeenCalledTimes(1);
  });
});
