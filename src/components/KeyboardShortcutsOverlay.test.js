import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import KeyboardShortcutsOverlay from './KeyboardShortcutsOverlay';
import { PLATFORM_STORAGE_KEY } from '../utils/platform';

const openOverlay = () => {
  act(() => {
    window.dispatchEvent(new CustomEvent('keyboard-show-help'));
  });
};

const setUserAgent = (ua) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
};

const ORIGINAL_UA = window.navigator.userAgent;

const modifierChips = () =>
  screen
    .getAllByText((_content, node) => node.tagName === 'KBD')
    .map((node) => node.textContent);

beforeEach(() => {
  window.localStorage.clear();
  setUserAgent(ORIGINAL_UA);
});

afterAll(() => setUserAgent(ORIGINAL_UA));

describe('KeyboardShortcutsOverlay — platform toggle', () => {
  it('renders a Windows/Mac toggle in the header when open', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    render(<KeyboardShortcutsOverlay />);
    openOverlay();

    expect(screen.getByRole('group', { name: /modifier key style/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Windows' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mac' })).toBeInTheDocument();
  });

  it('exposes the active side via aria-pressed', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    render(<KeyboardShortcutsOverlay />);
    openOverlay();

    expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Mac' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('auto-detects Mac from the user agent', () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    render(<KeyboardShortcutsOverlay />);
    openOverlay();

    expect(screen.getByRole('button', { name: 'Mac' })).toHaveAttribute('aria-pressed', 'true');
    expect(modifierChips()).toContain('⌘');
    expect(modifierChips()).not.toContain('Ctrl');
  });

  it('defaults to Windows when the platform is unrecognised', () => {
    setUserAgent('Mozilla/5.0 (X11; Linux x86_64)');
    render(<KeyboardShortcutsOverlay />);
    openOverlay();

    expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute('aria-pressed', 'true');
    expect(modifierChips()).toContain('Ctrl');
    expect(modifierChips()).not.toContain('⌘');
  });

  it('swaps every modifier chip when the other side is clicked', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    render(<KeyboardShortcutsOverlay />);
    openOverlay();

    const ctrlCount = modifierChips().filter((label) => label === 'Ctrl').length;
    expect(ctrlCount).toBe(4); // select-all, undo, redo x2

    fireEvent.click(screen.getByRole('button', { name: 'Mac' }));

    expect(modifierChips().filter((label) => label === '⌘')).toHaveLength(ctrlCount);
    expect(modifierChips()).not.toContain('Ctrl');
  });

  it('renders both redo alternatives for the selected platform', () => {
    setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    render(<KeyboardShortcutsOverlay />);
    openOverlay();

    const redoKeys = screen.getByRole('group', { name: 'Redo' });
    const labels = within(redoKeys)
      .getAllByText((_content, node) => node.tagName === 'KBD')
      .map((node) => node.textContent);
    expect(labels).toEqual(['⌘', 'Shift', 'Z', '⌘', 'Y']);
    expect(within(redoKeys).getByText('or')).toBeInTheDocument();
  });

  it('persists the choice and prefers it over detection on remount', () => {
    setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    const view = render(<KeyboardShortcutsOverlay />);
    openOverlay();
    fireEvent.click(screen.getByRole('button', { name: 'Mac' }));
    expect(window.localStorage.getItem(PLATFORM_STORAGE_KEY)).toBe('mac');
    view.unmount();

    render(<KeyboardShortcutsOverlay />);
    openOverlay();
    expect(screen.getByRole('button', { name: 'Mac' })).toHaveAttribute('aria-pressed', 'true');
    expect(modifierChips()).toContain('⌘');
  });
});

describe('KeyboardShortcutsOverlay — existing behavior is unchanged', () => {
  it('stays closed until the help event fires, then closes on Escape', () => {
    render(<KeyboardShortcutsOverlay />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    openOverlay();
    expect(screen.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on a backdrop click but not on a panel click', () => {
    render(<KeyboardShortcutsOverlay />);
    openOverlay();

    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('presentation'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('says both modifiers work, so the toggle cannot read as a rebind', () => {
    render(<KeyboardShortcutsOverlay />);
    openOverlay();
    expect(screen.getByText(/both work regardless of the setting/i)).toBeInTheDocument();
  });
});
