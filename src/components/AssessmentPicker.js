import React from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';

/**
 * AssessmentPicker
 *
 * The selection step in front of every export that would otherwise take the
 * whole store. Opens with everything selected, so confirming without touching
 * anything reproduces the historical export-everything behaviour exactly.
 *
 * Shell is modelled on ExportPasswordDialog: createPortal + inline styles for
 * the overlay geometry. index.css is a hand-written utility subset, not a
 * Tailwind build, so anything load-bearing for layout is an inline style and
 * class names are limited to the vocabulary that file actually defines.
 *
 * @param {boolean} isOpen
 * @param {string} [title]
 * @param {string} [description]
 * @param {Array} assessments - [{ id, name, scopeIds }]
 * @param {Function} onCancel
 * @param {Function} onConfirm - called with the selected id array
 * @param {string} [confirmLabel]
 */
const AssessmentPicker = ({
  isOpen,
  title = 'Choose assessments to export',
  description,
  assessments = [],
  onCancel,
  onConfirm,
  confirmLabel = 'Export'
}) => {
  const [selectedIds, setSelectedIds] = React.useState([]);

  // Reopening always resets to "everything selected" — a picker that
  // remembered a narrow prior selection is how someone ships a one-assessment
  // file believing it is their backup.
  React.useEffect(() => {
    if (!isOpen) return;
    setSelectedIds(assessments.map((a) => a.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const total = assessments.length;
  const selectedCount = selectedIds.length;
  const noneSelected = selectedCount === 0;
  const isSubset = selectedCount > 0 && selectedCount < total;

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noneSelected) return;
    // A full selection reports null, not the id list: downstream that means
    // "no narrowing", which keeps the default export byte-identical.
    onConfirm?.(selectedCount === total ? null : selectedIds);
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full"
        data-testid="assessment-picker"
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 flex items-start gap-2">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Download className="text-blue-600 dark:text-blue-300" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            {description ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>
            ) : null}
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-3">
            {/* Bulk controls + live count */}
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
                data-testid="assessment-picker-count"
              >
                {selectedCount} of {total} selected
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds(assessments.map((a) => a.id))}
                  className="text-sm text-blue-600 dark:text-blue-300 hover:text-blue-500"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-sm text-blue-600 dark:text-blue-300 hover:text-blue-500"
                >
                  Clear
                </button>
              </span>
            </div>

            {/* Pick list */}
            <div
              className="overflow-y-auto max-h-72 border border-gray-200 dark:border-gray-700 rounded-lg"
              style={{ overflowY: 'auto', maxHeight: '18rem' }}
            >
              {total === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300 p-3">
                  No assessments to export yet.
                </p>
              ) : (
                assessments.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-start gap-2 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    style={{ cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(a.id)}
                      onChange={() => toggle(a.id)}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {a.name}
                      </span>
                      <span className="block text-xs text-gray-600 dark:text-gray-400">
                        {(a.scopeIds || []).length} scoped item
                        {(a.scopeIds || []).length === 1 ? '' : 's'}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>

            {isSubset ? (
              <p
                className="text-xs text-gray-600 dark:text-gray-400 mt-2"
                data-testid="assessment-picker-subset-note"
              >
                Partial export: findings and evidence artifacts belonging to the
                assessments you left out are excluded, and the filename is marked
                <span className="font-medium"> _subset</span> so it is not mistaken
                for a full backup. Records that belong to no assessment at all,
                and org-level data (systems, metrics, the control catalogue),
                still ride along.
              </p>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 p-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={noneSelected}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              style={noneSelected ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AssessmentPicker;
