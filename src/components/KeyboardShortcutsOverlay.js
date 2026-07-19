import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  PLATFORM_MAC,
  PLATFORM_WINDOWS,
  resolvePlatform,
  storePlatform,
} from '../utils/platform';

/**
 * KeyboardShortcutsOverlay
 *
 * Global modal that documents every keybinding actually implemented in
 * src/hooks/useKeyboardNavigation.js. Opened by pressing '?' (Shift+/) outside
 * of an input/textarea/contentEditable/select — the hook already dispatches the
 * `keyboard-show-help` CustomEvent for that key, so this component simply
 * listens for it. Esc, the close button, or a backdrop click all dismiss it.
 *
 * IMPORTANT: keep this list in sync with useKeyboardNavigation.js. Every row
 * below maps to a real branch of that hook's handleKeyDown switch statement.
 */

// A key token renders as a <kbd> chip.
const K = (label) => ({ kbd: label });
// The primary chord modifier, rendered per the selected platform. The hook
// accepts ctrlKey || metaKey everywhere, so either label is truthful.
const MOD = { mod: true };
// A separator between alternative key options ("or").
const OR = { or: true };
// A "+" combiner rendered between chord keys.
const PLUS = { plus: true };

const MODIFIER_LABEL = {
  [PLATFORM_WINDOWS]: 'Ctrl',
  [PLATFORM_MAC]: '⌘',
};

const SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    shortcuts: [
      { desc: 'Next item', keys: [K('↓'), OR, K('J')] },
      { desc: 'Previous item', keys: [K('↑'), OR, K('K')] },
      { desc: 'Next page', keys: [K('→'), OR, K('L')] },
      { desc: 'Previous page', keys: [K('←'), OR, K('H')] },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { desc: 'Toggle selection of current item', keys: [K('Space')] },
      { desc: 'Extend selection while moving', keys: [K('Shift'), PLUS, K('↑'), OR, K('Shift'), PLUS, K('↓')] },
      { desc: 'Select all items', keys: [MOD, PLUS, K('A')] },
      { desc: 'Exit edit / clear selection / deselect', keys: [K('Esc')] },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { desc: 'Edit current item', keys: [K('Enter')] },
      { desc: 'Create new item', keys: [K('N')] },
      { desc: 'Undo', keys: [MOD, PLUS, K('Z')] },
      { desc: 'Redo', keys: [MOD, PLUS, K('Shift'), PLUS, K('Z'), OR, MOD, PLUS, K('Y')] },
    ],
  },
  {
    title: 'Search & Help',
    shortcuts: [
      { desc: 'Focus search box', keys: [K('/')] },
      { desc: 'Show this shortcuts overlay', keys: [K('Shift'), PLUS, K('/')] },
    ],
  },
];

const KeyToken = ({ token, platform }) => {
  if (token.or) return <span className="kbd-overlay-or">or</span>;
  if (token.plus) return <span className="kbd-overlay-plus">+</span>;
  if (token.mod) return <kbd className="terminal-kbd">{MODIFIER_LABEL[platform]}</kbd>;
  return <kbd className="terminal-kbd">{token.kbd}</kbd>;
};

const PLATFORM_OPTIONS = [
  { id: PLATFORM_WINDOWS, label: 'Windows' },
  { id: PLATFORM_MAC, label: 'Mac' },
];

const KeyboardShortcutsOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState(resolvePlatform);
  const closeButtonRef = useRef(null);
  const previouslyFocused = useRef(null);

  const choosePlatform = useCallback((next) => {
    setPlatform(next);
    storePlatform(next);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Restore focus to whatever held it before the overlay opened.
    const prev = previouslyFocused.current;
    if (prev && typeof prev.focus === 'function') {
      prev.focus();
    }
  }, []);

  // Listen for the hook-dispatched open event ('?' pressed outside an input).
  useEffect(() => {
    const handleShowHelp = () => {
      setIsOpen((cur) => {
        if (!cur) previouslyFocused.current = document.activeElement;
        return true;
      });
    };
    window.addEventListener('keyboard-show-help', handleShowHelp);
    return () => window.removeEventListener('keyboard-show-help', handleShowHelp);
  }, []);

  // Handle Esc in the CAPTURE phase so we close the overlay before the global
  // navigation hook (which listens in the bubble phase) also acts on Escape.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDownCapture = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDownCapture, true);
    return () => window.removeEventListener('keydown', handleKeyDownCapture, true);
  }, [isOpen, close]);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="kbd-overlay-backdrop" onClick={close} role="presentation">
      <div
        className="kbd-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kbd-overlay-header">
          <span className="kbd-overlay-title">Keyboard Shortcuts</span>
          <div className="kbd-overlay-platform" role="group" aria-label="Modifier key style">
            {PLATFORM_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`kbd-overlay-platform-btn${platform === option.id ? ' is-active' : ''}`}
                aria-pressed={platform === option.id}
                onClick={() => choosePlatform(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            className="kbd-overlay-close"
            onClick={close}
            aria-label="Close keyboard shortcuts"
          >
            Esc
          </button>
        </div>

        <div className="kbd-overlay-body">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="kbd-overlay-group">
              <div className="kbd-overlay-group-title">{group.title}</div>
              {group.shortcuts.map((shortcut) => (
                <div key={shortcut.desc} className="kbd-overlay-row">
                  <span className="kbd-overlay-row-desc">{shortcut.desc}</span>
                  <span className="kbd-overlay-row-keys" role="group" aria-label={shortcut.desc}>
                    {shortcut.keys.map((token, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <KeyToken key={i} token={token} platform={platform} />
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <div className="kbd-overlay-footer">
            Shortcuts are disabled while typing in an input, textarea, or select.
            {' '}Ctrl and {'⌘'} both work regardless of the setting above.
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsOverlay;
