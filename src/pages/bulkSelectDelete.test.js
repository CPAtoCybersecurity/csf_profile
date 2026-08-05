/**
 * Select-all + bulk delete — driven through the real page components.
 *
 * `useRowSelection.test.js` proves the selection primitive in isolation. That
 * is not the claim that matters here: the checkbox columns on Artifacts and
 * Findings previously rendered with no `checked` and no `onChange` at all, so a
 * hook that works perfectly can still sit next to a checkbox wired to nothing.
 * These tests mount each page, click the header checkbox, click Delete, and
 * assert the records actually left the store.
 */
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Artifacts from './Artifacts';
import Findings from './Findings';
import UserControls from './UserControls';
import useArtifactStore from '../stores/artifactStore';
import useFindingsStore from '../stores/findingsStore';
import useControlsStore from '../stores/controlsStore';
import useAssessmentsStore from '../stores/assessmentsStore';
import useCSFStore from '../stores/csfStore';

jest.mock('react-markdown', () => function ReactMarkdown({ children }) {
  return <div>{children}</div>;
});
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }));

const ARTIFACTS = [
  { id: 1, artifactId: 'AR-1', name: 'Access Review Export', type: 'Document', status: 'ACTIVE', assessmentId: null, linkedSubcategoryIds: [] },
  { id: 2, artifactId: 'AR-2', name: 'Firewall Ruleset', type: 'Document', status: 'ACTIVE', assessmentId: null, linkedSubcategoryIds: [] },
  { id: 3, artifactId: 'AR-3', name: 'Backup Test Log', type: 'Document', status: 'ACTIVE', assessmentId: null, linkedSubcategoryIds: [] }
];

const FINDINGS = [
  { id: 'FND-1', summary: 'Logging gap', status: 'Not Started', priority: 'High', assessmentId: null, linkedArtifacts: [] },
  { id: 'FND-2', summary: 'Stale access', status: 'Not Started', priority: 'Medium', assessmentId: null, linkedArtifacts: [] },
  { id: 'FND-3', summary: 'No MFA on VPN', status: 'Not Started', priority: 'High', assessmentId: null, linkedArtifacts: [] }
];

const CONTROLS = [
  { controlId: 'CTRL-001', name: 'Access Reviews', status: 'Implemented', assessmentId: null, linkedRequirementIds: [], stakeholderIds: [] },
  { controlId: 'CTRL-002', name: 'Backup Testing', status: 'Implemented', assessmentId: null, linkedRequirementIds: [], stakeholderIds: [] },
  { controlId: 'CTRL-003', name: 'Log Retention', status: 'Implemented', assessmentId: null, linkedRequirementIds: [], stakeholderIds: [] }
];

const renderPage = (Component, route) => render(
  <MemoryRouter initialEntries={[route]}>
    <Component />
  </MemoryRouter>
);

