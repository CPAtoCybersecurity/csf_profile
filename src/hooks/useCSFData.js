import { useEffect, useCallback, useRef } from 'react';
import useCSFStore from '../stores/csfStore';
import useUserStore from '../stores/userStore';
import { parseUserInfo, findOrCreateUser, formatUserInfo, formatMultipleUsers } from '../utils/userUtils';
import { validateCSVImport, sanitizeInput } from '../utils/sanitize';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

const AUTO_SAVE_DELAY = 2000; // 2 seconds

export function useCSFData() {
  // Select individual values from CSF store to avoid infinite re-renders
  const data = useCSFStore((state) => state.data);
  const loading = useCSFStore((state) => state.loading);
  const error = useCSFStore((state) => state.error);
  const hasUnsavedChanges = useCSFStore((state) => state.hasUnsavedChanges);
  const lastSaved = useCSFStore((state) => state.lastSaved);
  const isSaving = useCSFStore((state) => state.isSaving);
  const updateItem = useCSFStore((state) => state.updateItem);
  const bulkUpdateItems = useCSFStore((state) => state.bulkUpdateItems);
  const toggleInScope = useCSFStore((state) => state.toggleInScope);
  const bulkSetInScope = useCSFStore((state) => state.bulkSetInScope);
  const clearAllScope = useCSFStore((state) => state.clearAllScope);
  const markSaved = useCSFStore((state) => state.markSaved);
  const setIsSaving = useCSFStore((state) => state.setIsSaving);
  const undo = useCSFStore((state) => state.undo);
  const redo = useCSFStore((state) => state.redo);
  const historyIndex = useCSFStore((state) => state.historyIndex);
  const historyLength = useCSFStore((state) => state.history.length);

  const autoSaveTimerRef = useRef(null);
  const dataLengthRef = useRef(data.length);

  // Update ref when data changes
  useEffect(() => {
    dataLengthRef.current = data.length;
  }, [data.length]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && data.length > 0) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        setIsSaving(true);
        // Data is already persisted by Zustand persist middleware
        // Just update the saved timestamp
        setTimeout(() => {
          markSaved();
          toast.success('Changes saved', { duration: 1500, icon: '💾' });
        }, 300);
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, data.length, setIsSaving, markSaved]);

  // Load initial data - use refs to avoid dependency changes
  const loadData = useCallback(async () => {
    // Access current values via store directly to avoid stale closures
    const currentState = useCSFStore.getState();
    const currentUserState = useUserStore.getState();

    if (currentState.hasDownloaded && currentState.data.length > 0) {
      currentState.setLoading(false);
      return;
    }

    try {
      currentState.setLoading(true);
      currentState.setError(null);

      const response = await fetch('/tblProfile_Demo.csv');
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const usersList = [...currentUserState.users];
          const processedData = processCSVData(results.data, usersList);

          // Update user store with any new users
          currentUserState.setUsers(usersList);

          currentState.setData(processedData);
          currentState.setLoading(false);
          useCSFStore.setState({ hasDownloaded: true });
          toast.success('Data loaded successfully');
        },
        error: (parseError) => {
          currentState.setError(`Error parsing CSV: ${parseError.message}`);
          currentState.setLoading(false);
          toast.error(`Error parsing CSV: ${parseError.message}`);
        }
      });
    } catch (err) {
      useCSFStore.getState().setError(`Error loading file: ${err.message}`);
      useCSFStore.getState().setLoading(false);
      toast.error(`Error loading file: ${err.message}`);
    }
  }, []); // Empty deps - uses store.getState() for current values

  // Import CSV
  const importCSV = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            // Validate imported data
            const validation = validateCSVImport(results.data);

            if (!validation.valid) {
              toast.error(
                <div>
                  <strong>Import completed with warnings:</strong>
                  <ul className="mt-2 text-sm">
                    {validation.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validation.errors.length > 5 && (
                      <li>...and {validation.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>,
                { duration: 5000 }
              );
            }

            const currentUserState = useUserStore.getState();
            const usersList = [...currentUserState.users];
            const processedData = processCSVData(validation.data, usersList);

            currentUserState.setUsers(usersList);
            useCSFStore.getState().setData(processedData);

            toast.success('CSV imported successfully!');
          },
          error: (parseError) => {
            toast.error(`Error parsing CSV: ${parseError.message}`);
          }
        });
      };

      reader.readAsText(file);
    });

    fileInput.click();
  }, []); // Empty deps - uses store.getState() for current values

  // Export CSV (all data)
  const exportCSV = useCallback(() => {
    const currentData = useCSFStore.getState().data;
    const currentUsers = useUserStore.getState().users;
    exportDataAsCSV(currentData, currentUsers, 'CSF_Profile');
  }, []); // Empty deps - uses store.getState() for current values

  // Compute canUndo/canRedo from primitive values
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  return {
    data,
    loading,
    error,
    hasUnsavedChanges,
    lastSaved,
    isSaving,
    loadData,
    updateItem,
    bulkUpdateItems,
    toggleInScope,
    bulkSetInScope,
    clearAllScope,
    importCSV,
    exportCSV,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

// Helper function to process CSV data
function processCSVData(rawData, existingUsers) {
  return rawData.map(row => {
    const categoryIdMatch = row.Category && row.Category.match(/\(([^)]+)\)/);
    const categoryId = categoryIdMatch ? categoryIdMatch[1] : '';

    // Process Owner
    let ownerId = null;
    if (row.Owner) {
      const ownerInfo = parseUserInfo(row.Owner);
      ownerId = findOrCreateUser(ownerInfo, existingUsers);
    }

    // Process Auditor
    let auditorId = null;
    if (row.Auditor) {
      const auditorInfo = parseUserInfo(row.Auditor);
      auditorId = findOrCreateUser(auditorInfo, existingUsers);
    }

    // Process Stakeholders
    let stakeholderIds = [];
    const stakeholderField = row['Stakeholder(s)'] || row.Stakeholders;
    if (stakeholderField) {
      const stakeholderStrings = stakeholderField
        .split(/;/)
        .map(s => s.trim())
        .filter(Boolean);

      stakeholderIds = stakeholderStrings
        .map(str => findOrCreateUser(parseUserInfo(str), existingUsers))
        .filter(Boolean);
    }

    // Process linked artifacts
    let linkedArtifacts = [];
    if (row['Artifact Name']) {
      linkedArtifacts = row['Artifact Name']
        .split(/[,;]/)
        .map(name => name.trim())
        .filter(Boolean);
    } else if (row['Linked Artifacts']) {
      linkedArtifacts = row['Linked Artifacts']
        .split(/;/)
        .map(name => name.trim())
        .filter(Boolean);
    }

    // Handle score fields
    const actualScore = row['Actual Score'] ?? row['Current State Score'] ?? 0;
    const desiredTarget = row['Desired Target'] ?? row['Desired State Score'] ?? 0;
    const minimumTarget = row['Minimum Target'] ?? 0;
    const controlRef = row['NIST 800-53 Control Ref'] || row['Control Implementation Description'] || '';

    // Build quarters object from imported CSV columns (Q1, Q2, Q3, Q4)
    const quarters = {};

    // Helper to parse Yes/No boolean fields
    const parseYesNo = (value) => {
      if (value === true || value === 'Yes' || value === 'yes' || value === 'YES') return true;
      return false;
    };

    // Q1 data
    if (row['Q1 Actual Score'] !== undefined && row['Q1 Actual Score'] !== '') {
      quarters.Q1 = {
        actualScore: Number(row['Q1 Actual Score']) || 0,
        targetScore: Number(row['Q1 Target Score']) || 0,
        observations: sanitizeInput(row['Q1 Observations'] || ''),
        observationDate: row['Q1 Observation Date'] || '',
        testingStatus: row['Q1 Testing Status'] || 'Not Started',
        examine: parseYesNo(row['Q1 Examine']),
        interview: parseYesNo(row['Q1 Interview']),
        test: parseYesNo(row['Q1 Test']),
      };
    }

    // Q2 data
    if (row['Q2 Actual Score'] !== undefined && row['Q2 Actual Score'] !== '') {
      quarters.Q2 = {
        actualScore: Number(row['Q2 Actual Score']) || 0,
        targetScore: Number(row['Q2 Target Score']) || 0,
        observations: sanitizeInput(row['Q2 Observations'] || ''),
        observationDate: row['Q2 Observation Date'] || '',
        testingStatus: row['Q2 Testing Status'] || 'Not Started',
        examine: parseYesNo(row['Q2 Examine']),
        interview: parseYesNo(row['Q2 Interview']),
        test: parseYesNo(row['Q2 Test']),
      };
    }

    // Q3 data
    if (row['Q3 Actual Score'] !== undefined && row['Q3 Actual Score'] !== '') {
      quarters.Q3 = {
        actualScore: Number(row['Q3 Actual Score']) || 0,
        targetScore: Number(row['Q3 Target Score']) || 0,
        observations: sanitizeInput(row['Q3 Observations'] || ''),
        observationDate: row['Q3 Observation Date'] || '',
        testingStatus: row['Q3 Testing Status'] || 'Not Started',
        examine: parseYesNo(row['Q3 Examine']),
        interview: parseYesNo(row['Q3 Interview']),
        test: parseYesNo(row['Q3 Test']),
      };
    }

    // Q4 data
    if (row['Q4 Actual Score'] !== undefined && row['Q4 Actual Score'] !== '') {
      quarters.Q4 = {
        actualScore: Number(row['Q4 Actual Score']) || 0,
        targetScore: Number(row['Q4 Target Score']) || 0,
        observations: sanitizeInput(row['Q4 Observations'] || ''),
        observationDate: row['Q4 Observation Date'] || '',
        testingStatus: row['Q4 Testing Status'] || 'Not Started',
        examine: parseYesNo(row['Q4 Examine']),
        interview: parseYesNo(row['Q4 Interview']),
        test: parseYesNo(row['Q4 Test']),
      };
    }

    // Process Remediation Owner (separate from assessment Owner)
    let remediationOwnerId = null;
    if (row['Remediation Owner']) {
      const remOwnerInfo = parseUserInfo(row['Remediation Owner']);
      remediationOwnerId = findOrCreateUser(remOwnerInfo, existingUsers);
    }

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
      'Implementation Description': row['Implementation Description'] || controlRef || '',
      'linkedArtifacts': linkedArtifacts,
      'quarters': Object.keys(quarters).length > 0 ? quarters : undefined,
      'remediationOwnerId': remediationOwnerId,
      'Remediation Due Date': row['Remediation Due Date'] || row['Due Date'] || '',
    };
  });
}

