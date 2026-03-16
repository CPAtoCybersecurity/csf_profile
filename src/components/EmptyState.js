import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Search, Filter, Plus, Upload, AlertCircle, ArrowRight } from 'lucide-react';

/**
 * EmptyState Component
 * Friendly empty state messages with illustrations and action buttons
 * Provides friendly messaging with action buttons
 *
 * Props:
 *   icon              — string key ('file', 'search', etc.) OR Lucide icon component
 *   title             — semibold heading text
 *   description       — muted supporting text
 *   action / onAction — callback for CTA button click (onAction is an alias)
 *   actionLabel       — CTA button label
 *   actionLink        — NavLink `to` path for CTA button (overrides action/onAction)
 *   secondaryAction   — callback for secondary button
 *   secondaryActionLabel — secondary button label
 *   className         — extra CSS classes on the container
 *   size              — 'sm' | 'md' | 'lg'
 */

const ICONS = {
  file: FileText,
  search: Search,
  filter: Filter,
  add: Plus,
  upload: Upload,
  error: AlertCircle,
};

const EmptyState = ({
  icon = 'file',
  title,
  description,
  action,
  onAction,
  actionLabel,
  actionLink,
  secondaryAction,
  secondaryActionLabel,
  className = '',
  size = 'md',
}) => {
  const Icon = typeof icon === 'string' ? ICONS[icon] || FileText : icon;

  // Support both `action` (legacy) and `onAction` (new) prop names
  const primaryAction = action || onAction;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 32,
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 48,
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 64,
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  const primaryBtnClass =
    'inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  return (
    <div className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}>
      <div className="mb-4 p-4 rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon
          size={sizes.icon}
          className="text-gray-400 dark:text-gray-500"
          strokeWidth={1.5}
        />
      </div>

      {title && (
        <h3 className={`font-semibold text-gray-700 dark:text-gray-200 mb-2 ${sizes.title}`}>
          {title}
        </h3>
      )}

      {description && (
        <p className={`text-gray-500 dark:text-gray-400 max-w-md mb-4 ${sizes.description}`}>
          {description}
        </p>
      )}

      {(primaryAction || actionLink || secondaryAction) && (
        <div className="flex items-center gap-3 mt-2">
          {/* NavLink CTA — used when actionLink is provided */}
          {actionLink && actionLabel && (
            <NavLink to={actionLink} className={primaryBtnClass}>
              {actionLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </NavLink>
          )}

          {/* Button CTA — used when onAction/action callback is provided */}
          {!actionLink && primaryAction && actionLabel && (
            <button onClick={primaryAction} className={primaryBtnClass}>
              {actionLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Preset empty states for common scenarios
 */

export const EmptySearchResults = ({ onClearFilters, searchTerm }) => (
  <EmptyState
    icon="search"
    title="No results found"
    description={
      searchTerm
        ? `No items match "${searchTerm}". Try adjusting your search or filters.`
        : "No items match your current filters."
    }
    action={onClearFilters}
    actionLabel="Clear filters"
  />
);

export const EmptyTableState = ({ entityName = 'items', onImport, onAdd }) => (
  <EmptyState
    icon="file"
    title={`No ${entityName} yet`}
    description={`Get started by importing ${entityName} from a CSV file or adding them manually.`}
    action={onImport}
    actionLabel="Import from CSV"
    secondaryAction={onAdd}
    secondaryActionLabel={`Add ${entityName.slice(0, -1)}`}
  />
);

export const EmptyFilteredState = ({ onClearFilters }) => (
  <EmptyState
    icon="filter"
    title="No matching items"
    description="Try adjusting your filters to see more results."
    action={onClearFilters}
    actionLabel="Clear all filters"
  />
);

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState
    icon="error"
    title="Something went wrong"
    description={error || "An error occurred while loading data. Please try again."}
    action={onRetry}
    actionLabel="Try again"
  />
);

/**
 * EmptyValue - Inline empty state for table cells
 */
export const EmptyValue = ({ text = 'Empty', className = '' }) => (
  <span className={`empty-value ${className}`}>{text}</span>
);

export default EmptyState;
