import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseUserInfo, findOrCreateUser } from '../utils/userUtils';
import { sanitizeInput } from '../utils/sanitize';
import Papa from 'papaparse';

// History for undo/redo
const MAX_HISTORY_SIZE = 50;

const useCSFStore = create(
  persist(
    (set, get) => ({
      // Data state
      data: [],
      loading: true,
      error: null,
      hasDownloaded: false,

      // History for undo/redo
      history: [],
      historyIndex: -1,

      // Auto-save state
      lastSaved: null,
      isSaving: false,
      hasUnsavedChanges: false,

      // Actions
      setData: (data) => {
        const sanitizedData = data.map(item => ({
          ...item,
          Observations: sanitizeInput(item.Observations || ''),
          'Action Plan': sanitizeInput(item['Action Plan'] || ''),
          'Test Procedure(s)': sanitizeInput(item['Test Procedure(s)'] || ''),
        }));

        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(state.data);

        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }

        set({
          data: sanitizedData,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          hasUnsavedChanges: true,
        });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setHasDownloaded: (hasDownloaded) => set({ hasDownloaded }),

      // Undo/Redo
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          set({
            data: state.history[newIndex],
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          set({
            data: state.history[newIndex],
            historyIndex: newIndex,
            hasUnsavedChanges: true,
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Auto-save
      markSaved: () => set({
        lastSaved: new Date(),
        isSaving: false,
        hasUnsavedChanges: false,
      }),

      setIsSaving: (isSaving) => set({ isSaving }),

      // Update single item
      updateItem: (id, updates) => {
        const state = get();
        const sanitizedUpdates = {
          ...updates,
          Observations: updates.Observations ? sanitizeInput(updates.Observations) : updates.Observations,
          'Action Plan': updates['Action Plan'] ? sanitizeInput(updates['Action Plan']) : updates['Action Plan'],
          'Test Procedure(s)': updates['Test Procedure(s)'] ? sanitizeInput(updates['Test Procedure(s)']) : updates['Test Procedure(s)'],
        };

        const updatedData = state.data.map(item =>
          item.ID === id ? { ...item, ...sanitizedUpdates } : item
        );

        get().setData(updatedData);
      },

      // Bulk update items
      bulkUpdateItems: (ids, updates) => {
        const state = get();
        const sanitizedUpdates = {
          ...updates,
          Observations: updates.Observations ? sanitizeInput(updates.Observations) : updates.Observations,
          'Action Plan': updates['Action Plan'] ? sanitizeInput(updates['Action Plan']) : updates['Action Plan'],
        };

        const updatedData = state.data.map(item =>
          ids.includes(item.ID) ? { ...item, ...sanitizedUpdates } : item
        );

        get().setData(updatedData);
      },

      // Toggle in scope
      toggleInScope: (id) => {
        const state = get();
        const updatedData = state.data.map(item =>
          item.ID === id
            ? { ...item, 'In Scope? ': item['In Scope? '] === 'Yes' ? 'No' : 'Yes' }
            : item
        );
        get().setData(updatedData);
      },

      // Bulk toggle in scope
      bulkSetInScope: (ids, inScope) => {
        const state = get();
        const updatedData = state.data.map(item =>
          ids.includes(item.ID) ? { ...item, 'In Scope? ': inScope } : item
        );
        get().setData(updatedData);
      },

      // Clear all scope
      clearAllScope: () => {
        const state = get();
        const updatedData = state.data.map(item => ({
          ...item,
          'In Scope? ': 'No'
        }));
        get().setData(updatedData);
      },

      // Get quarterly data for an item (1 = Q1, 2 = Q2, 3 = Q3, 4 = Q4)
      getQuarterData: (itemId, quarterNum) => {
        const state = get();
        const item = state.data.find(i => i.ID === itemId);
        if (!item) return null;

        const quarterKey = `Q${quarterNum}`;
        const quarters = item.quarters || {};

        return quarters[quarterKey] || {
          actualScore: 0,
          targetScore: 0,
          observations: '',
          observationDate: '',
          testingStatus: 'Not Started',
          examine: false,
          interview: false,
          test: false,
        };
      },

      // Update quarterly data for an item
      updateQuarterData: (itemId, quarterNum, updates) => {
        const state = get();
        const quarterKey = `Q${quarterNum}`;

        const updatedData = state.data.map(item => {
          if (item.ID !== itemId) return item;

          const quarters = item.quarters || {};
          const currentQuarterData = quarters[quarterKey] || {
            actualScore: 0,
            targetScore: 0,
            observations: '',
            observationDate: '',
            testingStatus: 'Not Started',
            examine: false,
            interview: false,
            test: false,
          };

          return {
            ...item,
            quarters: {
              ...quarters,
              [quarterKey]: {
                ...currentQuarterData,
                ...updates,
                observations: updates.observations ? sanitizeInput(updates.observations) : currentQuarterData.observations,
              },
            },
          };
        });

        get().setData(updatedData);
      },

      // Load initial data from CSV
      loadInitialData: async (userStore) => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/tblProfile_Demo.csv');
          const csvText = await response.text();

          return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: true,
              complete: (results) => {
                const users = userStore.getState().users;
                const processedData = processCSVData(results.data, users, userStore);

                set({
                  data: processedData,
                  loading: false,
                  hasDownloaded: true,
                  history: [processedData],
                  historyIndex: 0,
                });
                resolve(processedData);
              },
              error: (error) => {
                console.error('CSV parse error:', error);
                set({ error: 'Failed to parse CSV file.', loading: false });
                reject(error);
              }
            });
          });
        } catch (err) {
          console.error('CSV load error:', err);
          set({ error: 'Failed to load CSV file.', loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'csf-data-storage',
      version: 2,
      migrate: (persistedState, version) => {
        // Version 2: Force re-download of CSV to get proper owner assignments
        // Reset hasDownloaded to trigger fresh load with owner processing
        if (version < 2) {
          return {
            ...persistedState,
            hasDownloaded: false,
            data: [],
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        data: state.data,
        hasDownloaded: state.hasDownloaded,
      }),
    }
  )
);

// Helper function to process CSV data
function processCSVData(rawData, existingUsers, userStore) {
  const users = [...existingUsers];

  return rawData.map(row => {
    const categoryIdMatch = row.Category && row.Category.match(/\(([^)]+)\)/);
    const categoryId = categoryIdMatch ? categoryIdMatch[1] : '';

    // Process Owner
    let ownerId = null;
    if (row.Owner) {
      const ownerInfo = parseUserInfo(row.Owner);
      ownerId = findOrCreateUser(ownerInfo, users);
    }

    // Process Auditor
    let auditorId = null;
    if (row.Auditor) {
      const auditorInfo = parseUserInfo(row.Auditor);
      auditorId = findOrCreateUser(auditorInfo, users);
    }

    // Process Stakeholders
    let stakeholderIds = [];
    if (row['Stakeholder(s)'] || row.Stakeholders) {
      const stakeholderStrings = (row['Stakeholder(s)'] || row.Stakeholders)
        .split(/;/)
        .map(s => s.trim())
        .filter(Boolean);

      stakeholderIds = stakeholderStrings
        .map(str => findOrCreateUser(parseUserInfo(str), users))
        .filter(Boolean);
    }

    // Process linked artifacts
    let linkedArtifacts = [];
    if (row['Artifact Name']) {
      linkedArtifacts = row['Artifact Name']
        .split(/[,;]/)
        .map(name => name.trim())
        .filter(Boolean);
    }

    // Handle score fields
    const actualScore = row['Actual Score'] ?? row['Current State Score'] ?? 0;
    const desiredTarget = row['Desired Target'] ?? row['Desired State Score'] ?? 0;
    const minimumTarget = row['Minimum Target'] ?? 0;
    const controlRef = row['NIST 800-53 Control Ref'] || row['Control Implementation Description'] || '';

    return {
      ...row,
      'In Scope? ': row['In Scope? '] || 'No',
      'Observations': sanitizeInput(row['Observations'] || ''),
      'Current State Score': actualScore,
      'Actual Score': actualScore,
      'Minimum Target': minimumTarget,
      'Desired State Score': desiredTarget,
      'Desired Target': desiredTarget,
      'Gap to Minimum Target': minimumTarget - actualScore,
      'Testing Status': row['Testing Status'] || 'Not Started',
      'Category ID': categoryId,
      'Test Procedure(s)': sanitizeInput(row['Test Procedure(s)'] || ''),
      'Observation Date': row['Observation Date'] || '',
      'Action Plan': sanitizeInput(row['Action Plan'] || ''),
      'ownerId': ownerId,
      'stakeholderIds': stakeholderIds,
      'auditorId': auditorId,
      'Control Implementation Description': controlRef,
      'NIST 800-53 Control Ref': controlRef,
      'linkedArtifacts': linkedArtifacts,
    };
  });
}

export default useCSFStore;
