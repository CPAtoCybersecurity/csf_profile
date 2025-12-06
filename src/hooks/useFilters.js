import { useMemo, useCallback } from 'react';
import useUIStore from '../stores/uiStore';
import useCSFStore from '../stores/csfStore';

export function useFilters() {
  const data = useCSFStore((state) => state.data);

  const {
    searchTerm,
    filterFunctions,
    filterCategories,
    filterInScope,
    currentPage,
    itemsPerPage,
    sortKey,
    sortDirection,
    setSearchTerm,
    setFilterFunctions,
    setFilterCategories,
    setFilterInScope,
    setCurrentPage,
    setItemsPerPage,
    setSort,
    resetFilters,
  } = useUIStore();

  // Get unique functions for filter dropdown
  const functions = useMemo(() => {
    return [...new Set(data.map(item => item.Function))].filter(Boolean).sort();
  }, [data]);

  // Get unique category IDs for filter dropdown
  const categoryIds = useMemo(() => {
    return [...new Set(data.map(item => {
      const match = item.Category && item.Category.match(/\(([^)]+)\)/);
      return match ? match[1] : item.Category;
    }))].filter(Boolean).sort();
  }, [data]);

  // Filtered data
  const filteredData = useMemo(() => {
    let result = data.filter(item => {
      // Search term filter
      const matchesSearch =
        searchTerm === '' ||
        Object.values(item).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Function filter
      const matchesFunction =
        filterFunctions.length === 0 || filterFunctions.includes(item.Function);

      // Category filter
      const categoryId = item.Category && item.Category.match(/\(([^)]+)\)/)
        ? item.Category.match(/\(([^)]+)\)/)[1]
        : item.Category;
      const matchesCategory =
        filterCategories.length === 0 || filterCategories.includes(categoryId);

      // In Scope filter
      const matchesInScope =
        filterInScope === '' || item['In Scope? '] === filterInScope;

      return matchesSearch && matchesFunction && matchesCategory && matchesInScope;
    });

    // Apply sorting if sortKey is set
    if (sortKey && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal = a[sortKey];
        let bVal = b[sortKey];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
        if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Handle dates
        if (sortKey.toLowerCase().includes('date')) {
          const aDate = new Date(aVal);
          const bDate = new Date(bVal);
          if (!isNaN(aDate) && !isNaN(bDate)) {
            return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
          }
        }

        // Handle strings
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return result;
  }, [data, searchTerm, filterFunctions, filterCategories, filterInScope, sortKey, sortDirection]);

  // Sort handler for SortableHeader component
  const handleSort = useCallback((key, direction) => {
    setSort(key, direction);
  }, [setSort]);

  // Paginated data
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / itemsPerPage);
  }, [filteredData.length, itemsPerPage]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Navigation helpers
  const goToPage = useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages, setCurrentPage]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage, setCurrentPage]);

  // Filter toggle helpers
  const toggleFunction = useCallback((func) => {
    if (filterFunctions.includes(func)) {
      setFilterFunctions(filterFunctions.filter(f => f !== func));
    } else {
      setFilterFunctions([...filterFunctions, func]);
    }
  }, [filterFunctions, setFilterFunctions]);

  const toggleCategory = useCallback((cat) => {
    if (filterCategories.includes(cat)) {
      setFilterCategories(filterCategories.filter(c => c !== cat));
    } else {
      setFilterCategories([...filterCategories, cat]);
    }
  }, [filterCategories, setFilterCategories]);

  // Get item index in filtered data
  const getItemIndex = useCallback((itemId) => {
    return filteredData.findIndex(item => item.ID === itemId);
  }, [filteredData]);

  // Get next/previous item
  const getNextItem = useCallback((currentId) => {
    const currentIndex = getItemIndex(currentId);
    if (currentIndex >= 0 && currentIndex < filteredData.length - 1) {
      return filteredData[currentIndex + 1];
    }
    return null;
  }, [filteredData, getItemIndex]);

  const getPrevItem = useCallback((currentId) => {
    const currentIndex = getItemIndex(currentId);
    if (currentIndex > 0) {
      return filteredData[currentIndex - 1];
    }
    return null;
  }, [filteredData, getItemIndex]);

  return {
    // Filter state
    searchTerm,
    filterFunctions,
    filterCategories,
    filterInScope,
    currentPage,
    itemsPerPage,

    // Sort state
    sort: { key: sortKey, direction: sortDirection },

    // Computed data
    functions,
    categoryIds,
    filteredData,
    currentItems,
    totalPages,

    // Actions
    setSearchTerm,
    setFilterFunctions,
    setFilterCategories,
    setFilterInScope,
    setItemsPerPage,
    resetFilters,
    toggleFunction,
    toggleCategory,

    // Sorting
    handleSort,

    // Pagination
    goToPage,
    goToNextPage,
    goToPrevPage,

    // Navigation helpers
    getItemIndex,
    getNextItem,
    getPrevItem,
  };
}

export default useFilters;
