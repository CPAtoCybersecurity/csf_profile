import React from 'react';

/**
 * InvestmentPriorityCommentEditor — analyst-comment textarea row used inside
 * the InvestmentPrioritiesPanel expand-toggle. Split out so the parent panel
 * stays under the 250-line component cap (issue #212).
 *
 * Props:
 *   categoryId       {string}
 *   findingId        {string} — the linked finding whose `description` we edit
 *   value            {string} — current draft text
 *   onChange         {(v: string) => void}
 *   onCancel         {() => void}
 *   onSave           {() => void}
 *   subtitleColor    {string} — Tailwind-ish class for the muted label
 *   darkMode         {boolean}
 */
const InvestmentPriorityCommentEditor = ({
  categoryId,
  findingId,
  value,
  onChange,
  onCancel,
  onSave,
  subtitleColor,
  darkMode,
}) => {
  const textareaClass = darkMode
    ? 'bg-gray-800 border-gray-600 text-gray-200'
    : 'bg-white border-gray-300 text-gray-800';
  const cancelClass = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <td colSpan={8} className="px-2 py-3">
      <label className={`block text-xs mb-1 ${subtitleColor}`} htmlFor={`comment-${categoryId}`}>
        Analyst comment (linked finding {findingId})
      </label>
      <textarea
        id={`comment-${categoryId}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={`w-full text-sm p-2 font-mono border ${textareaClass}`}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button type="button" onClick={onCancel} className={`text-xs px-2 py-1 ${cancelClass}`}>
          Cancel
        </button>
        <button type="button" onClick={onSave} className="btn-terminal">
          Save
        </button>
      </div>
    </td>
  );
};

export default InvestmentPriorityCommentEditor;
