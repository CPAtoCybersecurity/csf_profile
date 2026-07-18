import {
  subcategoryFromItemId,
  getBankProcedure,
  bankCoverage,
  buildProcedureSource,
  bankSourceUrl,
  BANK_VERSION
} from './procedureBank';
import useAssessmentsStore from '../stores/assessmentsStore';

describe('procedureBank helpers', () => {
  test('extracts subcategory from requirement-scope item IDs', () => {
    expect(subcategoryFromItemId('GV.OC-01 Ex1')).toBe('GV.OC-01');
    expect(subcategoryFromItemId('PR.AA-05 Ex12')).toBe('PR.AA-05');
    expect(subcategoryFromItemId('DE.CM-09')).toBe('DE.CM-09');
  });

  test('control-scope and malformed IDs resolve to no coverage', () => {
    expect(subcategoryFromItemId('CTRL-042')).toBeNull();
    expect(subcategoryFromItemId('')).toBeNull();
    expect(subcategoryFromItemId(null)).toBeNull();
    expect(getBankProcedure('CTRL-042')).toBeNull();
  });

  test('bank lookup returns the full markdown with identity', () => {
    const entry = getBankProcedure('GV.OC-01 Ex1');
    expect(entry.bankId).toBe('GV.OC-01');
    expect(entry.markdown).toContain('Test Procedures');
    expect(entry.markdown.length).toBeGreaterThan(200);
    expect(entry.title).toBeTruthy();
  });

  test('coverage splits covered/uncovered preserving order — control scope is honestly zero', () => {
    const { covered, uncovered } = bankCoverage(['GV.OC-01 Ex1', 'CTRL-042', 'PR.AA-01 Ex2', 'ZZ.NOPE-99 Ex1']);
    expect(covered).toEqual(['GV.OC-01 Ex1', 'PR.AA-01 Ex2']);
    expect(uncovered).toEqual(['CTRL-042', 'ZZ.NOPE-99 Ex1']);

    const controlScope = bankCoverage(['CTRL-001', 'CTRL-002']);
    expect(controlScope.covered).toEqual([]);
    expect(controlScope.uncovered).toHaveLength(2);
  });

  test('provenance stamps bank identity, version, and pristine modified flag', () => {
    const src = buildProcedureSource('GV.OC-01');
    expect(src).toMatchObject({
      bank: 'community',
      bankId: 'GV.OC-01',
      bankVersion: BANK_VERSION,
      modified: false
    });
    expect(new Date(src.attachedAt).toString()).not.toBe('Invalid Date');
  });

  test('"Improve this procedure" links to the community source file on GitHub', () => {
    expect(bankSourceUrl('GV.OC-01')).toBe(
      'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/ASSESSMENT_CATALOG/3_Test_Procedures/GV/GV.OC-01.md'
    );
    expect(bankSourceUrl('ZZ.NOPE-99')).toBeNull();
  });
});

describe('bank attach + provenance in the assessments store', () => {
  const store = () => useAssessmentsStore.getState();
  let assessmentId;

  beforeEach(() => {
    const created = store().createAssessment({
      name: 'Bank attach test',
      description: '',
      scopeType: 'requirements'
    });
    assessmentId = created.id;
    store().addToScope(assessmentId, 'GV.OC-01 Ex1');
  });

  afterEach(() => {
    store().deleteAssessment(assessmentId);
  });

  test('attach writes full markdown + pristine provenance (wizard path)', () => {
    const entry = getBankProcedure('GV.OC-01 Ex1');
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown,
      procedureSource: buildProcedureSource(entry.bankId)
    });

    const obs = store().getObservation(assessmentId, 'GV.OC-01 Ex1');
    expect(obs.testProcedures).toBe(entry.markdown);
    expect(obs.procedureSource.bank).toBe('community');
    expect(obs.procedureSource.bankId).toBe('GV.OC-01');
    expect(obs.procedureSource.modified).toBe(false);
  });

  test('hand-editing an attached procedure flips modified — an explicit re-attach resets it', () => {
    const entry = getBankProcedure('GV.OC-01 Ex1');
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown,
      procedureSource: buildProcedureSource(entry.bankId)
    });

    // User edits the text (no procedureSource in the patch — the store flips it)
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown + '\n\nOur org also checks the DR runbook.'
    });
    expect(store().getObservation(assessmentId, 'GV.OC-01 Ex1').procedureSource.modified).toBe(true);

    // Non-text updates never flip the flag
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', { auditorId: 2 });
    expect(store().getObservation(assessmentId, 'GV.OC-01 Ex1').procedureSource.modified).toBe(true);

    // Reset-to-community restores pristine provenance
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown,
      procedureSource: buildProcedureSource(entry.bankId)
    });
    expect(store().getObservation(assessmentId, 'GV.OC-01 Ex1').procedureSource.modified).toBe(false);
  });

  test('observations without provenance are untouched by the modified heuristic', () => {
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', { testProcedures: 'My own procedure' });
    const obs = store().getObservation(assessmentId, 'GV.OC-01 Ex1');
    expect(obs.testProcedures).toBe('My own procedure');
    expect(obs.procedureSource).toBeUndefined();
  });
});
