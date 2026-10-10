import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Assessments from './Assessments';
import { COMPREHENSIVE_ASSESSMENT_ID } from '../stores/comprehensiveAssessmentData';

jest.mock('../components/Markdown', () => ({ children }) => <>{children}</>);

test('opens and closes the selected assessment case study from the list', () => {
  render(<MemoryRouter><Assessments /></MemoryRouter>);

  fireEvent.click(screen.getByRole('button', { name: /read case study for 2026 alma security comprehensive csf assessment/i }));

  expect(screen.getByRole('heading', { name: '2026 Alma Security Comprehensive CSF Assessment' })).toBeInTheDocument();
  expect(screen.getAllByText(/INC-2024-01/).length).toBeGreaterThan(0);

  fireEvent.click(screen.getByRole('button', { name: /back to assessment/i }));
  expect(screen.getByRole('heading', { name: 'Control Evaluations' })).toBeInTheDocument();
});

test('opens Alma case study from a practice deep link', () => {
  render(
    <MemoryRouter initialEntries={[`/assessments?selected=${COMPREHENSIVE_ASSESSMENT_ID}&brief=1`]}>
      <Assessments />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: 'Complete Alma case study library' })).toBeInTheDocument();
});
