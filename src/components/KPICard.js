import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPICard — Reusable key performance indicator card component.
 *
 * Props:
 *   title    {string}  — Label shown below the value
 *   value    {string|number} — Primary displayed value (use "--" for no data)
 *   subtitle {string}  — Optional secondary line of text
 *   trend    {object}  — Optional { value: number|string, direction: 'up'|'down'|'neutral' }
 *   darkMode {boolean} — Accepted for API compatibility. Theming now comes from the
 *                        terminal design tokens (.terminal-kpi*) which self-theme via
 *                        CSS custom properties under the .dark root, so it is not read here.
 */
const KPICard = ({ title, value, subtitle, trend }) => {
  const renderTrend = () => {
    if (!trend) return null;

    const { value: delta, direction } = trend;
    const isUp = direction === 'up';
    const isDown = direction === 'down';

    const colorClass = isUp
      ? 'text-green-500'
      : isDown
      ? 'text-red-500'
      : 'text-gray-400';

    const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

    return (
      <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${colorClass}`}>
        <Icon size={12} />
        <span>{delta} vs prev quarter</span>
      </div>
    );
  };

  return (
    <div className="terminal-kpi p-4">
      <div className="terminal-kpi-label text-xs uppercase tracking-wider mb-1">
        <span className="terminal-kpi-marker">▌</span> {title}
      </div>
      <div className="terminal-kpi-value text-3xl tracking-tight">
        {value}
      </div>
      {subtitle && (
        <div className="terminal-kpi-sub text-xs mt-1">{subtitle}</div>
      )}
      {renderTrend()}
    </div>
  );
};

export default KPICard;
