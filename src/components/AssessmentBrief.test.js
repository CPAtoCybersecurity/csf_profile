import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssessmentBrief from './AssessmentBrief';
import { COMPREHENSIVE_ASSESSMENT_ID } from '../stores/comprehensiveAssessmentData';

const almaAssessment = {
  id: COMPREHENSIVE_ASSESSMENT_ID,
  name: '2026 Alma Security Comprehensive CSF Assessment',
  description: 'Catalog-driven assessment',
  scopeType: 'requirements',
  scopeIds: ['PR.AA-05 Ex1'],
  year: 2026,
  status: 'In Progress'
};

const customAssessment = {
  id: 'ASM-custom',
  name: 'Northwind Access Review',
  description: '',
  scopeType: 'controls',
  scopeIds: ['CTRL-1', 'CTRL-2'],
  year: 2027,
  status: 'Not Started'
};

test('shows Alma context only for the Alma assessment and clears it when selection changes', () => {
  const { rerender } = render(
    <AssessmentBrief assessment={almaAssessment} onBack={() => {}} onSaveDescription={() => {}} />
  );

  expect(screen.getByText(/INC-2024-01/)).toBeInTheDocument();
  expect(screen.getByText(/300 employees/)).toBeInTheDocument();

  rerender(<AssessmentBrief assessment={customAssessment} onBack={() => {}} onSaveDescription={() => {}} />);

  expect(screen.getByText('Northwind Access Review')).toBeInTheDocument();
  expect(screen.queryByText(/INC-2024-01/)).not.toBeInTheDocument();
  expect(screen.getByText(/2 controls in scope/)).toBeInTheDocument();
});

test('saves custom assessment background in its existing description field', () => {
  const onSaveDescription = jest.fn();
  render(
    <AssessmentBrief assessment={customAssessment} onBack={() => {}} onSaveDescription={onSaveDescription} />
  );

  fireEvent.click(screen.getByRole('button', { name: /edit background/i }));
  fireEvent.change(screen.getByRole('textbox', { name: /assessment background/i }), {
    target: { value: '  Fictional company with an overdue access review.  ' }
  });
  fireEvent.click(screen.getByRole('button', { name: /save background/i }));

  expect(onSaveDescription).toHaveBeenCalledWith('ASM-custom', 'Fictional company with an overdue access review.');
});

test('keeps the Alma brief when an assessment copy carries its case-study identity', () => {
  render(
    <AssessmentBrief
      assessment={{ ...customAssessment, name: 'Quarter 2 review', caseStudyId: 'alma-security' }}
      onBack={() => {}}
      onSaveDescription={() => {}}
    />
  );

  expect(screen.getByText(/INC-2024-02/)).toBeInTheDocument();
});
