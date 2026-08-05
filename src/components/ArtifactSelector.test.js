import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ArtifactSelector from './ArtifactSelector';
import useArtifactStore from '../stores/artifactStore';

/**
 * The artifact pick list in the Assessments evaluation pane.
 *
 * Two behaviours are pinned here. First, the panel escapes its scrolling
 * ancestor: it is portalled to <body> with an inline z-index, because the pane
 * is `overflow-auto` inside an `overflow-hidden` grid and the stylesheet has no
 * `.z-10` rule to lean on. Second, an artifact can be created from inside the
 * panel and is linked to the evaluation in the same action.
 */

const MINE = 'ASM-user-2026';
const OTHER = 'ASM-other-2026';

const ARTIFACTS = [
  { id: 'a-mine', artifactId: 'AR-mine', name: 'My artifact', description: 'in scope', assessmentId: MINE },
  { id: 'a-legacy', artifactId: 'AR-legacy', name: 'Legacy artifact', description: 'unassigned' }
];

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// Click the trigger itself rather than its placeholder text — the placeholder
// is absent once anything is selected.
const openPanel = () => {
  fireEvent.click(screen.getByTestId('artifact-trigger'));
  return screen.getByTestId('artifact-dropdown');
};

const startCreating = () => {
  const panel = openPanel();
  fireEvent.click(within(panel).getByText('New artifact'));
  return panel;
};

beforeEach(() => useArtifactStore.setState({ artifacts: ARTIFACTS }));

describe('ArtifactSelector panel rendering', () => {
  it('portals the panel to <body> rather than nesting it in the clipping pane', () => {
    renderWithRouter(
      <ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />
    );
    const panel = openPanel();

    // A direct child of <body> is outside every `overflow-auto` ancestor, which
    // is the whole point — the pane can no longer clip it. Asserting DOM
    // topology is inherently node access; same exemption UserSelector's portal
    // test takes.
    // eslint-disable-next-line testing-library/no-node-access
    expect(panel.parentElement).toBe(document.body);
    // eslint-disable-next-line testing-library/no-node-access
    expect(panel.closest('[data-testid="artifact-trigger"]')).toBeNull();
  });

  it('sets z-index inline — a utility class is exactly what failed here', () => {
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    const panel = openPanel();

    expect(panel.style.position).toBe('fixed');
    expect(Number(panel.style.zIndex)).toBeGreaterThan(0);
    expect(panel.className).not.toMatch(/\bz-10\b/);
  });

  it('renders no label — and so no stray colon — when no label prop is given', () => {
    renderWithRouter(
      <ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />
    );
    // The Assessments pane passes no label; a bare ":" used to render above the
    // artifact chips.
    expect(screen.queryByText(':')).not.toBeInTheDocument();
  });

  it('renders the label with a colon when one is supplied', () => {
    renderWithRouter(
      <ArtifactSelector label="Artifacts" selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />
    );
    expect(screen.getByText('Artifacts:')).toBeInTheDocument();
  });

  it('exposes no create affordance in read-only mode', () => {
    renderWithRouter(
      <ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} disabled />
    );
    expect(screen.queryByText('New artifact')).not.toBeInTheDocument();
  });
});

