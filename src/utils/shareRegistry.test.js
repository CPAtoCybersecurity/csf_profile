/**
 * Registry enforcement — the appearance test and its polarity proofs.
 *
 * The four historical share leaks (artifacts.link, the user directory,
 * quarter metricId linkage, derived tailored text) all entered as
 * APPEARANCES: a field born fail-open that no scrub knew about. The golden
 * snapshots catch disappearances; THIS suite catches appearances:
 *
 *  - state is built through the REAL producers (createAssessment,
 *    updateObservation, bankAttachObservation, createControl, createFinding,
 *    addArtifact, addUser, addFramework, importPack, importMetricsCatalog,
 *    saveProfile) and every field path found in the resulting envelope must
 *    be declared in shareRegistry.js — a new producer field is a red test at
 *    commit time, forcing a disposition decision;
 *  - polarity: an undeclared field injected through a real open-shape
 *    producer is (a) detected by the walk and (b) absent from the PRODUCTION
 *    share output in both modes — the guard is proven on the production
 *    path, not a re-implementation of it.
 */
import { exportAllDataJSON, buildShareableExport } from './dataExport';
import {
  SHARE_SECTIONS,
  SHARE,
  OMIT,
  EMPTY_STRING,
  EMPTY_LIST,
  REBUILD_EXTERNAL_TRACKING,
  STRIP_IF_EXCLUDED_METRIC,
  declaredPaths
} from './shareRegistry';
import { bankAttachObservation, composeAttachObservation } from './procedureTailor';
import { getBankProcedure } from './procedureBank';
import { getPlatformProcedures, getPlatformRecord, PLATFORM_CORPUS_ID } from './platformBank';
import { importPack } from './packImport';
import { parseMetricsCSV, validateMetricsCatalog, importMetricsCatalog } from './metricsImport';
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';
import useArtifactStore from '../stores/artifactStore';
import useUserStore from '../stores/userStore';
import useFindingsStore from '../stores/findingsStore';
import useMetricsStore from '../stores/metricsStore';
import useOrgProfileStore from '../stores/orgProfileStore';

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

// ---------------------------------------------------------------------------
// Spec walker: mirrors the registry's node shapes. Any key in the data that
// the spec does not declare is a violation path.
//
// Leaf containment rule: a declared SHARE leaf copies its value WHOLESALE and
// the walker cannot see inside it — so a leaf holding an OBJECT is a blind
// spot with leak polarity (unknown nested keys would ride out unwalked).
// Object-valued leaves are therefore allowed ONLY on this opaque allowlist,
// each entry justified; any other leaf holding an object (or an array with
// object items) is a violation, forcing new nested shapes into struct/map
// declarations.
// ---------------------------------------------------------------------------
const OPAQUE_LEAVES = new Set([
  // Rebuilt from scratch in default mode (only `enabled` survives, systems
  // names emptied); wholesale under includePrivate by design (#284/#288).
  'assessments[].externalTracking',
  // Roster pairs — producer-normalized to { userId, role } only
  // (normalizeAssessmentUsers), proven by the roster polarity test below.
  'assessments[].users',
  // #288 typed links — producer-normalized (normalizeExternalLinks) and
  // emptied in default share mode; rides only under includePrivate.
  'assessments[].observations{}.externalLinks',
  // Legacy v0 tri-state — historical shape, no producer writes it today.
  'assessments[].observations{}.assessmentMethods',
  // User-authored display labels — no privacy class, wholesale by intent.
  'frameworks[].hierarchyLabels',
  // Platform addendum references / copy-on-write forks (plan §7 R-3).
  // OMIT in both share modes — expansion-on-export folds their text into
  // testProcedures, so the refs never serialize on the share path at all;
  // shape is producer-enforced (buildPlatformRef / forkPlatformProcedure,
  // pinned in platformBank.test.js) and complete backups carry them
  // wholesale by design.
  'assessments[].observations{}.platformProcedures'
]);

const isLeaf = (spec) => !spec.kind;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const leafHoldsObject = (value) =>
  isPlainObject(value) || (Array.isArray(value) && value.some((item) => isPlainObject(item)));

