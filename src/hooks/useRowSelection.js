import { useCallback, useMemo, useState } from 'react';

/**
 * Row selection for the record list pages (Artifacts, Findings, Controls).
 *
 * The selection is stored as raw ids but READ through an intersection with the
 * ids currently on screen. That indirection is the whole point: these pages
 * re-scope constantly (assessment filter, search, pagination), and a selection
 * held as plain state would keep ids for rows the user can no longer see — so
 * "Delete 3 selected" would delete a record that scrolled out of the filter.
 * Intersecting on read means the count in the toolbar and the set the delete
 * loop walks are always the same rows the checkboxes are drawn on.
 *
 * @param {Array} rows      the rows currently rendered, in render order
 * @param {Function} getId  row -> stable id (defaults to `row.id`)
 */
const useRowSelection = (rows, getId = (row) => row.id) => {
  const [rawSelected, setRawSelected] = useState(() => new Set());

  const visibleIds = useMemo(() => (rows || []).map(getId), [rows, getId]);

  // The effective selection: stored ids that are still on screen, ordered the
  // way the rows are ordered so the delete loop is deterministic.
  const selectedIds = useMemo(
    () => visibleIds.filter(id => rawSelected.has(id)),
    [visibleIds, rawSelected]
  );

  const selectedCount = selectedIds.length;

  const isSelected = useCallback(
    (id) => rawSelected.has(id),
    [rawSelected]
  );

  const toggle = useCallback((id) => {
    setRawSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => setRawSelected(new Set()), []);

  // An empty list is never "all selected" — otherwise the header checkbox
  // renders checked on a page with nothing on it.
  const allSelected = visibleIds.length > 0 && selectedCount === visibleIds.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const toggleAll = useCallback(() => {
    setRawSelected((prev) => {
      const everyVisibleSelected =
        visibleIds.length > 0 && visibleIds.every(id => prev.has(id));
      if (everyVisibleSelected) {
        // Deselect only what is on screen; ids held for off-screen rows are
        // already invisible to every consumer, but dropping them here keeps
        // the stored set from growing without bound across filter changes.
        const next = new Set(prev);
        visibleIds.forEach(id => next.delete(id));
        return next;
      }
      return new Set([...prev, ...visibleIds]);
    });
  }, [visibleIds]);

  return {
    selectedIds,
    selectedCount,
    isSelected,
    toggle,
    toggleAll,
    clear,
    allSelected,
    someSelected
  };
};

export default useRowSelection;
