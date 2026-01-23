import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const SortableHeader = ({ label, sortKey, currentSort, onSort, className = '' }) => {
  const isActive = currentSort.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  const handleClick = () => {
    if (isActive) {
      // Toggle direction or reset
      if (direction === 'asc') {
        onSort(sortKey, 'desc');
      } else if (direction === 'desc') {
        onSort(null, null); // Reset sort
      }
    } else {
      onSort(sortKey, 'asc');
    }
  };

  return (
    <th
      className={`p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="text-gray-400">
          {!isActive && <ChevronsUpDown size={14} />}
          {isActive && direction === 'asc' && <ChevronUp size={14} className="text-blue-600" />}
          {isActive && direction === 'desc' && <ChevronDown size={14} className="text-blue-600" />}
        </span>
      </div>
    </th>
  );
};

export default SortableHeader;
