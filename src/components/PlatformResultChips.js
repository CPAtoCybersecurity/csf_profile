import React from 'react';
import { RESULT_LABELS } from '../utils/scubaResultsImport';

/**
 * Imported SCuBA verdicts for one observation, as compact chips beside the
 * platform addendum badges (Evidence lane, R-7). Display only: verdicts
 * inform the auditor's score and never write one. Entries are already
 * producer-normalized; this renders them verbatim-by-field.
 */
const RESULT_STYLES = {
  pass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  fail: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
};
const DEFAULT_STYLE = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

const PlatformResultChips = ({ entries }) => {
  const list = Array.isArray(entries) ? entries : [];
  if (list.length === 0) return null;
  const stamp = list[0].reportDate || list[0].importedAt;
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          SCuBA results{stamp ? ` (${stamp})` : ''}:
        </span>
        {list.map((entry) => (
          <span
            key={entry.policyId}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${RESULT_STYLES[entry.result] || DEFAULT_STYLE}`}
            title={`Imported ${entry.importedAt || 'date unknown'}${entry.toolVersion ? ` · tool ${entry.toolVersion}` : ''}`}
          >
            {entry.policyId.toUpperCase()}
            <span className="font-sans font-medium">{RESULT_LABELS[entry.result] || entry.result}</span>
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Tool verdicts are evidence for your judgment; they do not set the score.
      </p>
    </div>
  );
};

export default PlatformResultChips;