const walkValue = (value, spec, path, violations) => {
  if (isLeaf(spec)) {
    if (leafHoldsObject(value) && !OPAQUE_LEAVES.has(path)) {
      violations.push(`${path} (object in non-opaque leaf)`);
    }
    return;
  }
  if (spec.kind === 'struct') {
    if (value === null || typeof value !== 'object') return;
    Object.keys(value).forEach((key) => {
      const fieldSpec = spec.fields[key];
      if (!fieldSpec) {
        violations.push(`${path}.${key}`);
        return;
      }
      walkValue(value[key], fieldSpec, `${path}.${key}`, violations);
    });
    return;
  }
  if (spec.kind === 'map') {
    if (value === null || typeof value !== 'object') return;
    Object.values(value).forEach((v) => walkValue(v, spec.of, `${path}{}`, violations));
    return;
  }
  if (spec.kind === 'list') {
    if (!Array.isArray(value)) return;
    value.forEach((v) => walkValue(v, spec.of, `${path}[]`, violations));
  }
};

const undeclaredIn = (data) => {
  const violations = [];
  Object.entries(data).forEach(([section, value]) => {
    const spec = SHARE_SECTIONS[section];
    if (!spec) {
      violations.push(section);
      return;
    }
    // Sections without a record spec are OMIT-everywhere (orgProfile): their
    // contents never serialize into a share, so field grain is exempt.
    if (!spec.record) return;
    (Array.isArray(value) ? value : []).forEach((record) =>
      walkValue(record, spec.record, `${section}[]`, violations)
    );
  });
  return [...new Set(violations)].sort();
};

// ---------------------------------------------------------------------------
// Producer-driven maximal state
// ---------------------------------------------------------------------------
const METRICS_CSV = [
  'metric_id,name,type,csf_subcategory_ids,description,formula,unit,target,direction,frequency,data_source,license,references,notes',
  'reg-m1,Patch latency,KPI,GV.OC-01,desc,days,days,14,down,quarterly,CMDB,CC0,ref,note'
].join('\n');

const PACK = {
  packFormat: 1,
  packVersion: '2026.07',
  org: { slug: 'registry-pack', name: 'Registry Pack Org', sector: 'tech', sizeBand: '50-200' },
  created: '2026-07-01',
  sections: {
    metricValues: [
      {
        subcategoryId: 'GV.OC-01',
        quarters: {
          Q2: {
            actualScore: 2,
            targetScore: 3,
            testingStatus: 'Tested',
            observations: 'Pack quarter note'
          }
        }
      }
    ],
    risks: [
      {
        id: 'R-001',
        title: 'Registry pack risk',
        subcategoryIds: ['PR.AA-01'],
        likelihood: 4,
        impact: 5,
        notes: 'note'
      }
    ]
  }
};

let assessmentId;

