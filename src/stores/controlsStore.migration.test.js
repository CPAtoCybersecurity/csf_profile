import useControlsStore, {
  SEEDED_CONTROLS,
  stampSeededDemoControls,
  migrateControlsState
} from './controlsStore';
import { DEFAULT_CONTROLS } from './defaultControlsData';
import { COMPREHENSIVE_ASSESSMENT_ID } from './comprehensiveAssessmentData';
import { DEMO_SEED_SOURCE } from '../utils/assessmentScope';

/**
 * Issue #299: the shipped Alma demo controls are stamped to the demo
 * assessment (same segregation scheme #297 gave users/findings/artifacts).
 * The stamp's positive-match key is controlId + the seed's createdDate —
 * createdDate is the stable identity field (updateControl never touches it,
 * createControl always stamps the current time), so an edited demo control is
 * still recognized while a user-created control can never false-match.
 */

const SEED = DEFAULT_CONTROLS[0];

describe('SEEDED_CONTROLS (issue #299)', () => {
  test('every seeded control is stamped to the demo assessment with seed provenance', () => {
    expect(SEEDED_CONTROLS.length).toBe(DEFAULT_CONTROLS.length);
    SEEDED_CONTROLS.forEach(c => {
      expect(c.assessmentId).toBe(COMPREHENSIVE_ASSESSMENT_ID);
      expect(c.seedSource).toBe(DEMO_SEED_SOURCE);
    });
  });

  test('stamping adds ONLY the two classification fields', () => {
    SEEDED_CONTROLS.forEach((c, i) => {
      const { assessmentId, seedSource, ...rest } = c;
      expect(rest).toEqual(DEFAULT_CONTROLS[i]);
    });
  });
});

describe('stampSeededDemoControls (controls store migration v6, issue #299)', () => {
  test('stamps a pristine persisted copy of a seeded demo control', () => {
    const persisted = { controls: [{ ...SEED }] };
    const after = stampSeededDemoControls(persisted);
    expect(after.controls[0].assessmentId).toBe(COMPREHENSIVE_ASSESSMENT_ID);
    expect(after.controls[0].seedSource).toBe(DEMO_SEED_SOURCE);
  });

  test('stamps a demo control whose description the user edited (createdDate is the identity)', () => {
    const edited = { ...SEED, implementationDescription: 'We do this our own way now.', lastModified: '2026-07-01T00:00:00.000Z' };
    const after = stampSeededDemoControls({ controls: [edited] });
    expect(after.controls[0].assessmentId).toBe(COMPREHENSIVE_ASSESSMENT_ID);
    expect(after.controls[0].implementationDescription).toBe('We do this our own way now.');
  });

  test('does NOT stamp a user-created control that reuses a seeded controlId', () => {
    const mine = { ...SEED, createdDate: '2026-05-05T10:00:00.000Z' };
    const after = stampSeededDemoControls({ controls: [mine] });
    expect(after.controls[0].assessmentId).toBeUndefined();
    expect(after.controls[0].seedSource).toBeUndefined();
  });

  test('a record with an unknown controlId and no createdDate cannot match via undefined === undefined', () => {
    const stranger = { controlId: 'CTL-777', implementationDescription: 'Mine' };
    const after = stampSeededDemoControls({ controls: [stranger] });
    expect(after.controls[0]).toEqual(stranger);
  });

  test('absent-only: an existing assessmentId is never overwritten', () => {
    const claimed = { ...SEED, assessmentId: 'ASM-user-2026' };
    const after = stampSeededDemoControls({ controls: [claimed] });
    expect(after.controls[0].assessmentId).toBe('ASM-user-2026');
    expect(after.controls[0].seedSource).toBeUndefined();
  });

  test('absent-only: an existing seedSource is never re-derived over', () => {
    const branded = { ...SEED, seedSource: 'some-other-pack' };
    const after = stampSeededDemoControls({ controls: [branded] });
    expect(after.controls[0].seedSource).toBe('some-other-pack');
    expect(after.controls[0].assessmentId).toBeUndefined();
  });

  test('is idempotent — a second pass returns the same state object', () => {
    const once = stampSeededDemoControls({ controls: [{ ...SEED }] });
    expect(stampSeededDemoControls(once)).toBe(once);
  });

  test('never deletes or reorders — record count and order are preserved', () => {
    const mixed = [
      { ...SEED },
      { controlId: 'CTL-001', implementationDescription: 'Mine', createdDate: '2026-01-01T00:00:00.000Z' },
      { ...DEFAULT_CONTROLS[1] }
    ];
    const after = stampSeededDemoControls({ controls: mixed });
    expect(after.controls.length).toBe(3);
    expect(after.controls.map(c => c.controlId)).toEqual(mixed.map(c => c.controlId));
  });

  test('preserves sibling keys on the persisted state', () => {
    const after = stampSeededDemoControls({ controls: [{ ...SEED }], somethingElse: 42 });
    expect(after.somethingElse).toBe(42);
  });

  test.each([
    ['undefined state', undefined],
    ['null state', null],
    ['missing controls key', {}],
    ['controls not an array', { controls: 'corrupt' }]
  ])('survives %s without throwing', (_label, state) => {
    expect(() => stampSeededDemoControls(state)).not.toThrow();
  });
});

