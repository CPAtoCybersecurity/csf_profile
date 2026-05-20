import React from 'react';
import { safeNum } from '../utils/dashboardMetrics';

/**
 * RiskExposureCard — Card 2 of the issue #212 top strip.
 *
 * Props:
 *   data     {object} — { value, critCount, highCount, medLowCount, oldestOpenDays, slaBreached, isEmpty }
 *   darkMode {boolean}
 */
const RiskExposureCard = ({ data, darkMode }) => {
  const isEmpty = !data || data.isEmpty;
  const value = safeNum(data && data.value, 0);
  const titleColor = darkMode ? 'text-gray-400' : 'text-gray-500';

  const valueDisplay = isEmpty ? '--' : value;

  let slaLine = null;
  if (!isEmpty && data && data.oldestOpenDays !== null && data.oldestOpenDays !== undefined) {
    slaLine = (
      <div className="terminal-card-rich-subtitle">
        Oldest open: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{data.oldestOpenDays}</span> days
        {data.slaBreached && (
          <span className="terminal-card-rich-trend-down"> · SLA breach</span>
        )}
      </div>
    );
  }

  const critCount = data ? data.critCount || 0 : 0;
  const highCount = data ? data.highCount || 0 : 0;
  const medLowCount = data ? data.medLowCount || 0 : 0;

  return (
    <div className="terminal-card-rich">
      <div className={`terminal-kpi-label text-xs uppercase tracking-wider ${titleColor}`}>
        <span className="terminal-kpi-marker">▌</span> RISK EXPOSURE
      </div>
      <div>
        <span className="terminal-card-rich-value">{valueDisplay}</span>
        <span className="terminal-card-rich-secondary">critical</span>
      </div>
      {slaLine}
      {!isEmpty && (
        <div className="flex flex-wrap items-center gap-1" style={{ marginTop: 2 }}>
          <span className="terminal-status-pill terminal-status-pill--stalled" title="Critical findings (open)">
            {critCount} CRIT
          </span>
          <span className="terminal-status-pill terminal-status-pill--in-progress" title="High findings (open)">
            {highCount} HIGH
          </span>
          <span className="terminal-status-pill terminal-status-pill--not-started" title="Medium and Low findings (open)">
            {medLowCount} MED/LOW
          </span>
        </div>
      )}
    </div>
  );
};

export default RiskExposureCard;
