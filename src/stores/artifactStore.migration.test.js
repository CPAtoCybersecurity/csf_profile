import {
  repairRelocatedLinks,
  stampSeededDemoArtifacts,
  migrateArtifactsState,
  SEEDED_ARTIFACTS
} from './artifactStore';
import { RELOCATED_ARTIFACT_LINKS, DEFAULT_ARTIFACTS } from './defaultArtifactsData';
import { COMPREHENSIVE_ARTIFACTS, COMPREHENSIVE_ASSESSMENT_ID } from './comprehensiveAssessmentData';
import { DEMO_SEED_SOURCE } from '../utils/assessmentScope';

const [DEAD_LINK, LIVE_LINK] = Object.entries(RELOCATED_ARTIFACT_LINKS)[0];

describe('repairRelocatedLinks (artifacts store migration v7, issue #287)', () => {
  test('rewrites a seeded link that the ASSESSMENT_CATALOG restructure broke', () => {
    const before = { artifacts: [{ artifactId: 'AR-1', link: DEAD_LINK }] };
    expect(repairRelocatedLinks(before).artifacts[0].link).toBe(LIVE_LINK);
  });

  test('covers every entry in the relocation map', () => {
    const artifacts = Object.keys(RELOCATED_ARTIFACT_LINKS).map((link, i) => ({
      artifactId: `AR-${i}`,
      link
    }));
    const repaired = repairRelocatedLinks({ artifacts }).artifacts;
    expect(repaired.map(a => a.link)).toEqual(Object.values(RELOCATED_ARTIFACT_LINKS));
  });

  test('leaves a link the user entered themselves alone', () => {
    const mine = 'https://intranet.example.com/evidence/phishing-q1.xlsx';
    const before = { artifacts: [{ artifactId: 'AR-99', link: mine }] };
    expect(repairRelocatedLinks(before).artifacts[0].link).toBe(mine);
  });

  test('preserves every other field on a rewritten artifact', () => {
    const artifact = {
      artifactId: 'AR-1',
      name: 'Phishing Campaign Results',
      link: DEAD_LINK,
      controlId: 'PR.AT-01 Ex2',
      status: 'ACTIVE'
    };
    expect(repairRelocatedLinks({ artifacts: [artifact] }).artifacts[0]).toEqual({
      ...artifact,
      link: LIVE_LINK
    });
  });

  test('preserves sibling keys on the persisted state', () => {
    const before = { artifacts: [{ artifactId: 'AR-1', link: DEAD_LINK }], somethingElse: 42 };
    expect(repairRelocatedLinks(before).somethingElse).toBe(42);
  });

  test('is idempotent — a second pass changes nothing', () => {
    const once = repairRelocatedLinks({ artifacts: [{ artifactId: 'AR-1', link: DEAD_LINK }] });
    expect(repairRelocatedLinks(once)).toBe(once);
  });

  test('returns the state untouched when there is nothing to repair', () => {
    const state = { artifacts: [{ artifactId: 'AR-1', link: LIVE_LINK }] };
    expect(repairRelocatedLinks(state)).toBe(state);
  });

  test.each([
    ['undefined state', undefined],
    ['null state', null],
    ['missing artifacts key', {}],
    ['artifacts not an array', { artifacts: 'corrupt' }]
  ])('survives %s without throwing', (_label, state) => {
    expect(() => repairRelocatedLinks(state)).not.toThrow();
  });

  test('tolerates artifacts with no link field', () => {
    const before = { artifacts: [{ artifactId: 'AR-6' }, null] };
    expect(() => repairRelocatedLinks(before)).not.toThrow();
  });

  // A link is user-supplied — CSV import takes the column raw. If the lookup read through the
  // prototype chain, these would each replace the link with a function or an object, and
  // JSON.stringify would then drop the field entirely on the way into localStorage.
  test.each([
    'toString',
    'valueOf',
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    '__proto__'
  ])('leaves the inherited-property name %p untouched', name => {
    const artifacts = [{ artifactId: 'AR-1', link: name }];
    const after = repairRelocatedLinks({ artifacts });
    expect(typeof after.artifacts[0].link).toBe('string');
    expect(after.artifacts[0].link).toBe(name);
    // Unchanged input must return the identical object, not a needless whole-state rewrite.
    expect(after.artifacts[0]).toBe(artifacts[0]);
  });

  test('survives the round trip into and out of localStorage', () => {
    const artifacts = [
      { artifactId: 'AR-1', link: DEAD_LINK },
      { artifactId: 'AR-2', link: 'toString' }
    ];
    const repaired = repairRelocatedLinks({ artifacts });
    const persisted = JSON.parse(JSON.stringify(repaired));
    expect(persisted.artifacts[0].link).toBe(LIVE_LINK);
    expect(persisted.artifacts[1].link).toBe('toString');
  });

  test('ignores a non-string link rather than throwing on it', () => {
    const artifacts = [{ artifactId: 'AR-1', link: { nested: true } }];
    expect(repairRelocatedLinks({ artifacts }).artifacts[0]).toBe(artifacts[0]);
  });

  test('every relocation target is a link this repo actually ships', () => {
    for (const target of Object.values(RELOCATED_ARTIFACT_LINKS)) {
      expect(target).toContain('/ASSESSMENT_CATALOG/');
      expect(target).not.toContain('/Sample_Artifacts/');
    }
  });
});

