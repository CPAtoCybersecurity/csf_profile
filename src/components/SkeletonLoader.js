import React from 'react';

/**
 * Skeleton Loader Components
 * Provides loading state placeholders with shimmer animation
 */

/**
 * Base Skeleton element with shimmer animation
 */
export const Skeleton = ({ className = '', width, height, rounded = 'md' }) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Text line skeleton
 */
export const SkeletonText = ({ lines = 1, width = '100%', className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === lines - 1 && lines > 1 ? '70%' : width}
          rounded="sm"
        />
      ))}
    </div>
  );
};

/**
 * Badge skeleton
 */
export const SkeletonBadge = ({ width = '4rem', className = '' }) => (
  <Skeleton width={width} height="1.25rem" rounded="md" className={className} />
);

/**
 * Avatar skeleton
 */
export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return <Skeleton className={`${sizeClasses[size]} ${className}`} rounded="full" />;
};

/**
 * Table Row Skeleton
 */
export const SkeletonTableRow = ({ columns = 5, hasCheckbox = false, hasRowNumber = false }) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {hasCheckbox && (
        <td className="p-3 w-10">
          <Skeleton width="1rem" height="1rem" rounded="sm" />
        </td>
      )}
      {hasRowNumber && (
        <td className="p-3 w-12">
          <Skeleton width="1.5rem" height="0.875rem" rounded="sm" />
        </td>
      )}
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          {i === 0 ? (
            <SkeletonBadge width="5rem" />
          ) : i === 1 ? (
            <SkeletonBadge width="6rem" />
          ) : (
            <SkeletonText lines={1} width={`${60 + Math.random() * 30}%`} />
          )}
        </td>
      ))}
    </tr>
  );
};

/**
 * Full Table Skeleton
 */
export const SkeletonTable = ({
  rows = 5,
  columns = 5,
  hasCheckbox = true,
  hasRowNumber = true,
  headers = [],
}) => {
  return (
    <table className="min-w-full bg-white dark:bg-gray-900 border-collapse">
      <thead className="sticky top-0 z-10">
        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
          {hasCheckbox && (
            <th className="p-3 w-10">
              <Skeleton width="1rem" height="1rem" rounded="sm" />
            </th>
          )}
          {hasRowNumber && (
            <th className="p-3 w-12">
              <Skeleton width="1rem" height="0.75rem" rounded="sm" />
            </th>
          )}
          {(headers.length > 0 ? headers : Array.from({ length: columns })).map((header, i) => (
            <th key={i} className="p-3 text-left">
              <Skeleton
                width={typeof header === 'string' ? `${header.length * 0.5}rem` : '6rem'}
                height="0.75rem"
                rounded="sm"
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow
            key={i}
            columns={headers.length || columns}
            hasCheckbox={hasCheckbox}
            hasRowNumber={hasRowNumber}
          />
        ))}
      </tbody>
    </table>
  );
};

/**
 * Card Skeleton
 */
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <SkeletonAvatar size="md" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="1rem" rounded="sm" />
          <Skeleton width="40%" height="0.75rem" rounded="sm" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonText lines={3} />
      </div>
      <div className="mt-4 flex gap-2">
        <SkeletonBadge width="4rem" />
        <SkeletonBadge width="5rem" />
        <SkeletonBadge width="3rem" />
      </div>
    </div>
  );
};

/**
 * Detail Panel Skeleton
 */
export const SkeletonDetailPanel = () => {
  return (
    <div className="space-y-4 p-4">
      {/* Title */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <Skeleton width="30%" height="0.75rem" rounded="sm" className="mb-2" />
        <Skeleton width="80%" height="1.25rem" rounded="sm" />
      </div>

      {/* Fields */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="w-32 flex-shrink-0">
            <Skeleton width="70%" height="0.75rem" rounded="sm" />
          </div>
          <div className="flex-1">
            {i % 3 === 0 ? (
              <SkeletonBadge width="5rem" />
            ) : i % 3 === 1 ? (
              <div className="flex items-center gap-2">
                <SkeletonAvatar size="sm" />
                <Skeleton width="6rem" height="0.875rem" rounded="sm" />
              </div>
            ) : (
              <SkeletonText lines={2} width="90%" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Dashboard Card Skeleton
 */
export const SkeletonDashboardCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-start mb-4">
        <Skeleton width="8rem" height="0.875rem" rounded="sm" />
        <Skeleton width="2rem" height="2rem" rounded="md" />
      </div>
      <Skeleton width="4rem" height="2rem" rounded="sm" className="mb-2" />
      <Skeleton width="60%" height="0.75rem" rounded="sm" />
    </div>
  );
};

/**
 * Loading Spinner
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <svg
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Add animation keyframes to index.css
export const skeletonAnimationCSS = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
`;

export default Skeleton;
