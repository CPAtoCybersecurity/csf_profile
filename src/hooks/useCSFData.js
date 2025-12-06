import { useEffect, useCallback, useRef } from 'react';
import useCSFStore from '../stores/csfStore';
import useUserStore from '../stores/userStore';
import { parseUserInfo, findOrCreateUser, formatUserInfo, formatMultipleUsers } from '../utils/userUtils';
import { validateCSVImport, sanitizeInput } from '../utils/sanitize';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

const AUTO_SAVE_DELAY = 2000; // 2 seconds

export function useCSFData() {
  const {
    data,
    loading,
    error,
    hasDownloaded,
    hasUnsavedChanges,
    lastSaved,
    isSaving,
    setData,
    setLoading,
    setError,
    updateItem,
    bulkUpdateItems,
    toggleInScope,
    bulkSetInScope,
    clearAllScope,
    markSaved,
    setIsSaving,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCSFStore();

  const userStore = useUserStore();
  const autoSaveTimerRef = useRef(null);

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
  }, [hasUnsavedChanges, data, setIsSaving, markSaved]);

  // Load initial data
  const loadData = useCallback(async () => {
    if (hasDownloaded && data.length > 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/tblProfile_Demo.csv');
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          const users = [...userStore.users];
          const processedData = processCSVData(results.data, users);

          // Update user store with any new users
          userStore.setUsers(users);

          setData(processedData);
          setLoading(false);
          useCSFStore.setState({ hasDownloaded: true });
          toast.success('Data loaded successfully');
        },
        error: (parseError) => {
          setError(`Error parsing CSV: ${parseError.message}`);
          setLoading(false);
          toast.error(`Error parsing CSV: ${parseError.message}`);
        }
      });
    } catch (err) {
      setError(`Error loading file: ${err.message}`);
      setLoading(false);
      toast.error(`Error loading file: ${err.message}`);
    }
  }, [hasDownloaded, data.length, setLoading, setError, setData, userStore]);

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

            const users = [...userStore.users];
            const processedData = processCSVData(validation.data, users);

            userStore.setUsers(users);
            setData(processedData);

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
  }, [setData, userStore]);

  // Export CSV (all data)
  const exportCSV = useCallback(() => {
    exportDataAsCSV(data, userStore.users, 'CSF_Profile');
  }, [data, userStore.users]);

  // Export filtered data
  const exportFilteredCSV = useCallback((filteredData, filename = 'CSF_Profile_Filtered') => {
    exportDataAsCSV(filteredData, userStore.users, filename);
  }, [userStore.users]);

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
    exportFilteredCSV,
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
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

// Helper function to export data as CSV
function exportDataAsCSV(data, users, filenamePrefix) {
  const today = new Date();
  const dateStamp = today.toISOString().split('T')[0];

  const exportData = data.map(item => {
    const categoryIdMatch = item.Category && item.Category.match(/\(([^)]+)\)/);
    const categoryId = categoryIdMatch ? categoryIdMatch[1] : '';

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
      'In Scope? ': item['In Scope? '],
      'Owner': formatUserInfo(item.ownerId, users),
      'Stakeholder(s)': formatMultipleUsers(item.stakeholderIds, users),
      'Auditor': formatUserInfo(item.auditorId, users),
      'NIST 800-53 Control Ref': item['Control Implementation Description'] || item['NIST 800-53 Control Ref'] || '',
      'Test Procedure(s)': item['Test Procedure(s)'] || '',
      'Observation Date': item['Observation Date'] || '',
      'Observations': item['Observations'] || '',
      'Actual Score': item['Current State Score'] || item['Actual Score'] || 0,
      'Minimum Target': item['Minimum Target'] || 0,
      'Desired Target': item['Desired State Score'] || item['Desired Target'] || 0,
      'Testing Status': item['Testing Status'] || '',
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
