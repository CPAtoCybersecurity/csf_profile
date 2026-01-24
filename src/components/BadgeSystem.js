import React from 'react';

/**
 * Unified Badge System Component
 * Provides consistent color coding across the application
 *
 * Badge Types and Colors:
 * - Framework: Blue (#dbeafe / #2563eb)
 * - CSF Function: Matches function (DETECT=red, PROTECT=green, etc.)
 * - Subcategory: Amber/Orange (#ffedd5 / #f59e0b)
 * - Artifact: Green (#dcfce7 / #16a34a)
 * - Finding: Red/Orange (#fee2e2 / #ef4444)
 * - Status: Varies by status type
 * - User: Purple (#f3e8ff / #9333ea)
 */

// Color definitions for consistency
export const BADGE_COLORS = {
  // CSF Functions
  function: {
    GOVERN: { bg: '#E8DEF8', text: '#6B21A8', darkBg: '#581c87', darkText: '#e9d5ff' },
    IDENTIFY: { bg: '#DBEAFE', text: '#1E40AF', darkBg: '#1e3a8a', darkText: '#bfdbfe' },
    PROTECT: { bg: '#DCFCE7', text: '#166534', darkBg: '#14532d', darkText: '#bbf7d0' },
    DETECT: { bg: '#FEE2E2', text: '#991B1B', darkBg: '#7f1d1d', darkText: '#fecaca' },
    RESPOND: { bg: '#FFEDD5', text: '#C2410C', darkBg: '#7c2d12', darkText: '#fed7aa' },
    RECOVER: { bg: '#FEF3C7', text: '#B45309', darkBg: '#78350f', darkText: '#fde68a' },
  },
  // Entity types
  framework: { bg: '#dbeafe', text: '#1e40af', darkBg: '#1e3a8a', darkText: '#bfdbfe' },
  subcategory: { bg: '#ffedd5', text: '#c2410c', darkBg: '#7c2d12', darkText: '#fed7aa' },
  artifact: { bg: '#dcfce7', text: '#166534', darkBg: '#14532d', darkText: '#bbf7d0' },
  finding: { bg: '#fee2e2', text: '#991b1b', darkBg: '#7f1d1d', darkText: '#fecaca' },
  control: { bg: '#e0e7ff', text: '#3730a3', darkBg: '#312e81', darkText: '#c7d2fe' },
  user: { bg: '#f3e8ff', text: '#6b21a8', darkBg: '#581c87', darkText: '#e9d5ff' },
  // Status types
  status: {
    active: { bg: '#dcfce7', text: '#166534', darkBg: '#14532d', darkText: '#bbf7d0' },
    inactive: { bg: '#f3f4f6', text: '#6b7280', darkBg: '#374151', darkText: '#9ca3af' },
    gap: { bg: '#fee2e2', text: '#991b1b', darkBg: '#7f1d1d', darkText: '#fecaca' },
    inProgress: { bg: '#dbeafe', text: '#1e40af', darkBg: '#1e3a8a', darkText: '#bfdbfe' },
    pending: { bg: '#fef3c7', text: '#b45309', darkBg: '#78350f', darkText: '#fde68a' },
    completed: { bg: '#dcfce7', text: '#166534', darkBg: '#14532d', darkText: '#bbf7d0' },
  },
  // Priority types
  priority: {
    critical: { bg: '#fee2e2', text: '#991b1b', darkBg: '#7f1d1d', darkText: '#fecaca' },
    high: { bg: '#ffedd5', text: '#c2410c', darkBg: '#7c2d12', darkText: '#fed7aa' },
    medium: { bg: '#fef3c7', text: '#b45309', darkBg: '#78350f', darkText: '#fde68a' },
    low: { bg: '#dcfce7', text: '#166534', darkBg: '#14532d', darkText: '#bbf7d0' },
  },
};

// Size configurations
const SIZE_CLASSES = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * Base Badge Component
 */
export const Badge = ({
  children,
  colorScheme = 'framework',
  size = 'sm',
  variant = 'default',
  className = '',
  onClick,
  title,
  mono = false,
}) => {
  // Determine colors based on colorScheme
  let colors;
  if (typeof colorScheme === 'object') {
    colors = colorScheme;
  } else if (BADGE_COLORS[colorScheme]) {
    colors = BADGE_COLORS[colorScheme];
  } else {
    colors = BADGE_COLORS.framework;
  }

  const isDarkMode = document.documentElement.classList.contains('dark');
  const bgColor = isDarkMode ? colors.darkBg : colors.bg;
  const textColor = isDarkMode ? colors.darkText : colors.text;

  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium
        ${SIZE_CLASSES[size]}
        ${mono ? 'font-mono' : ''}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      onClick={onClick}
      title={title}
    >
      {children}
    </span>
  );
};

