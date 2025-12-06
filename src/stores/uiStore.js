import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // Current selection
      currentItemId: null,
      selectedItemIds: [], // For bulk selection
      editMode: false,

      // Panel state
      detailPanelOpen: true,

      // Filters
      searchTerm: '',
      filterFunctions: [],
      filterCategories: [],
      filterInScope: '',

      // Dropdown states
      functionDropdownOpen: false,
      categoryDropdownOpen: false,
      inScopeDropdownOpen: false,

      // Pagination
      currentPage: 1,
      itemsPerPage: 10,

      // Sorting
      sortKey: null,
      sortDirection: null,

      // Actions - Selection
      setCurrentItemId: (id) => set({ currentItemId: id, editMode: false }),
      setEditMode: (editMode) => set({ editMode }),
      setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),

      // Bulk selection
      toggleItemSelection: (id) => {
        set((state) => {
          const isSelected = state.selectedItemIds.includes(id);
          return {
            selectedItemIds: isSelected
              ? state.selectedItemIds.filter(i => i !== id)
              : [...state.selectedItemIds, id]
          };
        });
      },

      selectAllItems: (ids) => set({ selectedItemIds: ids }),
      clearSelection: () => set({ selectedItemIds: [] }),

      isItemSelected: (id) => get().selectedItemIds.includes(id),
      hasSelection: () => get().selectedItemIds.length > 0,

      // Actions - Filters
      setSearchTerm: (term) => set({ searchTerm: term, currentPage: 1 }),
      setFilterFunctions: (funcs) => set({ filterFunctions: funcs, currentPage: 1 }),
      setFilterCategories: (cats) => set({ filterCategories: cats, currentPage: 1 }),
      setFilterInScope: (scope) => set({ filterInScope: scope, currentPage: 1 }),

      // Dropdown toggles
      setFunctionDropdownOpen: (open) => set({ functionDropdownOpen: open }),
      setCategoryDropdownOpen: (open) => set({ categoryDropdownOpen: open }),
      setInScopeDropdownOpen: (open) => set({ inScopeDropdownOpen: open }),

      closeAllDropdowns: () => set({
        functionDropdownOpen: false,
        categoryDropdownOpen: false,
        inScopeDropdownOpen: false,
      }),

      // Actions - Pagination
      setCurrentPage: (page) => set({ currentPage: page }),
      setItemsPerPage: (count) => set({ itemsPerPage: count, currentPage: 1 }),

      // Actions - Sorting
      setSort: (key, direction) => set({ sortKey: key, sortDirection: direction }),

      // Reset filters
      resetFilters: () => set({
        searchTerm: '',
        filterFunctions: [],
        filterCategories: [],
        filterInScope: '',
        currentPage: 1,
        sortKey: null,
        sortDirection: null,
      }),
    }),
    {
      name: 'csf-ui-storage',
      partialize: (state) => ({
        itemsPerPage: state.itemsPerPage,
        detailPanelOpen: state.detailPanelOpen,
      }),
    }
  )
);

export default useUIStore;