// Helper function to export data as CSV
function exportDataAsCSV(data, users, filenamePrefix) {
  const today = new Date();
  const dateStamp = today.toISOString().split('T')[0];

  const exportData = data.map(item => {
    const categoryIdMatch = item.Category && item.Category.match(/\(([^)]+)\)/);
    const categoryId = categoryIdMatch ? categoryIdMatch[1] : '';

    // Get quarterly data (Q1, Q2, Q3, Q4)
    const quarters = item.quarters || {};
    const q1 = quarters.Q1 || {};
    const q2 = quarters.Q2 || {};
    const q3 = quarters.Q3 || {};
    const q4 = quarters.Q4 || {};

    return {
      'ID': item.ID,
      'Function': item.Function,
      'Function Description': item['Function Description'],
      'Category ID': categoryId,
      'Category': item.Category,
      'Category Description': item['Category Description'],
      'Subcategory ID': item['Subcategory ID'],
      'Subcategory Description': item['Subcategory Description'],
      'Implementation Example': item['Implementation Example'],
      'Implementation Description': item['Implementation Description'] || item['Control Implementation Description'] || '',
      'In Scope? ': item['In Scope? '],
      'Owner': formatUserInfo(item.ownerId, users),
      'Stakeholder(s)': formatMultipleUsers(item.stakeholderIds, users),
      'Auditor': formatUserInfo(item.auditorId, users),
      'NIST 800-53 Control Ref': item['Control Implementation Description'] || item['NIST 800-53 Control Ref'] || '',
      'Test Procedure(s)': item['Test Procedure(s)'] || '',
      // Q1 (First Quarter)
      'Q1 Actual Score': q1.actualScore ?? '',
      'Q1 Target Score': q1.targetScore ?? '',
      'Q1 Observations': q1.observations || '',
      'Q1 Observation Date': q1.observationDate || '',
      'Q1 Testing Status': q1.testingStatus || '',
      'Q1 Examine': q1.examine ? 'Yes' : 'No',
      'Q1 Interview': q1.interview ? 'Yes' : 'No',
      'Q1 Test': q1.test ? 'Yes' : 'No',
      // Q2 (Second Quarter)
      'Q2 Actual Score': q2.actualScore ?? '',
      'Q2 Target Score': q2.targetScore ?? '',
      'Q2 Observations': q2.observations || '',
      'Q2 Observation Date': q2.observationDate || '',
      'Q2 Testing Status': q2.testingStatus || '',
      'Q2 Examine': q2.examine ? 'Yes' : 'No',
      'Q2 Interview': q2.interview ? 'Yes' : 'No',
      'Q2 Test': q2.test ? 'Yes' : 'No',
      // Q3 (Third Quarter)
      'Q3 Actual Score': q3.actualScore ?? '',
      'Q3 Target Score': q3.targetScore ?? '',
      'Q3 Observations': q3.observations || '',
      'Q3 Observation Date': q3.observationDate || '',
      'Q3 Testing Status': q3.testingStatus || '',
      'Q3 Examine': q3.examine ? 'Yes' : 'No',
      'Q3 Interview': q3.interview ? 'Yes' : 'No',
      'Q3 Test': q3.test ? 'Yes' : 'No',
      // Q4 (Fourth Quarter)
      'Q4 Actual Score': q4.actualScore ?? '',
      'Q4 Target Score': q4.targetScore ?? '',
      'Q4 Observations': q4.observations || '',
      'Q4 Observation Date': q4.observationDate || '',
      'Q4 Testing Status': q4.testingStatus || '',
      'Q4 Examine': q4.examine ? 'Yes' : 'No',
      'Q4 Interview': q4.interview ? 'Yes' : 'No',
      'Q4 Test': q4.test ? 'Yes' : 'No',
      // Remediation fields
      'Remediation Owner': formatUserInfo(item.remediationOwnerId, users),
      'Remediation Due Date': item['Remediation Due Date'] || '',
      // Other fields
      'Minimum Target': item['Minimum Target'] || 0,
      'Action Plan': item['Action Plan'] || '',
      'Artifact Name': Array.isArray(item.linkedArtifacts)
        ? item.linkedArtifacts.join('; ')
        : (item.linkedArtifacts || ''),
    };
  });

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${dateStamp}_${filenamePrefix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Exported ${data.length} items to CSV`);
}

export default useCSFData;
