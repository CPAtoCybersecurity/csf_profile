/**
 * Attribution survives every egress — the emission binding of the license
 * gate. A share export is redistribution: when licensed text ships, its
 * attribution block must ship with it (mandatory-if-parent-present), in BOTH
 * share modes, through the PRODUCTION fold — and the print/PDF surfaces must
 * keep NOT rendering procedure text at all (§7 R-9), pinned here so the
 * claim cannot rot silently.
 */
import fs from 'fs';
import path from 'path';
import { buildShareableExport } from './dataExport';
import { pristineObservation } from './shareRegistry';
import { requiresAttribution } from './licenseClass.mjs';
import { bankAttachObservation, deterministicTailorUpdate } from './procedureTailor';
import { getBankProcedure } from './procedureBank';
import { importCompleteDatabase, validateDatabaseExport } from './dataImport';
import { generateAuditReportMarkdown } from './auditReportMarkdown';
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

const ATTRIBUTION = {
  attributionText: 'Derived from CISA ScubaGoggles Secure Configuration Baseline for Google Workspace',
  sourceUrl: 'https://github.com/cisagov/ScubaGoggles/blob/main/scubagoggles/baselines/commoncontrols.md',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  retrievedAt: '2026-07-20',
  upstream: { repo: 'cisagov/ScubaGoggles', sha: 'fedcba987654', path: 'scubagoggles/baselines/commoncontrols.md' }
};

/** Attach a licensed fixture through the PRODUCTION producers. */
const seedLicensedObservation = () => {
  const assessments = useAssessmentsStore.getState();
  const created = assessments.createAssessment({ name: 'License egress fixture', scopeType: 'requirements' });
  assessments.addToScope(created.id, 'GV.OC-01 Ex1');
  const entry = {
    bankId: 'GV.OC-01',
    title: 'Fixture licensed procedure',
    markdown: '# Licensed fixture text\n\nVerbatim upstream content.',
    license: 'CC BY 4.0',
    attribution: ATTRIBUTION
  };
  const produced = bankAttachObservation(entry);
  useAssessmentsStore.getState().updateObservation(created.id, 'GV.OC-01 Ex1', produced);
  // Quarterly narrative on the SAME observation object that holds the
  // licensed testProcedures — the report's positive control reads this
  // field and must NOT read its sibling.
  useAssessmentsStore.getState().updateQuarterlyObservation(created.id, 'GV.OC-01 Ex1', 'Q1', {
    actualScore: 2,
    targetScore: 3,
    observations: 'Quarterly fixture narrative for the license egress test',
    observationDate: '2026-01-15',
    testingStatus: 'Tested'
  });
  return { assessmentId: created.id, produced };
};

afterEach(() => {
  // The suites share module-level zustand stores; reset what we seeded.
  const s = useAssessmentsStore.getState();
  (s.assessments || []).filter((a) => a.name === 'License egress fixture')
    .forEach((a) => s.deleteAssessment(a.id));
});

describe('share export — attribution rides the production fold in both modes', () => {
  test.each([[false], [true]])('includePrivate=%s carries the attribution block byte-equal', (includePrivate) => {
    const { assessmentId } = seedLicensedObservation();
    const share = buildShareableExport(stores(), { includePrivate });
    const shared = share.data.assessments.find((a) => a.id === assessmentId);
    expect(shared).toBeDefined();
    const source = shared.observations['GV.OC-01 Ex1'].procedureSource;
    expect(source.license).toBe('CC BY 4.0');
    expect(source.attribution).toEqual(ATTRIBUTION);
  });

  test('DECLARED-OVER-FLOOR: a CC0 record with record-declared obligations keeps them through the production fold in both modes (the R-1 case the model exists for)', () => {
    const assessments = useAssessmentsStore.getState();
    const created = assessments.createAssessment({ name: 'License egress fixture', scopeType: 'requirements' });
    const entry = {
      bankId: 'GV.OC-01',
      title: 'CISA-style fixture',
      markdown: '# CC0 text with asserted obligations',
      license: 'CC0-1.0',
      licenseObligations: { attribution: true, noticeText: ['cisa-no-endorsement'] },
      attribution: ATTRIBUTION
    };
    useAssessmentsStore.getState().updateObservation(created.id, 'GV.OC-01 Ex1', bankAttachObservation(entry));

    for (const includePrivate of [false, true]) {
      const share = buildShareableExport(stores(), { includePrivate });
      const source = share.data.assessments
        .find((a) => a.id === created.id).observations['GV.OC-01 Ex1'].procedureSource;
      expect(source.licenseObligations).toEqual({ attribution: true, noticeText: ['cisa-no-endorsement'] });
      expect(requiresAttribution(source)).toBe(true);
    }
  });

  test('pristineObservation preserves the attribution block through the tailored-swap', () => {
    const communityEntry = getBankProcedure('GV.OC-01 Ex1');
    const obs = {
      testProcedures: 'tailored text with org facts',
      procedureSource: {
        bank: 'community',
        bankId: communityEntry.bankId,
        bankVersion: 'x',
        tailored: true,
        modified: true,
        license: 'CC BY 4.0',
        attribution: ATTRIBUTION
      }
    };
    const pristine = pristineObservation(obs);
    expect(pristine.testProcedures).toBe(communityEntry.markdown);
    expect(pristine.procedureSource.attribution).toEqual(ATTRIBUTION);
    expect(pristine.procedureSource.license).toBe('CC BY 4.0');
  });
});

