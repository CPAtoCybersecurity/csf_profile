import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserSelector from './UserSelector';
import useUserStore from '../stores/userStore';

/**
 * Scoped mode (issue #297): with scopeUserIds set, the dropdown lists only
 * the assessment's roster; the rest of the directory sits behind an explicit
 * "Browse directory…" expansion (or a typed search), and picking a directory
 * user reports it through onAddToScope so the caller can link them.
 */

const DIRECTORY = [
  { id: 'u1', name: 'Roster Rita', title: 'Auditor', email: 'rita@example.com' },
  { id: 'u2', name: 'Directory Dan', title: 'Engineer', email: 'dan@example.com' },
  { id: 'u3', name: 'Demo Gerry', title: 'CISO', email: 'gerry@almasecurity.example' }
];

beforeEach(() => {
  useUserStore.setState({ users: DIRECTORY });
});

const openDropdown = () => fireEvent.click(screen.getByTitle('Select user'));

describe('UserSelector — unscoped (legacy behavior unchanged)', () => {
  it('lists the whole directory', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} />);
    openDropdown();
    expect(screen.getByText('Roster Rita')).toBeInTheDocument();
    expect(screen.getByText('Directory Dan')).toBeInTheDocument();
    expect(screen.getByText('Demo Gerry')).toBeInTheDocument();
    expect(screen.queryByText('Browse directory…')).not.toBeInTheDocument();
  });
});

describe('UserSelector — scoped mode (issue #297)', () => {
  it('lists only the roster by default; directory users are hidden', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={['u1']} />);
    openDropdown();
    expect(screen.getByText('Roster Rita')).toBeInTheDocument();
    expect(screen.queryByText('Directory Dan')).not.toBeInTheDocument();
    expect(screen.queryByText('Demo Gerry')).not.toBeInTheDocument();
  });

  it('an empty roster shows a helpful empty state, not the demo directory', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={[]} />);
    openDropdown();
    expect(screen.getByText('No users on this assessment yet')).toBeInTheDocument();
    expect(screen.queryByText('Demo Gerry')).not.toBeInTheDocument();
  });

  it('Browse directory reveals the rest of the directory', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={['u1']} />);
    openDropdown();
    fireEvent.click(screen.getByText('Browse directory…'));
    expect(screen.getByText('Directory Dan')).toBeInTheDocument();
    expect(screen.getByText('Directory — selecting adds the user to this assessment')).toBeInTheDocument();
  });

  it('typing a search also surfaces matching directory users', () => {
    render(<UserSelector selectedUsers={null} onChange={() => {}} scopeUserIds={['u1']} />);
    openDropdown();
    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'Dan' } });
    expect(screen.getByText('Directory Dan')).toBeInTheDocument();
  });

  it('picking a directory user fires onAddToScope AND onChange', () => {
    const onChange = jest.fn();
    const onAddToScope = jest.fn();
    render(
      <UserSelector
        selectedUsers={null}
        onChange={onChange}
        scopeUserIds={['u1']}
        onAddToScope={onAddToScope}
      />
    );
    openDropdown();
    fireEvent.click(screen.getByText('Browse directory…'));
    fireEvent.click(screen.getByText('Directory Dan'));
    expect(onAddToScope).toHaveBeenCalledWith('u2');
    expect(onChange).toHaveBeenCalledWith('u2');
  });

  it('picking a roster user does NOT fire onAddToScope', () => {
    const onAddToScope = jest.fn();
    render(
      <UserSelector
        selectedUsers={null}
        onChange={() => {}}
        scopeUserIds={['u1']}
        onAddToScope={onAddToScope}
      />
    );
    openDropdown();
    fireEvent.click(screen.getByText('Roster Rita'));
    expect(onAddToScope).not.toHaveBeenCalled();
  });
});

/**
 * Dropdown placement. The Assessments Details pane is an `overflow-auto`
 * column and its Auditor trigger is right-aligned, so an absolutely-positioned
 * panel inside the trigger got clipped by that pane — the user list scrolled
 * out of sight instead of drawing over it. The panel is therefore portalled to
 * <body>, positioned `fixed`, and clamped to the viewport.
 */
describe('UserSelector — dropdown placement stays on screen', () => {
  const PANEL_W = 288; // .w-72
  const MARGIN = 8;
  let rectSpy;

  const setViewport = (width, height) => {
    Object.defineProperty(document.documentElement, 'clientWidth', { value: width, configurable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { value: height, configurable: true });
  };

  // jsdom has no layout, so the trigger's box is stubbed explicitly.
  const stubTriggerAt = (left) => {
    rectSpy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left, right: left + 32, top: 200, bottom: 232,
      width: 32, height: 32, x: left, y: 200, toJSON: () => ({})
    });
  };

  // These assertions are about where in the DOM the panel lands and what it is
  // positioned with — exactly the structure RTL's queries abstract away — so
  // node access is the point here rather than a shortcut.
  // eslint-disable-next-line testing-library/no-node-access
  const panelEl = () => screen.getByPlaceholderText('Search users...').closest('.w-72');

  afterEach(() => rectSpy?.mockRestore());

  it('portals the panel to <body> so an overflow-auto ancestor cannot clip it', () => {
    setViewport(1000, 800);
    stubTriggerAt(100);
    const { container } = render(
      <div style={{ overflow: 'auto' }}>
        <UserSelector selectedUsers={null} onChange={() => {}} />
      </div>
    );
    openDropdown();

    const panel = panelEl();
    // eslint-disable-next-line testing-library/no-node-access
    expect(panel.parentElement).toBe(document.body);
    expect(container).not.toContainElement(panel);
    expect(panel.style.position).toBe('fixed');
    // z-[9999] was inert — this stylesheet has no arbitrary-value classes.
    expect(panel.style.zIndex).toBe('9999');
    expect(panel.className).not.toMatch(/\babsolute\b|\bleft-0\b|z-\[/);
  });

  it('pulls the panel back on screen when the trigger sits near the right edge', () => {
    setViewport(1000, 800);
    stubTriggerAt(900); // 900 + 288 = 1188 -> 188px past the viewport
    render(<UserSelector selectedUsers={null} onChange={() => {}} />);
    openDropdown();

    const left = parseFloat(panelEl().style.left);
    expect(left).toBe(1000 - PANEL_W - MARGIN); // 704
    expect(left + PANEL_W).toBeLessThanOrEqual(1000);
  });

  it('leaves the panel left-aligned with the trigger when it already fits', () => {
    setViewport(1000, 800);
    stubTriggerAt(100);
    render(<UserSelector selectedUsers={null} onChange={() => {}} />);
    openDropdown();

    expect(parseFloat(panelEl().style.left)).toBe(100);
  });

  it('never pushes the panel off the left edge', () => {
    setViewport(200, 800); // narrower than the panel itself
    stubTriggerAt(10);
    render(<UserSelector selectedUsers={null} onChange={() => {}} />);
    openDropdown();

    expect(parseFloat(panelEl().style.left)).toBe(MARGIN);
  });
});
