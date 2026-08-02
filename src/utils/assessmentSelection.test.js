/**
 * Selective export — the pure narrowing layer.
 *
 * Every assertion here drives the PRODUCTION function; none re-implements the
 * filter. The no-op contract (ISC-1079/1090) is the one that keeps every
 * existing export test and golden snapshot honest, so it is tested by identity
 * (===), not by deep equality.
 */

import {
  filterExportByAssessments,
  isSubsetOf,
  SECTION_DISPOSITION,
  sectionDispositionGaps
} from './assessmentSelection';

const envelope = () => ({
  exportDate: '2026-07-31T00:00:00.000Z',
  dataType: 'Complete Assessment Database',
  formatVersion: 6,
  metadata: {
    assessmentCount: 3,
    findingCount: 4,
    userCount: 2
  },
  data: {
    assessments: [
      { id: 'ASM-a', name: 'Alpha', scopeIds: ['GV.OC-01 Ex1'] },
      { id: 'ASM-b', name: 'Bravo', scopeIds: ['ID.AM-01 Ex1'] },
      { id: 'ASM-c', name: 'Charlie', scopeIds: [] }
    ],
    findings: [
      { id: 'F1', assessmentId: 'ASM-a' },
      { id: 'F2', assessmentId: 'ASM-b' },
      { id: 'F3', assessmentId: 'ASM-c' },
      { id: 'F4' } // unassigned
    ],
    artifacts: [
      { id: 'AR1', assessmentId: 'ASM-a' },
      { id: 'AR2', assessmentId: 'ASM-c' },
      { id: 'AR3', assessmentId: null } // unassigned
    ],
    users: [{ id: 1 }, { id: 2 }],
    controls: [{ id: 'C1' }],
    frameworks: [{ id: 'nist-csf-2.0' }]
  }
});

describe('filterExportByAssessments — no-op contract', () => {
  it('returns the SAME object when no selection is given', () => {
    const env = envelope();
    expect(filterExportByAssessments(env)).toBe(env);
    expect(filterExportByAssessments(env, null)).toBe(env);
  });

  it('returns the SAME object when every assessment is selected', () => {
    const env = envelope();
    expect(filterExportByAssessments(env, ['ASM-a', 'ASM-b', 'ASM-c'])).toBe(env);
  });

  it('stamps no assessmentSelection on the default path', () => {
    const env = envelope();
    expect(filterExportByAssessments(env, null).metadata.assessmentSelection).toBeUndefined();
  });
});

describe('filterExportByAssessments — narrowing', () => {
  it('keeps exactly the selected assessments, in store order', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-c', 'ASM-a']);
    expect(out.data.assessments.map((a) => a.id)).toEqual(['ASM-a', 'ASM-c']);
  });

  it('drops findings pointing at an unselected assessment', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-a']);
    expect(out.data.findings.map((f) => f.id)).toEqual(['F1', 'F4']);
  });

  it('drops artifacts pointing at an unselected assessment, keeping unassigned ones', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-a']);
    expect(out.data.artifacts.map((a) => a.id)).toEqual(['AR1', 'AR3']);
  });

  it('leaves the user directory and the catalogue whole', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-a']);
    expect(out.data.users).toHaveLength(2);
    expect(out.data.controls).toHaveLength(1);
    expect(out.data.frameworks).toHaveLength(1);
  });

  it('recomputes the metadata counts to match the filtered arrays', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-a', 'ASM-b']);
    expect(out.metadata.assessmentCount).toBe(out.data.assessments.length);
    expect(out.metadata.findingCount).toBe(out.data.findings.length);
    expect(out.metadata.userCount).toBe(2); // untouched
  });

  it('stamps the selection provenance a restore can warn on', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-b']);
    expect(out.metadata.assessmentSelection).toEqual({
      selectedIds: ['ASM-b'],
      selectedCount: 1,
      totalCount: 3,
      includedUnassigned: { findings: 1, artifacts: 1 }
    });
  });

  it('marks the dataType so a human reading the file sees it is a slice', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-b']);
    expect(out.dataType).toBe('Complete Assessment Database — selected assessments only');
  });

  it('never mutates the caller envelope', () => {
    const env = envelope();
    const before = JSON.stringify(env);
    filterExportByAssessments(env, ['ASM-a']);
    expect(JSON.stringify(env)).toBe(before);
  });

  it('tolerates sections the share fold deleted', () => {
    const env = envelope();
    delete env.data.artifacts;
    delete env.data.users;
    const out = filterExportByAssessments(env, ['ASM-a']);
    expect(out.data.artifacts).toBeUndefined();
    expect(out.data.users).toBeUndefined();
    expect(out.data.assessments.map((a) => a.id)).toEqual(['ASM-a']);
  });

  it('handles an empty selection as "keep nothing"', () => {
    const out = filterExportByAssessments(envelope(), []);
    expect(out.data.assessments).toEqual([]);
    expect(out.metadata.assessmentSelection.selectedCount).toBe(0);
  });
});

