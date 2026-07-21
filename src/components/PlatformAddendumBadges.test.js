import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PlatformAddendumBadges from './PlatformAddendumBadges';
import bank from '../data/platformProcedures.json';
import { buildPlatformRef, getPlatformProcedures } from '../utils/platformBank';
import { exportAllDataJSON } from '../utils/dataExport';
import { importCompleteDatabase } from '../utils/dataImport';

/**
 * Read-mode addendum provenance chrome (plan PR-7). The hard badge rule
 * binds every state to a production-drivable fixture:
 *  - drift: a contentHash-divergent reference rendered through the
 *    component's production derivation (platformRefDrift);
 *  - unresolved: a corpus-less reference driven through the PRODUCTION
 *    importCompleteDatabase restore path (the ISC-862 pattern) and
 *    rendered exactly as restored.
 * Assertions map each rendered label to the ref it claims — not merely
 * "a badge rendered".
 */

const gwsOffer = getPlatformProcedures('PR.DS-10', ['google-workspace'])[0];
const m365Offer = getPlatformProcedures('PR.DS-10', ['microsoft-365'])[0];
const freshRef = () => buildPlatformRef(gwsOffer.record, gwsOffer.corpusId);

afterEach(() => {
  window.localStorage.clear();
});

describe('PlatformAddendumBadges', () => {
  test('renders nothing without entries', () => {
    const { container } = render(<PlatformAddendumBadges entries={[]} />);
    expect(container).toBeEmptyDOMElement();
    const { container: c2 } = render(<PlatformAddendumBadges entries={undefined} />);
    expect(c2).toBeEmptyDOMElement();
  });

  test('a fresh reference: summary with count, NO drift or unresolved chip; row carries label + upstream source link', () => {
    render(<PlatformAddendumBadges entries={[freshRef()]} />);
    expect(screen.getByText('1 platform check')).toBeInTheDocument();
    expect(screen.queryByText(/updated upstream/i)).toBeNull();
    expect(screen.queryByText(/unresolved/i)).toBeNull();
    fireEvent.click(screen.getByText('1 platform check'));
    expect(screen.getByText(gwsOffer.policyId)).toBeInTheDocument();
    expect(screen.getByText('Google Workspace')).toBeInTheDocument();
    const link = screen.getByTitle('View the upstream source of this platform check');
    expect(link).toHaveAttribute('href', gwsOffer.record.attribution.sourceUrl);
  });

  test('drift badge: a contentHash-divergent ref shows "Updated upstream" in summary and on ITS row, link intact', () => {
    const drifted = { ...freshRef(), contentHash: '0000000000000000' };
    const stable = buildPlatformRef(m365Offer.record, m365Offer.corpusId);
    render(<PlatformAddendumBadges entries={[drifted, stable]} />);
    expect(screen.getByText('2 platform checks')).toBeInTheDocument();
    expect(screen.getByText('1 updated upstream')).toBeInTheDocument();
    fireEvent.click(screen.getByText('2 platform checks'));
    const rows = screen.getAllByTestId('platform-addendum-row');
    const driftedRow = rows.find((r) => r.textContent.includes(drifted.policyId));
    const stableRow = rows.find((r) => r.textContent.includes(stable.policyId));
    expect(driftedRow).toHaveTextContent('Updated upstream');
    expect(stableRow).not.toHaveTextContent('Updated upstream');
    expect(within(driftedRow).getByRole('link')).toHaveAttribute(
      'href', gwsOffer.record.attribution.sourceUrl);
  });

  test('unresolved badge through the PRODUCTION restore path: a corpus-less ref imported verbatim badges "Unresolved" with NO link', () => {
    const FOREIGN = {
      corpusId: 'foreign-corpus',
      corpusVersion: 'ffffffffffffffff',
      policyId: 'gone.policy.1.1v1',
      contentHash: '0123456789abcdef'
    };
    const data = {
      users: [{ id: 'u1', name: 'Auditor One' }],
      controls: [],
      requirements: [{ id: 'PR.DS-01 Ex1', frameworkId: 'nist-csf-2.0' }],
      frameworks: [{ id: 'nist-csf-2.0', name: 'NIST CSF 2.0', isDefault: true }],
      artifacts: [], findings: [], metrics: [],
      assessments: [{
        id: 'a1',
        name: 'Restored',
        observations: {
          'PR.DS-01 Ex1': {
            testProcedures: 'Trunk.',
            platformProcedures: [FOREIGN],
            quarters: {}
          }
        }
      }]
    };
    const setters = { setAssessments: jest.fn() };
    const storeOf = (state) => ({ getState: () => state });
    const stores = {
      userStore: storeOf({ users: data.users, setUsers: jest.fn() }),
      controlsStore: storeOf({ controls: data.controls, setControls: jest.fn() }),
      assessmentsStore: storeOf({ assessments: data.assessments, setAssessments: setters.setAssessments }),
      requirementsStore: storeOf({ requirements: data.requirements, setRequirements: jest.fn() }),
      frameworksStore: storeOf({ frameworks: data.frameworks, setFrameworks: jest.fn() }),
      artifactStore: storeOf({ artifacts: data.artifacts, setArtifacts: jest.fn() }),
      findingsStore: storeOf({ findings: data.findings, setFindings: jest.fn() }),
      metricsStore: storeOf({ metrics: data.metrics, setMetrics: jest.fn() }),
      orgProfileStore: storeOf({ profile: null, cloudConsent: false, setProfileState: jest.fn() })
    };
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores)));
    importCompleteDatabase(parsed, stores, { backupFirst: false });
    const restored = setters.setAssessments.mock.calls[0][0];
    const entries = restored[0].observations['PR.DS-01 Ex1'].platformProcedures;
    expect(entries).toEqual([FOREIGN]); // verbatim — the stale identity is preserved, never healed

    render(<PlatformAddendumBadges entries={entries} />);
    expect(screen.getByText('1 unresolved')).toBeInTheDocument();
    fireEvent.click(screen.getByText('1 platform check'));
    const row = screen.getByTestId('platform-addendum-row');
    expect(row).toHaveTextContent(FOREIGN.policyId);
    expect(row).toHaveTextContent('Unresolved');
    expect(within(row).queryByRole('link')).toBeNull(); // no dead href
  });

  test('rows collapsed by default; the toggle expands one row per entry in entry order', () => {
    const refs = getPlatformProcedures('PR.DS-10', ['google-workspace'])
      .slice(0, 3)
      .map((o) => buildPlatformRef(o.record, o.corpusId));
    render(<PlatformAddendumBadges entries={refs} />);
    expect(screen.queryAllByTestId('platform-addendum-row')).toHaveLength(0);
    fireEvent.click(screen.getByText('3 platform checks'));
    const rows = screen.getAllByTestId('platform-addendum-row');
    expect(rows).toHaveLength(refs.length);
    rows.forEach((row, i) => {
      expect(within(row).getByText(refs[i].policyId)).toBeInTheDocument();
    });
  });

  test('mixed corpus record license surface: the M365 record used here really carries a sourceUrl (fixture honesty)', () => {
    expect(bank.procedures[m365Offer.policyId].attribution.sourceUrl).toBeTruthy();
  });

  test('a fork row shows NEITHER chip — its text is user-owned and the drift remedy (adopt) refuses forks', () => {
    const fork = { ...freshRef(), contentHash: '0000000000000000', text: 'User text.', modified: true };
    render(<PlatformAddendumBadges entries={[fork]} />);
    expect(screen.queryByText(/updated upstream/i)).toBeNull();
    expect(screen.queryByText(/unresolved/i)).toBeNull();
    fireEvent.click(screen.getByText('1 platform check'));
    const row = screen.getByTestId('platform-addendum-row');
    expect(row).toHaveTextContent(fork.policyId);
  });
});