describe('ArtifactSelector panel positioning', () => {
  const VIEWPORT_H = 800;
  const VIEWPORT_W = 1200;
  let originalRect;

  const mockGeometry = ({ triggerTop, triggerHeight = 42, panelHeight = 320 }) => {
    originalRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function mocked() {
      if (this.dataset?.testid === 'artifact-trigger') {
        return { top: triggerTop, bottom: triggerTop + triggerHeight, left: 100, width: 500, height: triggerHeight };
      }
      return { top: 0, bottom: 0, left: 0, width: 0, height: 0 };
    };
    Object.defineProperty(document.documentElement, 'clientHeight', { value: VIEWPORT_H, configurable: true });
    Object.defineProperty(document.documentElement, 'clientWidth', { value: VIEWPORT_W, configurable: true });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { value: panelHeight, configurable: true });
  };

  afterEach(() => {
    if (originalRect) Element.prototype.getBoundingClientRect = originalRect;
    originalRect = undefined;
  });

  it('opens below the trigger when there is room', () => {
    mockGeometry({ triggerTop: 100 });
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    const panel = openPanel();

    expect(parseFloat(panel.style.top)).toBeGreaterThanOrEqual(142);
    expect(parseFloat(panel.style.left)).toBe(100);
    expect(parseFloat(panel.style.width)).toBe(500);
  });

  it('flips above the trigger when the panel would run off the bottom', () => {
    // Trigger near the viewport floor: 700 + 42 + 320 overflows 800.
    mockGeometry({ triggerTop: 700 });
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    const panel = openPanel();

    const top = parseFloat(panel.style.top);
    expect(top + 320).toBeLessThanOrEqual(700); // sits entirely above the trigger
    expect(top).toBeGreaterThanOrEqual(8);
  });

  it('clamps into the viewport when it fits neither below nor above', () => {
    // A tall panel with the trigger mid-screen: no room either side.
    mockGeometry({ triggerTop: 400, panelHeight: 780 });
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    const panel = openPanel();

    const top = parseFloat(panel.style.top);
    expect(top).toBeGreaterThanOrEqual(8);
    expect(top + 780).toBeLessThanOrEqual(VIEWPORT_H);
  });

  it('pulls the panel back when the trigger sits near the right edge', () => {
    originalRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function mocked() {
      if (this.dataset?.testid === 'artifact-trigger') {
        return { top: 100, bottom: 142, left: 1100, width: 500, height: 42 };
      }
      return { top: 0, bottom: 0, left: 0, width: 0, height: 0 };
    };
    Object.defineProperty(document.documentElement, 'clientWidth', { value: VIEWPORT_W, configurable: true });

    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    const panel = openPanel();

    const left = parseFloat(panel.style.left);
    const width = parseFloat(panel.style.width);
    expect(left + width).toBeLessThanOrEqual(VIEWPORT_W);
    expect(left).toBeGreaterThanOrEqual(8);
  });
});

