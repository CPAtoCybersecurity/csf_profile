import React, { useRef, useState } from 'react';
import { Upload, X, FileCheck2 } from 'lucide-react';
import { parseScubaResults, matchScubaResults, RESULT_LABELS } from '../utils/scubaResultsImport';

/**
 * Preview-first importer for ScubaGoggles / ScubaGear results (Evidence
 * lane, R-7). The modal computes a pure plan and shows exactly what will be
 * written before anything is: matched items, unmatched verdicts, skipped
 * entries. Zero store writes happen here — Apply hands the plan to the page,
 * which owns the updateObservation loop. The app never runs the tools; it
 * parses the results artifact they produced.
 */
const ScubaResultsImport = ({ assessmentName, observationsByItem, onApply, onClose }) => {
  const fileRef = useRef(null);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [plan, setPlan] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    const result = parseScubaResults(text);
    if (!result.ok) {
      setError(result.errors.join(' '));
      setParsed(null);
      setPlan(null);
      return;
    }
    setError(null);
    setParsed(result);
    setPlan(matchScubaResults(result.entries, observationsByItem));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileCheck2 size={18} className="text-teal-600" />
            Import SCuBA results{assessmentName ? ` — ${assessmentName}` : ''}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 text-sm">
          <p className="text-gray-600 dark:text-gray-300">
            Run ScubaGoggles or ScubaGear outside this app, then import the
            ScubaResults.json it produced. Verdicts attach as evidence to the
            subcategories carrying those platform checks. Only the policy id
            and verdict are stored; details stay in the tool's own report.
          </p>
          <input type="file" ref={fileRef} accept=".json,application/json" onChange={handleFile} aria-label="ScubaResults.json file" style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg"
          >
            <Upload size={16} /> {fileName ? 'Choose a different file' : 'Choose ScubaResults.json'}
          </button>

          {error && (
            <p className="text-red-700 dark:text-red-400" role="alert">{fileName ? `${fileName}: ` : ''}{error}</p>
          )}

          {parsed && plan && (
            <div className="space-y-3">
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-medium">{fileName}</span> ({parsed.meta.tool}
                {parsed.meta.reportDate ? `, ${parsed.meta.reportDate}` : ''}):{' '}
                {parsed.entries.length} verdicts read, {plan.matchedCount} match
                attached platform checks on {plan.rows.length} scoped item{plan.rows.length === 1 ? '' : 's'}.
              </p>

              {plan.rows.length > 0 && (
                <div className="max-h-56 overflow-y-auto border dark:border-gray-600 rounded">
                  {plan.rows.map((row) => (
                    <div key={row.itemId} className="p-2 border-b last:border-b-0 dark:border-gray-600">
                      <span className="font-medium">{row.itemId}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {' '}— {row.matches.map((m) => `${m.policyId.toUpperCase()} ${RESULT_LABELS[m.result]}`).join(' · ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {plan.unmatchedResults.length > 0 && (
                <p className="text-amber-700 dark:text-amber-400">
                  {plan.unmatchedResults.length} verdict{plan.unmatchedResults.length === 1 ? ' has' : 's have'} no
                  attached platform check in this assessment and will not import
                  (attach checks via the Environment step or the per-item picker first).
                </p>
              )}
              {parsed.skipped.length > 0 && (() => {
                // Undercount honesty: an unrecognized-verdict skip on a valid
                // id means the tool emitted vocabulary this build does not
                // know — surface the split so a partial import cannot pass
                // for a complete one.
                const badVerdicts = parsed.skipped.filter((s) => s.reason === 'unrecognized-result-value').length;
                const badIds = parsed.skipped.length - badVerdicts;
                return (
                  <p className={badVerdicts > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}>
                    {parsed.skipped.length} file entr{parsed.skipped.length === 1 ? 'y' : 'ies'} skipped:{' '}
                    {badIds} unrecognized id{badIds === 1 ? '' : 's'}, {badVerdicts} unrecognized
                    verdict{badVerdicts === 1 ? '' : 's'}{badVerdicts > 0
                      ? '. Unrecognized verdicts on valid policy ids mean this build does not know a value the tool emitted; those results are NOT imported.'
                      : '.'}
                  </p>
                );
              })()}
              {parsed.warnings.map((w) => (
                <p key={w} className="text-amber-700 dark:text-amber-400">{w}</p>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-600">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg border dark:border-gray-600 text-gray-700 dark:text-gray-300">
            Cancel
          </button>
          <button
            type="button"
            disabled={!plan || plan.rows.length === 0}
            onClick={() => onApply(plan.rows, parsed.meta)}
            className="py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply to {plan?.rows.length || 0} item{plan?.rows.length === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScubaResultsImport;
