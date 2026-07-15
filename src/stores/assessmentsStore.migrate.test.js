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
    const state = { assessments: [{ id: 'ASM-x', observations: {} }], currentAssessmentId: 'ASM-x' };
    const result = migrateAssessmentsState(state, 9);
    expect(result).toEqual(state);
  });

  test('empty/new state gets defaults and still runs the rest of the chain', () => {
    const result = migrateAssessmentsState({ assessments: [] }, 0);
    expect(result.assessments.length).toBeGreaterThan(0);
    expect(result.assessments.some(a => a.id === 'ASM-audit-2025-alma')).toBe(true);
  });
});
