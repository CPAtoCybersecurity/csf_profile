import { migrateAssessmentsState } from './assessmentsStore';

/**
 * Regression tests for the persisted-state migration chain.
 * The original implementation returned early from each version step, so a
 * client on an old schema version silently skipped every later migration.
 * These tests prove the chain falls through end to end.
 */

const legacyV0State = () => ({
  currentAssessmentId: 'ASM-legacy',
  assessments: [
    {
      id: 'ASM-legacy',
      name: 'Legacy assessment',
      scopeType: 'controls',
      scopeIds: ['GV.SC-04', 'DE.CM-03'],
      observations: {
        'GV.SC-04': {
          actualScore: 2,
          targetScore: 3,
          observations: 'Legacy single-period note',
          testingStatus: 'In Progress',
          assessmentMethods: { examine: true, interview: false, test: false }
        }
      }
    }
  ]
});

describe('migrateAssessmentsState', () => {
  test('a v0 client receives EVERY later migration, not just the first (fall-through)', () => {
    const result = migrateAssessmentsState(legacyV0State(), 0);
    const legacy = result.assessments.find(a => a.id === 'ASM-legacy');

    // v1: observations became quarterly
    expect(legacy.observations['GV.SC-04'].quarters).toBeDefined();
    expect(legacy.observations['GV.SC-04'].quarters.Q1.actualScore).toBe(2);

    // v4/v5: scopeType corrected because scopeIds are subcategory-style
    expect(legacy.scopeType).toBe('requirements');

    // v6: audit assessment added — this step was unreachable for v0 clients before the fix
    expect(result.assessments.some(a => a.id === 'ASM-audit-2025-alma')).toBe(true);

    // v8/v9: comprehensive assessment added — also previously unreachable from v0
    expect(result.assessments.length).toBeGreaterThanOrEqual(3);
  });

  test('a mid-chain client (v3) still receives all later migrations', () => {
    const state = legacyV0State();
    // Simulate v3-era data: already quarterly
    state.assessments[0].observations['GV.SC-04'] = {
      quarters: { Q1: { actualScore: 2 } }
    };
    const result = migrateAssessmentsState(state, 3);

    expect(result.assessments.find(a => a.id === 'ASM-legacy').scopeType).toBe('requirements');
    expect(result.assessments.some(a => a.id === 'ASM-audit-2025-alma')).toBe(true);
  });

  test('current-version state passes through unchanged', () => {
    const state = {
      assessments: [{ id: 'ASM-x', observations: {}, scoringScale: 10 }],
      currentAssessmentId: 'ASM-x'
    };
    const result = migrateAssessmentsState(state, 10);
    expect(result).toEqual(state);
  });

  describe('v10: scoringScale stamp (issue #277)', () => {
    test('a v9 client gets scoringScale 10 stamped on every assessment', () => {
      const state = {
        assessments: [
          { id: 'ASM-a', observations: {} },
          { id: 'ASM-b', observations: {} }
        ],
        currentAssessmentId: 'ASM-a'
      };
      const result = migrateAssessmentsState(state, 9);
      expect(result.assessments.every(a => a.scoringScale === 10)).toBe(true);
    });

    test('stored scores are byte-equal across the v10 stamp — never rescaled', () => {
      const state = {
        assessments: [{
          id: 'ASM-a',
          observations: {
            'GV.SC-04': { quarters: { Q1: { actualScore: 7.5, targetScore: 9 } } }
          }
        }],
        currentAssessmentId: 'ASM-a'
      };
      const result = migrateAssessmentsState(state, 9);
      const q1 = result.assessments[0].observations['GV.SC-04'].quarters.Q1;
      expect(q1.actualScore).toBe(7.5);
      expect(q1.targetScore).toBe(9);
    });

    test('idempotent: an assessment already carrying a valid scale keeps it', () => {
      const state = {
        assessments: [
          { id: 'ASM-five', observations: {}, scoringScale: 5 },
          { id: 'ASM-ten', observations: {}, scoringScale: 10 },
          { id: 'ASM-junk', observations: {}, scoringScale: 7 }
        ],
        currentAssessmentId: 'ASM-five'
      };
      const result = migrateAssessmentsState(state, 9);
      expect(result.assessments.find(a => a.id === 'ASM-five').scoringScale).toBe(5);
      expect(result.assessments.find(a => a.id === 'ASM-ten').scoringScale).toBe(10);
      expect(result.assessments.find(a => a.id === 'ASM-junk').scoringScale).toBe(10);
    });

    test('a v0 client also receives the scale stamp (fall-through)', () => {
      const result = migrateAssessmentsState(legacyV0State(), 0);
      expect(result.assessments.every(a => a.scoringScale === 5 || a.scoringScale === 10)).toBe(true);
    });
  });

  test('empty/new state gets defaults and still runs the rest of the chain', () => {
    const result = migrateAssessmentsState({ assessments: [] }, 0);
    expect(result.assessments.length).toBeGreaterThan(0);
    expect(result.assessments.some(a => a.id === 'ASM-audit-2025-alma')).toBe(true);
  });
});
