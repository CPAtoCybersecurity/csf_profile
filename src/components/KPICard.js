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
 *   darkMode {boolean} — Passed from parent for theming
 */
const KPICard = ({ title, value, subtitle, trend, darkMode }) => {
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

  const cardBg = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const titleColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const valueColor = darkMode ? 'text-white' : 'text-gray-900';
  const subtitleColor = darkMode ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`rounded-lg border shadow-sm p-4 ${cardBg}`}>
      <div className={`text-3xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </div>
      <div className={`text-sm font-medium mt-1 ${titleColor}`}>{title}</div>
      {subtitle && (
        <div className={`text-xs mt-0.5 ${subtitleColor}`}>{subtitle}</div>
      )}
      {renderTrend()}
    </div>
  );
};

export default KPICard;
