import {
  DEMO_SEED_SOURCE,
  SCOPE_ALL,
  SCOPE_UNASSIGNED,
  isUnassigned,
  belongsToAssessment,
  filterByScope,
  resolveScopeStamp,
  defaultScope
} from './assessmentScope';
import { COMPREHENSIVE_ASSESSMENT_ID } from '../stores/comprehensiveAssessmentData';
import { SEEDED_ARTIFACTS } from '../stores/artifactStore';
import { SEEDED_FINDINGS } from '../stores/findingsStore';
import { DEFAULT_USERS } from '../stores/userStore';
import { DEMO_ASSESSMENT_USERS, ASSESSMENT_USER_ROLES } from '../stores/assessmentsStore';

const DEMO = COMPREHENSIVE_ASSESSMENT_ID;
const MINE = 'ASM-user-2026';

describe('belongsToAssessment / isUnassigned (issue #297)', () => {
  test('matches on explicit assessmentId', () => {
    expect(belongsToAssessment({ assessmentId: DEMO }, DEMO)).toBe(true);
    expect(belongsToAssessment({ assessmentId: DEMO }, MINE)).toBe(false);
  });

  test('legacy finding with only an evaluationId containing the id matches', () => {
    const legacy = { evaluationId: `${MINE}-GV.OC-01` };
    expect(belongsToAssessment(legacy, MINE)).toBe(true);
    expect(belongsToAssessment(legacy, DEMO)).toBe(false);
  });

  test('an explicit assessmentId wins over the evaluationId fallback', () => {
    const record = { assessmentId: DEMO, evaluationId: `${MINE}-GV.OC-01` };
    expect(belongsToAssessment(record, MINE)).toBe(false);
  });

  test('unassigned means no assessmentId', () => {
    expect(isUnassigned({})).toBe(true);
    expect(isUnassigned({ assessmentId: null })).toBe(true);
    expect(isUnassigned({ assessmentId: DEMO })).toBe(false);
  });

  test('null/undefined record or scope never matches', () => {
    expect(belongsToAssessment(null, DEMO)).toBe(false);
    expect(belongsToAssessment({ assessmentId: DEMO }, null)).toBe(false);
  });
});

describe('filterByScope semantics (issue #297)', () => {
  const demoRec = { id: 1, assessmentId: DEMO };
  const mineRec = { id: 2, assessmentId: MINE };
  const legacyRec = { id: 3 };
  const all = [demoRec, mineRec, legacyRec];

  test('SCOPE_ALL returns everything', () => {
    expect(filterByScope(all, SCOPE_ALL)).toEqual(all);
  });

  test('a per-assessment scope shows its own records PLUS unassigned ones', () => {
    expect(filterByScope(all, MINE)).toEqual([mineRec, legacyRec]);
  });

  test('demo records are invisible in every other assessment scope', () => {
    expect(filterByScope(all, MINE)).not.toContain(demoRec);
  });

  test('SCOPE_UNASSIGNED shows only unassigned records', () => {
    expect(filterByScope(all, SCOPE_UNASSIGNED)).toEqual([legacyRec]);
  });

  test('a user-created unassigned record is reachable in EVERY scope except none', () => {
    expect(filterByScope(all, DEMO)).toContain(legacyRec);
    expect(filterByScope(all, MINE)).toContain(legacyRec);
    expect(filterByScope(all, SCOPE_ALL)).toContain(legacyRec);
    expect(filterByScope(all, SCOPE_UNASSIGNED)).toContain(legacyRec);
  });

  test('tolerates a non-array input', () => {
    expect(filterByScope(undefined, SCOPE_ALL)).toEqual([]);
  });

  test('Unassigned view surfaces orphans of a deleted assessment when known ids are given', () => {
    const orphan = { id: 9, assessmentId: 'ASM-deleted' };
    const records = [...all, orphan];
    const knownAssessmentIds = [DEMO, MINE];
    expect(filterByScope(records, SCOPE_UNASSIGNED, { knownAssessmentIds }))
      .toEqual([legacyRec, orphan]);
    // Without the known set, behavior is unchanged (strict unassigned only)
    expect(filterByScope(records, SCOPE_UNASSIGNED)).toEqual([legacyRec]);
  });
});

describe('resolveScopeStamp / defaultScope (issue #297)', () => {
  test('a concrete assessment scope wins', () => {
    expect(resolveScopeStamp(MINE, DEMO)).toBe(MINE);
  });

  test('the ALL scope falls back to the current assessment', () => {
    expect(resolveScopeStamp(SCOPE_ALL, MINE)).toBe(MINE);
  });

  test('the UNASSIGNED view stamps null — a record created there must stay visible there', () => {
    expect(resolveScopeStamp(SCOPE_UNASSIGNED, MINE)).toBeNull();
    expect(filterByScope([{ assessmentId: resolveScopeStamp(SCOPE_UNASSIGNED, MINE) }], SCOPE_UNASSIGNED))
      .toHaveLength(1);
  });

  test('no scope and no current assessment stamps null (unassigned)', () => {
    expect(resolveScopeStamp(SCOPE_ALL, null)).toBeNull();
  });

  test('defaultScope is the current assessment when set, else ALL', () => {
    expect(defaultScope(MINE)).toBe(MINE);
    expect(defaultScope(null)).toBe(SCOPE_ALL);
  });
});

describe('shipped demo data is fully scoped to the demo assessment (issue #297)', () => {
  test('every seeded artifact carries the demo assessmentId and seed provenance', () => {
    expect(SEEDED_ARTIFACTS.length).toBeGreaterThan(0);
    for (const a of SEEDED_ARTIFACTS) {
      expect(a.assessmentId).toBe(DEMO);
      expect(a.seedSource).toBe(DEMO_SEED_SOURCE);
    }
  });

  test('every seeded finding carries the demo assessmentId and seed provenance', () => {
    expect(SEEDED_FINDINGS.length).toBeGreaterThan(0);
    for (const f of SEEDED_FINDINGS) {
      expect(f.assessmentId).toBe(DEMO);
      expect(f.seedSource).toBe(DEMO_SEED_SOURCE);
    }
  });

  test('every seeded directory user carries seed provenance', () => {
    expect(DEFAULT_USERS).toHaveLength(8);
    for (const u of DEFAULT_USERS) {
      expect(u.seedSource).toBe(DEMO_SEED_SOURCE);
    }
  });

  test('the demo assessment roster covers all 8 demo users with valid roles', () => {
    expect(DEMO_ASSESSMENT_USERS.map(u => u.userId).sort()).toEqual(
      DEFAULT_USERS.map(u => u.id).sort()
    );
    for (const pair of DEMO_ASSESSMENT_USERS) {
      expect(ASSESSMENT_USER_ROLES).toContain(pair.role);
    }
  });

  test('demo findings and artifacts vanish from a fresh non-demo assessment scope', () => {
    expect(filterByScope(SEEDED_ARTIFACTS, MINE)).toEqual([]);
    expect(filterByScope(SEEDED_FINDINGS, MINE)).toEqual([]);
  });
});
