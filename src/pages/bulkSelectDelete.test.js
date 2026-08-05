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