/**
 * Status Badge with dot indicator
 */
export const StatusBadge = ({ status, size = 'sm', showDot = true }) => {
  const statusKey = status?.toLowerCase().replace(/\s+/g, '') || 'inactive';
  const colors = BADGE_COLORS.status[statusKey] || BADGE_COLORS.status.inactive;

  const dotColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    gap: 'bg-red-500',
    inProgress: 'bg-blue-500',
    pending: 'bg-amber-500',
    completed: 'bg-green-500',
  };

  return (
    <Badge colorScheme={colors} size={size}>
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[statusKey] || 'bg-gray-400'}`}
        />
      )}
      {status}
    </Badge>
  );
};

/**
 * Priority Badge
 */
export const PriorityBadge = ({ priority, size = 'sm' }) => {
  const priorityKey = priority?.toLowerCase() || 'medium';
  const colors = BADGE_COLORS.priority[priorityKey] || BADGE_COLORS.priority.medium;

  return (
    <Badge colorScheme={colors} size={size}>
      {priority}
    </Badge>
  );
};

/**
 * Artifact Badge - Green themed
 */
export const ArtifactBadge = ({ name, artifactId, size = 'sm', onClick, maxWidth = '150px' }) => {
  return (
    <Badge
      colorScheme={BADGE_COLORS.artifact}
      size={size}
      onClick={onClick}
      title={name}
      className="truncate"
      style={{ maxWidth }}
    >
      {artifactId || name}
    </Badge>
  );
};

/**
 * Finding Badge - Red/Orange themed
 */
export const FindingBadge = ({ id, summary, size = 'sm', onClick }) => {
  return (
    <Badge
      colorScheme={BADGE_COLORS.finding}
      size={size}
      onClick={onClick}
      title={summary}
    >
      {id}
    </Badge>
  );
};

/**
 * Control Badge - Indigo themed
 */
export const ControlBadge = ({ controlId, title, size = 'sm', onClick }) => {
  return (
    <Badge
      colorScheme={BADGE_COLORS.control}
      size={size}
      onClick={onClick}
      title={title}
    >
      {controlId}
    </Badge>
  );
};

/**
 * User Badge - Purple themed with avatar option
 */
export const UserBadge = ({ name, showAvatar = false, size = 'sm' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  if (showAvatar) {
    return (
      <div className="inline-flex items-center gap-1.5" title={name}>
        <span
          className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-medium flex-shrink-0"
        >
          {getInitials(name)}
        </span>
        <span className="text-sm text-gray-700 dark:text-gray-200">{name}</span>
      </div>
    );
  }

  return (
    <Badge colorScheme={BADGE_COLORS.user} size={size} title={name}>
      {name}
    </Badge>
  );
};

/**
 * Count Badge - Small circular count indicator
 */
export const CountBadge = ({ count, max = 99, colorScheme = 'framework', size = 'xs' }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge colorScheme={colorScheme} size={size} className="rounded-full min-w-[1.25rem] justify-center">
      {displayCount}
    </Badge>
  );
};

/**
 * Removable Filter Chip
 */
export const FilterChip = ({ label, value, onRemove, colorScheme = 'framework' }) => {
  return (
    <Badge colorScheme={colorScheme} size="sm" className="gap-1">
      <span className="text-[10px] opacity-70">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </Badge>
  );
};

/**
 * Badge Group - For displaying multiple badges with overflow handling
 */
export const BadgeGroup = ({
  badges,
  maxVisible = 2,
  renderBadge,
  colorScheme = 'framework',
  size = 'sm'
}) => {
  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = badges.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visibleBadges.map((badge, idx) => (
        <React.Fragment key={idx}>
          {renderBadge ? renderBadge(badge, idx) : (
            <Badge colorScheme={colorScheme} size={size}>{badge}</Badge>
          )}
        </React.Fragment>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500">+{remainingCount}</span>
      )}
    </div>
  );
};

export default Badge;
