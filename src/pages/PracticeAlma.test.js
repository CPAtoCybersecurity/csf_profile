import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PracticeAlma from './PracticeAlma';

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
