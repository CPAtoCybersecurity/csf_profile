import React from 'react';
import { safeNum } from '../utils/dashboardMetrics';

/**
 * WeakestFunctionCard — Card 3 of the issue #212 top strip.
 *
 * Props:
 *   data     {object | null} — { functionCode, actual, target, delta, tieBreaker: { otherFunction, actual } | null }
 *   darkMode {boolean}
 */
const WeakestFunctionCard = ({ data, darkMode }) => {
  const titleColor = darkMode ? 'text-gray-400' : 'text-gray-500';

  if (!data) {
    return (
      <div className="terminal-card-rich">
        <div className={`terminal-kpi-label text-xs uppercase tracking-wider ${titleColor}`}>
          <span className="terminal-kpi-marker">▌</span> WEAKEST FUNCTION
        </div>
        <div>
          <span className="terminal-card-rich-value">--</span>
        </div>
        <div className="terminal-card-rich-subtitle">No gap detected this quarter.</div>
      </div>
    );
  }

  const actualNum = safeNum(data.actual);
  const deltaNum = safeNum(data.delta);
  const formatDelta = (n) => {
    if (typeof n !== 'number') return n;
    return n > 0 ? `+${n.toFixed(1)}` : n.toFixed(1);
  };
  const formatActual = (n) => (typeof n === 'number' ? n.toFixed(1) : n);

  return (
    <div className="terminal-card-rich">
      <div className={`terminal-kpi-label text-xs uppercase tracking-wider ${titleColor}`}>
        <span className="terminal-kpi-marker">▌</span> WEAKEST FUNCTION
      </div>
      <div>
        <span className="terminal-card-rich-value" style={{ fontSize: 22 }}>{data.functionCode}</span>
      </div>
      <div className="terminal-card-rich-subtitle">
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatActual(actualNum)}</span> actual ·{' '}
        <span className="terminal-card-rich-trend-down" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatDelta(deltaNum)}
        </span>{' '}
        from target
      </div>
      {data.tieBreaker && (
        <div className="terminal-card-rich-subtitle">
          ▼ {data.tieBreaker.otherFunction} also at{' '}
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatActual(safeNum(data.tieBreaker.actual))}
          </span>
        </div>
      )}
    </div>
  );
};

export default WeakestFunctionCard;
