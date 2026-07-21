import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import {
  addendumRowDescriptor,
  getPlatformProcedures,
  getPlatformRecord,
  platformRecordContentHash,
  platformRefSourceUrl
} from '../utils/platformBank';
import { subcategoryFromItemId } from '../utils/procedureBank';
import { availablePlatforms } from '../utils/environmentStep';

/**
 * Post-create management of one observation's platform checks (plan PR-7)
 * — the surface that closes PR-6's one-way door. Pure presentation: every
 * click dispatches ONE operation to the page handler, which routes it
 * through the pure producer (pickerObservationUpdate) — no composition
 * rule lives here.
 *
 * Doctrine inherited from the wizard: offers are unranked (committed-map
 * order), grouped by platform with counts visible, and nothing is trimmed
 * or thresholded — the user is the only exclusion actor.
 *
 * Consent surfaces:
 *  - Adopt shows an in-dialog confirm naming exactly what changes: the
 *    check's rendered text already shows the current upstream version
 *    (rendering always does); adopting records that version as the one
 *    you accepted, replacing the stored fingerprint (old vs new shown,
 *    with the upstream source link). Nothing is adopted implicitly.
 *  - Removing a customized (forked) check shows an in-dialog confirm with
 *    a preview of the text that will be discarded.
 * Unresolved checks offer Remove only: there is no upstream record to
 * adopt, so no re-attach affordance renders.
 */
const CHIP = 'px-1.5 py-0.5 rounded text-xs';
const DRIFT_CHIP = `${CHIP} bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300`;
const UNRESOLVED_CHIP = `${CHIP} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`;

const PlatformCheckPicker = ({ itemId, observation, canAttach, onOperation, onClose }) => {
  const [confirming, setConfirming] = useState(null); // {type:'adopt'|'removeFork', entry}

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const entries = useMemo(
    () => (Array.isArray(observation?.platformProcedures) ? observation.platformProcedures : []),
    [observation]
  );
  const attachedRows = useMemo(() => entries.map(addendumRowDescriptor), [entries]);

  const subcategoryId = subcategoryFromItemId(itemId);
  const offerGroups = useMemo(() => {
    const attachedKeys = new Set(entries.map((e) => `${e.corpusId}:${e.policyId}`));
    return availablePlatforms()
      .map((platform) => {
        const offers = getPlatformProcedures(subcategoryId, [platform.id])
          .filter((offer) => !attachedKeys.has(`${offer.corpusId}:${offer.policyId}`));
        return { platform, offers };
      })
      .filter((group) => group.offers.length > 0);
  }, [subcategoryId, entries]);

  const entryFor = (row) =>
    entries.find((e) => e.corpusId === row.corpusId && e.policyId === row.policyId);

  const dispatch = (operation) => {
    setConfirming(null);
    onOperation(operation);
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" data-testid="platform-check-picker">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Platform checks for ${subcategoryId}`}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Platform checks for {subcategoryId}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-auto p-4 space-y-6 text-sm">
          {confirming?.type === 'adopt' && (() => {
            const entry = confirming.entry;
            const record = getPlatformRecord(entry.corpusId, entry.policyId);
            const newHash = record ? platformRecordContentHash(record) : null;
            const sourceUrl = platformRefSourceUrl(entry);
            return (
              <div className="border border-amber-300 dark:border-amber-700 rounded-lg p-3 space-y-2 bg-amber-50 dark:bg-amber-900/20" data-testid="adopt-confirm">
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  Adopt the upstream update for {entry.policyId}?
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  The text shown and exported for this check already comes from the
                  current upstream version. Adopting replaces the fingerprint recorded
                  when you attached it with the current one, marking this version as
                  the one you accepted.
                </p>
                <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
                  attached version: {entry.contentHash}
                  <br />
                  current version: {newHash}
                </p>
                {sourceUrl && (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs">
                    <ExternalLink size={11} /> Review the upstream source
                  </a>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => dispatch({ op: 'adopt', ref: entry })} className="px-2 py-1 rounded bg-amber-600 text-white text-xs hover:bg-amber-700">
                    Adopt upstream update
                  </button>
                  <button type="button" onClick={() => setConfirming(null)} className="px-2 py-1 rounded border dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300">
                    Cancel
                  </button>
                </div>
              </div>
            );
          })()}

          {confirming?.type === 'removeFork' && (
            <div className="border border-red-300 dark:border-red-700 rounded-lg p-3 space-y-2 bg-red-50 dark:bg-red-900/20" data-testid="remove-fork-confirm">
              <p className="font-medium text-gray-800 dark:text-gray-100">
                Remove this customized check and discard your edits?
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                You edited the text of {confirming.entry.policyId}. Removing it
                deletes your edited text, which starts with:
              </p>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-400 border-l-2 border-red-300 pl-2">
                {String(confirming.entry.text).slice(0, 160)}
                {String(confirming.entry.text).length > 160 ? '…' : ''}
              </p>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => dispatch({ op: 'remove', ref: confirming.entry })} className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700">
                  Remove and discard edits
                </button>
                <button type="button" onClick={() => setConfirming(null)} className="px-2 py-1 rounded border dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Attached ({attachedRows.length})
            </h4>
            {attachedRows.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-xs">No platform checks attached.</p>
            ) : (
              <ul className="space-y-1">
                {attachedRows.map((row) => {
                  const entry = entryFor(row);
                  return (
                    <li key={`${row.corpusId}:${row.policyId}`} className="flex items-center gap-2" data-testid="attached-check-row">
                      <span className="font-mono text-xs">{row.policyId}</span>
                      {row.platformText && <span className="text-xs text-gray-500 dark:text-gray-400">{row.platformText}</span>}
                      {row.drifted && <span className={DRIFT_CHIP}>Updated upstream</span>}
                      {row.unresolved && <span className={UNRESOLVED_CHIP}>Unresolved</span>}
                      {row.fork && <span className="text-xs text-gray-500 dark:text-gray-400">customized</span>}
                      <span className="flex-1" />
                      {row.drifted && (
                        <button type="button" onClick={() => setConfirming({ type: 'adopt', entry })} className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 hover:underline" title="Adopt the upstream update for this check">
                          <RefreshCw size={11} /> Adopt update
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => (row.fork ? setConfirming({ type: 'removeFork', entry }) : dispatch({ op: 'remove', ref: entry }))}
                        className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                        title="Remove this platform check"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Available</h4>
            {!canAttach ? (
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Platform checks extend the community procedure. Use "Insert
                community procedure" first, then add checks here.
              </p>
            ) : offerGroups.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Every available platform check for this subcategory is attached.
              </p>
            ) : (
              offerGroups.map(({ platform, offers }) => (
                <div key={platform.id} className="mb-3" data-testid={`offer-group-${platform.id}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {platform.label} ({offers.length} available)
                    </span>
                    <button type="button" onClick={() => dispatch({ op: 'addAll', offers })} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Attach all {offers.length}
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {offers.map((offer) => (
                      <li key={`${offer.corpusId}:${offer.policyId}`} className="flex items-center gap-2" data-testid="offer-row">
                        <span className="font-mono text-xs">{offer.policyId}</span>
                        <span className="flex-1" />
                        <button type="button" onClick={() => dispatch({ op: 'add', offer })} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline" title="Attach this platform check">
                          <Plus size={11} /> Attach
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default PlatformCheckPicker;
