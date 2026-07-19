import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { sanitizeInput, escapeCSVValue } from '../utils/sanitize';
import { DEFAULT_CONTROLS } from './defaultControlsData';
import { COMPREHENSIVE_ASSESSMENT_ID } from './comprehensiveAssessmentData';
import { DEMO_SEED_SOURCE } from '../utils/assessmentScope';

// The shipped Alma controls are demo evidence for the demo assessment
// (issue #299, same segregation scheme as #297 gave users/findings/artifacts):
// stamped with the demo assessment's id + seed provenance so they appear only
// in the demo assessment's scope, while anything a user creates (which never
// carries an assessmentId unless a scope stamps one) stays visible everywhere.
// The issue #306 fields are normalized into the seed itself, so a FRESH
// install and an UPGRADED install hold byte-identical demo records. Without
// this the v7 migration would add name/tests/frameworks to an existing
// install's copies while a fresh install's copies lacked them.
export const SEEDED_CONTROLS = normalizeControlFields({
  controls: DEFAULT_CONTROLS.map((c) => ({
    ...c,
    assessmentId: COMPREHENSIVE_ASSESSMENT_ID,
    seedSource: DEMO_SEED_SOURCE
  }))
}).controls;

/**
 * Implementation status a control can carry (issue #306). The first value is
 * the default for a control that has never been given one; the shipped Alma
 * demo set already uses 'Implemented' and 'Partially Implemented'.
 */
export const CONTROL_STATUSES = [
  'Not Implemented',
  'Partially Implemented',
  'Implemented',
  'Not Applicable'
];

const useControlsStore = create(
  persist(
    (set, get) => ({
      controls: SEEDED_CONTROLS,
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
          // Human-readable control name, distinct from the control ID (issue #306)
          name: sanitizeInput(controlData.name || ''),
          implementationDescription: sanitizeInput(controlData.implementationDescription || ''),
          ownerId: controlData.ownerId || null,
          stakeholderIds: controlData.stakeholderIds || [],
          linkedRequirementIds: controlData.linkedRequirementIds || [],
          status: controlData.status || CONTROL_STATUSES[0],
          // How this control is tested (issue #306) — free text, one control's
          // test plan. Distinct from an assessment observation's testProcedures,
          // which is point-in-time evidence for one evaluation.
          tests: sanitizeInput(controlData.tests || ''),
          // Frameworks this control satisfies (issue #306). STORED and
          // importable per Steve's 2026-07-19 ratification: a control catalog
          // imported from elsewhere names its frameworks directly, and may
          // carry no linked requirements to derive them from. Free text; the
          // Linked Requirements list remains the machine-readable linkage.
          frameworks: sanitizeInput(controlData.frameworks || ''),
          // Optional fields from migration
          artifacts: controlData.artifacts || '',
          findings: controlData.findings || '',
          controlEvaluationBackLink: controlData.controlEvaluationBackLink || '',
          // Optional URL to this control in an external compliance/ticketing tool (issue #284)
          externalUrl: controlData.externalUrl || '',
          // Assessment scoping (issue #299): null = visible in every
          // assessment's view; a concrete id scopes the control to that
          // assessment. seedSource is never set here — only shipped demo
          // records carry it.
          assessmentId: controlData.assessmentId || null,
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
        // Sanitize every free-text field the panel can write, not just the
        // description (issue #306 added name/tests/frameworks). Each key is
        // only touched when the caller actually supplied it, so a partial
        // update never resurrects a field it did not mean to change.
        const sanitizedUpdates = { ...updates, lastModified: new Date().toISOString() };
        ['implementationDescription', 'name', 'tests', 'frameworks'].forEach((field) => {
          if (typeof updates[field] === 'string') {
            sanitizedUpdates[field] = sanitizeInput(updates[field]);
          }
        });

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
                  // issue #306 columns. Status closes a PRE-EXISTING silent
                  // drop: the store has always held a status, but import
                  // rebuilt every record from scratch without one, so a
                  // export → import round-trip reset every control to the
                  // default. A blank cell still falls back to the default.
                  name: sanitizeInput(row['Control Name'] || row.name || ''),
                  status: (row['Status'] || row.status || '').trim() || CONTROL_STATUSES[0],
                  tests: sanitizeInput(row['Tests'] || row.tests || ''),
                  frameworks: sanitizeInput(row['Frameworks'] || row.frameworks || ''),
                  implementationDescription: sanitizeInput(row['Control Implementation Description'] || row.implementationDescription || ''),
                  ownerId,
                  stakeholderIds,
                  linkedRequirementIds: row['Linked Requirements']
                    ? row['Linked Requirements'].split(';').map(s => s.trim()).filter(Boolean)
                    : [],
                  // Assessment scoping round-trip (issue #299): blank → null
                  // (visible everywhere). Unknown ids are preserved, not
                  // nulled — reachable under All, and they survive a later
                  // restore of that assessment (same call as #297 artifacts).
                  assessmentId: (row['Assessment ID'] || '').trim() || null,
                  createdDate: row.createdDate || new Date().toISOString(),
                  lastModified: new Date().toISOString()
                };
              });

              get().setControls(newControls);
              resolve(newControls.length);
            },
            error: (error) => {
              reject(new Error('Failed to import CSV file. Please verify the file format.'));
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
          // issue #306 — these four round-trip through importControlsCSV
          'Control Name': escapeCSVValue(c.name || ''),
          'Status': escapeCSVValue(c.status || CONTROL_STATUSES[0]),
          'Tests': escapeCSVValue(c.tests || ''),
          'Frameworks': escapeCSVValue(c.frameworks || ''),
          'Control Implementation Description': escapeCSVValue(c.implementationDescription),
          'Control Owner': escapeCSVValue(getUserName(c.ownerId)),
          'Control Owner ID': escapeCSVValue(c.ownerId || ''),
          'Stakeholder(s)': escapeCSVValue((c.stakeholderIds || []).map(id => getUserName(id)).join('; ')),
          'Stakeholder IDs': (c.stakeholderIds || []).join('; '),
          'Linked Requirements': (c.linkedRequirementIds || []).join('; '),
          // Importable columns are user-controlled; escape them all.
          'Assessment ID': escapeCSVValue(c.assessmentId || ''),
          'Created Date': escapeCSVValue(c.createdDate),
          'Last Modified': escapeCSVValue(c.lastModified)
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
            // issue #306
            name: c.name || '',
            status: c.status || CONTROL_STATUSES[0],
            tests: c.tests || '',
            frameworks: c.frameworks || '',
            implementationDescription: c.implementationDescription,
            ownerId: c.ownerId || null,
            ownerName: getUserName(c.ownerId),
            stakeholderIds: c.stakeholderIds || [],
            stakeholderNames: (c.stakeholderIds || []).map(id => getUserName(id)),
            linkedRequirementIds: c.linkedRequirementIds || [],
            assessmentId: c.assessmentId || null,
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
      version: 7,
      migrate: (persistedState, version) => migrateControlsState(persistedState, version),
      partialize: (state) => ({
        controls: state.controls
      })
    }
  )
);