const seedThroughProducers = () => {
  const users = useUserStore.getState();
  users.addUser({ name: 'Pat Producer', title: 'Auditor', email: 'pat@example.test' });
  users.findOrCreateUserByEmail({ name: 'Casey Import', email: 'casey@example.test', title: '' });

  const assessments = useAssessmentsStore.getState();
  const created = assessments.createAssessment({
    name: 'Registry appearance assessment',
    description: 'seeded through real producers',
    scopeType: 'requirements'
  });
  assessmentId = created.id;
  assessments.addToScope(assessmentId, 'GV.OC-01 Ex1');
  useOrgProfileStore.getState().saveProfile({
    orgName: 'Producer Org',
    industry: 'Insurance',
    sizeBand: '250–999',
    infrastructure: ['AWS'],
    securityTools: ['EDR'],
    crownJewels: ['ProducerJewel']
  });
  // The real wizard-attach producer (tailored provenance stamped inside it)
  const produced = bankAttachObservation(
    getBankProcedure('GV.OC-01'),
    useOrgProfileStore.getState().profile,
    { substituteName: true, adaptStack: true }
  );
  assessments.updateObservation(assessmentId, 'GV.OC-01 Ex1', produced);
  // The real composed-attach producer (PR-5): trunk + platform addendum
  // REFERENCES + the recorded recipe, tailored trunk so the pristine-swap ×
  // expansion composition is exercised on the share path.
  assessments.addToScope(assessmentId, 'PR.DS-01 Ex1');
  const composed = composeAttachObservation(
    getBankProcedure('PR.DS-01'),
    getPlatformProcedures('PR.DS-01', ['microsoft-365']).slice(0, 2),
    useOrgProfileStore.getState().profile,
    { substituteName: true }
  );
  assessments.updateObservation(assessmentId, 'PR.DS-01 Ex1', composed);
  // An unresolvable reference riding a real observation (foreign corpus id):
  // the share export must expand it to the explicit placeholder.
  assessments.addToScope(assessmentId, 'DE.CM-09 Ex1');
  assessments.updateObservation(assessmentId, 'DE.CM-09 Ex1', {
    testProcedures: 'Trunk with a dead reference.',
    platformProcedures: [
      {
        corpusId: 'foreign-corpus',
        corpusVersion: 'ffffffffffffffff',
        policyId: 'gone.policy.1.1v1',
        contentHash: '0123456789abcdef'
      }
    ]
  });
  assessments.updateObservation(assessmentId, 'GV.OC-01 Ex1', {
    auditorId: 'U-1',
    linkedArtifacts: ['AR-1'],
    linkedFindings: ['FND-1'],
    linkedControls: ['CTRL-1'],
    externalLinks: [{ type: 'findings', url: 'https://jira.internal.example/browse/T-1' }],
    remediation: { ownerId: 'U-1', actionPlan: 'plan', dueDate: '2026-03-01' }
  });
  assessments.updateQuarterlyObservation(assessmentId, 'GV.OC-01 Ex1', 'Q1', {
    actualScore: 2,
    targetScore: 3,
    observations: 'quarter note',
    observationDate: '2026-01-15',
    testingStatus: 'Tested',
    examine: true,
    interview: false,
    test: true
  });
  assessments.updateAssessment(assessmentId, {
    externalTracking: { enabled: true, systems: { findings: 'Jira', artifacts: '', controls: '' } },
    year: 2026,
    users: [{ userId: 'U-1', role: 'auditor' }]
  });

  useControlsStore.getState().createControl({
    controlId: 'CTRL-REG-1',
    name: 'Registry control',
    implementationDescription: 'desc',
    ownerId: 'U-1',
    stakeholderIds: [],
    linkedRequirementIds: [],
    externalUrl: 'https://jira.internal.example/browse/CTRL-REG-1'
  });

  useFindingsStore.getState().createFinding({
    summary: 'Registry finding',
    evaluationId: 'GV.OC-01 Ex1',
    controlId: 'CTRL-REG-1',
    assessmentId,
    rootCause: 'cause',
    remediationActionPlan: 'plan',
    remediationOwner: 'U-1',
    dueDate: '2026-04-01',
    priority: 'High',
    externalUrl: 'https://jira.internal.example/browse/F-1'
  });

  useArtifactStore.getState().addArtifact({
    name: 'Registry artifact',
    description: 'desc',
    link: 'https://drive.internal.example/doc',
    controlId: 'CTRL-REG-1',
    assessmentId,
    type: 'Document',
    status: 'ACTIVE'
  });

  useFrameworksStore.getState().addFramework({
    name: 'Custom Framework',
    shortName: 'CF',
    version: '1.0',
    source: 'user',
    sourceUrl: 'https://example.test/framework',
    description: ''
  });

  // Requirements' real producer is the CSV/initial load (fetch-backed, not
  // jest-drivable); mirror its loadInitialData record shape verbatim. The
  // frameworkId must be the store's REAL default framework — the pack
  // importer resolves subcategories against it.
  const fwState = useFrameworksStore.getState();
  const defaultFrameworkId = (fwState.frameworks.find((f) => f.isDefault) || fwState.frameworks[0]).id;
  useRequirementsStore.getState().setRequirements([
    {
      id: 'REQ-REG-1',
      frameworkId: defaultFrameworkId,
      function: 'GOVERN',
      functionDescription: 'fd',
      category: 'Organizational Context',
      categoryDescription: 'cd',
      categoryId: 'GV.OC',
      subcategoryId: 'GV.OC-01',
      subcategoryDescription: 'sd',
      implementationExample: 'ex',
      inScope: true,
      controlOwner: '',
      stakeholders: '',
      implementationDescription: '',
      artifacts: '',
      findings: '',
      controlEvaluationBackLink: ''
    }
  ]);

  const validation = validateMetricsCatalog(parseMetricsCSV(METRICS_CSV));
  importMetricsCatalog(validation, stores(), { catalogSlug: 'registry-catalogue' });

  importPack(PACK, stores());
};