describe('stampSeededDemoArtifacts (artifacts store migration v8, issue #297)', () => {
  // What a pre-#297 install actually holds: the seeded records without the
  // new fields.
  const legacySeed = (a) => {
    const { assessmentId, seedSource, ...rest } = a;
    return rest;
  };

  test('stamps a persisted seeded demo artifact with the demo assessment + provenance', () => {
    const before = { artifacts: [legacySeed(SEEDED_ARTIFACTS[0])] };
    const after = stampSeededDemoArtifacts(before);
    expect(after.artifacts[0].assessmentId).toBe(COMPREHENSIVE_ASSESSMENT_ID);
    expect(after.artifacts[0].seedSource).toBe(DEMO_SEED_SOURCE);
  });

  test('does NOT stamp a user artifact whose artifactId collides but whose name differs', () => {
    const mine = { ...legacySeed(SEEDED_ARTIFACTS[0]), name: 'My own evidence file' };
    const after = stampSeededDemoArtifacts({ artifacts: [mine] });
    expect(after.artifacts[0].assessmentId).toBeUndefined();
    expect(after.artifacts[0].seedSource).toBeUndefined();
  });

  test('never overwrites an existing assessmentId', () => {
    const rescoped = { ...legacySeed(SEEDED_ARTIFACTS[0]), assessmentId: 'ASM-user-2026' };
    const after = stampSeededDemoArtifacts({ artifacts: [rescoped] });
    expect(after.artifacts[0].assessmentId).toBe('ASM-user-2026');
    expect(after.artifacts[0].seedSource).toBeUndefined();
  });

  test('preserves user edits on a stamped record (heal-in-place, only the two fields change)', () => {
    const edited = { ...legacySeed(SEEDED_ARTIFACTS[0]), description: 'my notes', status: 'ARCHIVED' };
    const after = stampSeededDemoArtifacts({ artifacts: [edited] });
    expect(after.artifacts[0]).toEqual({
      ...edited,
      assessmentId: COMPREHENSIVE_ASSESSMENT_ID,
      seedSource: DEMO_SEED_SOURCE
    });
  });

  test('is idempotent — a second pass changes nothing', () => {
    const once = stampSeededDemoArtifacts({ artifacts: [legacySeed(SEEDED_ARTIFACTS[0])] });
    expect(stampSeededDemoArtifacts(once)).toBe(once);
  });

  test('never deletes a record — counts are equal before and after', () => {
    const before = {
      artifacts: [
        ...SEEDED_ARTIFACTS.map(legacySeed),
        { artifactId: 'AR-mine', name: 'Mine', link: '' }
      ]
    };
    expect(stampSeededDemoArtifacts(before).artifacts).toHaveLength(before.artifacts.length);
  });

  test('a record with an unknown id and NO name is never stamped (undefined must not match undefined)', () => {
    const after = stampSeededDemoArtifacts({ artifacts: [{ artifactId: 'AR-unknown' }] });
    expect(after.artifacts[0].assessmentId).toBeUndefined();
  });

  test('tolerates corrupt state shapes', () => {
    expect(stampSeededDemoArtifacts(undefined)).toBeUndefined();
    expect(stampSeededDemoArtifacts({ artifacts: 'corrupt' }).artifacts).toBe('corrupt');
  });
});

