/**
 * Findings detail panel — render probe for the CSV-parity fields (2026-08-05).
 *
 * `findingsCsvUiParity.test.js` proves the column list and the panel source
 * agree. That is a source-level check: it would still pass if a label sat
 * inside a branch that never renders. This suite mounts the real panel and
 * asserts the fields reach the DOM with their real values, which is the claim
 * the source check cannot make on its own.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Findings from './Findings';
import useFindingsStore from '../stores/findingsStore';
import useAssessmentsStore from '../stores/assessmentsStore';

jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }) {
    return <div>{children}</div>;
  };
});
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }));

const FINDING = {
  id: 'FND-parity-1',
  summary: 'Detection coverage gap',
  name: '',
  description: '',
  rootCause: '',
  remediationActionPlan: '',
  complianceRequirement: 'GV.SC-04',
  controlId: 'DE.AE-03 Ex1',
  linkedArtifacts: ['AWS Config Snapshot', 'IAM Policy'],
  jiraKey: 'FND-1001',
  assessmentId: null,
  remediationOwner: null,
  dueDate: '',
  status: 'Not Started',
  priority: 'Medium',
  externalUrl: '',
  createdDate: '2026-04-30T10:48:04.460Z',
  lastModified: '2026-04-30T10:48:04.460Z'
};

const openPanel = () => {
  render(
    <MemoryRouter initialEntries={['/findings']}>
      <Findings />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByText('Detection coverage gap'));
};

beforeEach(() => {
  window.localStorage.clear();
  useAssessmentsStore.setState({ assessments: [], currentAssessmentId: null });
  useFindingsStore.setState({ findings: [FINDING] });
});

describe('the three CSV columns that had no panel surface now render', () => {
  it('shows Control ID with its value', () => {
    openPanel();
    expect(screen.getByText('Control ID')).toBeInTheDocument();
    // The value can also appear in the list row, so assert presence, not count.
    expect(screen.getAllByText('DE.AE-03 Ex1').length).toBeGreaterThan(0);
  });

  it('shows Linked Artifacts joined on the same separator the CSV uses', () => {
    openPanel();
    expect(screen.getByText('Linked Artifacts')).toBeInTheDocument();
    expect(screen.getByText('AWS Config Snapshot; IAM Policy')).toBeInTheDocument();
  });

  it('shows Ticket ID, not the old Jira Key label', () => {
    openPanel();
    expect(screen.getByText('Ticket ID')).toBeInTheDocument();
    expect(screen.getAllByText('FND-1001').length).toBeGreaterThan(0);
    expect(screen.queryByText('Jira Key')).not.toBeInTheDocument();
  });
});

describe('the compliance field is labelled the same as its CSV column', () => {
  it('reads "Compliance Requirement", not the old "CSF Reference"', () => {
    openPanel();
    expect(screen.getByText('Compliance Requirement')).toBeInTheDocument();
    expect(screen.queryByText('CSF Reference')).not.toBeInTheDocument();
    // Also rendered in the list's CSF Ref column — presence, not count.
    expect(screen.getAllByText('GV.SC-04').length).toBeGreaterThan(0);
  });
});
