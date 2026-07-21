import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { addendumRowDescriptor } from '../utils/platformBank';

/**
 * Read-mode provenance chrome for an observation's platform addenda —
 * one summary line plus one row per entry (plan PR-7). Pure presentation
 * over addendumRowDescriptor(): the rows, the summary counts, and the
 * picker's attached list all read the same derivation, so they cannot
 * disagree. Renders from the per-observation entries alone — never from
 * the assessment-level platforms array, whose emptiness is ambiguous by
 * contract.
 *
 * Badge states are the production-drivable set only: "Updated upstream"
 * (attach-time fingerprint differs from the current corpus — the rendered
 * text below already shows the current version; the badge is the consent
 * surface, resolved by the picker's adopt action) and "Unresolved" (no
 * current corpus record — the expanded placeholder carries the identity).
 * Rows are collapsed behind the summary by default: attractor
 * subcategories legitimately carry 100+ addenda and the chrome must not
 * bury the procedure text.
 */
const CHIP = 'px-1.5 py-0.5 rounded text-xs';
const DRIFT_CHIP = `${CHIP} bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300`;
const UNRESOLVED_CHIP = `${CHIP} bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`;

const PlatformAddendumBadges = ({ entries }) => {
  const [open, setOpen] = useState(false);
  const list = Array.isArray(entries) ? entries : [];
  if (list.length === 0) return null;
  const rows = list.map(addendumRowDescriptor);
  const driftedCount = rows.filter((r) => r.drifted).length;
  const unresolvedCount = rows.filter((r) => r.unresolved).length;

  return (
    <div className="mb-2 text-xs" data-testid="platform-addendum-badges">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:underline"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span>{list.length === 1 ? '1 platform check' : `${list.length} platform checks`}</span>
        {driftedCount > 0 && (
          <span className={DRIFT_CHIP}>{driftedCount} updated upstream</span>
        )}
        {unresolvedCount > 0 && (
          <span className={UNRESOLVED_CHIP}>{unresolvedCount} unresolved</span>
        )}
      </button>
      {open && (
        <ul className="mt-1 ml-5 space-y-1">
          {rows.map((row) => (
            <li
              key={`${row.corpusId}:${row.policyId}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
              data-testid="platform-addendum-row"
            >
              <span className="font-mono">{row.policyId}</span>
              {row.platformText && <span>{row.platformText}</span>}
              {row.drifted && <span className={DRIFT_CHIP}>Updated upstream</span>}
              {row.unresolved && <span className={UNRESOLVED_CHIP}>Unresolved</span>}
              {row.sourceUrl && (
                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                  title="View the upstream source of this platform check"
                >
                  <ExternalLink size={11} /> Source
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlatformAddendumBadges;
