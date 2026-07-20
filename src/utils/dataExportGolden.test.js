/**
 * Golden envelopes — the pure-inversion proof for the disposition registry.
 *
 * These snapshots were recorded against the pre-registry buildShareableExport
 * (the hand-maintained scrub list) on a deterministic maximal fixture, then
 * the registry fold replaced the implementation UNDER the unchanged snapshots.
 * A diff here means share/backup output changed shape — review it as a
 * disposition decision, never regenerate casually.
 *
 * The fixture is bulk-set (stable ids, fixed dates — no producer timestamps)
 * and contains ONLY registry-declared fields; undeclared-field behavior is
 * covered by shareRegistry.test.js, not here. It exercises every disposition:
 * pack lineage (assessment + finding + finding-pointing-at-pack), tailored +
 * legacy-v0 + csv-shaped observations, excluded/surviving metric links,
 * external URLs/links/tracking (with a v11 legacy systemName), the users
 * directory, and the org profile.
 */
import { buildShareableExport, exportAllDataJSON } from './dataExport';
import { getBankProcedure } from './procedureBank';
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';
import useArtifactStore from '../stores/artifactStore';
import useUserStore from '../stores/userStore';
import useFindingsStore from '../stores/findingsStore';
import useMetricsStore from '../stores/metricsStore';
import useOrgProfileStore from '../stores/orgProfileStore';

const CANARY_JEWEL = 'CustomerVault9000';
const CANARY_ORG = 'Northwind Insurance';

