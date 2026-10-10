import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Assessments from './Assessments';
import useAssessmentsStore from '../stores/assessmentsStore';
import useRequirementsStore from '../stores/requirementsStore';

jest.mock('../components/Markdown', () => ({ children }) => <>{children}</>);

test('shows beginner guidance beside scoring fields in an unscored Alma practice assessment', () => {
  const store = useAssessmentsStore.getState();
  const previousAssessments = store.assessments;
  const previousCurrentId = store.currentAssessmentId;
  const previousRequirements = useRequirementsStore.getState().requirements;
  useRequirementsStore.getState().setRequirements([
    { id: 'ID.AM-02 Ex1', subcategoryId: 'ID.AM-02', category: 'Asset Management' },
    { id: 'PR.AT-01 Ex1', subcategoryId: 'PR.AT-01', category: 'Awareness and Training' },
    { id: 'PR.AA-01 Ex1', subcategoryId: 'PR.AA-01', category: 'Identity Management' }
  ]);
  const practice = store.createAssessment({
    name: 'Alma Security — My Practice Assessment',
    caseStudyId: 'alma-security',
    beginnerPractice: true,
    scopeType: 'requirements',
    scopeIds: ['ID.AM-02 Ex1', 'PR.AT-01 Ex1', 'PR.AA-01 Ex1'],
    year: 2026
  });

  try {
    const { unmount } = render(<MemoryRouter initialEntries={[`/assessments?selected=${practice.id}`]}><Assessments /></MemoryRouter>);
    expect(screen.getByText(/This is your practice copy/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to walkthrough' })).toHaveAttribute('href', '/practice/alma');
    expect(screen.getByRole('button', { name: 'Score Assessment' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Score Assessment' }));
    expect(screen.getByText(/Alma's completed assessment is reference material/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to walkthrough' })).toHaveAttribute('href', '/practice/alma');
    expect(screen.getAllByText('Not scored')).toHaveLength(2);
    expect(screen.getByText('Help with target score')).toBeInTheDocument();
    expect(screen.getByText('Help with actual score')).toBeInTheDocument();
    expect(screen.getByText('Help with observations')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Q1 Actual Score')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Q1 Actual Score'), { target: { value: '3' } });
    expect(useAssessmentsStore.getState().getObservation(practice.id, 'ID.AM-02 Ex1').quarters.Q1.actualScore).toBe(3);
    unmount();
  } finally {
    useRequirementsStore.getState().setRequirements(previousRequirements);
    useAssessmentsStore.getState().setAssessments(previousAssessments);
    useAssessmentsStore.getState().setCurrentAssessmentId(previousCurrentId);
  }
});
