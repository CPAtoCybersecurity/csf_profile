/**
 * useRowSelection — the shared selection primitive behind the select-all and
 * bulk-delete controls on Artifacts, Findings and Controls.
 *
 * The interesting behaviour is not "a set holds ids" — it is that the selection
 * is READ through the rows currently on screen. These pages re-scope constantly
 * (assessment filter, search, pagination), and the failure this hook exists to
 * prevent is a delete that reaches a record the user can no longer see.
 */
import { renderHook, act } from '@testing-library/react';
import useRowSelection from './useRowSelection';

const rows = (...ids) => ids.map(id => ({ id }));

describe('the exposed surface', () => {
  it('returns the full selection API', () => {
    const { result } = renderHook(() => useRowSelection(rows('a', 'b')));
    expect(Object.keys(result.current).sort()).toEqual([
      'allSelected',
      'clear',
      'isSelected',
      'selectedCount',
      'selectedIds',
      'someSelected',
      'toggle',
      'toggleAll'
    ]);
  });
});

describe('toggling one row at a time', () => {
  it('selects, reports, and deselects', () => {
    const { result } = renderHook(() => useRowSelection(rows('a', 'b')));

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('a')).toBe(false);

    act(() => result.current.toggle('a'));
    expect(result.current.isSelected('a')).toBe(true);
    expect(result.current.selectedIds).toEqual(['a']);
    expect(result.current.someSelected).toBe(true);
    expect(result.current.allSelected).toBe(false);

    act(() => result.current.toggle('a'));
    expect(result.current.selectedCount).toBe(0);
  });
});

describe('select all', () => {
  it('selects every visible row, then clears them on a second toggle', () => {
    const { result } = renderHook(() => useRowSelection(rows('a', 'b', 'c')));

    act(() => result.current.toggleAll());
    expect(result.current.selectedIds).toEqual(['a', 'b', 'c']);
    expect(result.current.allSelected).toBe(true);
    // "all" and "some" are mutually exclusive — the bar and the header
    // checkbox read different ones and must never both light up.
    expect(result.current.someSelected).toBe(false);

    act(() => result.current.toggleAll());
    expect(result.current.selectedCount).toBe(0);
  });

  it('is never "all selected" on an empty list', () => {
    const { result } = renderHook(() => useRowSelection([]));
    expect(result.current.allSelected).toBe(false);

    act(() => result.current.toggleAll());
    expect(result.current.selectedCount).toBe(0);
  });

  it('promotes a partial selection to all rather than clearing it', () => {
    const { result } = renderHook(() => useRowSelection(rows('a', 'b', 'c')));
    act(() => result.current.toggle('b'));
    act(() => result.current.toggleAll());
    expect(result.current.selectedIds).toEqual(['a', 'b', 'c']);
  });
});

describe('rows leaving the view', () => {
  it('drops ids that are no longer rendered', () => {
    // This is the guard the delete loop depends on: after a scope change the
    // count in the toolbar and the ids the loop walks must both describe only
    // what is on screen.
    const { result, rerender } = renderHook(
      ({ visible }) => useRowSelection(visible),
      { initialProps: { visible: rows('a', 'b', 'c') } }
    );

    act(() => result.current.toggleAll());
    expect(result.current.selectedCount).toBe(3);

    rerender({ visible: rows('a') });
    expect(result.current.selectedIds).toEqual(['a']);
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.allSelected).toBe(true);
  });

  it('restores a selection when the row comes back into view', () => {
    const { result, rerender } = renderHook(
      ({ visible }) => useRowSelection(visible),
      { initialProps: { visible: rows('a', 'b') } }
    );

    act(() => result.current.toggle('b'));
    rerender({ visible: rows('a') });
    expect(result.current.selectedIds).toEqual([]);

    rerender({ visible: rows('a', 'b') });
    expect(result.current.selectedIds).toEqual(['b']);
  });

  it('orders selectedIds by render order, not click order', () => {
    const { result } = renderHook(() => useRowSelection(rows('a', 'b', 'c')));
    act(() => result.current.toggle('c'));
    act(() => result.current.toggle('a'));
    expect(result.current.selectedIds).toEqual(['a', 'c']);
  });
});

describe('a custom id accessor', () => {
  it('keys on the field the caller names', () => {
    const controls = [{ controlId: 'CTRL-1' }, { controlId: 'CTRL-2' }];
    const { result } = renderHook(
      () => useRowSelection(controls, (c) => c.controlId)
    );
    act(() => result.current.toggleAll());
    expect(result.current.selectedIds).toEqual(['CTRL-1', 'CTRL-2']);
  });
});

describe('clear', () => {
  it('empties the selection', () => {
    const { result } = renderHook(() => useRowSelection(rows('a', 'b')));
    act(() => result.current.toggleAll());
    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.allSelected).toBe(false);
  });
});