const FIXTURE = {
  users: [
    {
      id: 'U-1',
      name: 'Pat Example',
      title: 'Auditor',
      email: 'pat@example.test',
      seedSource: 'golden-fixture'
    }
  ],
  controls: [
    {
      controlId: 'CTRL-1',
      name: 'Access reviews',
      implementationDescription: 'Quarterly access review of privileged accounts',
      ownerId: 'U-1',
      stakeholderIds: ['U-1'],
      linkedRequirementIds: ['REQ-1'],
      status: 'Implemented',
      tests: 'Inspect Q1 review evidence',
      frameworks: 'CSF 2.0',
      artifacts: '',
      findings: '',
      controlEvaluationBackLink: 'WP-1',
      externalUrl: 'https://jira.internal.example/browse/CTRL-1',
      assessmentId: null,
      seedSource: 'golden-fixture',
      createdDate: '2026-01-01',
      lastModified: '2026-01-02'
    }
  ],
  assessments: [
    {
      id: 'ASM-1',
      name: 'Annual CSF assessment',
      description: 'User-authored assessment',
      scopeType: 'requirements',
      scoringScale: 10,
      externalTracking: {
        enabled: true,
        systems: { findings: 'Jira', artifacts: 'SharePoint', controls: 'Hyperproof' },
        systemName: 'LegacyJira' // v11 legacy key — must never ride a default share
      },
      year: 2026,
      users: [{ userId: 'U-1', role: 'auditor' }],
      scopeIds: ['GV.OC-01 Ex1', 'GV.OC-02 Ex1'],
      frameworkFilter: 'csf2',
      status: 'In Progress',
      createdDate: '2026-01-01',
      lastModified: '2026-01-10',
      jiraKey: 'PROJ-1',
      observations: {
        'GV.OC-01 Ex1': {
          auditorId: 'U-1',
          testProcedures: `Tailored for ${CANARY_ORG}: verify ${CANARY_JEWEL} recovery.`,
          procedureSource: {
            bank: 'community',
            bankId: 'GV.OC-01',
            bankVersion: 'fixture-version',
            attachedAt: '2026-01-01T00:00:00.000Z',
            modified: true,
            tailored: true
          },
          linkedArtifacts: ['AR-1'],
          linkedFindings: ['FND-1'],
          linkedControls: ['CTRL-1'],
          externalLinks: [
            { id: 'XL-1', type: 'findings', url: 'https://jira.internal.example/browse/T-1' }
          ],
          remediation: { ownerId: 'U-1', actionPlan: 'Close the gap', dueDate: '2026-03-01' },
          jiraKey: 'PROJ-1-OBS',
          quarters: {
            Q1: {
              actualScore: 2,
              targetScore: 3,
              observations: 'Quarterly narrative',
              observationDate: '2026-01-15',
              testingStatus: 'Tested',
              examine: true,
              interview: false,
              test: true,
              metricId: 'cis-m1' // restricted-license metric — stripped in BOTH modes
            },
            Q2: {
              actualScore: 3,
              targetScore: 3,
              observations: '',
              observationDate: '',
              testingStatus: 'Not Started',
              examine: false,
              interview: false,
              test: false,
              metricId: 'user-m1' // csv-import metric — stripped by default, kept w/ opt-in
            }
          }
        },
        'GV.OC-02 Ex1': {
          auditorId: '',
          testProcedures: 'Hand-written procedure, never tailored.',
          // legacy pre-quarterly (v0) shape — rides shares verbatim today
          actualScore: 1,
          targetScore: 2,
          observations: 'Legacy narrative field',
          observationDate: '2025-11-01',
          testingStatus: 'Planned',
          assessmentMethods: { examine: true, interview: false, test: false },
          score: 1,
          quarters: {}
        }
      }
    },
    {
      id: 'ASM-pack-alma',
      name: 'Alma Security (private pack)',
      description: 'Pack-owned assessment',
      scopeType: 'requirements',
      scoringScale: 10,
      externalTracking: { enabled: false, systems: { findings: '', artifacts: '', controls: '' } },
      year: 2026,
      users: [],
      scopeIds: ['GV.OC-01 Ex1'],
      frameworkFilter: 'csf2',
      status: 'In Progress',
      createdDate: '2026-07-01',
      lastModified: '2026-07-01',
      observations: {
        'GV.OC-01 Ex1': {
          auditorId: '',
          testProcedures: '',
          linkedArtifacts: [],
          linkedFindings: [],
          remediation: { ownerId: '', actionPlan: '', dueDate: '' },
          quarters: {
            Q2: {
              actualScore: 2,
              targetScore: 3,
              observations: 'Pack quarter',
              observationDate: '',
              testingStatus: '',
              examine: false,
              interview: false,
              test: false,
              metricId: ''
            }
          }
        }
      },
      source: 'pack',
      packSlug: 'alma-security',
      packVersion: '2026.07',
      packImportedAt: '2026-07-01T00:00:00.000Z'
    },
    {
      // CSV-import shape: no externalTracking / year / users — absent keys
      // must stay absent in every envelope.
      id: 'ASM-3',
      name: 'CSV imported assessment',
      description: '',
      scopeType: 'requirements',
      scoringScale: 5,
      scopeIds: ['GV.OC-01 Ex1'],
      frameworkFilter: 'csf2',
      status: 'Not Started',
      createdDate: '2026-02-01',
      lastModified: '2026-02-01',
      jiraKey: 'PROJ-3',
      observations: {}
    }
  ],
  requirements: [
    {
      id: 'REQ-1',
      frameworkId: 'csf2',
      function: 'GOVERN',
      functionDescription: 'Governance function',
      category: 'Organizational Context',
      categoryDescription: 'Context category',
      categoryId: 'GV.OC',
      subcategoryId: 'GV.OC-01',
      subcategoryDescription: 'Mission is understood',
      implementationExample: 'Example text',
      inScope: true,
      controlOwner: 'Dana Deprecated',
      stakeholders: 'Sam Stakeholder',
      implementationDescription: '',
      artifacts: '',
      findings: '',
      controlEvaluationBackLink: ''
    }
  ],
  frameworks: [
    {
      id: 'csf2',
      name: 'NIST CSF 2.0',
      shortName: 'CSF',
      version: '2.0',
      source: 'NIST',
      sourceUrl: 'https://www.nist.gov/cyberframework',
      description: 'Cybersecurity Framework 2.0',
      enabled: true,
      color: '#3B82F6',
      hierarchyLabels: {
        level1: 'Function',
        level2: 'Category',
        level3: 'Subcategory',
        level4: 'Implementation Example'
      },
      importedDate: null,
      isDefault: true
    }
  ],
  artifacts: [
    {
      id: 'AR-row-1',
      artifactId: 'AR-1',
      name: 'Access review workbook',
      description: 'Quarterly evidence',
      link: 'https://drive.internal.example/doc/access-review',
      controlId: 'CTRL-1',
      assessmentId: 'ASM-1',
      linkedEvaluationIds: ['GV.OC-01 Ex1'],
      complianceRequirement: '',
      linkedSubcategoryIds: ['GV.OC-01'],
      type: 'Document',
      health: 'Healthy',
      createdDate: '2026-01-01',
      lastModified: '2026-01-02',
      jiraKey: 'AJ-1',
      status: 'ACTIVE',
      priority: 'Medium',
      seedSource: 'golden-fixture'
    }
  ],
  findings: [
    {
      id: 'FND-1',
      summary: 'Stale privileged accounts',
      description: 'CSV-imported description field',
      evaluationId: 'GV.OC-01 Ex1',
      controlId: 'CTRL-1',
      assessmentId: 'ASM-1',
      complianceRequirement: '',
      rootCause: 'No leaver process',
      remediationActionPlan: 'Automate deprovisioning',
      remediationOwner: 'U-1',
      dueDate: '2026-04-01',
      status: 'Not Started',
      priority: 'High',
      createdDate: '2026-01-05',
      lastModified: '2026-01-06',
      jiraKey: 'PROJ-9',
      externalUrl: 'https://jira.internal.example/browse/FND-1',
      linkedArtifacts: ['AR-1'],
      seedSource: 'golden-fixture'
    },
    {
      id: 'FND-pack-1',
      summary: 'Wire-transfer BEC',
      evaluationId: '',
      controlId: 'PR.AA-01',
      assessmentId: 'ASM-pack-alma',
      complianceRequirement: '',
      rootCause: 'Finance targeted twice',
      remediationActionPlan: '',
      remediationOwner: '',
      dueDate: '',
      status: 'Not Started',
      priority: 'High',
      createdDate: '2026-07-01',
      lastModified: '2026-07-01',
      jiraKey: '',
      externalUrl: '',
      linkedArtifacts: [],
      source: 'pack',
      packSlug: 'alma-security',
      packVersion: '2026.07',
      packRiskId: 'R-001',
      packLikelihood: 4,
      packImpact: 5,
      packSubcategoryIds: ['PR.AA-01']
    },
    {
      // User-authored finding POINTING AT the pack assessment — the lineage
      // filter must drop it from default shares (assessmentId, not tags).
      id: 'FND-2',
      summary: 'Note against pack assessment',
      evaluationId: '',
      controlId: '',
      assessmentId: 'ASM-pack-alma',
      complianceRequirement: '',
      rootCause: '',
      remediationActionPlan: '',
      remediationOwner: '',
      dueDate: '',
      status: 'Not Started',
      priority: 'Low',
      createdDate: '2026-07-02',
      lastModified: '2026-07-02',
      jiraKey: '',
      externalUrl: '',
      linkedArtifacts: []
    }
  ],
  metrics: [
    {
      id: 'user-m1',
      name: 'Patch latency',
      type: 'KPI',
      subcategoryIds: ['GV.OC-01'],
      description: 'Own metric from own catalogue',
      formula: 'days',
      unit: 'days',
      target: '14',
      direction: 'down',
      frequency: 'quarterly',
      dataSource: 'CMDB',
      references: '',
      notes: '',
      license: 'CC0',
      source: 'csv-import',
      catalogSlug: 'my-catalogue',
      importedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'cis-m1',
      name: 'Restricted benchmark metric',
      type: 'KRI',
      subcategoryIds: ['GV.OC-01'],
      description: 'Licensed content',
      formula: '',
      unit: '%',
      target: '',
      direction: '',
      frequency: '',
      dataSource: '',
      references: '',
      notes: '',
      license: 'CC BY-NC-ND 4.0',
      source: 'csv-import',
      catalogSlug: 'licensed-catalogue',
      importedAt: '2026-01-01T00:00:00.000Z'
    },
    {
      // Foreign metric that arrived via restore (no csv-import lineage,
      // unrestricted blank license) — the one shape that survives a default
      // share. Pins the licenseIsRestricted('') === false contract.
      id: 'restored-m1',
      name: 'Restored foreign metric',
      type: 'metric',
      subcategoryIds: [],
      description: '',
      formula: '',
      unit: '',
      target: '',
      direction: '',
      frequency: '',
      dataSource: '',
      references: '',
      notes: '',
      license: '',
      source: 'restore',
      catalogSlug: 'foreign',
      importedAt: '2026-01-02T00:00:00.000Z'
    }
  ]
};