describe('share registry enforcement', () => {
  beforeAll(() => {
    seedThroughProducers();
  });

  afterAll(() => {
    useOrgProfileStore.getState().clearProfile();
  });

  test('appearance: every field the real producers write is declared in the registry', () => {
    const envelope = exportAllDataJSON(stores());
    expect(undeclaredIn(envelope.data)).toEqual([]);
  });

  test('polarity: an undeclared observation field is detected AND never rides either share mode', () => {
    // updateObservation spreads arbitrary keys — this is the REAL producer
    // path a future feature would use, not a synthetic mutation.
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      covertTelemetry: 'CANARY-NEW-OBS-FIELD'
    });

    const envelope = exportAllDataJSON(stores());
    expect(undeclaredIn(envelope.data)).toContain(
      'assessments[].observations{}.covertTelemetry'
    );
    // Complete backups keep it — wholesale by design.
    expect(JSON.stringify(envelope)).toContain('CANARY-NEW-OBS-FIELD');

    // The PRODUCTION share path drops it in both modes (fail-closed).
    expect(JSON.stringify(buildShareableExport(stores()))).not.toContain('CANARY-NEW-OBS-FIELD');
    expect(
      JSON.stringify(buildShareableExport(stores(), { includePrivate: true }))
    ).not.toContain('CANARY-NEW-OBS-FIELD');

    // Remove the canary so later appearance walks see only real producer state.
    useAssessmentsStore.getState().setAssessments(
      useAssessmentsStore.getState().assessments.map((a) => {
        if (a.id !== assessmentId) return a;
        const { covertTelemetry, ...cleanObs } = a.observations['GV.OC-01 Ex1'];
        return { ...a, observations: { ...a.observations, 'GV.OC-01 Ex1': cleanObs } };
      })
    );
  });

  test('polarity: an undeclared record field from an open-shape producer never rides either share mode', () => {
    useArtifactStore.getState().addArtifact({
      name: 'Canary artifact',
      covertNote: 'CANARY-NEW-ARTIFACT-FIELD'
    });

    const envelope = exportAllDataJSON(stores());
    expect(undeclaredIn(envelope.data)).toContain('artifacts[].covertNote');
    expect(JSON.stringify(buildShareableExport(stores()))).not.toContain(
      'CANARY-NEW-ARTIFACT-FIELD'
    );
    expect(
      JSON.stringify(buildShareableExport(stores(), { includePrivate: true }))
    ).not.toContain('CANARY-NEW-ARTIFACT-FIELD');

    // Remove the canary so later appearance walks see only real producer state.
    const artifactState = useArtifactStore.getState();
    const canary = artifactState.artifacts.find((a) => a.covertNote === 'CANARY-NEW-ARTIFACT-FIELD');
    artifactState.deleteArtifact(canary.id);
  });

  test('polarity: nested junk inside an opaque container is stripped by the PRODUCER, not the fold', () => {
    // The roster is an opaque leaf — the fold copies it wholesale, so its
    // guarantee lives at the producer: normalizeAssessmentUsers must strip
    // unknown keys before the store ever holds them.
    useAssessmentsStore.getState().updateAssessment(assessmentId, {
      users: [{ userId: 'U-1', role: 'auditor', covertRosterField: 'CANARY-ROSTER-FIELD' }]
    });
    const stored = useAssessmentsStore
      .getState()
      .assessments.find((a) => a.id === assessmentId);
    expect(JSON.stringify(stored.users)).not.toContain('CANARY-ROSTER-FIELD');
    expect(JSON.stringify(buildShareableExport(stores()))).not.toContain('CANARY-ROSTER-FIELD');
    expect(
      JSON.stringify(buildShareableExport(stores(), { includePrivate: true }))
    ).not.toContain('CANARY-ROSTER-FIELD');
  });

  test('walker teeth: an object landing in a non-opaque leaf is a violation', () => {
    // linkedControls is declared as a plain SHARE leaf (array of id strings).
    // An object smuggled into it would be invisible to the field walk, so the
    // containment rule must flag it rather than walk past it.
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      linkedControls: [{ covertNested: 'CANARY-NESTED-OBJECT' }]
    });
    const envelope = exportAllDataJSON(stores());
    expect(undeclaredIn(envelope.data)).toContain(
      'assessments[].observations{}.linkedControls (object in non-opaque leaf)'
    );
    // Restore the legal shape so later walks see only real producer state.
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      linkedControls: ['CTRL-1']
    });
  });

  test('sections omitted by disposition are deleted, never emptied', () => {
    const share = buildShareableExport(stores());
    expect('users' in share.data).toBe(false);
    expect('orgProfile' in share.data).toBe(false);

    const optIn = buildShareableExport(stores(), { includePrivate: true });
    expect(Array.isArray(optIn.data.users)).toBe(true);
    expect('orgProfile' in optIn.data).toBe(false);
  });

  test('registry integrity: every leaf disposition is a known value with complete mode coverage', () => {
    const KNOWN = new Set([
      SHARE,
      OMIT,
      EMPTY_STRING,
      EMPTY_LIST,
      REBUILD_EXTERNAL_TRACKING,
      STRIP_IF_EXCLUDED_METRIC
    ]);
    const invalid = [];
    const checkLeaf = (leaf, path) => {
      if (typeof leaf === 'string') {
        if (!KNOWN.has(leaf)) invalid.push(`${path}: unknown disposition "${leaf}"`);
        return;
      }
      if (Object.keys(leaf).sort().join(',') !== 'default,includePrivate') {
        invalid.push(`${path}: mode object must have exactly default+includePrivate`);
      }
      if (!KNOWN.has(leaf.default)) invalid.push(`${path}: unknown default "${leaf.default}"`);
      if (!KNOWN.has(leaf.includePrivate)) {
        invalid.push(`${path}: unknown includePrivate "${leaf.includePrivate}"`);
      }
    };
    const walkSpec = (spec, path) => {
      if (isLeaf(spec)) {
        checkLeaf(spec, path);
        return;
      }
      if (spec.kind === 'struct') {
        Object.entries(spec.fields).forEach(([field, s]) => walkSpec(s, `${path}.${field}`));
      } else {
        walkSpec(spec.of, path);
      }
    };
    Object.entries(SHARE_SECTIONS).forEach(([name, section]) => {
      if (section.record) walkSpec(section.record, name);
    });
    expect(invalid).toEqual([]);
  });

  test('declaredPaths enumerates the spec (spot checks)', () => {
    const paths = declaredPaths();
    expect(paths.has('assessments[].observations{}.procedureSource.bankId')).toBe(true);
    expect(paths.has('findings[].externalUrl')).toBe(true);
    expect(paths.has('assessments[].observations{}.quarters{}.metricId')).toBe(true);
    expect(paths.has('users[].email')).toBe(true);
    expect(paths.has('nonexistent[].field')).toBe(false);
  });
});

