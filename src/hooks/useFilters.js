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
    setSearchTerm,
    setFilterFunctions,
    setFilterCategories,
    setFilterInScope,
    setCurrentPage,
    setItemsPerPage,
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
    return data.filter(item => {
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
  }, [data, searchTerm, filterFunctions, filterCategories, filterInScope]);

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