describe('ArtifactSelector inline create', () => {
  it('creates the artifact and links it to the evaluation in one action', () => {
    const onChange = jest.fn();
    renderWithRouter(
      <ArtifactSelector selectedArtifacts={['My artifact']} onChange={onChange} assessmentId={MINE} />
    );
    const panel = startCreating();

    fireEvent.change(within(panel).getByLabelText('New artifact name'), { target: { value: 'SOC 2 Report' } });
    fireEvent.change(within(panel).getByLabelText('New artifact type'), { target: { value: 'Report' } });
    fireEvent.change(within(panel).getByLabelText('New artifact link'), { target: { value: 'https://example.com/soc2' } });
    fireEvent.click(within(panel).getByText('Create & link'));

    const created = useArtifactStore.getState().artifacts.find(a => a.name === 'SOC 2 Report');
    expect(created).toBeDefined();
    expect(created.type).toBe('Report');
    expect(created.link).toBe('https://example.com/soc2');
    // Stamped into the scope that created it, so it cannot leak into other
    // assessments' pick lists.
    expect(created.assessmentId).toBe(MINE);
    expect(onChange).toHaveBeenCalledWith(['My artifact', 'SOC 2 Report']);
  });

  it('submits on Enter instead of letting the key bubble out and close the panel', () => {
    const onChange = jest.fn();
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={onChange} assessmentId={MINE} />);
    const panel = startCreating();

    const nameInput = within(panel).getByLabelText('New artifact name');
    fireEvent.change(nameInput, { target: { value: 'Pen Test Report' } });
    fireEvent.keyDown(nameInput, { key: 'Enter' });

    expect(useArtifactStore.getState().artifacts.some(a => a.name === 'Pen Test Report')).toBe(true);
    expect(onChange).toHaveBeenCalledWith(['Pen Test Report']);
  });

  it('blocks a duplicate name — links key on name, so duplicates are ambiguous', () => {
    const onChange = jest.fn();
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={onChange} assessmentId={MINE} />);
    const panel = startCreating();

    fireEvent.change(within(panel).getByLabelText('New artifact name'), { target: { value: '  my ARTIFACT ' } });
    fireEvent.click(within(panel).getByText('Create & link'));

    expect(within(panel).getByRole('alert')).toHaveTextContent('already exists');
    expect(useArtifactStore.getState().artifacts).toHaveLength(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks a duplicate that is out of scope but still in the store', () => {
    useArtifactStore.setState({
      artifacts: [...ARTIFACTS, { id: 'a-other', artifactId: 'AR-other', name: 'Hidden artifact', assessmentId: OTHER }]
    });
    const onChange = jest.fn();
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={onChange} assessmentId={MINE} />);
    const panel = startCreating();

    fireEvent.change(within(panel).getByLabelText('New artifact name'), { target: { value: 'Hidden artifact' } });
    fireEvent.click(within(panel).getByText('Create & link'));

    expect(within(panel).getByRole('alert')).toHaveTextContent('already exists');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks an empty or whitespace-only name', () => {
    const onChange = jest.fn();
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={onChange} assessmentId={MINE} />);
    const panel = startCreating();

    fireEvent.change(within(panel).getByLabelText('New artifact name'), { target: { value: '   ' } });
    fireEvent.click(within(panel).getByText('Create & link'));

    expect(within(panel).getByRole('alert')).toHaveTextContent('Name is required');
    expect(useArtifactStore.getState().artifacts).toHaveLength(2);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cancel dismisses the form without creating anything', () => {
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    const panel = startCreating();

    fireEvent.change(within(panel).getByLabelText('New artifact name'), { target: { value: 'Discarded' } });
    fireEvent.click(within(panel).getByText('Cancel'));

    expect(useArtifactStore.getState().artifacts).toHaveLength(2);
    expect(within(panel).getByText('New artifact')).toBeInTheDocument();
  });

  it('resets a cancelled draft so it does not reappear on reopen', () => {
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    let panel = startCreating();

    fireEvent.change(within(panel).getByLabelText('New artifact name'), { target: { value: 'Abandoned draft' } });
    // Close the whole panel with the draft still in flight.
    fireEvent.mouseDown(document.body);

    panel = startCreating();
    expect(within(panel).getByLabelText('New artifact name')).toHaveValue('');
  });

  it('Escape steps out of the create form first, then closes the panel', () => {
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />);
    const panel = startCreating();

    // First Escape: leave the form, keep the panel open.
    fireEvent.keyDown(within(panel).getByLabelText('New artifact name'), { key: 'Escape' });
    expect(screen.getByTestId('artifact-dropdown')).toBeInTheDocument();
    expect(screen.queryByLabelText('New artifact name')).not.toBeInTheDocument();

    // Second Escape: close the panel — portalling puts it at the end of the
    // document, so a keyboard user needs a way out.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('artifact-dropdown')).not.toBeInTheDocument();
  });

  it('tears down its window listeners on unmount', () => {
    const remove = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderWithRouter(
      <ArtifactSelector selectedArtifacts={[]} onChange={() => {}} assessmentId={MINE} />
    );
    openPanel();
    unmount();

    const removed = remove.mock.calls.map(c => c[0]);
    expect(removed).toContain('scroll');
    expect(removed).toContain('resize');
    remove.mockRestore();
  });

  it('keeps the panel open when a row inside the portal is clicked', () => {
    const onChange = jest.fn();
    renderWithRouter(<ArtifactSelector selectedArtifacts={[]} onChange={onChange} assessmentId={MINE} />);
    const panel = openPanel();

    fireEvent.mouseDown(within(panel).getByText('My artifact'));
    fireEvent.click(within(panel).getByText('My artifact'));

    expect(screen.getByTestId('artifact-dropdown')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(['My artifact']);
  });
});