describe('share registry enforcement — CSV importer lanes', () => {
  // The CSV importers are separate producers with their own field writes
  // (assessment/observation jiraKey, findings.description, artifacts.priority)
  // AND the provenance-laundering ingress the registry must stay ahead of.
  // Each import asserts it actually created records, so a rotted CSV fixture
  // fails loudly instead of silently walking nothing.

  const REQUIREMENTS_CSV = [
    'Requirement ID,CSF FUNCTION,CSF Function Description,Category Name,Category Description,SUBCATEGORY ID,SUBCATEGORY DESCRIPTION,IMPLEMENTATION EXAMPLE,In Scope,Control Owner,Stakeholders',
    'csv-fw-GV.OC-01,GOVERN,fn desc,Organizational Context (GV.OC),cat desc,GV.OC-01,sub desc,example,Yes,Dana Deprecated,Sam Stakeholder'
  ].join('\n');

  const ASSESSMENTS_CSV = [
    'Assessment Name,Scope Type,Description,Framework Filter,Scoring Scale,Item ID,Auditor,Remediation Owner,Test Procedure(s),Linked Artifacts,Action Plan,Remediation Due Date,Q1 Actual Score,Q1 Target Score,Q1 Observations,Q1 Observation Date,Q1 Testing Status,Q1 Examine,Q1 Interview,Q1 Test',
    'CSV Lane Assessment,requirements,from csv,,10,GV.OC-01 Ex1,Avery Auditor,Rowan Owner,CSV imported procedure,AR-1;AR-2,Fix it,2026-05-01,2,3,quarter note,2026-01-15,Tested,yes,no,yes'
  ].join('\n');

  const JIRA_ASSESSMENTS_CSV = [
    'Issue Type,Issue key,Issue id,Summary,Description,Parent,Parent key,Parent summary,Status,Custom field (Control ID),Custom field (Quarter),Custom field (Assessment Methods),Custom field (Test Procedures),Custom field (Observations)',
    'Epic,EPIC-1,10001,Jira Lane Assessment,epic desc,,,,In Progress,,,,,',
    'Work paper,WP-1,10002,GV.OC-01 Ex1,,10001,EPIC-1,Jira Lane Assessment,In Progress,GV.OC-01 Ex1,Q1,Examine; Test,Jira imported procedure,jira note'
  ].join('\n');

  const CONTROLS_CSV = [
    'Control ID,Control Name,Status,Tests,Frameworks,Control Implementation Description,Linked Requirements,Assessment ID,Control Owner ID,Stakeholder IDs',
    'CTRL-CSV-1,CSV control,Implemented,inspect,CSF 2.0,desc,GV.OC-01,,Avery Auditor,Sam Stakeholder'
  ].join('\n');

  const ARTIFACTS_CSV = [
    'Artifact ID,Artifact Name,Description,Link,Type,Control ID,Assessment ID,Linked Evaluation IDs,Compliance Requirement,Linked Subcategories,Created Date,Last Updated,Jira Key,Status,Health,Priority',
    'AR-CSV-1,CSV artifact,desc,https://drive.internal.example/doc,Document,CTRL-CSV-1,,GV.OC-01 Ex1,,GV.OC-01,2026-01-01,2026-01-02,AJ-9,ACTIVE,Healthy,High'
  ].join('\n');

  const FINDINGS_CSV = [
    'Finding ID,Summary,Description,Evaluation ID,Control ID,Assessment ID,Compliance Requirement,Root Cause,Remediation Action Plan,Remediation Owner,Due Date,Status,Priority,Created Date,Updated,Jira Key,Linked Artifacts',
    'FND-CSV-1,CSV finding,csv description,GV.OC-01 Ex1,CTRL-CSV-1,,,cause,plan,Avery Auditor,2026-04-01,Open,High,2026-01-05,2026-01-06,FJ-9,AR-CSV-1'
  ].join('\n');

  beforeAll(async () => {
    await useRequirementsStore.getState().importRequirementsCSV(REQUIREMENTS_CSV, 'csv-fw');
    await useAssessmentsStore.getState().importAssessmentsCSV(ASSESSMENTS_CSV, useUserStore);
    await useAssessmentsStore.getState().importAssessmentsCSV(JIRA_ASSESSMENTS_CSV, useUserStore);
    await useControlsStore.getState().importControlsCSV(CONTROLS_CSV, useUserStore);
    await useArtifactStore.getState().importArtifactsCSV(ARTIFACTS_CSV);
    await useFindingsStore.getState().importFindingsCSV(FINDINGS_CSV, useUserStore);
  });

  test('every importer actually produced its record (a rotted fixture fails here, not silently)', () => {
    // Note importControlsCSV REPLACES the control set (import = catalogue
    // replace), so presence — not count growth — is the correct probe.
    expect(
      useRequirementsStore.getState().requirements.some((r) => r.id === 'csv-fw-GV.OC-01')
    ).toBe(true);
    expect(
      useAssessmentsStore.getState().assessments.some((a) => a.name === 'CSV Lane Assessment')
    ).toBe(true);
    expect(useControlsStore.getState().controls.some((c) => c.controlId === 'CTRL-CSV-1')).toBe(true);
    expect(useArtifactStore.getState().artifacts.some((a) => a.artifactId === 'AR-CSV-1')).toBe(true);
    expect(useFindingsStore.getState().findings.some((f) => f.id === 'FND-CSV-1')).toBe(true);
    // The Jira lane is the only producer of assessment/observation jiraKey —
    // prove it actually ran rather than silently importing nothing.
    expect(useAssessmentsStore.getState().assessments.some((a) => a.jiraKey === 'EPIC-1')).toBe(true);
  });

  test('appearance: every field the CSV importer lanes write is declared in the registry', () => {
    const envelope = exportAllDataJSON(stores());
    expect(undeclaredIn(envelope.data)).toEqual([]);
  });
});

