import { migrateAssessmentsState, DEMO_ASSESSMENT_USERS } from './assessmentsStore';
import { getBankProcedure, BANK_VERSION } from '../utils/procedureBank';

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

    // v8/v9: comprehensive assessment added; v14: the two legacy demo
    // assessments are gone again (issue #294) — only the comprehensive
    // example plus the user's own assessment remain
    expect(result.assessments.some(a => a.id === 'ASM-2026-comprehensive-alma')).toBe(true);
    expect(result.assessments.some(a => a.id === 'ASM-audit-2025-alma')).toBe(false);
    expect(result.assessments.some(a => a.id === 'ASM-default-2025-alma')).toBe(false);
  });

  test('a mid-chain client (v3) still receives all later migrations', () => {
    const state = legacyV0State();
    // Simulate v3-era data: already quarterly
    state.assessments[0].observations['GV.SC-04'] = {
      quarters: { Q1: { actualScore: 2 } }
    };
    const result = migrateAssessmentsState(state, 3);

    expect(result.assessments.find(a => a.id === 'ASM-legacy').scopeType).toBe('requirements');
    expect(result.assessments.some(a => a.id === 'ASM-2026-comprehensive-alma')).toBe(true);
  });

  test('current-version state passes through unchanged', () => {
    const state = {
      assessments: [{
        id: 'ASM-x',
        observations: {},
        scoringScale: 10,
        externalTracking: { enabled: false, systems: { findings: '', artifacts: '', controls: '' } },
        year: 2026,
        users: [{ userId: 1, role: 'auditor' }]
      }],
      currentAssessmentId: 'ASM-x'
    };
    const result = migrateAssessmentsState(state, 14);
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

  describe('v11: externalTracking stamp (issue #284; shape now v12 per issue #288)', () => {
    const DISABLED_V12 = { enabled: false, systems: { findings: '', artifacts: '', controls: '' } };

    test('a v10 client gets the disabled default stamped on every assessment', () => {
      const state = {
        assessments: [
          { id: 'ASM-a', observations: {}, scoringScale: 10 },
          { id: 'ASM-b', observations: {}, scoringScale: 5 }
        ],
        currentAssessmentId: 'ASM-a'
      };
      const result = migrateAssessmentsState(state, 10);
      expect(result.assessments.every(a =>
        a.externalTracking && a.externalTracking.enabled === false
      )).toBe(true);
      expect(result.assessments[0].externalTracking).toEqual(DISABLED_V12);
    });

    test('a v10 record already carrying a single-name config converts it per type', () => {
      const state = {
        assessments: [
          { id: 'ASM-jira', observations: {}, scoringScale: 10, externalTracking: { enabled: true, systemName: 'Jira' } },
          { id: 'ASM-junk', observations: {}, scoringScale: 10, externalTracking: 'garbage' }
        ],
        currentAssessmentId: 'ASM-jira'
      };
      const result = migrateAssessmentsState(state, 10);
      expect(result.assessments.find(a => a.id === 'ASM-jira').externalTracking)
        .toEqual({ enabled: true, systems: { findings: 'Jira', artifacts: 'Jira', controls: 'Jira' } });
      expect(result.assessments.find(a => a.id === 'ASM-junk').externalTracking)
        .toEqual(DISABLED_V12);
    });

    test('a v0 client also receives the externalTracking stamp (fall-through)', () => {
      const result = migrateAssessmentsState(legacyV0State(), 0);
      expect(result.assessments.every(a =>
        a.externalTracking && typeof a.externalTracking.enabled === 'boolean' &&
        a.externalTracking.systems && typeof a.externalTracking.systems === 'object'
      )).toBe(true);
    });
  });

  describe('v12: per-record-type external systems (issue #288)', () => {
    test('a v11 client converts the single system name to all three record types', () => {
      const state = {
        assessments: [
          { id: 'ASM-v11', observations: {}, scoringScale: 10, externalTracking: { enabled: true, systemName: 'Jira' } }
        ],
        currentAssessmentId: 'ASM-v11'
      };
      const result = migrateAssessmentsState(state, 11);
      expect(result.assessments[0].externalTracking).toEqual({
        enabled: true,
        systems: { findings: 'Jira', artifacts: 'Jira', controls: 'Jira' }
      });
    });

    test('an already-v12 config is preserved exactly', () => {
      const config = { enabled: true, systems: { findings: 'Jira', artifacts: 'SharePoint', controls: 'Hyperproof' } };
      const state = {
        assessments: [{ id: 'ASM-v12', observations: {}, scoringScale: 10, externalTracking: config }],
        currentAssessmentId: 'ASM-v12'
      };
      const result = migrateAssessmentsState(state, 11);
      expect(result.assessments[0].externalTracking).toEqual(config);
    });

    test('scores and observations are untouched by the reshape', () => {
      const observations = {
        'GV.OC-01 Ex1': {
          testProcedures: 'Inspect the charter.',
          linkedArtifacts: ['art-1'],
          quarters: { Q1: { actualScore: 3.25, targetScore: 4, observations: 'On track' } }
        }
      };
      const state = {
        assessments: [{
          id: 'ASM-frozen',
          observations,
          scoringScale: 5,
          externalTracking: { enabled: true, systemName: 'Jira' }
        }],
        currentAssessmentId: 'ASM-frozen'
      };
      const before = JSON.stringify(state.assessments[0].observations);
      const result = migrateAssessmentsState(state, 11);
      const migrated = result.assessments[0];
      expect(JSON.stringify(migrated.observations)).toBe(before);
      expect(migrated.scoringScale).toBe(5);
    });
  });

  describe('v13: year + user scope stamp (issues #291/#290)', () => {
    test('a v12 client gets year stamped from its own createdDate and an empty users list', () => {
      const state = {
        assessments: [{
          id: 'ASM-x',
          createdDate: '2024-03-15T12:00:00.000Z',
          observations: {},
          scoringScale: 10,
          externalTracking: { enabled: false, systems: { findings: '', artifacts: '', controls: '' } }
        }]
      };
      const result = migrateAssessmentsState(state, 12);
      expect(result.assessments[0].year).toBe(2024);
      expect(result.assessments[0].users).toEqual([]);
    });

    test('a missing/invalid createdDate falls back to the current year', () => {
      const state = { assessments: [{ id: 'A' }, { id: 'B', createdDate: 'not-a-date' }] };
      const result = migrateAssessmentsState(state, 12);
      const thisYear = new Date().getFullYear();
      expect(result.assessments[0].year).toBe(thisYear);
      expect(result.assessments[1].year).toBe(thisYear);
    });

    test('idempotent: a valid existing year and user scope are preserved', () => {
      const state = {
        assessments: [{
          id: 'ASM-x',
          createdDate: '2023-01-01T00:00:00.000Z',
          year: 2025,
          users: [{ userId: 7, role: 'control owner' }]
        }]
      };
      const result = migrateAssessmentsState(state, 12);
      expect(result.assessments[0].year).toBe(2025);
      expect(result.assessments[0].users).toEqual([{ userId: 7, role: 'control owner' }]);
    });

    test('tampered users entries are dropped, deduped, and stripped of PII fields', () => {
      const state = {
        assessments: [{
          id: 'ASM-x',
          users: [
            { userId: 1, role: 'auditor', email: 'smuggled@example.com', name: 'Smuggled' },
            { userId: 1, role: 'stakeholder' },
            { userId: 2, role: 'not-a-role' },
            { role: 'auditor' },
            'garbage',
            null
          ]
        }]
      };
      const result = migrateAssessmentsState(state, 12);
      expect(result.assessments[0].users).toEqual([{ userId: 1, role: 'auditor' }]);
    });

    test('a v0 client also receives the year/users stamp (fall-through)', () => {
      const result = migrateAssessmentsState(legacyV0State(), 0);
      const legacy = result.assessments.find(a => a.id === 'ASM-legacy');
      expect(typeof legacy.year).toBe('number');
      expect(legacy.users).toEqual([]);
    });

    test('scores and observations are untouched by the stamp', () => {
      const observations = {
        'GV.SC-04': { quarters: { Q1: { actualScore: 7.5, targetScore: 9 } } }
      };
      const state = {
        assessments: [{ id: 'ASM-x', observations }]
      };
      const before = JSON.stringify(observations);
      const result = migrateAssessmentsState(state, 12);
      expect(JSON.stringify(result.assessments[0].observations)).toBe(before);
    });
  });

  test('empty/new state gets ONLY the comprehensive example (issue #294)', () => {
    const result = migrateAssessmentsState({ assessments: [] }, 0);
    expect(result.assessments.map(a => a.id)).toEqual(['ASM-2026-comprehensive-alma']);
  });

  describe('v14: single example assessment (issue #294)', () => {
    const comprehensiveStub = (overrides = {}) => ({
      id: 'ASM-2026-comprehensive-alma',
      name: 'My renamed example',
      description: 'stale description',
      scopeType: 'requirements',
      scopeIds: ['DE.AE-02 Ex1'],
      observations: { 'DE.AE-02 Ex1': { testProcedures: 'plain text, no provenance', quarters: {} } },
      scoringScale: 5,
      externalTracking: { enabled: true, systems: { findings: 'Jira', artifacts: '', controls: '' } },
      year: 2030,
      users: [{ userId: 9, role: 'auditor' }],
      ...overrides
    });

    test('removes the two legacy demo assessments; user assessments are never touched', () => {
      const state = {
        assessments: [
          { id: 'ASM-default-2025-alma', observations: {} },
          { id: 'ASM-audit-2025-alma', observations: {} },
          { id: 'ASM-mine', name: 'My real assessment', observations: {} }
        ],
        currentAssessmentId: 'ASM-mine'
      };
      const result = migrateAssessmentsState(state, 13);
      expect(result.assessments.map(a => a.id)).toEqual(['ASM-mine']);
      expect(result.currentAssessmentId).toBe('ASM-mine');
    });

    test('the comprehensive example heals in place — Related stripped, user edits and stamps preserved', () => {
      // The example's observations are build-time bank attaches with pristine
      // provenance, so the SAME in-place clean that fixes user assessments
      // fixes the example. Nothing is constant-replaced: scores, notes, a
      // user rename, and every stamp survive (reviewer-flagged data-loss
      // path — a v13 user may have adopted the example as their working
      // assessment).
      const entry = getBankProcedure('DE.AE-02 Ex1');
      const state = {
        assessments: [comprehensiveStub({
          observations: {
            'DE.AE-02 Ex1': {
              testProcedures: `${entry.markdown}\n\n## Related\n\n- **Controls:** [DE.AE-02_Ex1](../../2_Controls/DE/DE.AE-02_Ex1.md)`,
              procedureSource: {
                bank: 'community',
                bankId: 'DE.AE-02',
                bankVersion: 'stale0000',
                attachedAt: '2026-04-30T00:00:00.000Z',
                modified: false
              },
              linkedArtifacts: ['Incident Response Playbook (Excerpt)'],
              quarters: { Q1: { actualScore: 2, targetScore: 5, observations: 'my own note' } }
            }
          }
        })],
        currentAssessmentId: 'ASM-2026-comprehensive-alma'
      };
      const result = migrateAssessmentsState(state, 13);
      const comp = result.assessments[0];
      const obs = comp.observations['DE.AE-02 Ex1'];
      // Procedure text healed to exactly the current bank entry
      expect(obs.testProcedures).toBe(entry.markdown);
      expect(obs.testProcedures).not.toContain('## Related');
      expect(obs.procedureSource.bankVersion).toBe(BANK_VERSION);
      // User work inside the example survives
      expect(obs.quarters.Q1).toEqual({ actualScore: 2, targetScore: 5, observations: 'my own note' });
      expect(obs.linkedArtifacts).toEqual(['Incident Response Playbook (Excerpt)']);
      expect(comp.name).toBe('My renamed example');
      expect(comp.scoringScale).toBe(5);
      expect(comp.externalTracking.systems.findings).toBe('Jira');
      expect(comp.year).toBe(2030);
      expect(comp.users).toEqual([{ userId: 9, role: 'auditor' }]);
    });

    test('currentAssessmentId pointing at a removed legacy example falls back to the comprehensive', () => {
      const state = {
        assessments: [
          { id: 'ASM-default-2025-alma', observations: {} },
          comprehensiveStub()
        ],
        currentAssessmentId: 'ASM-default-2025-alma'
      };
      const result = migrateAssessmentsState(state, 13);
      expect(result.currentAssessmentId).toBe('ASM-2026-comprehensive-alma');
    });

    test('currentAssessmentId falls back to the first remaining assessment when the comprehensive was deleted', () => {
      const state = {
        assessments: [
          { id: 'ASM-audit-2025-alma', observations: {} },
          { id: 'ASM-mine', observations: {} }
        ],
        currentAssessmentId: 'ASM-audit-2025-alma'
      };
      const result = migrateAssessmentsState(state, 13);
      expect(result.currentAssessmentId).toBe('ASM-mine');
    });

    test('a pristine attach from an older bank is cleaned in place to exactly the current bank text', () => {
      const entry = getBankProcedure('DE.AE-02 Ex1');
      // Simulate the pre-#294 bank copy: current text plus the Related
      // section the old bank still carried.
      const state = {
        assessments: [{
          id: 'ASM-mine',
          observations: {
            'DE.AE-02 Ex1': {
              testProcedures: `${entry.markdown}\n\n## Related\n\n- **Artifacts:** [X](../../5_Artifacts/Policies/POL-x.md)`,
              procedureSource: {
                bank: 'community',
                bankId: 'DE.AE-02',
                bankVersion: 'stale0000',
                attachedAt: '2026-05-01T00:00:00.000Z',
                modified: false
              },
              quarters: {}
            }
          }
        }],
        currentAssessmentId: 'ASM-mine'
      };
      const result = migrateAssessmentsState(state, 13);
      const obs = result.assessments[0].observations['DE.AE-02 Ex1'];
      expect(obs.testProcedures).toBe(entry.markdown);
      expect(obs.testProcedures).not.toContain('## Related');
      expect(obs.procedureSource.bankVersion).toBe(BANK_VERSION);
      expect(obs.procedureSource.attachedAt).toBe('2026-05-01T00:00:00.000Z');
    });

    test('a stale modified flag can cost at most the Related section — surrounding text survives verbatim', () => {
      // Flag says pristine but the text has actually diverged from the bank:
      // the in-place clean only strips the dead-link section, it never
      // replaces the user text wholesale, and provenance is NOT refreshed.
      const state = {
        assessments: [{
          id: 'ASM-mine',
          observations: {
            'DE.AE-02 Ex1': {
              testProcedures: 'My org checks the DR runbook first.\n\n## Related\n\n- [dead](../../2_Controls/DE/DE.AE-02_Ex1.md)\n\n## Notes\n\nKeep quarterly.',
              procedureSource: { bank: 'community', bankId: 'DE.AE-02', bankVersion: 'stale0000', modified: false },
              quarters: {}
            }
          }
        }],
        currentAssessmentId: 'ASM-mine'
      };
      const result = migrateAssessmentsState(state, 13);
      const obs = result.assessments[0].observations['DE.AE-02 Ex1'];
      expect(obs.testProcedures).toBe('My org checks the DR runbook first.\n\n## Notes\n\nKeep quarterly.');
      expect(obs.procedureSource.bankVersion).toBe('stale0000');
    });

    test('v14 is idempotent — running it twice is a fixed point', () => {
      const entry = getBankProcedure('DE.AE-02 Ex1');
      const state = {
        assessments: [
          { id: 'ASM-default-2025-alma', observations: {} },
          comprehensiveStub(),
          {
            id: 'ASM-mine',
            observations: {
              'DE.AE-02 Ex1': {
                testProcedures: `${entry.markdown}\n\n## Related\n\n- [x](../../5_Artifacts/y.md)`,
                procedureSource: { bank: 'community', bankId: 'DE.AE-02', bankVersion: 'stale0000', modified: false },
                quarters: {}
              }
            }
          }
        ],
        currentAssessmentId: 'ASM-default-2025-alma'
      };
      const once = migrateAssessmentsState(state, 13);
      const twice = migrateAssessmentsState(JSON.parse(JSON.stringify(once)), 13);
      expect(twice).toEqual(once);
    });

    test('modified or tailored procedure text is NEVER touched by the re-sync', () => {
      const state = {
        assessments: [{
          id: 'ASM-mine',
          observations: {
            'DE.AE-02 Ex1': {
              testProcedures: 'my own edited text ## Related kept because I changed it',
              procedureSource: { bank: 'community', bankId: 'DE.AE-02', modified: true },
              quarters: {}
            },
            'GV.OC-01 Ex1': {
              testProcedures: 'AI-tailored text for my org',
              procedureSource: { bank: 'community', bankId: 'GV.OC-01', modified: false, tailored: true },
              quarters: {}
            },
            'PR.AA-02 Ex2': {
              testProcedures: 'hand-written, never from the bank',
              quarters: {}
            }
          }
        }],
        currentAssessmentId: 'ASM-mine'
      };
      const before = JSON.stringify(state.assessments[0].observations);
      const result = migrateAssessmentsState(state, 13);
      expect(JSON.stringify(result.assessments[0].observations)).toBe(before);
    });
  });

  describe('v15: demo assessment user roster seed (issue #297)', () => {
    const DEMO_ID = 'ASM-2026-comprehensive-alma';

    test('seeds the demo roster when the demo assessment has no users', () => {
      const state = {
        assessments: [{ id: DEMO_ID, observations: {}, users: [] }],
        currentAssessmentId: DEMO_ID
      };
      const result = migrateAssessmentsState(state, 14);
      expect(result.assessments[0].users).toEqual(DEMO_ASSESSMENT_USERS);
    });

    test('seeds when the users field is missing entirely (pre-#290 payload shape)', () => {
      const state = { assessments: [{ id: DEMO_ID, observations: {} }] };
      const result = migrateAssessmentsState(state, 14);
      expect(result.assessments[0].users).toEqual(DEMO_ASSESSMENT_USERS);
    });

    test('a roster the user populated is NEVER replaced (heal-in-place)', () => {
      const mine = [{ userId: 42, role: 'auditor' }];
      const state = { assessments: [{ id: DEMO_ID, observations: {}, users: mine }] };
      const result = migrateAssessmentsState(state, 14);
      expect(result.assessments[0].users).toEqual(mine);
    });

    test('other assessments are never touched', () => {
      const state = { assessments: [{ id: 'ASM-mine', observations: {}, users: [] }] };
      const result = migrateAssessmentsState(state, 14);
      expect(result.assessments[0].users).toEqual([]);
    });

    test('a v0 client falls through all the way to the v15 seed', () => {
      const state = {
        assessments: [{ id: DEMO_ID, observations: {} }],
        currentAssessmentId: DEMO_ID
      };
      const result = migrateAssessmentsState(state, 0);
      expect(result.assessments[0].users).toEqual(DEMO_ASSESSMENT_USERS);
    });

    test('is idempotent — running the chain again changes nothing', () => {
      const once = migrateAssessmentsState(
        { assessments: [{ id: DEMO_ID, observations: {}, users: [] }] }, 14
      );
      const twice = migrateAssessmentsState(JSON.parse(JSON.stringify(once)), 15);
      expect(twice.assessments[0].users).toEqual(once.assessments[0].users);
    });
  });
});
