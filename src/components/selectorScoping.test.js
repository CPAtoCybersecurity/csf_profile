import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FindingSelector from './FindingSelector';
import ArtifactSelector from './ArtifactSelector';
import ControlSelector from './ControlSelector';
import useFindingsStore from '../stores/findingsStore';
import useArtifactStore from '../stores/artifactStore';
import useControlsStore from '../stores/controlsStore';
import { COMPREHENSIVE_ASSESSMENT_ID } from '../stores/comprehensiveAssessmentData';

/**
 * Eval-panel pick lists scope to the assessment being evaluated (issue #297;
 * ControlSelector joined in #299): demo records (stamped to the demo
 * assessment) drop out of every other assessment; unassigned legacy records
 * stay reachable everywhere.
 */

const MINE = 'ASM-user-2026';

const FINDINGS = [
  { id: 'FND-demo', jiraKey: 'FND-demo', summary: 'Demo finding', status: 'Not Started', priority: 'High', assessmentId: COMPREHENSIVE_ASSESSMENT_ID },
  { id: 'FND-mine', jiraKey: 'FND-mine', summary: 'My finding', status: 'Not Started', priority: 'High', assessmentId: MINE },
  { id: 'FND-legacy', jiraKey: 'FND-legacy', summary: 'Legacy finding', status: 'Not Started', priority: 'Low' }
];

const ARTIFACTS = [
  { id: 'a-demo', artifactId: 'AR-demo', name: 'Demo artifact', assessmentId: COMPREHENSIVE_ASSESSMENT_ID },
  { id: 'a-mine', artifactId: 'AR-mine', name: 'My artifact', assessmentId: MINE },
  { id: 'a-legacy', artifactId: 'AR-legacy', name: 'Legacy artifact' }
];

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('FindingSelector scoping (issue #297)', () => {
  beforeEach(() => useFindingsStore.setState({ findings: FINDINGS }));

  it('scoped to my assessment: my + legacy findings listed, demo hidden', () => {
    renderWithRouter(
      <FindingSelector label="Findings" selectedFindings={[]} onChange={() => {}} assessmentId={MINE} />
    );
    fireEvent.click(screen.getByText('Select findings'));
    expect(screen.getByText('FND-mine')).toBeInTheDocument();
    expect(screen.getByText('FND-legacy')).toBeInTheDocument();
    expect(screen.queryByText('FND-demo')).not.toBeInTheDocument();
  });

  it('scoped to the demo assessment: demo findings ARE listed', () => {
    renderWithRouter(
      <FindingSelector label="Findings" selectedFindings={[]} onChange={() => {}} assessmentId={COMPREHENSIVE_ASSESSMENT_ID} />
    );
    fireEvent.click(screen.getByText('Select findings'));
    expect(screen.getByText('FND-demo')).toBeInTheDocument();
  });

  it('no assessmentId prop: unscoped legacy behavior (everything listed)', () => {
    renderWithRouter(
      <FindingSelector label="Findings" selectedFindings={[]} onChange={() => {}} />
    );
    fireEvent.click(screen.getByText('Select findings'));
    expect(screen.getByText('FND-demo')).toBeInTheDocument();
    expect(screen.getByText('FND-mine')).toBeInTheDocument();
  });

  it('an already-linked out-of-scope finding still renders its chip', () => {
    renderWithRouter(
      <FindingSelector label="Findings" selectedFindings={['FND-demo']} onChange={() => {}} assessmentId={MINE} />
    );
    // Chip text is the jiraKey; it must resolve even though the list hides it
    expect(screen.getByText('FND-demo')).toBeInTheDocument();
  });
});

describe('ArtifactSelector scoping (issue #297)', () => {
  beforeEach(() => useArtifactStore.setState({ artifacts: ARTIFACTS }));

  it('scoped to my assessment: my + legacy artifacts listed, demo hidden', () => {
    renderWithRouter(
      <ArtifactSelector label="Artifacts" selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />
    );
    fireEvent.click(screen.getByText('Select artifacts'));
    expect(screen.getByText('My artifact')).toBeInTheDocument();
    expect(screen.getByText('Legacy artifact')).toBeInTheDocument();
    expect(screen.queryByText('Demo artifact')).not.toBeInTheDocument();
  });

  it('scoped to the demo assessment: demo artifacts ARE listed', () => {
    renderWithRouter(
      <ArtifactSelector label="Artifacts" selectedArtifacts={[]} onChange={() => {}} assessmentId={COMPREHENSIVE_ASSESSMENT_ID} />
    );
    fireEvent.click(screen.getByText('Select artifacts'));
    expect(screen.getByText('Demo artifact')).toBeInTheDocument();
  });

  it('an already-linked out-of-scope artifact still renders its chip', () => {
    renderWithRouter(
      <ArtifactSelector label="Artifacts" selectedArtifacts={['Demo artifact']} onChange={() => {}} assessmentId={MINE} />
    );
    expect(screen.getByText('Demo artifact')).toBeInTheDocument();
  });
});

const CONTROLS = [
  { controlId: 'CTL-demo', implementationDescription: 'Demo control', assessmentId: COMPREHENSIVE_ASSESSMENT_ID, seedSource: 'demo-alma' },
  { controlId: 'CTL-mine', implementationDescription: 'My control', assessmentId: MINE },
  { controlId: 'CTL-legacy', implementationDescription: 'Legacy control' }
];

describe('ControlSelector scoping (issue #299)', () => {
  beforeEach(() => useControlsStore.setState({ controls: CONTROLS }));

  it('scoped to my assessment: my + legacy controls listed, demo hidden', () => {
    renderWithRouter(
      <ControlSelector label="Controls" selectedControls={[]} onChange={() => {}} assessmentId={MINE} />
    );
    fireEvent.click(screen.getByText('Select controls'));
    expect(screen.getByText('CTL-mine')).toBeInTheDocument();
    expect(screen.getByText('CTL-legacy')).toBeInTheDocument();
    expect(screen.queryByText('CTL-demo')).not.toBeInTheDocument();
  });

  it('scoped to the demo assessment: demo controls ARE listed', () => {
    renderWithRouter(
      <ControlSelector label="Controls" selectedControls={[]} onChange={() => {}} assessmentId={COMPREHENSIVE_ASSESSMENT_ID} />
    );
    fireEvent.click(screen.getByText('Select controls'));
    expect(screen.getByText('CTL-demo')).toBeInTheDocument();
  });

  it('no assessmentId prop: fails OPEN — everything listed', () => {
    renderWithRouter(
      <ControlSelector label="Controls" selectedControls={[]} onChange={() => {}} />
    );
    fireEvent.click(screen.getByText('Select controls'));
    expect(screen.getByText('CTL-demo')).toBeInTheDocument();
    expect(screen.getByText('CTL-mine')).toBeInTheDocument();
    expect(screen.getByText('CTL-legacy')).toBeInTheDocument();
  });

  it('an already-linked out-of-scope control still renders its chip with its real tooltip', () => {
    renderWithRouter(
      <ControlSelector label="Controls" selectedControls={['CTL-demo']} onChange={() => {}} disabled assessmentId={MINE} />
    );
    // The chip button's title comes from the UNSCOPED register lookup.
    expect(screen.getByTitle('Demo control')).toHaveTextContent('CTL-demo');
  });
});
