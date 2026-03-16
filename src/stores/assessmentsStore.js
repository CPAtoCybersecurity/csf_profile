import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { sanitizeInput, escapeCSVValue } from '../utils/sanitize';
import { buildEncryptedFilename, encryptBytesWithPassword } from '../utils/exportEncryption';
import { UPDATED_OBSERVATIONS } from './defaultAssessmentsData';

// Default assessment for new installations
// References control IDs from DEFAULT_CONTROLS in controlsStore.js
// User ID 2 = Steve (Auditor) from default users
// Quarterly observation data imported from defaultAssessmentsData.js (extracted from CSV)
const DEFAULT_ASSESSMENTS = [
  {
    id: 'ASM-default-2025-alma',
    name: '2025 Alma Security CSF',
    description: 'Annual CSF 2.0 assessment for Alma Security covering all implemented controls',
    scopeType: 'requirements',
    frameworkFilter: null,
    createdDate: '2025-01-01T00:00:00.000Z',
    scopeIds: [
      'GV.SC-04 Ex1', 'GV.OC-01 Ex1', 'GV.RR-02 Ex1', 'GV.OC-02 Ex1', 'GV.OV-01 Ex2',
      'GV.RM-01 Ex2', 'GV.RR-01 Ex4', 'GV.SC-01 Ex3', 'GV.SC-02 Ex7', 'GV.SC-06 Ex3',
      'GV.SC-10 Ex3', 'GV.SC-09 Ex5', 'ID.RA-07 Ex1', 'PR.AT-01 Ex2', 'PR.IR-02 Ex1',
      'RS.MI-02 Ex2', 'DE.AE-02 Ex1', 'DE.AE-06 Ex1', 'DE.CM-01 Ex1', 'ID.RA-01 Ex1',
      'PR.DS-01 Ex4', 'PR.IR-03 Ex3', 'PR.PS-01 Ex1', 'PR.PS-05 Ex1', 'RC.RP-03 Ex1',
      'RS.MI-01 Ex1', 'DE.AE-03 Ex2', 'DE.CM-03 Ex2', 'DE.CM-09 Ex1', 'ID.AM-02 Ex2',
      'ID.AM-07 Ex3', 'ID.IM-01 Ex1', 'RS.MA-03 Ex2', 'DE.AE-02 Ex3', 'DE.AE-08 Ex1',
      'ID.RA-08 Ex1', 'PR.AA-02 Ex2', 'PR.DS-10 Ex1'
    ],
    observations: UPDATED_OBSERVATIONS
  }
];

// Helper to create default quarterly data structure
const createDefaultQuarter = () => ({
  actualScore: 0,
  targetScore: 0,
  observations: '',
  observationDate: '',
  testingStatus: 'Not Started',
  examine: false,
  interview: false,
  test: false
});

const createDefaultQuarters = () => ({
  Q1: createDefaultQuarter(),
  Q2: createDefaultQuarter(),
  Q3: createDefaultQuarter(),
  Q4: createDefaultQuarter()
});

// Helper to migrate old observation format to new quarterly format
const migrateObservationToQuarterly = (oldObs) => {
  if (!oldObs) return null;

  // If already has quarters structure, return as-is
  if (oldObs.quarters) return oldObs;

  // Migrate old format to Q1
  const methods = oldObs.assessmentMethods || {};
  return {
    auditorId: oldObs.auditorId || null,
    testProcedures: oldObs.testProcedures || '',
    linkedArtifacts: oldObs.linkedArtifacts || [],
    remediation: oldObs.remediation || { ownerId: null, actionPlan: '', dueDate: '' },
    quarters: {
      Q1: {
        actualScore: oldObs.actualScore || 0,
        targetScore: oldObs.targetScore || 0,
        observations: oldObs.observations || '',
        observationDate: oldObs.observationDate || '',
        testingStatus: oldObs.testingStatus || 'Not Started',
        examine: methods.examine || false,
        interview: methods.interview || false,
        test: methods.test || false
      },
      Q2: createDefaultQuarter(),
      Q3: createDefaultQuarter(),
      Q4: createDefaultQuarter()
    }
  };
};