describe('share registry enforcement — restore lane', () => {
  // A complete backup is arbitrary JSON from a PRIOR app version — the one
  // producer lane that bypasses every store action. The unconditional
  // normalize/heal passes in importCompleteDatabase must bring restored
  // legacy shapes back inside the registry, or a restore-then-share would
  // silently drop (or leak) fields no current producer writes.
  test('a legacy-era backup restores into registry-declared shape (heal-then-walk)', () => {
    // eslint-disable-next-line global-require
    const { importCompleteDatabase, validateDatabaseExport } = require('./dataImport');

    const legacyEnvelope = {
      formatVersion: 2, // pre-metrics, pre-orgProfile era
      data: {
        frameworks: [{ id: 'legacy-fw', name: 'Legacy FW' }],
        users: [],
        controls: [],
        requirements: [],
        artifacts: [],
        findings: [],
        assessments: [
          {
            id: 'ASM-LEGACY-1',
            name: 'Legacy restore assessment',
            description: '',
            scopeType: 'requirements',
            scopeIds: ['GV.OC-01 Ex1'],
            frameworkFilter: null,
            status: 'In Progress',
            createdDate: '2025-06-01',
            lastModified: '2025-06-02',
            // v11-era shape: systemName instead of systems — the restore
            // normalize pass must convert it (it must NOT survive to a walk).
            externalTracking: { enabled: true, systemName: 'LegacyJira' },
            observations: {
              'GV.OC-01 Ex1': {
                auditorId: '',
                testProcedures: 'Legacy procedure text',
                // pre-quarterly v0 fields — declared legacy dispositions
                actualScore: 1,
                targetScore: 2,
                observations: 'legacy narrative',
                observationDate: '2025-05-01',
                testingStatus: 'Planned',
                assessmentMethods: { examine: true, interview: false, test: false },
                score: 1,
                quarters: {}
              }
            }
          }
        ]
      }
    };

    expect(validateDatabaseExport(legacyEnvelope).ok).toBe(true);
    const result = importCompleteDatabase(legacyEnvelope, stores(), { backupFirst: false });
    expect(result.applied).toContain('assessments');

    const envelope = exportAllDataJSON(stores());
    expect(undeclaredIn(envelope.data)).toEqual([]);

    // The healed record shares cleanly: legacy systemName is gone in the
    // default share; the legacy observation fields ride as declared.
    const share = buildShareableExport(stores());
    expect(JSON.stringify(share)).not.toContain('LegacyJira');
    const restored = share.data.assessments.find((a) => a.id === 'ASM-LEGACY-1');
    expect(restored.observations['GV.OC-01 Ex1'].assessmentMethods).toEqual({
      examine: true,
      interview: false,
      test: false
    });
  });
});