/**
 * Persist migration pipeline. Version history:
 * - v5: empty/new installs get the Alma example controls; installs with their
 *   own data keep it untouched.
 * - v6 (issue #299): seeded demo controls gain assessmentId + seedSource so
 *   they appear only in the demo assessment's scope.
 * - v7 (issue #306): name / tests / frameworks fields, and a status on every
 *   record rather than only the ones the demo data happened to ship with.
 *
 * The v7 pass runs AFTER the version chain rather than as another branch in
 * it — the branches return early, so a user coming from v4 would never reach
 * a branch placed at the end (the lesson artifactStore's migration already
 * learned). It is a no-op on states that already carry the fields.
 */
export function migrateControlsState(persistedState, version) {
  let state = persistedState;
  if (version < 5) {
    state = state?.controls?.length > 0 ? state : { controls: SEEDED_CONTROLS };
  }
  return normalizeControlFields(stampSeededDemoControls(state));
}

/**
 * Fill in the issue #306 fields on any control that predates them.
 *
 * Absent-only by construction: a field is written only when the record does
 * not already carry a string there, so a user's own value — including a
 * deliberate empty string — is never overwritten. Idempotent: after one pass
 * every record has all four keys, so a second pass changes nothing and
 * returns the SAME state object.
 *
 * Exported because the restore path (dataImport) uses zustand's bulk setters,
 * which bypass this store's load-time migrate entirely.
 */
export function normalizeControlFields(state) {
  const controls = state?.controls;
  if (!Array.isArray(controls)) return state;

  let changed = false;
  const normalized = controls.map((control) => {
    if (!control || typeof control !== 'object') return control;
    const patch = {};
    ['name', 'tests', 'frameworks'].forEach((field) => {
      if (typeof control[field] !== 'string') patch[field] = '';
    });
    if (typeof control.status !== 'string' || control.status === '') {
      patch.status = CONTROL_STATUSES[0];
    }
    if (Object.keys(patch).length === 0) return control;
    changed = true;
    return { ...control, ...patch };
  });

  return changed ? { ...state, controls: normalized } : state;
}

/**
 * Stamp the persisted copies of the shipped Alma demo controls with the demo
 * assessment's id + seed provenance (issue #299 — the same heal-in-place as
 * #297's stampSeededDemoArtifacts / Users / Findings).
 *
 * Guard doctrine:
 * - Absent-only: any existing assessmentId OR seedSource means this record
 *   has already been classified (locally or by the install that exported it)
 *   — never re-derive over an existing classification.
 * - The match must be POSITIVE on both sides: the controlId must be a seeded
 *   id AND the record's createdDate must equal that seed's createdDate.
 *   createdDate is the stable identity field — updateControl never touches it
 *   and createControl always stamps the current time — so a demo control
 *   whose description the user edited is still recognized, while a
 *   user-created control that reuses a seeded controlId can never match, and
 *   a record with an unknown controlId and no createdDate cannot match via
 *   undefined === undefined.
 * - Idempotent: once stamped, the absent-only guard matches nothing.
 */
export function stampSeededDemoControls(state) {
  const controls = state?.controls;
  if (!Array.isArray(controls)) return state;

  const seededCreatedById = new Map(DEFAULT_CONTROLS.map((c) => [c.controlId, c.createdDate]));

  let changed = false;
  const stamped = controls.map((control) => {
    if (!control || control.assessmentId || control.seedSource) return control;
    const seededCreated = seededCreatedById.get(control.controlId);
    if (!seededCreated || seededCreated !== control.createdDate) return control;
    changed = true;
    return { ...control, assessmentId: COMPREHENSIVE_ASSESSMENT_ID, seedSource: DEMO_SEED_SOURCE };
  });

  return changed ? { ...state, controls: stamped } : state;
}

export default useControlsStore;
