import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PracticeAlma from './PracticeAlma';
import useAssessmentsStore from '../stores/assessmentsStore';

beforeEach(() => localStorage.clear());

test('guides a beginner from Alma evidence to a portfolio note', () => {
  render(<MemoryRouter><PracticeAlma /></MemoryRouter>);

  expect(screen.getByRole('heading', { name: 'Practice with Alma' })).toBeInTheDocument();
  expect(screen.getByText('Step 1 of 6 — Start')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Start practice' }));
  expect(screen.getByRole('heading', { name: 'Review the evidence' })).toBeInTheDocument();
  expect(screen.getByText('Step 2 of 6 — Evidence')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'What works' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'What is missing' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'What was tested' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Continue to scoring' }));
  const compare = screen.getByRole('button', { name: 'Compare with the example' });
  expect(compare).toBeDisabled();
  expect(screen.getByText(/Half points let you place Alma between two rubric levels/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Choose score 4.0 out of 10' }));
  fireEvent.change(screen.getByLabelText('Why did you choose that score?'), { target: { value: 'A CMDB exists, but the sampled assets and network scan show gaps.' } });
  fireEvent.click(compare);

  expect(screen.getByText(/catalog example:/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Continue to finding' }));
  fireEvent.change(screen.getByLabelText('What gap did you find?'), { target: { value: 'The inventory is not reconciled with scans.' } });
  fireEvent.change(screen.getByLabelText('What should Alma do?'), { target: { value: 'Reconcile the CMDB monthly and assign an owner.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Review portfolio note' }));

  expect(screen.getByRole('heading', { name: 'Your portfolio note' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Assessment summary' })).toBeInTheDocument();
  expect(screen.getByText('Current score')).toBeInTheDocument();
  expect(screen.getByText(/The inventory is not reconciled with scans/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download Markdown' })).toBeInTheDocument();
});

test('restores a saved practice draft after remount', () => {
  const { unmount } = render(<MemoryRouter><PracticeAlma /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Start practice' }));
  unmount();

  render(<MemoryRouter><PracticeAlma /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Review the evidence' })).toBeInTheDocument();
});

test('starts a separate three-requirement Alma assessment with empty scores and resumes it', () => {
  const store = useAssessmentsStore.getState();
  const previousAssessments = store.assessments;
  const previousCurrentId = store.currentAssessmentId;
  localStorage.setItem('alma-practice-draft-v1', JSON.stringify({ step: 5, score: '4', reason: 'A system exists with gaps.', gap: 'Inventory is incomplete.', action: 'Reconcile monthly.' }));

  try {
    const { unmount } = render(<MemoryRouter><PracticeAlma /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Try your own assessment' }));

    const practice = useAssessmentsStore.getState().assessments.find((item) => item.beginnerPractice === true);
    expect(practice).toMatchObject({ caseStudyId: 'alma-security', scopeIds: ['ID.AM-02 Ex1', 'PR.AT-01 Ex1', 'PR.AA-01 Ex1'] });
    for (const id of practice.scopeIds) {
      expect(practice.observations[id].quarters.Q1).toMatchObject({ actualScore: null, targetScore: null, observations: '' });
    }
    expect(practice.id).not.toBe('ASM-2026-comprehensive-alma');

    unmount();
    const second = render(<MemoryRouter><PracticeAlma /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Resume your assessment' }));
    expect(useAssessmentsStore.getState().assessments.filter((item) => item.beginnerPractice === true)).toHaveLength(1);
    second.unmount();
  } finally {
    useAssessmentsStore.getState().setAssessments(previousAssessments);
    useAssessmentsStore.getState().setCurrentAssessmentId(previousCurrentId);
  }
});
