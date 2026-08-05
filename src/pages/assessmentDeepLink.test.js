/**
 * Assessments list — every evaluation is a real link.
 *
 * The cards used to be `div`s with an onClick, so the browser had no link to
 * offer a context menu for: no "Open Link in New Window", no Cmd-click, no
 * keyboard focus. These tests pin the two halves of the fix — the anchor that
 * produces the URL, and the `?selected=` handler that consumes it.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Assessments from './Assessments';
import useAssessmentsStore from '../stores/assessmentsStore';

// react-markdown and remark-gfm are ESM and CRA's Jest does not transform
// them; the repo mocks them at the test-file level (see App.test.js).
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }) {
    return <div>{children}</div>;
  };
});
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }));

const EVAL_ID = 'ASM-1001';
const EVAL_NAME = 'Q3 CSF Baseline';

const seedAssessment = (overrides = {}) => ({
  id: EVAL_ID,
  name: EVAL_NAME,
  description: 'Baseline evaluation',
  scopeType: 'requirements',
  scoringScale: 10,
  externalTracking: null,
  year: 2026,
  users: [],
  platforms: [],
  scopeIds: [],
  frameworkFilter: null,
  status: 'Not Started',
  createdDate: '2026-01-01T00:00:00.000Z',
  lastModified: '2026-01-01T00:00:00.000Z',
  observations: {},
  ...overrides
});

const renderAt = (route) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Assessments />
    </MemoryRouter>
  );

beforeEach(() => {
  window.localStorage.clear();
  useAssessmentsStore.setState({
    assessments: [seedAssessment()],
    currentAssessmentId: null
  });
});

describe('Assessments list — evaluation cards are links', () => {
  test('each evaluation renders an anchor addressing itself', () => {
    renderAt('/assessments');

    const link = screen.getByRole('link', { name: EVAL_NAME });
    expect(link).toHaveAttribute('href', `/assessments?selected=${EVAL_ID}`);
  });

  test('the anchor carries no target — the context menu decides window vs tab', () => {
    renderAt('/assessments');

    const link = screen.getByRole('link', { name: EVAL_NAME });
    expect(link.getAttribute('target')).toBeNull();
  });

  test('clicking the card link opens that evaluation', () => {
    renderAt('/assessments');

    fireEvent.click(screen.getByRole('link', { name: EVAL_NAME }));

    expect(useAssessmentsStore.getState().currentAssessmentId).toBe(EVAL_ID);
    expect(screen.getByText(/Define scope/i)).toBeInTheDocument();
  });

  test('the link is keyboard reachable — Enter opens the evaluation', () => {
    renderAt('/assessments');

    const link = screen.getByRole('link', { name: EVAL_NAME });
    act(() => link.focus());
    expect(link).toHaveFocus();

    fireEvent.keyDown(link, { key: 'Enter', code: 'Enter' });
    fireEvent.click(link); // Enter on an anchor dispatches a click in a real browser

    expect(useAssessmentsStore.getState().currentAssessmentId).toBe(EVAL_ID);
  });
});

describe('Assessments deep link — ?selected=<id>', () => {
  test('a window opened at ?selected=<id> lands on that evaluation, not the list', () => {
    renderAt(`/assessments?selected=${EVAL_ID}`);

    expect(useAssessmentsStore.getState().currentAssessmentId).toBe(EVAL_ID);
    expect(screen.getByText(/Define scope/i)).toBeInTheDocument();
    expect(screen.queryByText(/Control Evaluations/i)).not.toBeInTheDocument();
  });

  test('an unknown id leaves the list intact and throws nothing', () => {
    expect(() => renderAt('/assessments?selected=ASM-does-not-exist')).not.toThrow();

    expect(screen.getByText(/Control Evaluations/i)).toBeInTheDocument();
    expect(useAssessmentsStore.getState().currentAssessmentId).toBeNull();
  });

  test('the clone and delete buttons do not navigate to the evaluation', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue(null);
    renderAt('/assessments');

    fireEvent.click(screen.getByTitle('Clone assessment'));
    fireEvent.click(screen.getByTitle('Delete assessment'));

    expect(screen.getByText(/Control Evaluations/i)).toBeInTheDocument();
    expect(useAssessmentsStore.getState().currentAssessmentId).toBeNull();

    confirmSpy.mockRestore();
    promptSpy.mockRestore();
  });
});
