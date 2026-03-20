import React, { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';

// Map ID prefix to function display label
const FUNCTION_MAP = {
  GV: 'GOVERN (GV)',
  ID: 'IDENTIFY (ID)',
  PR: 'PROTECT (PR)',
  DE: 'DETECT (DE)',
  RS: 'RESPOND (RS)',
  RC: 'RECOVER (RC)',
};

const FUNCTION_ORDER = ['GV', 'ID', 'PR', 'DE', 'RS', 'RC'];

/**
 * EvidenceTracker - Shows audit readiness by counting how many in-scope
 * items have at least one linked artifact in their observation.
 *
 * Props:
 *   assessment  — the selected assessment object (from assessmentsStore)
 *   artifacts   — artifact array from artifactStore (unused for calculations
 *                 but kept for future drill-down features)
 */
const EvidenceTracker = ({ assessment, artifacts }) => {
  const scopeIds = assessment?.scopeIds || [];
  const observations = assessment?.observations || {};

  // Overall coverage calculation
  const { withEvidence, total, percentage } = useMemo(() => {
    const total = scopeIds.length;
    const withEvidence = scopeIds.filter((id) => {
      const obs = observations[id];
      return obs?.linkedArtifacts?.length > 0;
    }).length;
    const percentage =
      total > 0 ? Math.round((withEvidence / total) * 100) : 0;
    return { withEvidence, total, percentage };
  }, [scopeIds, observations]);

  // Per-function breakdown
  const functionBreakdown = useMemo(() => {
    // Group scopeIds by 2-char prefix
    const groups = {};
    scopeIds.forEach((id) => {
      const prefix = id.substring(0, 2).toUpperCase();
      if (!groups[prefix]) groups[prefix] = { total: 0, withEvidence: 0 };
      groups[prefix].total += 1;
      const obs = observations[id];
      if (obs?.linkedArtifacts?.length > 0) {
        groups[prefix].withEvidence += 1;
      }
    });

    // Return in defined order, skipping prefixes with no items
    return FUNCTION_ORDER.filter((prefix) => groups[prefix]).map((prefix) => {
      const { total, withEvidence } = groups[prefix];
      const pct = total > 0 ? Math.round((withEvidence / total) * 100) : 0;
      return {
        prefix,
        label: FUNCTION_MAP[prefix] || prefix,
        total,
        withEvidence,
        pct,
      };
    });
  }, [scopeIds, observations]);

  // Color utility based on percentage
  const barColor = (pct) => {
    if (pct > 80) return 'bg-green-500';
    if (pct > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const textColor = (pct) => {
    if (pct > 80) return 'text-green-600 dark:text-green-400';
    if (pct > 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!assessment) {
    return (
      <div className="card p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No assessment selected.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={18} className="text-blue-500 dark:text-blue-400" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Evidence Completeness
        </h2>
        <span
          className={`ml-auto text-2xl font-bold ${textColor(percentage)}`}
        >
          {percentage}%
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${barColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
        {withEvidence} of {total} in-scope items with evidence documented
      </p>

      {/* Per-function breakdown */}
      {functionBreakdown.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            By Function
          </h3>
          {functionBreakdown.map(({ prefix, label, total, withEvidence, pct }) => (
            <div key={prefix}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </span>
                <span className={`text-xs font-semibold ${textColor(pct)}`}>
                  {withEvidence}/{total} ({pct}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${barColor(pct)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceTracker;
