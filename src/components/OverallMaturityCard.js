import React from 'react';
import { safeNum } from '../utils/dashboardMetrics';

/**
 * OverallMaturityCard — Card 1 of the issue #212 top strip.
 *
 * Props:
 *   data     {object} — { value, target, trend: { direction, delta, prevQuarter } | null, subtitle }
 *   darkMode {boolean}
 */
const OverallMaturityCard = ({ data, darkMode }) => {
  const valueNum = safeNum(data && data.value);
  const targetNum = safeNum(data && data.target);
  const subtitle = (data && data.subtitle) || 'Average actual score';
  const trend = data && data.trend;

  const titleColor = darkMode ? 'text-gray-400' : 'text-gray-500';

  let trendNode = null;
  if (trend) {
    let arrow = '–';
    let trendClass = 'terminal-card-rich-trend-neutral';
    if (trend.direction === 'up') {
      arrow = '▲';
      trendClass = 'terminal-card-rich-trend-up';
    } else if (trend.direction === 'down') {
      arrow = '▼';
      trendClass = 'terminal-card-rich-trend-down';
    }
    trendNode = (
      <div className={`terminal-card-rich-subtitle ${trendClass}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {arrow} {trend.delta} vs {trend.prevQuarter}
      </div>
    );
  }

  const formatValue = (n) => (typeof n === 'number' ? n.toFixed(1) : n);

  return (
    <div className="terminal-card-rich">
      <div className={`terminal-kpi-label text-xs uppercase tracking-wider ${titleColor}`}>
        <span className="terminal-kpi-marker">▌</span> OVERALL MATURITY
      </div>
      <div>
        <span className="terminal-card-rich-value">{formatValue(valueNum)}</span>
        {typeof targetNum === 'number' && (
          <span className="terminal-card-rich-secondary"> / {formatValue(targetNum)}</span>
        )}
      </div>
      {subtitle && <div className="terminal-card-rich-subtitle">{subtitle}</div>}
      {trendNode}
    </div>
  );
};

export default OverallMaturityCard;
