import React from 'react';
import { Trash2, X } from 'lucide-react';

/**
 * Selection strip for the record list pages. Appears only while rows are
 * selected and carries the one destructive action the pages share.
 *
 * Styling note: this project has no Tailwind build — `index.css` is a
 * hand-maintained utility subset, and `dark:`-prefixed classes are not in it at
 * all (dark mode is expressed as `.dark .foo` descendant rules). Every class
 * used here was checked against that file. The Delete button's hover is done
 * with inline handlers, matching the pattern already in UserControls.js,
 * because `hover:bg-red-700` has no rule to fall back on.
 */
const BulkDeleteBar = ({ count, onDelete, onClear, noun = 'item' }) => {
  if (!count) return null;

  const plural = count === 1 ? noun : `${noun}s`;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b" data-testid="bulk-delete-bar">
      <span className="text-sm font-medium text-gray-700">
        {count} {plural} selected
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#b91c1c'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
        title={`Delete the ${count} selected ${plural}`}
      >
        <Trash2 size={14} />
        Delete {count}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1 rounded"
        title="Clear selection"
      >
        <X size={14} />
        Clear
      </button>
    </div>
  );
};

export default BulkDeleteBar;
