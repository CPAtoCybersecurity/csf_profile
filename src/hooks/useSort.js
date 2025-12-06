import { useState, useMemo, useCallback } from 'react';

const useSort = (data, defaultSort = { key: null, direction: null }) => {
  const [sort, setSort] = useState(defaultSort);

  const handleSort = useCallback((key, direction) => {
    setSort({ key, direction });
  }, []);

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction || !data) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sort.key];
      let bVal = b[sort.key];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sort.direction === 'asc' ? 1 : -1;
      if (bVal == null) return sort.direction === 'asc' ? -1 : 1;

      // Handle different types
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Handle dates (string format YYYY-MM-DD)
      if (sort.key.toLowerCase().includes('date')) {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sort.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
      }

      // Handle strings
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sort.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sort]);

  return {
    sort,
    sortedData,
    handleSort,
  };
};

export default useSort;