describe('migrateControlsState (v5 → v6 chain, issue #299)', () => {
  test('a pre-v5 empty install seeds the stamped demo controls', () => {
    const after = migrateControlsState({ controls: [] }, 0);
    expect(after.controls).toEqual(SEEDED_CONTROLS);
  });

  test('a pre-v5 install with its own controls keeps them untouched', () => {
    const mine = { controlId: 'CTL-001', implementationDescription: 'Mine', createdDate: '2026-01-01T00:00:00.000Z' };
    const after = migrateControlsState({ controls: [mine] }, 0);
    expect(after.controls).toEqual([mine]);
  });

  test('a v5 install with the pristine demo set converges to the fresh v6 seed state', () => {
    const v5State = { controls: DEFAULT_CONTROLS.map(c => ({ ...c })) };
    const after = migrateControlsState(v5State, 5);
    expect(after.controls).toEqual(SEEDED_CONTROLS);
  });

  test('a v5 install mixing demo and user controls stamps only the demo ones', () => {
    const mine = { controlId: 'CTL-001', implementationDescription: 'Mine', createdDate: '2026-01-01T00:00:00.000Z' };
    const after = migrateControlsState({ controls: [{ ...SEED }, mine] }, 5);
    expect(after.controls[0].assessmentId).toBe(COMPREHENSIVE_ASSESSMENT_ID);
    expect(after.controls[1]).toEqual(mine);
  });

  test('migration never changes the record count', () => {
    const v5State = { controls: DEFAULT_CONTROLS.map(c => ({ ...c })) };
    expect(migrateControlsState(v5State, 5).controls.length).toBe(DEFAULT_CONTROLS.length);
  });

  test('deleted demo controls are NOT resurrected by the migration (stamp-only, never upsert)', () => {
    // #299 makes demo controls one-click deletable; a heal migration that
    // inserted missing seeds would bring every deleted one back on the next
    // load, contradicting the feature.
    const pruned = DEFAULT_CONTROLS.slice(6).map(c => ({ ...c }));
    const after = migrateControlsState({ controls: pruned }, 5);
    expect(after.controls.length).toBe(DEFAULT_CONTROLS.length - 6);
    const deletedIds = DEFAULT_CONTROLS.slice(0, 6).map(c => c.controlId);
    expect(after.controls.some(c => deletedIds.includes(c.controlId))).toBe(false);
  });

  test('a v5 install that deleted ALL controls stays empty (re-seed only ever applies pre-v5)', () => {
    expect(migrateControlsState({ controls: [] }, 5).controls).toEqual([]);
  });
});

describe('createControl assessment scoping (issue #299)', () => {
  beforeEach(() => useControlsStore.setState({ controls: [], history: [], historyIndex: -1 }));

  test('stamps the assessmentId it is given', () => {
    const created = useControlsStore.getState().createControl({ assessmentId: 'ASM-user-2026' });
    expect(created.assessmentId).toBe('ASM-user-2026');
  });

  test('defaults to null (visible everywhere) and never sets seedSource', () => {
    const created = useControlsStore.getState().createControl({});
    expect(created.assessmentId).toBeNull();
    expect('seedSource' in created).toBe(false);
  });

  test('getNextControlId stays global across assessments — no duplicate CTL ids', () => {
    const store = useControlsStore.getState();
    const a = store.createControl({ controlId: store.getNextControlId(), assessmentId: 'ASM-a' });
    const b = useControlsStore.getState().createControl({
      controlId: useControlsStore.getState().getNextControlId(),
      assessmentId: 'ASM-b'
    });
    expect(a.controlId).not.toBe(b.controlId);
  });
});

describe('controls CSV assessment scope round-trip (issue #299)', () => {
  beforeEach(() => useControlsStore.setState({ controls: [], history: [], historyIndex: -1 }));

  test('importControlsCSV reads the Assessment ID column', async () => {
    const csv = [
      'Control ID,Control Implementation Description,Assessment ID',
      'CTL-X1,Scoped control,ASM-user-2026',
      'CTL-X2,Unscoped control,'
    ].join('\n');
    await useControlsStore.getState().importControlsCSV(csv);
    const byId = Object.fromEntries(useControlsStore.getState().controls.map(c => [c.controlId, c]));
    expect(byId['CTL-X1'].assessmentId).toBe('ASM-user-2026');
    expect(byId['CTL-X2'].assessmentId).toBeNull();
  });

  test('an older CSV without the column imports as unassigned', async () => {
    const csv = ['Control ID,Control Implementation Description', 'CTL-X3,Old-format control'].join('\n');
    await useControlsStore.getState().importControlsCSV(csv);
    expect(useControlsStore.getState().controls[0].assessmentId).toBeNull();
  });

  test('an id naming no current assessment is preserved, not silently nulled', async () => {
    const csv = [
      'Control ID,Control Implementation Description,Assessment ID',
      'CTL-X4,Foreign control,ASM-not-here'
    ].join('\n');
    await useControlsStore.getState().importControlsCSV(csv);
    expect(useControlsStore.getState().controls[0].assessmentId).toBe('ASM-not-here');
  });
});
