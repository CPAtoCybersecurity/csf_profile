import React from 'react';
import { Eye, Edit, Link2, MoreHorizontal, Trash2 } from 'lucide-react';

/**
 * RowHoverActions Component
 * Shows action icons on table row hover
 */

const ActionButton = ({ icon: Icon, onClick, title, variant = 'default' }) => {
  const variantClasses = {
    default: 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30',
    danger: 'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={`
        p-1 rounded transition-colors
        ${variantClasses[variant]}
      `}
      title={title}
    >
      <Icon size={14} />
    </button>
  );
};

const RowHoverActions = ({
  onView,
  onEdit,
  onLink,
  onDelete,
  onMore,
  showView = true,
  showEdit = true,
  showLink = false,
  showDelete = false,
  showMore = false,
  className = '',
}) => {
  return (
    <div className={`row-hover-actions flex items-center gap-0.5 ${className}`}>
      {showView && onView && (
        <ActionButton icon={Eye} onClick={onView} title="View details" />
      )}
      {showEdit && onEdit && (
        <ActionButton icon={Edit} onClick={onEdit} title="Edit" />
      )}
      {showLink && onLink && (
        <ActionButton icon={Link2} onClick={onLink} title="Link" />
      )}
      {showDelete && onDelete && (
        <ActionButton icon={Trash2} onClick={onDelete} title="Delete" variant="danger" />
      )}
      {showMore && onMore && (
        <ActionButton icon={MoreHorizontal} onClick={onMore} title="More actions" />
      )}
    </div>
  );
};

/**
 * Checkbox for bulk selection
 */
export const RowCheckbox = ({ checked, onChange, indeterminate = false }) => {
  const checkboxRef = React.useRef(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 cursor-pointer"
    />
  );
};

/**
 * Row number display
 */
export const RowNumber = ({ number, className = '' }) => (
  <span className={`row-number ${className}`}>{number}</span>
);

/**
 * Selectable table header checkbox
 */
export const HeaderCheckbox = ({ checked, onChange, indeterminate = false }) => {
  const checkboxRef = React.useRef(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 cursor-pointer"
    />
  );
};

export default RowHoverActions;