beforeEach(() => {
  window.localStorage.clear();
  // The Artifacts mount effect re-seeds from localStorage or profile data
  // unless it sees a prior download; without these the store is overwritten
  // and the fixtures never reach the table.
  window.localStorage.setItem('hasDownloaded', 'true');
  window.localStorage.setItem('artifacts', JSON.stringify(ARTIFACTS));
  useCSFStore.setState({ data: [] });
  useAssessmentsStore.setState({ assessments: [], currentAssessmentId: null });
  useArtifactStore.setState({ artifacts: ARTIFACTS });
  useFindingsStore.setState({ findings: FINDINGS });
  useControlsStore.setState({ controls: CONTROLS });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const confirmWith = (answer) =>
  jest.spyOn(window, 'confirm').mockImplementation(() => answer);

/**
 * Each page's select-all lives under a distinct accessible name, so the probe
 * is the same shape across all three even though the markup differs (Artifacts
 * and Findings are flex divs; Controls is a real table).
 */
const PAGES = [
  {
    label: 'Artifacts',
    Component: Artifacts,
    route: '/artifacts',
    selectAll: 'Select all artifacts',
    firstRow: 'Select Access Review Export',
    deleteLabel: /Delete 3/,
    countLabel: '3 artifacts selected',
    remaining: () => useArtifactStore.getState().artifacts,
    openDetail: 'Access Review Export'
  },
  {
    label: 'Findings',
    Component: Findings,
    route: '/findings',
    selectAll: 'Select all findings',
    firstRow: 'Select Logging gap',
    deleteLabel: /Delete 3/,
    countLabel: '3 findings selected',
    remaining: () => useFindingsStore.getState().findings,
    openDetail: 'Logging gap'
  },
  {
    label: 'Controls',
    Component: UserControls,
    route: '/controls',
    selectAll: 'Select all controls on this page',
    firstRow: 'Select CTRL-001',
    deleteLabel: /Delete 3/,
    countLabel: '3 controls selected',
    remaining: () => useControlsStore.getState().controls,
    openDetail: 'CTRL-001'
  }
];

describe.each(PAGES)('$label', (page) => {
  it('renders a select-all control', () => {
    renderPage(page.Component, page.route);
    expect(screen.getByLabelText(page.selectAll)).toBeInTheDocument();
  });

  it('select-all checks every row checkbox', () => {
    renderPage(page.Component, page.route);
    fireEvent.click(screen.getByLabelText(page.selectAll));
    expect(screen.getByLabelText(page.firstRow)).toBeChecked();
    expect(screen.getByText(page.countLabel)).toBeInTheDocument();
  });

  it('a row checkbox drives the select-all state without a full pass', () => {
    renderPage(page.Component, page.route);
    fireEvent.click(screen.getByLabelText(page.firstRow));
    expect(screen.getByLabelText(page.selectAll)).not.toBeChecked();
    expect(screen.getByLabelText(page.firstRow)).toBeChecked();
  });

  it('shows no delete bar until something is selected', () => {
    renderPage(page.Component, page.route);
    expect(screen.queryByTestId('bulk-delete-bar')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(page.selectAll));
    expect(screen.getByTestId('bulk-delete-bar')).toBeInTheDocument();
  });

  it('deletes every selected record behind a single confirm', () => {
    const confirmSpy = confirmWith(true);
    renderPage(page.Component, page.route);

    fireEvent.click(screen.getByLabelText(page.selectAll));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(page.deleteLabel));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(page.remaining()).toHaveLength(0);
  });

  it('deletes nothing when the confirm is declined', () => {
    confirmWith(false);
    renderPage(page.Component, page.route);

    fireEvent.click(screen.getByLabelText(page.selectAll));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(page.deleteLabel));

    expect(page.remaining()).toHaveLength(3);
  });

  it('clears the selection after a delete', () => {
    confirmWith(true);
    renderPage(page.Component, page.route);

    fireEvent.click(screen.getByLabelText(page.selectAll));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(page.deleteLabel));

    expect(screen.queryByTestId('bulk-delete-bar')).not.toBeInTheDocument();
  });

  it('Clear drops the selection without deleting anything', () => {
    renderPage(page.Component, page.route);

    fireEvent.click(screen.getByLabelText(page.selectAll));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText('Clear'));

    expect(screen.queryByTestId('bulk-delete-bar')).not.toBeInTheDocument();
    expect(page.remaining()).toHaveLength(3);
  });

  it('does not leave a detail panel open on a record it just deleted', () => {
    confirmWith(true);
    renderPage(page.Component, page.route);

    // Open the detail panel on a row, then bulk-delete that row with the rest.
    fireEvent.click(screen.getAllByText(page.openDetail)[0]);
    fireEvent.click(screen.getByLabelText(page.selectAll));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(page.deleteLabel));

    expect(page.remaining()).toHaveLength(0);
    // The deleted record's identifier must be gone from the DOM entirely — a
    // surviving occurrence means the panel is still rendering a ghost.
    expect(screen.queryByText(page.openDetail)).not.toBeInTheDocument();
  });
});

describe('a row checkbox does not open the detail panel', () => {
  it('Artifacts: clicking the checkbox leaves the list full-width', () => {
    renderPage(Artifacts, '/artifacts');
    fireEvent.click(screen.getByLabelText('Select Access Review Export'));
    // The detail panel renders the Edit/Delete affordances; none should exist.
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
  });
});

