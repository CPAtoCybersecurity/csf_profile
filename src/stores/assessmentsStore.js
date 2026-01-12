import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { sanitizeInput } from '../utils/sanitize';
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
    scopeType: 'controls',
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
      exportAssessmentCSV: (assessmentId, controlsStore, requirementsStore, userStore) => {
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
            'ID': getItemName(itemId),
            'Assessment': assessment.name,
            'Scope Type': assessment.scopeType,
            'Auditor': getUserName(obs.auditorId),
            'Test Procedure(s)': obs.testProcedures || ''
          };

          // Add quarterly columns
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            const qData = obs.quarters?.[q] || createDefaultQuarter();
            row[`${q} Actual Score`] = qData.actualScore || 0;
            row[`${q} Target Score`] = qData.targetScore || 0;
            row[`${q} Observations`] = qData.observations || '';
            row[`${q} Observation Date`] = qData.observationDate || '';
            row[`${q} Testing Status`] = qData.testingStatus || 'Not Started';
            row[`${q} Examine`] = qData.examine ? 'Yes' : 'No';
            row[`${q} Interview`] = qData.interview ? 'Yes' : 'No';
            row[`${q} Test`] = qData.test ? 'Yes' : 'No';
          });

          row['Linked Artifacts'] = (obs.linkedArtifacts || []).join('; ');
          row['Remediation Owner'] = getUserName(remediation.ownerId);
          row['Action Plan'] = remediation.actionPlan || '';
          row['Remediation Due Date'] = remediation.dueDate || '';

          return row;
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        const safeName = assessment.name.replace(/[^a-z0-9]/gi, '_');

        link.setAttribute('href', url);
        link.setAttribute('download', `assessment_${safeName}_${date}.csv`);
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
      importAssessmentsCSV: async (csvText, userStore) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

              // Group rows by assessment name
              // Carry forward assessment name from previous row if current row is blank
              const assessmentGroups = {};
              let lastAssessmentName = null;
              let lastScopeType = 'controls';

              results.data.forEach(row => {
                let assessmentName = row['Assessment'] || row['Assessment Name'] || row.assessment;

                // If assessment name is empty, use the last known assessment name
                if (!assessmentName && lastAssessmentName) {
                  assessmentName = lastAssessmentName;
                }

                if (!assessmentName) return;

                // Track for subsequent rows
                lastAssessmentName = assessmentName;

                if (!assessmentGroups[assessmentName]) {
                  const scopeType = (row['Scope Type'] || row.scopeType || lastScopeType || 'controls').toLowerCase();
                  lastScopeType = scopeType;
                  assessmentGroups[assessmentName] = {
                    name: assessmentName,
                    description: row['Description'] || row.description || '',
                    scopeType: scopeType,
                    frameworkFilter: row['Framework Filter'] || row.frameworkFilter || null,
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
                  const itemId = row['ID'] || row['Item ID'] || row.itemId || row.id;
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

                  if (hasQuarterlyColumns) {
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
                  id: `ASM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: group.name,
                  description: group.description,
                  scopeType: group.scopeType,
                  scopeIds: [...new Set(scopeIds)],
                  frameworkFilter: group.frameworkFilter,
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
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        });
      },

      // Export assessment to Jira EVAL project format (Control Evaluations)
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

        // Create one row per control per quarter that has data
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
              'Summary': `WP-${assessment.name}-${controlDetails.id}-${quarter}`,
              'Issue Type': 'Work paper',
              'Project key': 'EVAL',
              'Assignee': getUserEmail(obs.auditorId),
              'Custom field (Control ID)': controlDetails.id,
              'Custom field (Compliance Requirement)': controlDetails.linkedReqs,
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
              'Custom field (Test Procedures)': obs.testProcedures || '',
              'Custom field (Observations)': qData.observations || '',
              'Custom field (Assessment Methods)': methods.join(', '),
              'Custom field (Artifacts)': (obs.linkedArtifacts || []).join('; '),
              'Description': description
            });
          });
        });

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
                'Project key': 'EVAL',
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
      exportAllAssessmentsCSV: (controlsStore, requirementsStore, userStore) => {
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
              'ID': getItemName(itemId),
              'Assessment': assessment.name,
              'Description': assessment.description || '',
              'Scope Type': assessment.scopeType,
              'Framework Filter': assessment.frameworkFilter || '',
              'Auditor': getUserName(obs.auditorId),
              'Test Procedure(s)': obs.testProcedures || ''
            };

            // Add quarterly columns
            ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
              const qData = obs.quarters?.[q] || createDefaultQuarter();
              row[`${q} Actual Score`] = qData.actualScore || 0;
              row[`${q} Target Score`] = qData.targetScore || 0;
              row[`${q} Observations`] = qData.observations || '';
              row[`${q} Observation Date`] = qData.observationDate || '';
              row[`${q} Testing Status`] = qData.testingStatus || 'Not Started';
              row[`${q} Examine`] = qData.examine ? 'Yes' : 'No';
              row[`${q} Interview`] = qData.interview ? 'Yes' : 'No';
              row[`${q} Test`] = qData.test ? 'Yes' : 'No';
            });

            row['Linked Artifacts'] = (obs.linkedArtifacts || []).join('; ');
            row['Remediation Owner'] = getUserName(remediation.ownerId);
            row['Action Plan'] = remediation.actionPlan || '';
            row['Remediation Due Date'] = remediation.dueDate || '';

            csvData.push(row);
          });
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `assessments_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }),
    {
      name: 'csf-assessments-storage',
      version: 3,
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
