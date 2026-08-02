/**
 * Store wiring — the PRODUCTION update/create/delete paths of the three real
 * stores must write scoped, attributed audit entries; bulk lanes must not
 * flood the log. Attribution asserts run with an acting user selected, per
 * the behavioral-not-grep rule (the 'System' fallback makes greps useless).
 */
import useAuditLogStore from './auditLogStore';
import useUserStore from './userStore';
import useControlsStore from './controlsStore';
import useFindingsStore from './findingsStore';
import useAssessmentsStore, { evaluationTargetId } from './assessmentsStore';

const entriesFor = (t, id) => useAuditLogStore.getState().getEntriesForRecord(t, id);

beforeEach(() => {
  window.localStorage.clear();
  useAuditLogStore.setState({ entries: [] });
  useUserStore.setState({
    users: [{ id: 42, name: 'Omar.Garza', email: 'o@x.com' }],
    currentUserId: 42
  });
});

describe('controlsStore wiring', () => {
  test('create → update → delete logs scoped, attributed entries', () => {
    const control = useControlsStore.getState().createControl({ controlId: 'CTL-AUD-1', name: 'Audit control' });
    expect(entriesFor('control', control.controlId).map(e => e.action)).toEqual(['control_created']);

    useControlsStore.getState().updateControl(control.controlId, { status: 'Implemented' });
    const afterUpdate = entriesFor('control', control.controlId);
    expect(afterUpdate[0].action).toBe('control_updated');
    expect(afterUpdate[0].field).toBe('status');
    expect(afterUpdate[0].user).toBe('Omar.Garza');

    useControlsStore.getState().deleteControl(control.controlId);
    expect(entriesFor('control', control.controlId)[0].action).toBe('control_deleted');
  });

  test('a no-op update writes nothing', () => {
    const control = useControlsStore.getState().createControl({ controlId: 'CTL-AUD-2', name: 'N' });
    const before = entriesFor('control', control.controlId).length;
    useControlsStore.getState().updateControl(control.controlId, { name: 'N' });
    expect(entriesFor('control', control.controlId).length).toBe(before);
  });

  test('programmatic bulk auto-create does not flood the log', () => {
    useControlsStore.getState().ensureControlsForRequirements([
      { id: 'GV.OC-01' }, { id: 'GV.OC-02' }, { id: 'GV.OC-03' }
    ]);
    const created = useAuditLogStore.getState().getEntries({ action: 'control_created' });
    expect(created).toHaveLength(0);
  });
});

describe('findingsStore wiring', () => {
  test('create → update → delete logs scoped, attributed entries', () => {
    const finding = useFindingsStore.getState().createFinding({ summary: 'MFA gap on payroll' });
    expect(entriesFor('finding', finding.id).map(e => e.action)).toEqual(['finding_created']);

    useFindingsStore.getState().updateFinding(finding.id, { status: 'In Progress', priority: 'High' });
    const actions = entriesFor('finding', finding.id).map(e => e.action);
    expect(actions.filter(a => a === 'finding_updated')).toHaveLength(2);
    expect(entriesFor('finding', finding.id)[0].user).toBe('Omar.Garza');

    useFindingsStore.getState().deleteFinding(finding.id);
    expect(entriesFor('finding', finding.id)[0].action).toBe('finding_deleted');
    // History survives the record's deletion — that is the point of the log.
    expect(entriesFor('finding', finding.id).length).toBeGreaterThanOrEqual(3);
  });
});

describe('assessmentsStore wiring', () => {
  test('observation edits log per changed field with evaluation scoping', () => {
    const assessment = useAssessmentsStore.getState().createAssessment({
      name: 'Wiring Test', scopeIds: ['PR.DS-01'], scopeType: 'requirements'
    });
    useAuditLogStore.setState({ entries: [] });

    useAssessmentsStore.getState().updateObservation(assessment.id, 'PR.DS-01', {
      score: 4, testingStatus: 'In Progress'
    });
    const tid = evaluationTargetId(assessment.id, 'PR.DS-01');
    const actions = entriesFor('evaluation', tid).map(e => e.action).sort();
    expect(actions).toEqual(['score_changed', 'status_changed']);
    expect(entriesFor('evaluation', tid)[0].user).toBe('Omar.Garza');
  });

  test('quarterly edits log with the quarter named in the field', () => {
    const assessment = useAssessmentsStore.getState().createAssessment({
      name: 'Quarterly Test', scopeIds: ['PR.DS-02'], scopeType: 'requirements'
    });
    useAssessmentsStore.getState().updateQuarterlyObservation(assessment.id, 'PR.DS-02', 'Q2', {
      score: 7, observations: 'Improved coverage'
    });
    const tid = evaluationTargetId(assessment.id, 'PR.DS-02');
    const fields = entriesFor('evaluation', tid).map(e => e.field);
    expect(fields).toEqual(expect.arrayContaining(['Q2 score', 'Q2 observations']));
  });

  test('assessment create, rename, delete are logged', () => {
    const assessment = useAssessmentsStore.getState().createAssessment({ name: 'Lifecycle A' });
    useAssessmentsStore.getState().updateAssessment(assessment.id, { name: 'Lifecycle B' });
    useAssessmentsStore.getState().deleteAssessment(assessment.id);
    const actions = entriesFor('assessment', assessment.id).map(e => e.action);
    expect(actions).toEqual(['assessment_deleted', 'assessment_updated', 'assessment_created']);
    const rename = entriesFor('assessment', assessment.id).find(e => e.action === 'assessment_updated');
    expect(rename.oldValue).toBe('Lifecycle A');
    expect(rename.newValue).toBe('Lifecycle B');
  });

  test('an observations-payload updateAssessment call does not double-log', () => {
    const assessment = useAssessmentsStore.getState().createAssessment({
      name: 'NoDouble', scopeIds: ['PR.DS-03'], scopeType: 'requirements'
    });
    useAuditLogStore.setState({ entries: [] });
    useAssessmentsStore.getState().updateObservation(assessment.id, 'PR.DS-03', { score: 2 });
    // Exactly the one score entry — updateAssessment's internal call with the
    // observations payload must not add assessment_updated noise.
    expect(useAuditLogStore.getState().entries).toHaveLength(1);
  });
});
