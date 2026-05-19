import React from 'react';
import { safeNum } from '../utils/dashboardMetrics';

/**
 * TopGapsPanel — horizontal bar list of the top 5 subcategory gaps to target.
 *
 * Props:
 *   gaps     {Array<{ categoryId, actual, target, gap, color }>}
 *   darkMode {boolean}
 */
const TopGapsPanel = ({ gaps, darkMode }) => {
  if (!Array.isArray(gaps) || gaps.length === 0) return null;

  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const maxTarget = gaps.reduce((m, g) => (g.target > m ? g.target : m), 0) || 1;

  return (
    <div className={`card border p-4 ${cardBg}`} style={{ borderRadius: 0 }}>
      <h2 className={`text-base font-semibold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        Top 5 Gaps to Target
      </h2>
      <div className="flex flex-col gap-2">
        {gaps.map((row) => {
          const actualNum = safeNum(row.actual, 0);
          const targetNum = safeNum(row.target, 0);
          const fillPct = maxTarget > 0 ? (Math.max(0, actualNum) / maxTarget) * 100 : 0;
          const tickPct = maxTarget > 0 ? (Math.max(0, targetNum) / maxTarget) * 100 : 0;
          const fillClass = `terminal-gap-bar-fill terminal-gap-bar-fill--${row.color}`;
          const formatNum = (n) => (typeof n === 'number' ? n.toFixed(1) : n);
          return (
            <div key={row.categoryId} className="flex items-center gap-2">
              <span
                className={`font-mono text-xs ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                style={{ minWidth: 56, display: 'inline-block' }}
              >
                {row.categoryId}
              </span>
              <div className="terminal-gap-bar" style={{ flex: 1 }}>
                <div className={fillClass} style={{ width: `${Math.min(100, fillPct)}%` }} />
                <div className="terminal-gap-bar-target-tick" style={{ left: `${Math.min(100, tickPct)}%` }} />
              </div>
              <span
                className={`font-mono text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                style={{ fontVariantNumeric: 'tabular-nums', minWidth: 70, textAlign: 'right' }}
              >
                {formatNum(actualNum)} / {formatNum(targetNum)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopGapsPanel;