describe('the select-all box shows a partial selection as mixed', () => {
  // React has no `indeterminate` prop, so this is set through a ref. Without
  // it a half-selected page draws an empty box — which reads as "nothing
  // selected" while the bar next to it says one is.
  it.each([
    ['Artifacts', Artifacts, '/artifacts', 'Select all artifacts', 'Select Access Review Export'],
    ['Findings', Findings, '/findings', 'Select all findings', 'Select Logging gap'],
    ['Controls', UserControls, '/controls', 'Select all controls on this page', 'Select CTRL-001']
  ])('%s', (_label, Component, route, selectAll, firstRow) => {
    renderPage(Component, route);
    const header = screen.getByLabelText(selectAll);

    expect(header.indeterminate).toBe(false);

    fireEvent.click(screen.getByLabelText(firstRow));
    expect(header.indeterminate).toBe(true);
    expect(header).toHaveAttribute('aria-checked', 'mixed');
    expect(header).not.toBeChecked();

    fireEvent.click(screen.getByLabelText(selectAll));
    expect(header.indeterminate).toBe(false);
    expect(header).toBeChecked();
  });
});

describe('a delete reaches exactly the named row that was checked', () => {
  // Index-based probes ("the second checkbox") pass even when a checkbox is
  // bound to the wrong row. These name the row and then assert which record
  // left the store.
  it('Artifacts: deletes the checked artifact and leaves the others', () => {
    confirmWith(true);
    renderPage(Artifacts, '/artifacts');

    fireEvent.click(screen.getByLabelText('Select Firewall Ruleset'));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(/Delete 1/));

    expect(useArtifactStore.getState().artifacts.map(a => a.name))
      .toEqual(['Access Review Export', 'Backup Test Log']);
  });

  it('Findings: deletes the checked finding and leaves the others', () => {
    confirmWith(true);
    renderPage(Findings, '/findings');

    fireEvent.click(screen.getByLabelText('Select Stale access'));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(/Delete 1/));

    expect(useFindingsStore.getState().findings.map(f => f.id))
      .toEqual(['FND-1', 'FND-3']);
  });

  it('Controls: deletes the checked control and leaves the others', () => {
    confirmWith(true);
    renderPage(UserControls, '/controls');

    fireEvent.click(screen.getByLabelText('Select CTRL-002'));
    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(/Delete 1/));

    expect(useControlsStore.getState().controls.map(c => c.controlId))
      .toEqual(['CTRL-001', 'CTRL-003']);
  });
});

describe('a selection cannot outlive the rows it was made on', () => {
  /**
   * The hook prunes ids that leave the view — but proving that at the hook
   * layer does not prove the PAGE's delete loop consumed the pruned value. A
   * page that kept its own copy of the raw set would pass every hook test and
   * still delete a record hidden behind the assessment filter. This drives the
   * real page: select everything, narrow the scope so rows disappear, delete.
   */
  it('Findings: a finding hidden by the scope filter survives a bulk delete', () => {
    confirmWith(true);
    // Both findings are stamped to an assessment: `filterByScope` deliberately
    // fails open for UNASSIGNED records, so an unassigned finding would stay
    // visible in every scope and could never go hidden.
    useAssessmentsStore.setState({
      assessments: [
        { id: 'ASMT-1', name: 'FY26 Assessment' },
        { id: 'ASMT-2', name: 'FY25 Assessment' }
      ],
      currentAssessmentId: null
    });
    useFindingsStore.setState({
      findings: [
        { id: 'FND-A', summary: 'Prior year gap', status: 'Not Started', priority: 'High', assessmentId: 'ASMT-2', linkedArtifacts: [] },
        { id: 'FND-B', summary: 'Current year gap', status: 'Not Started', priority: 'High', assessmentId: 'ASMT-1', linkedArtifacts: [] }
      ]
    });

    renderPage(Findings, '/findings');

    // Both rows visible under "All assessments" — select them both.
    fireEvent.click(screen.getByLabelText('Select all findings'));
    expect(screen.getByText('2 findings selected')).toBeInTheDocument();

    // Narrow the scope so the unassigned-only view hides FND-B.
    fireEvent.change(screen.getByLabelText('Assessment scope'), {
      target: { value: 'ASMT-1' }
    });

    // The bar now describes only what is on screen.
    expect(screen.getByText('1 finding selected')).toBeInTheDocument();

    fireEvent.click(within(screen.getByTestId('bulk-delete-bar')).getByText(/Delete 1/));

    // FND-A was selected but is no longer visible — it must survive.
    expect(useFindingsStore.getState().findings.map(f => f.id)).toEqual(['FND-A']);
  });
});
