import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ title, value, subtitle, trend, darkMode, accent }) => {
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
    <div
      className="kpi-card"
      style={accent ? { '--kpi-accent': accent } : undefined}
    >
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{title}</div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      {renderTrend()}
    </div>
  );
};

export default KPICard;