describe('migrateArtifactsState — the production migrate path (issue #297)', () => {
  test('a pristine v7 install converges to exactly the fresh v8 seed', () => {
    // v7 installs held DEFAULT + COMPREHENSIVE merged, de-duped by artifactId,
    // without the new fields — reconstruct that from the shipped data.
    const seen = new Set();
    const v7State = { artifacts: [] };
    for (const a of [...DEFAULT_ARTIFACTS, ...COMPREHENSIVE_ARTIFACTS]) {
      if (seen.has(a.artifactId)) continue;
      seen.add(a.artifactId);
      v7State.artifacts.push({ ...a });
    }
    expect(migrateArtifactsState(v7State, 7).artifacts).toEqual(SEEDED_ARTIFACTS);
  });

  test('a v6 state also picks up the v8 stamp (post-chain pass runs on every path)', () => {
    const v6State = { artifacts: [{ ...COMPREHENSIVE_ARTIFACTS[0] }] };
    const after = migrateArtifactsState(v6State, 6);
    expect(after.artifacts.find(a => a.artifactId === COMPREHENSIVE_ARTIFACTS[0].artifactId).assessmentId)
      .toBe(COMPREHENSIVE_ASSESSMENT_ID);
  });

  test('a user-created artifact rides the full chain untouched', () => {
    const mine = { artifactId: 'AR-9001', name: 'My evidence', link: 'https://intranet.example.com/x' };
    const after = migrateArtifactsState({ artifacts: [mine] }, 7);
    expect(after.artifacts[0]).toEqual(mine);
  });
});

describe('artifacts CSV assessment scope round-trip (issue #297)', () => {
  // The import path is header-name based, so older CSVs without the column
  // simply land unassigned.
  const useArtifactStore = require('./artifactStore').default;

  beforeEach(() => useArtifactStore.setState({ artifacts: [] }));

  test('importArtifactsCSV reads the Assessment ID column', async () => {
    const csv = [
      'Artifact ID,Name,Description,Link,Type,Control ID,Assessment ID',
      'AR-X1,Scoped artifact,desc,,Document,,ASM-user-2026',
      'AR-X2,Unscoped artifact,desc,,Document,,'
    ].join('\n');
    await useArtifactStore.getState().importArtifactsCSV(csv);
    const byId = Object.fromEntries(useArtifactStore.getState().artifacts.map(a => [a.artifactId, a]));
    expect(byId['AR-X1'].assessmentId).toBe('ASM-user-2026');
    expect(byId['AR-X2'].assessmentId).toBeNull();
  });

  test('an older CSV without the column imports as unassigned', async () => {
    const csv = ['Artifact ID,Name,Description', 'AR-X3,Old-format artifact,desc'].join('\n');
    await useArtifactStore.getState().importArtifactsCSV(csv);
    expect(useArtifactStore.getState().artifacts[0].assessmentId).toBeNull();
  });

  test('an id naming no current assessment is preserved, not silently nulled', async () => {
    const csv = [
      'Artifact ID,Name,Description,Assessment ID',
      'AR-X4,Foreign artifact,desc,ASM-not-here'
    ].join('\n');
    await useArtifactStore.getState().importArtifactsCSV(csv);
    expect(useArtifactStore.getState().artifacts[0].assessmentId).toBe('ASM-not-here');
  });
});