describe('PR-5: expansion-on-export + reference dispositions (production share path)', () => {
  // Earlier describes (the CSV-importer appearance lanes) rebuild store
  // state; re-seed so these tests read the producer-built assessment.
  beforeAll(() => {
    seedThroughProducers();
  });

  const shareObs = (share, itemId) =>
    share.data.assessments.find((a) => a.id === assessmentId).observations[itemId];

  test('leak-side: platformProcedures references never serialize on the share path, either mode', () => {
    expect(JSON.stringify(buildShareableExport(stores()))).not.toContain('platformProcedures');
    expect(
      JSON.stringify(buildShareableExport(stores(), { includePrivate: true }))
    ).not.toContain('platformProcedures');
  });

  test('complete backups carry the references verbatim (wholesale by design)', () => {
    const envelope = exportAllDataJSON(stores());
    const backup = envelope.data.assessments.find((a) => a.id === assessmentId);
    const refs = backup.observations['PR.DS-01 Ex1'].platformProcedures;
    expect(refs).toHaveLength(2);
    refs.forEach((ref) => {
      expect(Object.keys(ref).sort()).toEqual([
        'contentHash',
        'corpusId',
        'corpusVersion',
        'policyId'
      ]);
    });
  });

  test('default mode: pristine trunk + expanded addenda + attribution, in one self-contained text', () => {
    const obs = shareObs(buildShareableExport(stores()), 'PR.DS-01 Ex1');
    const pristine = getBankProcedure('PR.DS-01').markdown;
    // trunk swapped back to pristine (tailored org name gone), then expanded
    expect(obs.testProcedures.startsWith(pristine)).toBe(true);
    expect(obs.testProcedures).not.toContain('Producer Org');
    // both referenced addenda expanded from the corpus with attribution
    const refs = getPlatformProcedures('PR.DS-01', ['microsoft-365']).slice(0, 2);
    refs.forEach(({ policyId }) => {
      const record = getPlatformRecord(PLATFORM_CORPUS_ID, policyId);
      expect(obs.testProcedures).toContain(record.assertion);
      expect(obs.testProcedures).toContain(record.attribution.attributionText);
    });
    // provenance flags reset by the pristine swap, recipe still rides
    expect(obs.procedureSource.tailored).toBe(false);
    expect(obs.procedureSource.components).toHaveLength(3);
    expect(obs.procedureSource.components[0].kind).toBe('trunk');
  });

  test('include-private mode: user trunk kept, addenda still expanded (corpus-independence is not a privacy toggle)', () => {
    const obs = shareObs(buildShareableExport(stores(), { includePrivate: true }), 'PR.DS-01 Ex1');
    expect(obs.testProcedures).toContain('Producer Org'); // tailored trunk rides
    const refs = getPlatformProcedures('PR.DS-01', ['microsoft-365']).slice(0, 2);
    refs.forEach(({ policyId }) => {
      expect(obs.testProcedures).toContain(
        getPlatformRecord(PLATFORM_CORPUS_ID, policyId).assertion
      );
    });
  });

  test('unresolvable reference expands to the identity-carrying placeholder on the share — never a silent drop', () => {
    const obs = shareObs(buildShareableExport(stores()), 'DE.CM-09 Ex1');
    expect(obs.testProcedures).toContain('Trunk with a dead reference.');
    expect(obs.testProcedures).toContain('Unresolved platform procedure reference');
    expect(obs.testProcedures).toContain('gone.policy.1.1v1');
    expect(obs.testProcedures).toContain('ffffffffffffffff');
    expect(obs.testProcedures).toContain('0123456789abcdef');
  });

  test('store passthrough: updateObservation persisted the references unmangled (real producer path)', () => {
    const stored = useAssessmentsStore
      .getState()
      .getObservation(assessmentId, 'PR.DS-01 Ex1');
    expect(stored.platformProcedures).toHaveLength(2);
    expect(stored.procedureSource.components).toHaveLength(3);
    // and an untouched observation's default shape has no platform keys
    const fresh = useAssessmentsStore.getState().getObservation(assessmentId, 'GV.OC-01 Ex1');
    expect('platformProcedures' in fresh).toBe(false);
  });
});