const useAssessmentsStore = create(
  persist(
    (set, get) => ({
      assessments: DEFAULT_ASSESSMENTS,
      currentAssessmentId: null,
      loading: false,
      error: null,

      // History for undo/redo
      history: [],
      historyIndex: -1,

      // Set assessments with history tracking
      setAssessments: (assessments) => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(state.assessments);

        if (newHistory.length > 50) {
          newHistory.shift();
        }

        set({
          assessments,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          loading: false,
          error: null
        });
      },

      // Load initial assessment data from JIRA-Assessments.csv
      loadInitialData: async () => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/JIRA-Assessments.csv');
          const csvText = await response.text();

          return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                // Detect Jira format (has Issue Type and Issue key columns)
                const isJiraFormat = results.meta.fields?.includes('Issue Type') &&
                  results.meta.fields?.includes('Issue key');

                if (!isJiraFormat) {
                  // Fallback to DEFAULT_ASSESSMENTS if not Jira format
                  set({ loading: false });
                  resolve(get().assessments);
                  return;
                }

                // First pass: identify Epics as Assessments
                const jiraEpics = {};
                results.data.forEach(row => {
                  if (row['Issue Type'] === 'Epic') {
                    const epicKey = row['Issue key'];
                    const epicId = row['Issue id'];
                    jiraEpics[epicKey] = {
                      id: epicId,
                      key: epicKey,
                      name: row['Summary'] || epicKey,
                      description: row['Description'] || '',
                      jiraKey: epicKey
                    };
                    if (epicId) {
                      jiraEpics[epicId] = jiraEpics[epicKey];
                    }
                  }
                });

                // Group work paper rows by parent Epic or Parent summary
                const assessmentGroups = {};
                results.data.forEach(row => {
                  if (row['Issue Type'] === 'Epic') return;

                  const parentKey = row['Parent key'] || row['Parent'];
                  const parentId = row['Parent'];
                  const parentSummary = row['Parent summary']; // Use Parent summary for assessment name
                  const parentEpic = jiraEpics[parentKey] || jiraEpics[parentId];

                  let assessmentName, assessmentJiraKey;
                  if (parentEpic) {
                    assessmentName = parentEpic.name;
                    assessmentJiraKey = parentEpic.key;
                  } else if (parentSummary) {
                    // Use Parent summary as the assessment name (preferred)
                    assessmentName = parentSummary;
                    assessmentJiraKey = parentKey || null;
                  } else if (parentKey || parentId) {
                    assessmentName = parentKey || `Assessment-${parentId}`;
                    assessmentJiraKey = parentKey;
                  } else {
                    return;
                  }

                  if (!assessmentGroups[assessmentName]) {
                    const epicInfo = assessmentJiraKey ? jiraEpics[assessmentJiraKey] : null;
                    assessmentGroups[assessmentName] = {
                      name: assessmentName,
                      description: epicInfo?.description || '',
                      scopeType: 'requirements', // JIRA work papers use subcategory IDs which map to requirements
                      jiraKey: assessmentJiraKey,
                      rows: []
                    };
                  }
                  assessmentGroups[assessmentName].rows.push(row);
                });

                // Create assessments from groups
                const newAssessments = Object.values(assessmentGroups).map(group => {
                  const scopeIds = [];
                  const observations = {};

                  group.rows.forEach(row => {
                    // Extract control ID from Summary (e.g., "GV.SC-02")
                    const itemId = row['Summary'] || row['Issue key'];
                    if (!itemId) return;

                    scopeIds.push(itemId);

                    // Parse quarter data from Jira custom fields
                    const q1Obs = row['Custom field (Q1 Observations)'] || '';
                    const q2Obs = row['Custom field (Q2 Observations)'] || '';
                    const q3Obs = row['Custom field (Q3 Observations)'] || '';
                    const q4Obs = row['Custom field (Q4 Observations)'] || '';

                    observations[itemId] = {
                      auditorId: null,
                      testProcedures: sanitizeInput(row['Custom field (Test Procedures)'] || ''),
                      linkedArtifacts: (row['Custom field (Artifacts)'] || '').split(';').map(s => s.trim()).filter(Boolean),
                      jiraKey: row['Issue key'] || null,
                      remediation: {
                        ownerId: null,
                        actionPlan: sanitizeInput(row['Custom field (Remediation Action Plan (Who will do What by When?) )'] || ''),
                        dueDate: ''
                      },
                      quarters: {
                        Q1: {
                          actualScore: parseFloat(row['Custom field (Q1 Actual Score)']) || 0,
                          targetScore: parseFloat(row['Custom field (Q1 Target Score)']) || 0,
                          observations: sanitizeInput(q1Obs),
                          observationDate: '',
                          testingStatus: row['Custom field (Testing Status)'] || row['Status'] || 'Not Started',
                          examine: (row['Custom field (Assessment Methods)'] || '').toLowerCase().includes('examine'),
                          interview: (row['Custom field (Assessment Methods)'] || '').toLowerCase().includes('interview'),
                          test: (row['Custom field (Assessment Methods)'] || '').toLowerCase().includes('test')
                        },
                        Q2: {
                          actualScore: parseFloat(row['Custom field (Q2 Actual Score)']) || 0,
                          targetScore: parseFloat(row['Custom field (Q2 Target Score)']) || 0,
                          observations: sanitizeInput(q2Obs),
                          observationDate: '',
                          testingStatus: q2Obs ? 'In Progress' : 'Not Started',
                          examine: false,
                          interview: false,
                          test: false
                        },
                        Q3: {
                          actualScore: parseFloat(row['Custom field (Q3 Actual Score)']) || 0,
                          targetScore: parseFloat(row['Custom field (Q3 Target Score)']) || 0,
                          observations: sanitizeInput(q3Obs),
                          observationDate: '',
                          testingStatus: q3Obs ? 'In Progress' : 'Not Started',
                          examine: false,
                          interview: false,
                          test: false
                        },
                        Q4: {
                          actualScore: parseFloat(row['Custom field (Q4 Actual Score)']) || 0,
                          targetScore: parseFloat(row['Custom field (Q4 Target Score)']) || 0,
                          observations: sanitizeInput(q4Obs),
                          observationDate: '',
                          testingStatus: q4Obs ? 'In Progress' : 'Not Started',
                          examine: false,
                          interview: false,
                          test: false
                        }
                      }
                    };
                  });

                  return {
                    id: `ASM-jira-${group.jiraKey || Date.now()}`,
                    name: group.name,
                    description: group.description,
                    scopeType: group.scopeType,
                    scopeIds: [...new Set(scopeIds)],
                    frameworkFilter: null,
                    jiraKey: group.jiraKey || null,
                    status: 'In Progress',
                    createdDate: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    observations
                  };
                });

                // Replace assessments with loaded data
                set({
                  assessments: newAssessments.length > 0 ? newAssessments : DEFAULT_ASSESSMENTS,
                  loading: false,
                  error: null
                });
                resolve(newAssessments);
              },
              error: (error) => {
                console.error('Jira CSV parse error:', error);
                set({ error: 'Failed to parse CSV file.', loading: false });
                reject(error);
              }
            });
          });
        } catch (err) {
          console.error('Jira CSV parse error:', err);
          set({ error: 'Failed to parse CSV file.', loading: false });
          throw err;
        }
      },

      // Get all assessments
      getAssessments: () => get().assessments,

      // Get assessment by ID
      getAssessment: (assessmentId) => {
        return get().assessments.find(a => a.id === assessmentId);
      },

      // Get current assessment
      getCurrentAssessment: () => {
        const currentId = get().currentAssessmentId;
        return currentId ? get().getAssessment(currentId) : null;
      },

      // Set current assessment
      setCurrentAssessmentId: (assessmentId) => {
        set({ currentAssessmentId: assessmentId });
      },

      // Create new assessment
      createAssessment: (assessmentData) => {
        const assessments = get().assessments;
        const newId = `ASM-${Date.now()}`;

        const newAssessment = {
          id: newId,
          name: assessmentData.name || `Assessment ${assessments.length + 1}`,
          description: assessmentData.description || '',
          scopeType: assessmentData.scopeType || 'requirements', // 'requirements' or 'controls'
          scopeIds: assessmentData.scopeIds || [], // Array of requirement IDs or control IDs
          frameworkFilter: assessmentData.frameworkFilter || null, // Optional framework filter
          status: 'Not Started', // Not Started, In Progress, Complete
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),

          // Observations keyed by scoped item ID
          observations: {}
        };

        const updatedAssessments = [...assessments, newAssessment];
        get().setAssessments(updatedAssessments);
        set({ currentAssessmentId: newId });
        return newAssessment;
      },

      // Update assessment metadata
      updateAssessment: (assessmentId, updates) => {
        const updatedAssessments = get().assessments.map(a =>
          a.id === assessmentId
            ? { ...a, ...updates, lastModified: new Date().toISOString() }
            : a
        );
        get().setAssessments(updatedAssessments);
      },

      // Delete assessment
      deleteAssessment: (assessmentId) => {
        const updatedAssessments = get().assessments.filter(a => a.id !== assessmentId);
        get().setAssessments(updatedAssessments);
        if (get().currentAssessmentId === assessmentId) {
          set({ currentAssessmentId: null });
        }
      },

      // Add item to assessment scope
      addToScope: (assessmentId, itemId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        if (!assessment.scopeIds.includes(itemId)) {
          get().updateAssessment(assessmentId, {
            scopeIds: [...assessment.scopeIds, itemId]
          });
        }
      },

      // Remove item from assessment scope
      removeFromScope: (assessmentId, itemId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        get().updateAssessment(assessmentId, {
          scopeIds: assessment.scopeIds.filter(id => id !== itemId)
        });

        // Also remove observations for this item
        const observations = { ...assessment.observations };
        delete observations[itemId];
        get().updateAssessment(assessmentId, { observations });
      },

      // Bulk add to scope
      bulkAddToScope: (assessmentId, itemIds) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        const newIds = [...new Set([...assessment.scopeIds, ...itemIds])];
        get().updateAssessment(assessmentId, { scopeIds: newIds });
      },

      // Get observation for a scoped item (with quarterly structure)
      getObservation: (assessmentId, itemId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return null;

        const stored = assessment.observations[itemId];

        // If stored observation exists, ensure it has quarterly structure
        if (stored) {
          // Migrate if needed
          if (!stored.quarters) {
            return migrateObservationToQuarterly(stored);
          }
          return stored;
        }

        // Return default structure with quarterly data
        return {
          auditorId: null,
          testProcedures: '',
          linkedArtifacts: [],
          remediation: {
            ownerId: null,
            actionPlan: '',
            dueDate: ''
          },
          quarters: createDefaultQuarters()
        };
      },

      // Update observation for a scoped item
      // observationData can include: auditorId, testProcedures, linkedArtifacts, remediation
      // For quarterly data, use updateQuarterlyObservation instead
      updateObservation: (assessmentId, itemId, observationData) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        const currentObservation = get().getObservation(assessmentId, itemId);
        const sanitizedData = {
          ...observationData,
          testProcedures: observationData.testProcedures !== undefined
            ? sanitizeInput(observationData.testProcedures)
            : currentObservation.testProcedures,
          remediation: observationData.remediation
            ? {
              ...currentObservation.remediation,
              ...observationData.remediation,
              actionPlan: observationData.remediation.actionPlan
                ? sanitizeInput(observationData.remediation.actionPlan)
                : currentObservation.remediation.actionPlan
            }
            : currentObservation.remediation,
          quarters: currentObservation.quarters || createDefaultQuarters()
        };

        const updatedObservations = {
          ...assessment.observations,
          [itemId]: {
            ...currentObservation,
            ...sanitizedData
          }
        };

        get().updateAssessment(assessmentId, { observations: updatedObservations });
      },

      // Update quarterly observation data for a specific quarter
      updateQuarterlyObservation: (assessmentId, itemId, quarter, quarterData) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;
        if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) return;

        const currentObservation = get().getObservation(assessmentId, itemId);
        const currentQuarter = currentObservation.quarters?.[quarter] || createDefaultQuarter();

        const sanitizedQuarterData = {
          ...currentQuarter,
          ...quarterData,
          observations: quarterData.observations !== undefined
            ? sanitizeInput(quarterData.observations)
            : currentQuarter.observations
        };

        const updatedObservations = {
          ...assessment.observations,
          [itemId]: {
            ...currentObservation,
            quarters: {
              ...currentObservation.quarters,
              [quarter]: sanitizedQuarterData
            }
          }
        };

        get().updateAssessment(assessmentId, { observations: updatedObservations });
      },

      // Get assessment progress (considers all quarters - complete if any quarter is complete)
      getAssessmentProgress: (assessmentId, quarter = null) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return { total: 0, completed: 0, percentage: 0 };

        const total = assessment.scopeIds.length;

        // Helper to get testing status considering quarterly structure
        const getTestingStatus = (obs) => {
          if (!obs) return 'Not Started';

          // New quarterly structure
          if (obs.quarters) {
            if (quarter) {
              return obs.quarters[quarter]?.testingStatus || 'Not Started';
            }
            // If no specific quarter, consider complete if any quarter is complete
            const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            for (const q of quarters) {
              if (obs.quarters[q]?.testingStatus === 'Complete') return 'Complete';
            }
            for (const q of quarters) {
              if (obs.quarters[q]?.testingStatus === 'In Progress') return 'In Progress';
            }
            for (const q of quarters) {
              if (obs.quarters[q]?.testingStatus === 'Submitted') return 'Submitted';
            }
            return 'Not Started';
          }

          // Legacy structure
          return obs.testingStatus || 'Not Started';
        };

        const completed = assessment.scopeIds.filter(itemId => {
          const obs = assessment.observations[itemId];
          return getTestingStatus(obs) === 'Complete';
        }).length;

        const inProgress = assessment.scopeIds.filter(itemId => {
          const obs = assessment.observations[itemId];
          return getTestingStatus(obs) === 'In Progress';
        }).length;

        return {
          total,
          completed,
          inProgress,
          notStarted: total - completed - inProgress,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      },

      // Get items needing remediation
      getRemediationItems: (assessmentId) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return [];

        return assessment.scopeIds.filter(itemId => {
          const obs = assessment.observations[itemId];
          return obs && obs.remediation && (
            obs.remediation.ownerId ||
            obs.remediation.actionPlan ||
            obs.remediation.dueDate
          );
        }).map(itemId => ({
          itemId,
          ...assessment.observations[itemId]
        }));
      },

      // Undo
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          set({
            assessments: state.history[newIndex],
            historyIndex: newIndex
          });
        }
      },

      // Redo
      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          set({
            assessments: state.history[newIndex],
            historyIndex: newIndex
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Export assessment to CSV with quarterly columns
      // Optionally encrypt if a password is provided.
      exportAssessmentCSV: async (assessmentId, controlsStore, requirementsStore, userStore, { password } = {}) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          if (!user) return userId || '';
          return user.email ? `${user.name} <${user.email}>` : user.name;
        };

        const getItemName = (itemId) => {
          if (assessment.scopeType === 'controls') {
            const control = controlsStore.getState().getControl(itemId);
            return control ? control.controlId : itemId;
          } else {
            const req = requirementsStore.getState().getRequirement(itemId);
            return req ? req.id : itemId;
          }
        };

        const csvData = assessment.scopeIds.map(itemId => {
          const rawObs = assessment.observations[itemId] || {};
          const obs = rawObs.quarters ? rawObs : migrateObservationToQuarterly(rawObs) || { quarters: createDefaultQuarters() };
          const remediation = obs.remediation || {};

          const row = {
            'ID': escapeCSVValue(getItemName(itemId)),
            'Assessment': escapeCSVValue(assessment.name),
            'Scope Type': escapeCSVValue(assessment.scopeType),
            'Auditor': escapeCSVValue(getUserName(obs.auditorId)),
            'Test Procedure(s)': escapeCSVValue(obs.testProcedures || '')
          };

          // Add quarterly columns
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            const qData = obs.quarters?.[q] || createDefaultQuarter();
            row[`${q} Actual Score`] = qData.actualScore || 0;
            row[`${q} Target Score`] = qData.targetScore || 0;
            row[`${q} Observations`] = escapeCSVValue(qData.observations || '');
            row[`${q} Observation Date`] = qData.observationDate || '';
            row[`${q} Testing Status`] = qData.testingStatus || 'Not Started';
            row[`${q} Examine`] = qData.examine ? 'Yes' : 'No';
            row[`${q} Interview`] = qData.interview ? 'Yes' : 'No';
            row[`${q} Test`] = qData.test ? 'Yes' : 'No';
          });

          row['Linked Artifacts'] = escapeCSVValue((obs.linkedArtifacts || []).join('; '));
          row['Remediation Owner'] = escapeCSVValue(getUserName(remediation.ownerId));
          row['Action Plan'] = escapeCSVValue(remediation.actionPlan || '');
          row['Remediation Due Date'] = remediation.dueDate || '';

          return row;
        });

        const csv = Papa.unparse(csvData);
        const trimmedPassword = (password || '').trim();

        let blob;
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        const safeName = assessment.name.replace(/[^a-z0-9]/gi, '_');
        const baseFilename = `assessment_${safeName}_${date}.csv`;

        if (trimmedPassword) {
          const encoder = new TextEncoder();
          const encryptedBytes = await encryptBytesWithPassword(
            encoder.encode(csv),
            trimmedPassword
          );
          blob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
        } else {
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        }

        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          trimmedPassword ? buildEncryptedFilename(baseFilename) : baseFilename
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Clone assessment (for new assessment period)
      cloneAssessment: (assessmentId, newName) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return null;

        const newAssessment = {
          ...assessment,
          id: `ASM-${Date.now()}`,
          name: newName || `${assessment.name} (Copy)`,
          status: 'Not Started',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          // Reset all observations
          observations: {}
        };

        const updatedAssessments = [...get().assessments, newAssessment];
        get().setAssessments(updatedAssessments);
        return newAssessment;
      },

      // Import assessments from CSV with quarterly columns support
      // Supports both standard format AND Jira EVAL format:
      // - Jira Epic (Issue Type = "Epic") → React Assessment
      // - Jira Work paper with Parent/Parent key → React Observation within that Assessment
      importAssessmentsCSV: async (csvText, userStore) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

              // Detect if this is a Jira EVAL export (has Issue Type and Issue key columns)
              const isJiraFormat = results.meta.fields?.includes('Issue Type') &&
                results.meta.fields?.includes('Issue key');

              // Group rows by assessment name
              // Carry forward assessment name from previous row if current row is blank
              const assessmentGroups = {};
              let lastAssessmentName = null;
              let lastScopeType = 'controls';

              // For Jira format: First pass to identify Epics as Assessments
              const jiraEpics = {};
              if (isJiraFormat) {
                results.data.forEach(row => {
                  if (row['Issue Type'] === 'Epic') {
                    const epicKey = row['Issue key'];
                    const epicId = row['Issue id']; // Jira internal ID used in Parent field
                    jiraEpics[epicKey] = {
                      id: epicId,
                      key: epicKey,
                      name: row['Summary'] || epicKey,
                      description: row['Description'] || '',
                      jiraKey: epicKey
                    };
                    // Also map by ID for Parent field lookups
                    if (epicId) {
                      jiraEpics[epicId] = jiraEpics[epicKey];
                    }
                  }
                });
              }

              results.data.forEach(row => {
                let assessmentName;
                let assessmentJiraKey = null;

                if (isJiraFormat) {
                  // Skip Epic rows - they define assessments, not observations
                  if (row['Issue Type'] === 'Epic') return;

                  // For Work papers, find parent Epic to determine assessment
                  const parentKey = row['Parent key'] || row['Parent'];
                  const parentId = row['Parent'];

                  // Try to find the Epic by key or ID
                  const parentEpic = jiraEpics[parentKey] || jiraEpics[parentId];

                  if (parentEpic) {
                    assessmentName = parentEpic.name;
                    assessmentJiraKey = parentEpic.key;
                  } else if (parentKey || parentId) {
                    // Parent exists but Epic not found in this CSV - use parent key as assessment name
                    assessmentName = parentKey || `Assessment-${parentId}`;
                    assessmentJiraKey = parentKey;
                  } else {
                    // No parent - skip or use Summary as standalone
                    return;
                  }
                } else {
                  // Standard format
                  assessmentName = row['Assessment'] || row['Assessment Name'] || row.assessment;

                  // If assessment name is empty, use the last known assessment name
                  if (!assessmentName && lastAssessmentName) {
                    assessmentName = lastAssessmentName;
                  }
                }

                if (!assessmentName) return;

                // Track for subsequent rows
                lastAssessmentName = assessmentName;

                if (!assessmentGroups[assessmentName]) {
                  const scopeType = (row['Scope Type'] || row.scopeType || lastScopeType || 'controls').toLowerCase();
                  lastScopeType = scopeType;

                  // For Jira format, use Epic description if available
                  const epicInfo = assessmentJiraKey ? jiraEpics[assessmentJiraKey] : null;

                  assessmentGroups[assessmentName] = {
                    name: assessmentName,
                    description: epicInfo?.description || row['Description'] || row.description || '',
                    scopeType: scopeType,
                    frameworkFilter: row['Framework Filter'] || row.frameworkFilter || null,
                    jiraKey: assessmentJiraKey, // Store Jira Epic key for reference
                    rows: []
                  };
                }
                assessmentGroups[assessmentName].rows.push(row);
              });

              // Parse user string helper
              const parseUserString = (str) => {
                if (!str || !str.trim()) return null;
                str = str.trim();
                const match = str.match(/^(.+?)\s*<([^>]+)>$/);
                if (match) {
                  return { name: match[1].trim(), email: match[2].trim() };
                }
                if (str.includes('@')) {
                  const namePart = str.split('@')[0].replace(/[._]/g, ' ');
                  return { name: namePart, email: str };
                }
                return { name: str, email: null };
              };

              // Helper to convert Excel serial date to ISO date string (YYYY-MM-DD)
              const parseDate = (value) => {
                if (!value) return '';
                const str = String(value).trim();
                if (!str) return '';

                // Check if it's a number (Excel serial date)
                const num = parseFloat(str);
                if (!isNaN(num) && num > 1000 && num < 100000) {
                  // Excel serial date: days since January 1, 1900
                  // Note: Excel incorrectly treats 1900 as a leap year, so subtract 1 for dates after Feb 28, 1900
                  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 (to account for Excel's off-by-one)
                  const date = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
                  return date.toISOString().split('T')[0];
                }

                // Already a date string - return as-is
                return str;
              };

              // Helper to detect if CSV has quarterly columns
              const hasQuarterlyColumns = results.meta.fields?.some(f => f.startsWith('Q1 '));

              // Helper to parse quarter data from row
              const parseQuarterData = (row, quarter) => ({
                actualScore: parseFloat(row[`${quarter} Actual Score`]) || 0,
                targetScore: parseFloat(row[`${quarter} Target Score`]) || 0,
                observations: sanitizeInput(row[`${quarter} Observations`] || ''),
                observationDate: parseDate(row[`${quarter} Observation Date`]),
                testingStatus: row[`${quarter} Testing Status`] || 'Not Started',
                examine: (row[`${quarter} Examine`] || '').toLowerCase() === 'yes',
                interview: (row[`${quarter} Interview`] || '').toLowerCase() === 'yes',
                test: (row[`${quarter} Test`] || '').toLowerCase() === 'yes'
              });

              // Create assessments
              const newAssessments = Object.values(assessmentGroups).map(group => {
                const scopeIds = [];
                const observations = {};

                group.rows.forEach(row => {
                  // For Jira format, extract Control ID from custom field or Summary
                  let itemId;
                  if (isJiraFormat) {
                    itemId = row['Custom field (Control ID)'] ||
                      row['Custom field (Compliance Requirement)'] ||
                      // Parse from Summary if in format "WP-AssessmentName-ControlID-Quarter"
                      (() => {
                        const summary = row['Summary'] || '';
                        const match = summary.match(/^WP-.*?-(.+?)-Q\d$/);
                        return match ? match[1] : null;
                      })() ||
                      row['Issue key']; // Fallback to Jira key
                  } else {
                    itemId = row['ID'] || row['Item ID'] || row.itemId || row.id;
                  }
                  if (!itemId) return;

                  scopeIds.push(itemId);

                  // Parse auditor
                  let auditorId = null;
                  const auditorStr = row['Auditor'] || row.auditor;
                  if (auditorStr && findOrCreateUser) {
                    const info = parseUserString(auditorStr);
                    if (info) auditorId = findOrCreateUser(info);
                  }

                  // Parse remediation owner
                  let remediationOwnerId = null;
                  const remOwnerStr = row['Remediation Owner'] || row.remediationOwner;
                  if (remOwnerStr && findOrCreateUser) {
                    const info = parseUserString(remOwnerStr);
                    if (info) remediationOwnerId = findOrCreateUser(info);
                  }

                  if (isJiraFormat) {
                    // Jira EVAL format - each row is a single quarter's observation
                    const quarter = row['Custom field (Quarter)'] ||
                      (() => {
                        const summary = row['Summary'] || '';
                        const match = summary.match(/Q(\d)$/);
                        return match ? `Q${match[1]}` : 'Q1';
                      })();

                    // Parse assessment methods from custom field
                    const methodsStr = row['Custom field (Assessment Methods)'] || '';
                    const examine = methodsStr.toLowerCase().includes('examine');
                    const interview = methodsStr.toLowerCase().includes('interview');
                    const test = methodsStr.toLowerCase().includes('test');

                    // Get or create existing observation for this item
                    const existingObs = observations[itemId] || {
                      auditorId: null,
                      testProcedures: '',
                      linkedArtifacts: [],
                      remediation: { ownerId: null, actionPlan: '', dueDate: '' },
                      jiraKey: null,
                      quarters: createDefaultQuarters()
                    };

                    // Update with this row's data
                    existingObs.auditorId = auditorId || existingObs.auditorId;
                    existingObs.testProcedures = sanitizeInput(
                      row['Custom field (Test Procedures)'] ||
                      row['Custom field (Observations)'] ||
                      existingObs.testProcedures || ''
                    );
                    existingObs.jiraKey = row['Issue key'] || existingObs.jiraKey;
                    existingObs.linkedArtifacts = (row['Custom field (Artifacts)'] || '')
                      .split(';').map(s => s.trim()).filter(Boolean);

                    // Update the specific quarter
                    if (['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) {
                      existingObs.quarters[quarter] = {
                        actualScore: parseFloat(row['Custom field (Q1 Actual Score)'] ||
                          row['Custom field (Q2 Actual Score)'] ||
                          row['Custom field (Q3 Actual Score)'] ||
                          row['Custom field (Q4 Actual Score)'] ||
                          row['Custom field (Actual Score)']) || 0,
                        targetScore: parseFloat(row['Custom field (Q1 Target Score)'] ||
                          row['Custom field (Q2 Target Score)'] ||
                          row['Custom field (Q3 Target Score)'] ||
                          row['Custom field (Q4 Target Score)'] ||
                          row['Custom field (Target Score)']) || 0,
                        observations: sanitizeInput(row['Custom field (Observations)'] || row['Description'] || ''),
                        observationDate: parseDate(row['Created'] || row['Updated'] || ''),
                        testingStatus: row['Custom field (Testing Status)'] || row['Status'] || 'Not Started',
                        examine,
                        interview,
                        test
                      };
                    }

                    observations[itemId] = existingObs;
                  } else if (hasQuarterlyColumns) {
                    // New quarterly format
                    observations[itemId] = {
                      auditorId,
                      testProcedures: sanitizeInput(row['Test Procedure(s)'] || row['Test Procedures'] || ''),
                      linkedArtifacts: (row['Linked Artifacts'] || row.linkedArtifacts || '')
                        .split(';').map(s => s.trim()).filter(Boolean),
                      remediation: {
                        ownerId: remediationOwnerId,
                        actionPlan: sanitizeInput(row['Action Plan'] || row.actionPlan || ''),
                        dueDate: parseDate(row['Remediation Due Date'] || row['Due Date'] || row.dueDate)
                      },
                      quarters: {
                        Q1: parseQuarterData(row, 'Q1'),
                        Q2: parseQuarterData(row, 'Q2'),
                        Q3: parseQuarterData(row, 'Q3'),
                        Q4: parseQuarterData(row, 'Q4')
                      }
                    };
                  } else {
                    // Legacy single-period format - migrate to Q1
                    observations[itemId] = {
                      auditorId,
                      testProcedures: sanitizeInput(row['Test Procedure(s)'] || row['Test Procedures'] || ''),
                      linkedArtifacts: (row['Linked Artifacts'] || row.linkedArtifacts || '')
                        .split(';').map(s => s.trim()).filter(Boolean),
                      remediation: {
                        ownerId: remediationOwnerId,
                        actionPlan: sanitizeInput(row['Action Plan'] || row.actionPlan || ''),
                        dueDate: parseDate(row['Remediation Due Date'] || row['Due Date'] || row.dueDate)
                      },
                      quarters: {
                        Q1: {
                          actualScore: parseFloat(row['Actual Score'] || row.actualScore) || 0,
                          targetScore: parseFloat(row['Target Score'] || row.targetScore) || 0,
                          observations: sanitizeInput(row['Observations'] || row.observations || ''),
                          observationDate: parseDate(row['Observation Date'] || row.observationDate),
                          testingStatus: row['Testing Status'] || row.testingStatus || 'Not Started',
                          examine: (row['Examine'] || '').toLowerCase() === 'yes',
                          interview: (row['Interview'] || '').toLowerCase() === 'yes',
                          test: (row['Test'] || '').toLowerCase() === 'yes'
                        },
                        Q2: createDefaultQuarter(),
                        Q3: createDefaultQuarter(),
                        Q4: createDefaultQuarter()
                      }
                    };
                  }
                });

                return {
                  id: `ASM-${uuidv4()}`,
                  name: group.name,
                  description: group.description,
                  scopeType: group.scopeType,
                  scopeIds: [...new Set(scopeIds)],
                  frameworkFilter: group.frameworkFilter,
                  jiraKey: group.jiraKey || null, // Store Jira Epic key for sync reference
                  status: 'Not Started',
                  createdDate: new Date().toISOString(),
                  lastModified: new Date().toISOString(),
                  observations
                };
              });

              // Add to existing assessments
              const updatedAssessments = [...get().assessments, ...newAssessments];
              get().setAssessments(updatedAssessments);
              resolve(newAssessments.length);
            },
            error: (error) => {
              reject(new Error('Failed to import CSV file. Please verify the file format.'));
            }
          });
        });
      },

      // Export assessment to Jira EVAL project format (Control Evaluations)
      // Includes Epic row for assessment + Work paper rows for observations
      exportForJiraCSV: (assessmentId, controlsStore, requirementsStore, userStore) => {
        const assessment = get().getAssessment(assessmentId);
        if (!assessment) return;

        const users = userStore?.getState?.()?.users || [];
        const getUserEmail = (userId) => {
          const user = users.find(u => u.id === userId);
          return user?.email || '';
        };

        const getControlDetails = (itemId) => {
          if (assessment.scopeType === 'controls') {
            const control = controlsStore?.getState?.()?.getControl?.(itemId);
            return {
              id: control?.controlId || itemId,
              linkedReqs: control?.linkedRequirementIds?.join(', ') || ''
            };
          }
          return { id: itemId, linkedReqs: '' };
        };

        // Generate smart-embed URL if available
        const getSmartEmbedUrl = (requirementId) => {
          try {
            const { getSmartEmbedUrlForRequirement } = require('../utils/confluenceSync');
            return getSmartEmbedUrlForRequirement(requirementId) || '';
          } catch {
            return '';
          }
        };

        const csvData = [];

        // First row: Epic representing the Assessment
        // Use existing jiraKey if available, otherwise generate a new one
        const epicKey = assessment.jiraKey || `EVAL-EPIC-${assessment.id}`;
        csvData.push({
          'Summary': escapeCSVValue(assessment.name),
          'Issue Type': 'Epic',
          'Issue key': epicKey,
          'Project key': 'EVAL',
          'Description': escapeCSVValue(assessment.description || `CSF Assessment: ${assessment.name}\nScope Type: ${assessment.scopeType}\nCreated: ${assessment.createdDate}`),
          'Status': assessment.status || 'Not Started',
          // Empty custom fields for Epic row
          'Assignee': '',
          'Custom field (Control ID)': '',
          'Custom field (Compliance Requirement)': '',
          'Custom field (Quarter)': '',
          'Custom field (Q1 Actual Score)': '',
          'Custom field (Q1 Target Score)': '',
          'Custom field (Q2 Actual Score)': '',
          'Custom field (Q2 Target Score)': '',
          'Custom field (Q3 Actual Score)': '',
          'Custom field (Q3 Target Score)': '',
          'Custom field (Q4 Actual Score)': '',
          'Custom field (Q4 Target Score)': '',
          'Custom field (Testing Status)': '',
          'Custom field (Test Procedures)': '',
          'Custom field (Observations)': '',
          'Custom field (Assessment Methods)': '',
          'Custom field (Artifacts)': '',
          'Parent': '',
          'Parent key': ''
        });

        // Create one row per control per quarter that has data (Work papers)
        assessment.scopeIds.forEach(itemId => {
          const rawObs = assessment.observations[itemId] || {};
          const obs = rawObs.quarters ? rawObs : migrateObservationToQuarterly(rawObs) || { quarters: createDefaultQuarters() };
          const controlDetails = getControlDetails(itemId);

          // Create separate issues for each quarter with data
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
            const qData = obs.quarters?.[quarter] || createDefaultQuarter();

            // Skip quarters with no meaningful data
            if (qData.testingStatus === 'Not Started' && !qData.observations && qData.actualScore === 0) {
              return;
            }

            // Build assessment methods string
            const methods = [];
            if (qData.examine) methods.push('Examine');
            if (qData.interview) methods.push('Interview');
            if (qData.test) methods.push('Test');

            // Build description with smart-embed if available
            let description = `Control Evaluation for ${controlDetails.id} - ${quarter}\n\n`;
            description += `Test Procedures:\n${obs.testProcedures || 'N/A'}\n\n`;
            description += `Observations:\n${qData.observations || 'N/A'}\n\n`;
            description += `Assessment Methods: ${methods.join(', ') || 'None'}\n\n`;
            if (controlDetails.linkedReqs) {
              description += `Linked Requirements: ${controlDetails.linkedReqs}\n`;
              const smartEmbedUrl = getSmartEmbedUrl(controlDetails.linkedReqs.split(',')[0]?.trim());
              if (smartEmbedUrl) {
                description += `\nView in Confluence: ${smartEmbedUrl}`;
              }
            }
            if ((obs.linkedArtifacts || []).length > 0) {
              description += `\nLinked Artifacts: ${obs.linkedArtifacts.join(', ')}`;
            }

            csvData.push({
              'Summary': escapeCSVValue(`WP-${assessment.name}-${controlDetails.id}-${quarter}`),
              'Issue Type': 'Work paper',
              'Issue key': obs.jiraKey || '', // Include Jira key if synced
              'Project key': 'EVAL',
              'Parent': epicKey, // Link to parent Epic (Assessment)
              'Parent key': epicKey,
              'Assignee': escapeCSVValue(getUserEmail(obs.auditorId)),
              'Custom field (Control ID)': escapeCSVValue(controlDetails.id),
              'Custom field (Compliance Requirement)': escapeCSVValue(controlDetails.linkedReqs),
              'Custom field (Quarter)': quarter,
              'Custom field (Q1 Actual Score)': quarter === 'Q1' ? qData.actualScore : '',
              'Custom field (Q1 Target Score)': quarter === 'Q1' ? qData.targetScore : '',
              'Custom field (Q2 Actual Score)': quarter === 'Q2' ? qData.actualScore : '',
              'Custom field (Q2 Target Score)': quarter === 'Q2' ? qData.targetScore : '',
              'Custom field (Q3 Actual Score)': quarter === 'Q3' ? qData.actualScore : '',
              'Custom field (Q3 Target Score)': quarter === 'Q3' ? qData.targetScore : '',
              'Custom field (Q4 Actual Score)': quarter === 'Q4' ? qData.actualScore : '',
              'Custom field (Q4 Target Score)': quarter === 'Q4' ? qData.targetScore : '',
              'Custom field (Testing Status)': qData.testingStatus,
              'Custom field (Test Procedures)': escapeCSVValue(obs.testProcedures || ''),
              'Custom field (Observations)': escapeCSVValue(qData.observations || ''),
              'Custom field (Assessment Methods)': methods.join(', '),
              'Custom field (Artifacts)': escapeCSVValue((obs.linkedArtifacts || []).join('; ')),
              'Description': escapeCSVValue(description)
            });
          });
        });

        // If only the Epic row exists (no work papers with data), still export the Epic
        if (csvData.length === 1) {
          // Keep the Epic row, just log that there's no work paper data
          console.info('Exporting assessment Epic with no work paper data');
        }

        if (csvData.length === 0) {
          console.warn('No data to export for Jira');
          return;
        }

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        const safeName = assessment.name.replace(/[^a-z0-9]/gi, '_');

        link.setAttribute('href', url);
        link.setAttribute('download', `jira_eval_import_${safeName}_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Export all assessments to Jira EVAL format
      // Includes Epic rows for each assessment + Work paper rows for observations
      exportAllForJiraCSV: (controlsStore, requirementsStore, userStore) => {
        const assessments = get().assessments;
        if (assessments.length === 0) return;

        const users = userStore?.getState?.()?.users || [];
        const getUserEmail = (userId) => {
          const user = users.find(u => u.id === userId);
          return user?.email || '';
        };

        const csvData = [];

        assessments.forEach(assessment => {
          // First: Epic row representing the Assessment
          const epicKey = assessment.jiraKey || `EVAL-EPIC-${assessment.id}`;
          csvData.push({
            'Summary': assessment.name,
            'Issue Type': 'Epic',
            'Issue key': epicKey,
            'Project key': 'EVAL',
            'Description': assessment.description || `CSF Assessment: ${assessment.name}\nScope Type: ${assessment.scopeType}\nCreated: ${assessment.createdDate}`,
            'Status': assessment.status || 'Not Started',
            'Parent': '',
            'Parent key': '',
            'Assignee': '',
            'Custom field (Control ID)': '',
            'Custom field (Compliance Requirement)': '',
            'Custom field (Quarter)': '',
            'Custom field (Actual Score)': '',
            'Custom field (Target Score)': '',
            'Custom field (Testing Status)': '',
            'Custom field (Test Procedures)': '',
            'Custom field (Observations)': '',
            'Custom field (Assessment Methods)': '',
            'Custom field (Artifacts)': ''
          });

          const getControlDetails = (itemId) => {
            if (assessment.scopeType === 'controls') {
              const control = controlsStore?.getState?.()?.getControl?.(itemId);
              return {
                id: control?.controlId || itemId,
                linkedReqs: control?.linkedRequirementIds?.join(', ') || ''
              };
            }
            return { id: itemId, linkedReqs: '' };
          };

          // Then: Work paper rows for each observation
          assessment.scopeIds.forEach(itemId => {
            const rawObs = assessment.observations[itemId] || {};
            const obs = rawObs.quarters ? rawObs : migrateObservationToQuarterly(rawObs) || { quarters: createDefaultQuarters() };
            const controlDetails = getControlDetails(itemId);

            ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
              const qData = obs.quarters?.[quarter] || createDefaultQuarter();

              if (qData.testingStatus === 'Not Started' && !qData.observations && qData.actualScore === 0) {
                return;
              }

              const methods = [];
              if (qData.examine) methods.push('Examine');
              if (qData.interview) methods.push('Interview');
              if (qData.test) methods.push('Test');

              csvData.push({
                'Summary': `WP-${assessment.name}-${controlDetails.id}-${quarter}`,
                'Issue Type': 'Work paper',
                'Issue key': obs.jiraKey || '',
                'Project key': 'EVAL',
                'Parent': epicKey, // Link to parent Epic (Assessment)
                'Parent key': epicKey,
                'Assignee': getUserEmail(obs.auditorId),
                'Custom field (Control ID)': controlDetails.id,
                'Custom field (Compliance Requirement)': controlDetails.linkedReqs,
                'Custom field (Quarter)': quarter,
                'Custom field (Actual Score)': qData.actualScore,
                'Custom field (Target Score)': qData.targetScore,
                'Custom field (Testing Status)': qData.testingStatus,
                'Custom field (Test Procedures)': obs.testProcedures || '',
                'Custom field (Observations)': qData.observations || '',
                'Custom field (Assessment Methods)': methods.join(', '),
                'Custom field (Artifacts)': (obs.linkedArtifacts || []).join('; '),
                'Description': `Control Evaluation for ${controlDetails.id} - ${quarter}\n\nAssessment: ${assessment.name}`
              });
            });
          });
        });

        if (csvData.length === 0) return;

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `jira_eval_import_all_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Export all assessments to CSV with quarterly columns
      exportAllAssessmentsCSV: async (controlsStore, requirementsStore, userStore, { password } = {}) => {
        const assessments = get().assessments;
        if (assessments.length === 0) return;

        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          if (!user) return userId || '';
          return user.email ? `${user.name} <${user.email}>` : user.name;
        };

        const csvData = [];

        assessments.forEach(assessment => {
          const getItemName = (itemId) => {
            if (assessment.scopeType === 'controls') {
              const control = controlsStore.getState().getControl(itemId);
              return control ? control.controlId : itemId;
            } else {
              const req = requirementsStore.getState().getRequirement(itemId);
              return req ? req.id : itemId;
            }
          };

          assessment.scopeIds.forEach(itemId => {
            const rawObs = assessment.observations[itemId] || {};
            const obs = rawObs.quarters ? rawObs : migrateObservationToQuarterly(rawObs) || { quarters: createDefaultQuarters() };
            const remediation = obs.remediation || {};

            const row = {
              'ID': escapeCSVValue(getItemName(itemId)),
              'Assessment': escapeCSVValue(assessment.name),
              'Description': escapeCSVValue(assessment.description || ''),
              'Scope Type': escapeCSVValue(assessment.scopeType),
              'Framework Filter': escapeCSVValue(assessment.frameworkFilter || ''),
              'Auditor': escapeCSVValue(getUserName(obs.auditorId)),
              'Test Procedure(s)': escapeCSVValue(obs.testProcedures || '')
            };

            // Add quarterly columns
            ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
              const qData = obs.quarters?.[q] || createDefaultQuarter();
              row[`${q} Actual Score`] = qData.actualScore || 0;
              row[`${q} Target Score`] = qData.targetScore || 0;
              row[`${q} Observations`] = escapeCSVValue(qData.observations || '');
              row[`${q} Observation Date`] = qData.observationDate || '';
              row[`${q} Testing Status`] = qData.testingStatus || 'Not Started';
              row[`${q} Examine`] = qData.examine ? 'Yes' : 'No';
              row[`${q} Interview`] = qData.interview ? 'Yes' : 'No';
              row[`${q} Test`] = qData.test ? 'Yes' : 'No';
            });

            row['Linked Artifacts'] = escapeCSVValue((obs.linkedArtifacts || []).join('; '));
            row['Remediation Owner'] = escapeCSVValue(getUserName(remediation.ownerId));
            row['Action Plan'] = escapeCSVValue(remediation.actionPlan || '');
            row['Remediation Due Date'] = remediation.dueDate || '';

            csvData.push(row);
          });
        });

        const csv = Papa.unparse(csvData);
        const date = new Date().toISOString().split('T')[0];
        const baseFilename = `assessments_${date}.csv`;

        let blob;
        let filename;

        if (password && String(password).trim().length > 0) {
          const encoder = new TextEncoder();
          const plaintextBytes = encoder.encode(csv);
          const encryptedBytes = await encryptBytesWithPassword(plaintextBytes, String(password));
          blob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
          filename = buildEncryptedFilename(baseFilename);
        } else {
          blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          filename = baseFilename;
        }

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      // ============ EVALUATIONS STORE INTEGRATION ============
      // NOTE: The embedded `observations` object is DEPRECATED.
      // New code should use evaluationsStore for point-in-time evaluation data.
      // These methods provide migration and compatibility.

      /**
       * Get scope control IDs (alias for scopeIds with preferred naming)
       * scopeIds holds control IDs for assessments that scope by controls
       */
      getScopeControlIds: (assessmentId) => {
        const assessment = get().getAssessment(assessmentId);
        return assessment?.scopeIds || [];
      },

      /**
       * Set scope control IDs
       */
      setScopeControlIds: (assessmentId, controlIds) => {
        get().updateAssessment(assessmentId, { scopeIds: controlIds });
      },

      /**
       * Migrate embedded observations to evaluationsStore.
       * This extracts quarterly observation data and creates Evaluation entities.
       * Should be called once during app migration.
       *
       * @param {Object} evaluationsStore - The evaluations store instance
       * @returns {number} Number of evaluations created
       */
      migrateObservationsToEvaluations: (evaluationsStore) => {
        const assessments = get().assessments;
        const evaluationsData = [];

        assessments.forEach(assessment => {
          const observations = assessment.observations || {};

          Object.entries(observations).forEach(([controlId, obs]) => {
            // Skip if no quarterly data
            if (!obs.quarters) {
              // Try to migrate old format
              const migrated = migrateObservationToQuarterly(obs);
              if (!migrated?.quarters) return;
              obs = migrated;
            }

            ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
              const qData = obs.quarters[quarter];

              // Skip empty quarters (no meaningful data)
              if (!qData ||
                (qData.testingStatus === 'Not Started' &&
                  !qData.observations &&
                  qData.actualScore === 0 &&
                  qData.targetScore === 0)) {
                return;
              }

              evaluationsData.push({
                assessmentId: assessment.id,
                controlId,
                quarter,
                auditorId: obs.auditorId,
                actualScore: qData.actualScore,
                targetScore: qData.targetScore,
                observations: qData.observations,
                testProcedures: obs.testProcedures,
                testingStatus: qData.testingStatus,
                examine: qData.examine,
                interview: qData.interview,
                test: qData.test,
                evaluationDate: qData.observationDate,
                linkedArtifactIds: obs.linkedArtifacts || [],
                remediation: obs.remediation,
                jiraKey: obs.jiraKey,
                createdDate: assessment.createdDate
              });
            });
          });
        });

        // Use evaluationsStore bulk create
        const count = evaluationsStore.getState().bulkCreateEvaluations(evaluationsData);
        console.log(`[assessmentsStore] Migrated ${count} evaluations from ${assessments.length} assessments`);
        return count;
      },

      /**
       * Get evaluations for an assessment from evaluationsStore.
       * This is the NEW way to access evaluation data.
       *
       * @param {string} assessmentId - Assessment ID
       * @param {Object} evaluationsStore - The evaluations store instance
       * @returns {Array} Evaluation objects
       */
      getEvaluationsFromStore: (assessmentId, evaluationsStore) => {
        return evaluationsStore.getState().getEvaluationsByAssessment(assessmentId);
      },

      /**
       * Check if assessment has been migrated to evaluationsStore.
       * An assessment is "migrated" if it has evaluations in evaluationsStore.
       *
       * @param {string} assessmentId - Assessment ID
       * @param {Object} evaluationsStore - The evaluations store instance
       * @returns {boolean}
       */
      isMigratedToEvaluations: (assessmentId, evaluationsStore) => {
        const evals = evaluationsStore.getState().getEvaluationsByAssessment(assessmentId);
        return evals.length > 0;
      }
    }),
    {
      name: 'csf-assessments-storage',
      version: 5,
      migrate: (persistedState, version) => {
        // Version 1: Migrate observations to quarterly structure
        if (version === 0 && persistedState?.assessments) {
          const migratedAssessments = persistedState.assessments.map(assessment => {
            if (!assessment.observations) return assessment;

            const migratedObservations = {};
            Object.entries(assessment.observations).forEach(([itemId, obs]) => {
              // Only migrate if not already in quarterly format
              if (!obs.quarters) {
                migratedObservations[itemId] = migrateObservationToQuarterly(obs);
              } else {
                migratedObservations[itemId] = obs;
              }
            });

            return {
              ...assessment,
              observations: migratedObservations
            };
          });

          return {
            ...persistedState,
            assessments: migratedAssessments
          };
        }
        // Version 2: Added default assessment for new installations
        // Existing users with data keep their assessments, new users get defaults
        if (version < 2) {
          if (persistedState?.assessments?.length > 0) {
            // Existing user with data - keep their assessments
            return persistedState;
          }
          // New user or empty state - use defaults
          return { assessments: DEFAULT_ASSESSMENTS, currentAssessmentId: null };
        }
        // Version 3: Update default assessment with corrected CSV data (Q1-Q4 scores)
        if (version < 3) {
          const assessments = persistedState?.assessments || [];
          const updatedAssessments = assessments.map(assessment => {
            // Only update the default Alma Security assessment
            if (assessment.id === 'ASM-default-2025-alma') {
              return {
                ...assessment,
                observations: UPDATED_OBSERVATIONS
              };
            }
            return assessment;
          });
          return {
            ...persistedState,
            assessments: updatedAssessments
          };
        }
        // Version 4: Fix scopeType from 'controls' to 'requirements'
        // The scopeIds are subcategory/requirement IDs, not control IDs
        if (version < 4) {
          const assessments = persistedState?.assessments || [];
          const updatedAssessments = assessments.map(assessment => {
            // Fix scopeType for assessments that have requirement/subcategory-style IDs
            if (assessment.scopeType === 'controls' && assessment.scopeIds?.length > 0) {
              const firstId = assessment.scopeIds[0];
              // If IDs look like subcategory IDs (e.g., GV.SC-04, DE.AE-02) or requirement IDs (e.g., GV.SC-04 Ex1)
              if (firstId && /^[A-Z]{2}\.[A-Z]{2,3}-\d{2}/.test(firstId)) {
                return {
                  ...assessment,
                  scopeType: 'requirements'
                };
              }
            }
            return assessment;
          });
          return {
            ...persistedState,
            assessments: updatedAssessments
          };
        }
        // Version 5: Re-run scopeType fix with improved regex for subcategory IDs
        // Handles cases like GV.SC-02, DE.CM-03 that were missed in v4
        if (version < 5) {
          const assessments = persistedState?.assessments || [];
          const updatedAssessments = assessments.map(assessment => {
            if (assessment.scopeType === 'controls' && assessment.scopeIds?.length > 0) {
              const firstId = assessment.scopeIds[0];
              // Match subcategory IDs: XX.YY-NN or XX.YYY-NN (e.g., GV.SC-02, DE.CM-03)
              if (firstId && /^[A-Z]{2}\.[A-Z]{2,3}-\d{2}/.test(firstId)) {
                return {
                  ...assessment,
                  scopeType: 'requirements'
                };
              }
            }
            return assessment;
          });
          return {
            ...persistedState,
            assessments: updatedAssessments
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        assessments: state.assessments,
        currentAssessmentId: state.currentAssessmentId
      })
    }
  )
);

export default useAssessmentsStore;
