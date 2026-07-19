import { renderHook } from '@testing-library/react';
import useKeyboardNavigation from './useKeyboardNavigation';

/**
 * Regression guard for the chords the shortcuts overlay advertises.
 *
 * The overlay renders "Ctrl/⌘ + Shift + Z". Browsers report the SHIFTED
 * character in event.key, so that chord arrives as 'Z' — the hook used to
 * compare against a lowercase literal and never fired, meaning the overlay
 * documented a key combination that did nothing.
 */

const mockUndo = jest.fn();
const mockRedo = jest.fn();

jest.mock('../stores/uiStore', () => {
  const state = {
    currentItemId: null,
    setCurrentItemId: jest.fn(),
    editMode: false,
    setEditMode: jest.fn(),
    selectedItemIds: [],
    toggleItemSelection: jest.fn(),
    clearSelection: jest.fn(),
  };
  const store = () => state;
  store.getState = () => ({ ...state, selectAllItems: jest.fn() });
  return { __esModule: true, default: store };
});

jest.mock('../stores/csfStore', () => ({
  __esModule: true,
  default: () => ({
    undo: mockUndo,
    redo: mockRedo,
    canUndo: () => true,
    canRedo: () => true,
  }),
}));

jest.mock('./useFilters', () => ({
  useFilters: () => ({
    filteredData: [],
    getNextItem: () => null,
    getPrevItem: () => null,
    goToNextPage: jest.fn(),
    goToPrevPage: jest.fn(),
  }),
}));

const press = (init) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
};

beforeEach(() => {
  mockUndo.mockClear();
  mockRedo.mockClear();
});

describe('undo/redo chords survive the shifted-key report', () => {
  it('fires redo for Ctrl + Shift + Z, which arrives as key "Z"', () => {
    renderHook(() => useKeyboardNavigation());
    press({ key: 'Z', shiftKey: true, ctrlKey: true });
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });

  it('fires redo for Cmd + Shift + Z on a Mac', () => {
    renderHook(() => useKeyboardNavigation());
    press({ key: 'Z', shiftKey: true, metaKey: true });
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });

  it('still fires redo for the Ctrl + Y alternative', () => {
    renderHook(() => useKeyboardNavigation());
    press({ key: 'y', ctrlKey: true });
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });

  it('fires undo for Ctrl + Z even when Caps Lock reports "Z"', () => {
    renderHook(() => useKeyboardNavigation());
    press({ key: 'Z', ctrlKey: true });
    expect(mockUndo).toHaveBeenCalledTimes(1);
    expect(mockRedo).not.toHaveBeenCalled();
  });

  it('does not treat a bare Z as undo', () => {
    renderHook(() => useKeyboardNavigation());
    press({ key: 'z' });
    expect(mockUndo).not.toHaveBeenCalled();
    expect(mockRedo).not.toHaveBeenCalled();
  });
});