const stores = () => ({
  controlsStore: useControlsStore,
  assessmentsStore: useAssessmentsStore,
  requirementsStore: useRequirementsStore,
  frameworksStore: useFrameworksStore,
  artifactStore: useArtifactStore,
  userStore: useUserStore,
  findingsStore: useFindingsStore,
  metricsStore: useMetricsStore,
  orgProfileStore: useOrgProfileStore
});

const seedAll = () => {
  useUserStore.getState().setUsers(FIXTURE.users);
  useControlsStore.getState().setControls(FIXTURE.controls);
  useAssessmentsStore.getState().setAssessments(FIXTURE.assessments);
  useRequirementsStore.getState().setRequirements(FIXTURE.requirements);
  useFrameworksStore.getState().setFrameworks(FIXTURE.frameworks);
  useArtifactStore.getState().setArtifacts(FIXTURE.artifacts);
  useFindingsStore.getState().setFindings(FIXTURE.findings);
  useMetricsStore.getState().setMetrics(FIXTURE.metrics);
  useOrgProfileStore.getState().saveProfile({
    orgName: CANARY_ORG,
    industry: 'Insurance',
    sizeBand: '250–999',
    infrastructure: ['AWS'],
    securityTools: ['EDR'],
    crownJewels: [CANARY_JEWEL]
  });
};

const stripVolatile = (envelope) => {
  const clone = JSON.parse(JSON.stringify(envelope));
  clone.exportDate = '<stripped>';
  if (clone.metadata) clone.metadata.exportTimestamp = '<stripped>';
  return clone;
};

describe('golden envelopes', () => {
  beforeAll(() => {
    // The tailored fixture's pristine swap resolves against the real bank —
    // fail loudly here rather than as a confusing snapshot diff.
    expect(getBankProcedure('GV.OC-01')).toBeTruthy();
    seedAll();
  });

  afterAll(() => {
    useOrgProfileStore.getState().clearProfile();
  });

  test('default share export is frozen', () => {
    expect(stripVolatile(buildShareableExport(stores()))).toMatchSnapshot();
  });

  test('include-private share export is frozen', () => {
    expect(stripVolatile(buildShareableExport(stores(), { includePrivate: true }))).toMatchSnapshot();
  });

  test('complete backup is frozen', () => {
    expect(stripVolatile(exportAllDataJSON(stores()))).toMatchSnapshot();
  });
});