describe('PR-5: copy-on-write forks on the share path', () => {
  beforeAll(() => {
    seedThroughProducers();
    // Fork one PR.DS-01 addendum through the production fork producer and
    // attach it alongside a pristine reference.
    const offer = getPlatformProcedures('PR.DS-01', ['microsoft-365'])[0];
    const { forkPlatformProcedure, buildPlatformRef } =
      // eslint-disable-next-line global-require
      require('./platformBank');
    const fork = forkPlatformProcedure(buildPlatformRef(offer.record), 'FORKED-ADDENDUM user text.');
    useAssessmentsStore.getState().updateObservation(assessmentId, 'PR.DS-01 Ex1', {
      platformProcedures: [fork]
    });
  });

  test('a forked addendum rides the DEFAULT share as user text with modification indication (pinned current behavior)', () => {
    // Pins the policy boundary the reviewer flagged for PR-6: hand-edited
    // addendum text rides default shares exactly like hand-edited trunk
    // text does today (the pristine swap is tailoring-scoped, not
    // edit-scoped). If PR-6 decides forks need a pristine reset on default
    // share, this test is the one that changes — deliberately.
    const share = buildShareableExport(stores());
    const obs = share.data.assessments.find((a) => a.id === assessmentId)
      .observations['PR.DS-01 Ex1'];
    expect(obs.testProcedures).toContain('FORKED-ADDENDUM user text.');
    expect(obs.testProcedures).toContain('modified from the referenced original');
    expect(JSON.stringify(obs)).not.toContain('platformProcedures');
  });
});
