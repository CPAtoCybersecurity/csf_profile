import React, { useState, useRef } from 'react';
import { Search, Filter, X, ChevronDown, List, LayoutGrid, Download, Upload } from 'lucide-react';
import DropdownPortal from './DropdownPortal';

/**
 * FilterBar Component
 * Filter bar with chips, search, and action controls
 */

/**
 * FilterChip - Removable filter indicator
 */
export const FilterChip = ({ label, value, onRemove, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      <span className="text-[10px] opacity-70">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X size={12} />
      </button>
    </span>
  );
};

/**
 * FilterDropdown - Dropdown filter selector
 */
export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  placeholder,
  icon: Icon = Filter,
  renderOption,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  const selectedOption = options.find(opt =>
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const displayValue = selectedOption
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        <Icon size={14} className="text-gray-500" />
        <span className="truncate max-w-[120px]">{displayValue}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <DropdownPortal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        className="min-w-[180px] max-h-60 overflow-auto"
      >
        <div className="py-1">
          {options.map((option, idx) => {
            const optValue = typeof option === 'object' ? option.value : option;
            const optLabel = typeof option === 'object' ? option.label : option;
            const isSelected = optValue === value;

            return (
              <button
                key={optValue || idx}
                onClick={() => {
                  onChange(optValue);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 text-sm
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                  transition-colors
                `}
              >
                {renderOption ? renderOption(option) : optLabel}
              </button>
            );
          })}
        </div>
      </DropdownPortal>
    </div>
  );
};

/**
 * ViewSwitcher - Toggle between list/grid/kanban views
 */
export const ViewSwitcher = ({ view, onChange, views = ['list', 'grid'] }) => {
  const viewIcons = {
    list: List,
    grid: LayoutGrid,
  };

  return (
    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {views.map((v) => {
        const Icon = viewIcons[v] || List;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`
              p-1.5 transition-colors
              ${view === v
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
            title={v.charAt(0).toUpperCase() + v.slice(1) + ' view'}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
};

/**
 * Main FilterBar Component
 */
const FilterBar = ({
  // Search
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  // Active filters (for chips)
  activeFilters = [],
  onRemoveFilter,
  onClearAllFilters,
  // Filter dropdowns
  filters = [],
  // Actions
  onImport,
  onExport,
  importLabel = 'Import',
  exportLabel = 'Export',
  showImport = true,
  showExport = true,
  // View
  view,
  onViewChange,
  views,
  // Custom content
  leftContent,
  rightContent,
  // Styling
  className = '',
}) => {
  const activeFilterCount = activeFilters.filter(f => f.value).length;

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 p-3 flex flex-wrap items-center gap-3 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Left section: Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={14} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-40 pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter dropdowns */}
      {filters.map((filter, idx) => (
        <FilterDropdown
          key={filter.key || idx}
          label={filter.label}
          value={filter.value}
          options={filter.options}
          onChange={filter.onChange}
          placeholder={filter.placeholder}
          icon={filter.icon}
          renderOption={filter.renderOption}
        />
      ))}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <span className="text-xs text-gray-500 dark:text-gray-400">Filters:</span>
          <div className="flex flex-wrap gap-1">
            {activeFilters.filter(f => f.value).map((filter, idx) => (
              <FilterChip
                key={filter.key || idx}
                label={filter.label}
                value={filter.displayValue || filter.value}
                onRemove={() => onRemoveFilter(filter.key)}
                color={filter.color || 'blue'}
              />
            ))}
          </div>
          {activeFilterCount > 1 && (
            <button
              onClick={onClearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Custom left content */}
      {leftContent}

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Right section: View switcher and actions */}
      <div className="flex items-center gap-2">
        {/* Custom right content */}
        {rightContent}

        {/* View switcher */}
        {view && onViewChange && (
          <ViewSwitcher view={view} onChange={onViewChange} views={views} />
        )}

        {/* Import button */}
        {showImport && onImport && (
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Upload size={14} />
            {importLabel}
          </button>
        )}

        {/* Export button */}
        {showExport && onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={14} />
            {exportLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
