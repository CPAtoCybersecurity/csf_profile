import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { sanitizeInput, escapeCSVValue } from '../utils/sanitize';
import { DEFAULT_CONTROLS } from './defaultControlsData';

const useControlsStore = create(
  persist(
    (set, get) => ({
      controls: DEFAULT_CONTROLS,
      loading: false,
      error: null,

      // History for undo/redo
      history: [],
      historyIndex: -1,

      // Set controls data with history tracking
      setControls: (controls) => {
        const state = get();
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(state.controls);

        if (newHistory.length > 50) {
          newHistory.shift();
        }

        set({
          controls,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          loading: false,
          error: null
        });
      },

      // Get all controls
      getControls: () => get().controls,

      // Get control by ID
      getControl: (controlId) => {
        return get().controls.find(c => c.controlId === controlId);
      },

      // Get controls by owner
      getControlsByOwner: (ownerId) => {
        return get().controls.filter(c => c.ownerId === ownerId);
      },

      // Get controls that link to a specific requirement
      getControlsByRequirement: (requirementId) => {
        return get().controls.filter(c =>
          c.linkedRequirementIds && c.linkedRequirementIds.includes(requirementId)
        );
      },

      // Get controls that cover requirements from a specific framework
      getControlsByFramework: (frameworkId, requirementsStore) => {
        const frameworkReqIds = requirementsStore.getState()
          .getRequirementsByFramework(frameworkId)
          .map(r => r.id);

        return get().controls.filter(c =>
          c.linkedRequirementIds &&
          c.linkedRequirementIds.some(reqId => frameworkReqIds.includes(reqId))
        );
      },

      // Create new control
      createControl: (controlData) => {
        const newControl = {
          controlId: controlData.controlId || `CTL-${String(get().controls.length + 1).padStart(3, '0')}`,
          implementationDescription: sanitizeInput(controlData.implementationDescription || ''),
          ownerId: controlData.ownerId || null,
          stakeholderIds: controlData.stakeholderIds || [],
          linkedRequirementIds: controlData.linkedRequirementIds || [],
          status: controlData.status || 'Not Implemented',
          // Optional fields from migration
          artifacts: controlData.artifacts || '',
          findings: controlData.findings || '',
          controlEvaluationBackLink: controlData.controlEvaluationBackLink || '',
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };

        const updatedControls = [...get().controls, newControl];
        get().setControls(updatedControls);
        return newControl;
      },

      // Get or create control for a requirement (auto-creates for CSF where controlId = requirement.id)
      getOrCreateControlForRequirement: (requirement) => {
        // For CSF, use requirement.id as control ID
        const controlId = requirement.id;
        const existingControl = get().getControl(controlId);

        if (existingControl) {
          return existingControl;
        }

        // Auto-create control linked to this requirement
        return get().createControl({
          controlId,
          linkedRequirementIds: [requirement.id],
          status: 'Not Implemented'
        });
      },

      // Bulk get or create controls for multiple requirements
      ensureControlsForRequirements: (requirements) => {
        const results = [];
        requirements.forEach(req => {
          results.push(get().getOrCreateControlForRequirement(req));
        });
        return results;
      },

      // Update existing control
      updateControl: (controlId, updates) => {
        const sanitizedUpdates = {
          ...updates,
          implementationDescription: updates.implementationDescription
            ? sanitizeInput(updates.implementationDescription)
            : updates.implementationDescription,
          lastModified: new Date().toISOString()
        };

        const updatedControls = get().controls.map(c =>
          c.controlId === controlId ? { ...c, ...sanitizedUpdates } : c
        );
        get().setControls(updatedControls);
      },

      // Delete control
      deleteControl: (controlId) => {
        const updatedControls = get().controls.filter(c => c.controlId !== controlId);
        get().setControls(updatedControls);
      },

      // Link requirement to control
      linkRequirement: (controlId, requirementId) => {
        const control = get().getControl(controlId);
        if (!control) return;

        const linkedRequirementIds = control.linkedRequirementIds || [];
        if (!linkedRequirementIds.includes(requirementId)) {
          get().updateControl(controlId, {
            linkedRequirementIds: [...linkedRequirementIds, requirementId]
          });
        }
      },

      // Unlink requirement from control
      unlinkRequirement: (controlId, requirementId) => {
        const control = get().getControl(controlId);
        if (!control) return;

        const linkedRequirementIds = (control.linkedRequirementIds || [])
          .filter(id => id !== requirementId);
        get().updateControl(controlId, { linkedRequirementIds });
      },

      // Bulk link requirements to control
      bulkLinkRequirements: (controlId, requirementIds) => {
        const control = get().getControl(controlId);
        if (!control) return;

        const existingIds = control.linkedRequirementIds || [];
        const newIds = [...new Set([...existingIds, ...requirementIds])];
        get().updateControl(controlId, { linkedRequirementIds: newIds });
      },

      // Get coverage statistics
      getCoverageStats: (frameworkId, requirementsStore) => {
        const frameworkReqs = requirementsStore.getState()
          .getRequirementsByFramework(frameworkId);
        const totalReqs = frameworkReqs.length;

        const coveredReqIds = new Set();
        get().controls.forEach(control => {
          (control.linkedRequirementIds || []).forEach(reqId => {
            if (frameworkReqs.some(r => r.id === reqId)) {
              coveredReqIds.add(reqId);
            }
          });
        });

        return {
          total: totalReqs,
          covered: coveredReqIds.size,
          percentage: totalReqs > 0 ? Math.round((coveredReqIds.size / totalReqs) * 100) : 0
        };
      },

      // Undo
      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          set({
            controls: state.history[newIndex],
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
            controls: state.history[newIndex],
            historyIndex: newIndex
          });
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      // Helper to parse "name <email>" format
      parseUserString: (str) => {
        if (!str || !str.trim()) return null;
        str = str.trim();

        // Match "name <email>" format
        const match = str.match(/^(.+?)\s*<([^>]+)>$/);
        if (match) {
          return { name: match[1].trim(), email: match[2].trim() };
        }

        // Check if it's just an email
        if (str.includes('@')) {
          const namePart = str.split('@')[0].replace(/[._]/g, ' ');
          return { name: namePart, email: str };
        }

        // Just a name or ID
        return { name: str, email: null };
      },

      // Import controls from CSV
      importControlsCSV: async (csvText, userStore) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parseUserString = get().parseUserString;
              const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

              const newControls = results.data.map((row) => {
                // Parse owner - try multiple column names
                let ownerId = null;
                const ownerStr = row['Control Owner ID'] || row['Control Owner'] || row.ownerId;
                if (ownerStr && findOrCreateUser) {
                  const ownerInfo = parseUserString(ownerStr);
                  if (ownerInfo) {
                    ownerId = findOrCreateUser(ownerInfo);
                  }
                }

                // Parse stakeholders - try multiple column names
                let stakeholderIds = [];
                const stakeholderStr = row['Stakeholder IDs'] || row['Stakeholders'] || row.stakeholderIds;
                if (stakeholderStr && findOrCreateUser) {
                  const stakeholders = stakeholderStr.split(';').map(s => s.trim()).filter(Boolean);
                  stakeholderIds = stakeholders.map(s => {
                    const info = parseUserString(s);
                    return info ? findOrCreateUser(info) : null;
                  }).filter(Boolean);
                }

                return {
                  controlId: row['Control ID'] || row.controlId,
                  implementationDescription: sanitizeInput(row['Control Implementation Description'] || row.implementationDescription || ''),
                  ownerId,
                  stakeholderIds,
                  linkedRequirementIds: row['Linked Requirements']
                    ? row['Linked Requirements'].split(';').map(s => s.trim()).filter(Boolean)
                    : [],
                  createdDate: row.createdDate || new Date().toISOString(),
                  lastModified: new Date().toISOString()
                };
              });

              get().setControls(newControls);
              resolve(newControls.length);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        });
      },

      // Export controls to CSV
      exportControlsCSV: (userStore) => {
        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          return user ? user.name : userId || '';
        };

        const csvData = get().controls.map(c => ({
          'Control ID': escapeCSVValue(c.controlId),
          'Control Implementation Description': escapeCSVValue(c.implementationDescription),
          'Control Owner': escapeCSVValue(getUserName(c.ownerId)),
          'Control Owner ID': c.ownerId || '',
          'Stakeholder(s)': escapeCSVValue((c.stakeholderIds || []).map(id => getUserName(id)).join('; ')),
          'Stakeholder IDs': (c.stakeholderIds || []).join('; '),
          'Linked Requirements': (c.linkedRequirementIds || []).join('; '),
          'Created Date': c.createdDate,
          'Last Modified': c.lastModified
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `controls_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Export controls to JSON
      exportControlsJSON: (userStore) => {
        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          return user ? user.name : userId || '';
        };

        const jsonData = {
          exportDate: new Date().toISOString(),
          dataType: 'Controls',
          controls: get().controls.map(c => ({
            controlId: c.controlId,
            implementationDescription: c.implementationDescription,
            ownerId: c.ownerId || null,
            ownerName: getUserName(c.ownerId),
            stakeholderIds: c.stakeholderIds || [],
            stakeholderNames: (c.stakeholderIds || []).map(id => getUserName(id)),
            linkedRequirementIds: c.linkedRequirementIds || [],
            createdDate: c.createdDate,
            lastModified: c.lastModified
          }))
        };

        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `controls_${date}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url)
        document.body.removeChild(link);
      },

      // Generate next control ID
      getNextControlId: () => {
        const controls = get().controls;
        const maxNum = controls.reduce((max, c) => {
          const match = c.controlId.match(/CTL-(\d+)/);
          if (match) {
            return Math.max(max, parseInt(match[1], 10));
          }
          return max;
        }, 0);
        return `CTL-${String(maxNum + 1).padStart(3, '0')}`;
      },

      // ============ MIGRATION METHODS ============

      /**
       * Migrate control data from requirementsStore to controlsStore.
       * For CSF, each requirement becomes a control with the same ID.
       * This imports: implementationDescription, controlOwner, stakeholders, artifacts, findings
       *
       * @param {Object} requirementsStore - The requirements store instance
       * @param {Object} userStore - The user store instance (for finding/creating users)
       */
      migrateFromRequirements: (requirementsStore, userStore) => {
        const migrationData = requirementsStore.getState().getControlDataForMigration();

        if (migrationData.length === 0) {
          console.log('[controlsStore] No control data to migrate from requirements');
          return 0;
        }

        const parseUserString = get().parseUserString;
        const findOrCreateUser = userStore?.getState?.()?.findOrCreateUser;

        let migratedCount = 0;

        migrationData.forEach(data => {
          // Skip if control already exists
          const existingControl = get().getControl(data.controlId);
          if (existingControl) {
            // Update existing control with any missing data
            const updates = {};
            if (!existingControl.implementationDescription && data.implementationDescription) {
              updates.implementationDescription = data.implementationDescription;
            }
            if (!existingControl.artifacts && data.artifacts) {
              updates.artifacts = data.artifacts;
            }
            if (!existingControl.findings && data.findings) {
              updates.findings = data.findings;
            }
            if (Object.keys(updates).length > 0) {
              get().updateControl(data.controlId, updates);
              migratedCount++;
            }
            return;
          }

          // Parse owner
          let ownerId = null;
          if (data.controlOwner && findOrCreateUser) {
            const ownerInfo = parseUserString(data.controlOwner);
            if (ownerInfo) {
              ownerId = findOrCreateUser(ownerInfo);
            }
          }

          // Parse stakeholders
          let stakeholderIds = [];
          if (data.stakeholders && findOrCreateUser) {
            const stakeholders = data.stakeholders.split(/[;,]/).map(s => s.trim()).filter(Boolean);
            stakeholderIds = stakeholders.map(s => {
              const info = parseUserString(s);
              return info ? findOrCreateUser(info) : null;
            }).filter(Boolean);
          }

          // Create new control
          get().createControl({
            controlId: data.controlId,
            implementationDescription: data.implementationDescription,
            ownerId,
            stakeholderIds,
            linkedRequirementIds: data.linkedRequirementIds,
            artifacts: data.artifacts,
            findings: data.findings,
            controlEvaluationBackLink: data.controlEvaluationBackLink,
            status: 'Not Implemented'
          });

          migratedCount++;
        });

        console.log(`[controlsStore] Migrated ${migratedCount} controls from requirements`);
        return migratedCount;
      },

      // Reset store (for testing)
      reset: () => {
        set({ controls: [], history: [], historyIndex: -1, loading: false, error: null });
      }
    }),
    {
      name: 'csf-controls-storage',
      version: 5,
      migrate: (persistedState, version) => {
        // Version 5: Default controls from Alma Security example data
        // Existing users with data keep their controls, new users get Alma Security examples
        if (version < 5) {
          if (persistedState?.controls?.length > 0) {
            // Existing user with data - keep their controls
            return persistedState;
          }
          // New user or empty state - use Alma Security example controls
          return { controls: DEFAULT_CONTROLS };
        }
        return persistedState;
      },
      partialize: (state) => ({
        controls: state.controls
      })
    }
  )
);

export default useControlsStore;