describe('import round-trip — attribution survives the wire in both directions', () => {
  test('export → import → export keeps the attribution block byte-equal (no strip, no downgrade)', () => {
    const { assessmentId } = seedLicensedObservation();
    const exported = buildShareableExport(stores(), { includePrivate: false });
    const wire = JSON.parse(JSON.stringify(exported)); // simulate file round-trip

    const validation = validateDatabaseExport(wire);
    expect(validation.ok).toBe(true);
    const result = importCompleteDatabase(wire, stores(), { backupFirst: false });
    expect(result.applied).toContain('assessments');

    const reExported = buildShareableExport(stores(), { includePrivate: false });
    const shared = reExported.data.assessments.find((a) => a.id === assessmentId);
    expect(shared.observations['GV.OC-01 Ex1'].procedureSource.attribution).toEqual(ATTRIBUTION);
  });

  test('DECLARED-OVER-FLOOR round-trip: record-declared obligations survive the wire and still bind on the receiving install', () => {
    const assessments = useAssessmentsStore.getState();
    const created = assessments.createAssessment({ name: 'License egress fixture', scopeType: 'requirements' });
    const entry = {
      bankId: 'GV.OC-01',
      title: 'CISA-style fixture',
      markdown: '# CC0 text with asserted obligations',
      license: 'CC0-1.0',
      licenseObligations: { attribution: true, noDerivatives: true },
      attribution: ATTRIBUTION
    };
    useAssessmentsStore.getState().updateObservation(created.id, 'GV.OC-01 Ex1', bankAttachObservation(entry));

    const wire = JSON.parse(JSON.stringify(buildShareableExport(stores(), { includePrivate: false })));
    importCompleteDatabase(wire, stores(), { backupFirst: false });

    const source = useAssessmentsStore.getState().assessments
      .find((a) => a.id === created.id).observations['GV.OC-01 Ex1'].procedureSource;
    expect(source.licenseObligations).toEqual({ attribution: true, noDerivatives: true });
    expect(requiresAttribution(source)).toBe(true);
    // ...and the transform gate still refuses on the receiving install.
    expect(deterministicTailorUpdate('Alma Security text.', source, 'GV.OC-01 Ex1',
      { orgName: 'Contoso', infrastructure: [], securityTools: [] })).toBeNull();
  });
});

describe('print/PDF surfaces — R-9 invariant, with positive control', () => {
  // generateAuditReportMarkdown both returns the markdown and triggers a
  // browser download; jsdom lacks the object-URL API, so stub it (the
  // egress census, not this suite, owns download-surface accounting).
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => 'blob:fixture');
    URL.revokeObjectURL = jest.fn();
  });

  test('the audit report consumes the fixture assessment but never its procedure text or attribution fields', () => {
    const { assessmentId } = seedLicensedObservation();
    const assessment = useAssessmentsStore.getState().assessments.find((a) => a.id === assessmentId);
    const report = generateAuditReportMarkdown({
      assessment,
      requirements: useRequirementsStore.getState().requirements,
      findings: [],
      artifacts: [],
      selectedQuarter: 1,
      reportMetadata: {
        reportNumber: 'R-1',
        engagementType: 'Fixture',
        assessmentPeriod: '2026',
        reportDate: '2026-07-20',
        classification: 'Internal',
        preparedFor: 'Fixture',
        preparedBy: 'Fixture',
        leadAssessor: 'Fixture',
        qualityReviewer: 'Fixture',
        organizationName: 'Fixture Org'
      }
    });
    // Positive control: the report DID walk this scoped observation record —
    // Appendix A renders its controlId (from the same observations map that
    // holds the licensed testProcedures)...
    expect(report).toContain('GV.OC-01 Ex1');
    // ...and still renders no procedure text and no attribution block fields.
    expect(report).not.toContain('Licensed fixture text');
    expect(report).not.toContain('Verbatim upstream content');
    expect(report).not.toContain(ATTRIBUTION.attributionText);
  });

  test('no print/PDF builder references testProcedures (source-level pin so a future render cannot land silently)', () => {
    for (const file of ['auditReportMarkdown.js', 'executiveSummaryPDF.js']) {
      const src = fs.readFileSync(path.join(__dirname, file), 'utf8');
      expect(src.includes('testProcedures')).toBe(false);
    }
  });
});