describe('orphans vs unassigned', () => {
  it('drops records pointing at an assessment that no longer exists', () => {
    const env = envelope();
    env.data.findings.push({ id: 'F-orphan', assessmentId: 'ASM-deleted' });
    const out = filterExportByAssessments(env, ['ASM-a']);
    expect(out.data.findings.map((f) => f.id)).not.toContain('F-orphan');
  });

  it('reports how many unassigned records rode along', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-a']);
    expect(out.metadata.assessmentSelection.includedUnassigned).toEqual({
      findings: 1, // F4
      artifacts: 1 // AR3
    });
  });

  it('reports an empty object when nothing unassigned rode along', () => {
    const env = envelope();
    env.data.findings = env.data.findings.filter((f) => f.assessmentId);
    env.data.artifacts = env.data.artifacts.filter((a) => a.assessmentId);
    const out = filterExportByAssessments(env, ['ASM-a']);
    expect(out.metadata.assessmentSelection.includedUnassigned).toEqual({});
  });
});

describe('no excluded assessment id survives anywhere in the payload', () => {
  // The single strongest probe: scan the whole serialized subset for any id
  // that was NOT selected. A string scan catches dangling pointers inside
  // kept-whole sections, transitive children, and any section added later —
  // classes of leak that per-collection assertions cannot see.
  it('finds zero references to an excluded assessment', () => {
    const out = filterExportByAssessments(envelope(), ['ASM-a']);
    const wire = JSON.stringify(out);
    expect(wire).not.toContain('ASM-b');
    expect(wire).not.toContain('ASM-c');
    expect(wire).toContain('ASM-a');
  });

  it('catches a dangling pointer planted in a kept-whole section', () => {
    const env = envelope();
    // A user record that remembers the last assessment they opened: exactly
    // the shape of leak the per-collection assertions would miss.
    env.data.users[0].lastAssessmentId = 'ASM-b';
    const out = filterExportByAssessments(env, ['ASM-a']);
    // Documents current behaviour: kept-whole sections are NOT scrubbed, so
    // this scan is the tripwire that makes such a field a conscious decision
    // rather than a silent disclosure.
    expect(JSON.stringify(out)).toContain('ASM-b');
  });
});

describe('section disposition is exhaustive', () => {
  it('classifies every section a real envelope carries', () => {
    expect(sectionDispositionGaps(envelope())).toEqual([]);
  });

  it('flags a section nobody classified', () => {
    const env = envelope();
    env.data.riskRegister = [];
    expect(sectionDispositionGaps(env)).toEqual(['riskRegister']);
  });

  it('classifies each section as narrow, cascade, or keep-whole', () => {
    Object.values(SECTION_DISPOSITION).forEach((d) => {
      expect(['narrow', 'cascade', 'keep-whole']).toContain(d);
    });
  });
});

describe('isSubsetOf', () => {
  it('is false for no selection and for a full selection', () => {
    expect(isSubsetOf([{ id: 'a' }, { id: 'b' }], null)).toBe(false);
    expect(isSubsetOf([{ id: 'a' }, { id: 'b' }], ['a', 'b'])).toBe(false);
  });

  it('is true for a strict subset', () => {
    expect(isSubsetOf([{ id: 'a' }, { id: 'b' }], ['a'])).toBe(true);
  });
});
