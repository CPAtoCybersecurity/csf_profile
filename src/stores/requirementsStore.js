import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';

const useRequirementsStore = create(
  persist(
    (set, get) => ({
      requirements: [],
      loading: false,
      error: null,

      // Set requirements data
      setRequirements: (requirements) => {
        set({ requirements, loading: false, error: null });
      },

      // Set loading state
      setLoading: (loading) => set({ loading }),

      // Set error state
      setError: (error) => set({ error, loading: false }),

      // Get all requirements
      getRequirements: () => get().requirements,

      // Get requirements by framework
      getRequirementsByFramework: (frameworkId) => {
        return get().requirements.filter(r => r.frameworkId === frameworkId);
      },

      // Get requirement by ID
      getRequirement: (requirementId) => {
        return get().requirements.find(r => r.id === requirementId);
      },

      // Get requirements by IDs (for control linking)
      getRequirementsByIds: (ids) => {
        return get().requirements.filter(r => ids.includes(r.id));
      },

      // Get unique functions for a framework
      getFunctions: (frameworkId = null) => {
        const reqs = frameworkId
          ? get().getRequirementsByFramework(frameworkId)
          : get().requirements;
        return [...new Set(reqs.map(r => r.function))].filter(Boolean);
      },

      // Get unique categories for a framework/function
      getCategories: (frameworkId = null, functionName = null) => {
        let reqs = get().requirements;
        if (frameworkId) reqs = reqs.filter(r => r.frameworkId === frameworkId);
        if (functionName) reqs = reqs.filter(r => r.function === functionName);
        return [...new Set(reqs.map(r => r.category))].filter(Boolean);
      },

      // Get unique subcategories
      getSubcategories: (frameworkId = null, category = null) => {
        let reqs = get().requirements;
        if (frameworkId) reqs = reqs.filter(r => r.frameworkId === frameworkId);
        if (category) reqs = reqs.filter(r => r.category === category);
        return [...new Set(reqs.map(r => r.subcategoryId))].filter(Boolean);
      },

      // Toggle requirement in scope
      toggleInScope: (requirementId) => {
        set((state) => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, inScope: !r.inScope } : r
          )
        }));
      },

      // Bulk set in scope
      bulkSetInScope: (requirementIds, inScope) => {
        set((state) => ({
          requirements: state.requirements.map(r =>
            requirementIds.includes(r.id) ? { ...r, inScope } : r
          )
        }));
      },

      // Clear all scope for a framework
      clearAllScope: (frameworkId = null) => {
        set((state) => ({
          requirements: state.requirements.map(r =>
            (frameworkId === null || r.frameworkId === frameworkId)
              ? { ...r, inScope: false }
              : r
          )
        }));
      },

      // Get in-scope requirements
      getInScopeRequirements: (frameworkId = null) => {
        let reqs = get().requirements.filter(r => r.inScope);
        if (frameworkId) reqs = reqs.filter(r => r.frameworkId === frameworkId);
        return reqs;
      },

<<<<<<< HEAD
=======
      // ============ MIGRATION HELPER ============
      // Extract control-related data from requirements for migration to controlsStore.
      // This should be called during initial migration to move deprecated fields to Controls.
      getControlDataForMigration: () => {
        return get().requirements
          .filter(r =>
            r.implementationDescription ||
            r.controlOwner ||
            r.stakeholders ||
            r.artifacts ||
            r.findings
          )
          .map(r => ({
            // Use requirement ID as default control ID for CSF
            controlId: r.id,
            linkedRequirementIds: [r.id],
            frameworkId: r.frameworkId,

            // Deprecated fields to migrate
            implementationDescription: r.implementationDescription || '',
            controlOwner: r.controlOwner || '',
            stakeholders: r.stakeholders || '',
            artifacts: r.artifacts || '',
            findings: r.findings || '',
            controlEvaluationBackLink: r.controlEvaluationBackLink || ''
          }));
      },

      // Clear deprecated fields after migration (optional cleanup)
      clearDeprecatedFields: () => {
        set((state) => ({
          requirements: state.requirements.map(r => ({
            ...r,
            // Keep these as empty strings for backward compatibility, but they're deprecated
            implementationDescription: '',
            controlOwner: '',
            stakeholders: '',
            artifacts: '',
            findings: '',
            controlEvaluationBackLink: ''
          }))
        }));
        console.log('[requirementsStore] Deprecated fields cleared. Use controlsStore for control data.');
      },

      // Update a requirement (RESTRICTED - Requirements are now READ-ONLY)
      // Only inScope can be updated. Control-related data should go to controlsStore.
      // @deprecated Use controlsStore for: controlOwner, stakeholders, implementationDescription
      updateRequirement: (requirementId, updates) => {
        // Filter to only allow scope-related updates
        const allowedFields = ['inScope'];
        const filteredUpdates = {};

        for (const key of allowedFields) {
          if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key];
          }
        }

        // Warn about deprecated field updates
        const deprecatedFields = ['controlOwner', 'stakeholders', 'implementationDescription', 'artifacts', 'findings'];
        const attemptedDeprecated = Object.keys(updates).filter(k => deprecatedFields.includes(k));
        if (attemptedDeprecated.length > 0) {
          console.warn(`[requirementsStore] Attempted to update deprecated fields: ${attemptedDeprecated.join(', ')}. Use controlsStore instead.`);
        }

        if (Object.keys(filteredUpdates).length === 0) {
          return; // No valid updates
        }

        set((state) => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...filteredUpdates } : r
          )
        }));
      },

      // Delete a requirement
      deleteRequirement: (requirementId) => {
        set((state) => ({
          requirements: state.requirements.filter(r => r.id !== requirementId)
        }));
      },

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      // Count requirements by framework
      getRequirementCount: (frameworkId) => {
        return get().requirements.filter(r => r.frameworkId === frameworkId).length;
      },

      // Import requirements from CSV for a specific framework
      importRequirementsCSV: async (csvText, frameworkId) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const newRequirements = results.data.map((row, index) => {
                // Get framework from row or use provided frameworkId
                const rowFramework = row.FRAMEWORK || row.Framework || row.framework || frameworkId;

                return {
<<<<<<< HEAD
                  id: row.ID || row.id || `${rowFramework}-${index}`,
                  frameworkId: rowFramework,
                  function: row['CSF FUNCTION'] || row['CSF Function'] || row.Function || row.function || row.level1 || '',
                  category: row.CATEGORY || row.Category || row.category || row.level2 || '',
                  subcategoryId: row['SUBCATEGORY ID'] || row['Subcategory ID'] || row.subcategoryId || row.Subcategory || row.level3 || '',
                  subcategoryDescription: row['SUBCATEGORY DESCRIPTION'] || row['Subcategory Description'] || row.subcategoryDescription || '',
                  implementationExample: row['IMPLEMENTATION EXAMPLE'] || row['Implementation Example'] || row.implementationExample || row.level4 || '',
                  inScope: false,
                  // Additional metadata
                  functionDescription: row['Function Description'] || row.functionDescription || '',
                  categoryDescription: row['Category Description'] || row.categoryDescription || ''
=======
                  id: row['Requirement ID'] || row.ID || row.id || `${rowFramework}-${index}`,
                  frameworkId: rowFramework,
                  function: row['CSF FUNCTION'] || row['CSF Function'] || row.Function || row.function || row.level1 || '',
                  category: row['Category Name'] || row.CATEGORY || row.Category || row.category || row.level2 || '',
                  subcategoryId: row['SUBCATEGORY ID'] || row['Subcategory ID'] || row.subcategoryId || row.Subcategory || row.level3 || '',
                  subcategoryDescription: row['SUBCATEGORY DESCRIPTION'] || row['Subcategory Description'] || row.subcategoryDescription || '',
                  implementationExample: row['IMPLEMENTATION EXAMPLE'] || row['Implementation Example'] || row.implementationExample || row.level4 || '',
                  inScope: (row['In Scope'] || row['In Scope?'] || 'No').toLowerCase() === 'yes',
                  // Additional metadata
                  functionDescription: row['CSF Function Description'] || row['Function Description'] || row.functionDescription || '',
                  categoryDescription: row['Category Description'] || row.categoryDescription || '',
                  // Confluence fields
                  controlOwner: row['Control Owner'] || row.controlOwner || '',
                  stakeholders: row['Stakeholders'] || row.stakeholders || ''
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
                };
              });

              // Remove existing requirements for this framework and add new ones
              set((state) => ({
                requirements: [
                  ...state.requirements.filter(r => r.frameworkId !== frameworkId),
                  ...newRequirements
                ]
              }));

              resolve(newRequirements.length);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        });
      },

<<<<<<< HEAD
      // Load initial CSF data (migrated from csfStore)
=======
      // Load initial CSF data from Confluence-Requirements.csv
      // NOTE: Requirements are READ-ONLY framework data. The CSV may contain control-related
      // fields (controlOwner, implementationDescription, etc.) for migration purposes,
      // but these should be migrated to controlsStore and are deprecated here.
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      loadInitialData: async () => {
        try {
          set({ loading: true, error: null });

<<<<<<< HEAD
          const response = await fetch('/tblProfile_Demo.csv');
=======
          const response = await fetch('/Confluence-Requirements.csv');
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
          const csvText = await response.text();

          return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const requirements = results.data.map(row => {
<<<<<<< HEAD
                  // Extract category ID from category string
                  const categoryIdMatch = row.Category && row.Category.match(/\(([^)]+)\)/);
                  const categoryId = categoryIdMatch ? categoryIdMatch[1] : '';

                  return {
                    id: row.ID,
                    frameworkId: 'nist-csf-2.0',
                    function: row.Function || '',
                    functionDescription: row['Function Description'] || '',
                    category: row.Category || '',
                    categoryDescription: row['Category Description'] || '',
                    categoryId: categoryId,
                    subcategoryId: row['Subcategory ID'] || '',
                    subcategoryDescription: row['Subcategory Description'] || '',
                    implementationExample: row['Implementation Example'] || '',
                    inScope: (row['In Scope? '] || 'No') === 'Yes'
=======
                  // Extract category ID from category string if present
                  const categoryIdMatch = row['Category Name'] && row['Category Name'].match(/\(([^)]+)\)/);
                  const categoryId = categoryIdMatch ? categoryIdMatch[1] : '';

                  return {
                    // === FRAMEWORK DATA (Read-Only) ===
                    id: row['Requirement ID'] || row.ID || '',
                    frameworkId: row.Framework || row.FRAMEWORK || 'nist-csf-2.0',
                    function: row['CSF Function'] || row['CSF FUNCTION'] || row.Function || '',
                    functionDescription: row['CSF Function Description'] || row['Function Description'] || '',
                    category: row['Category Name'] || row.CATEGORY || row.Category || '',
                    categoryDescription: row['Category Description'] || '',
                    categoryId: categoryId,
                    subcategoryId: row['Subcategory ID'] || row['SUBCATEGORY ID'] || '',
                    subcategoryDescription: row['Subcategory Description'] || row['SUBCATEGORY DESCRIPTION'] || '',
                    implementationExample: row['Implementation Example'] || row['IMPLEMENTATION EXAMPLE'] || '',

                    // === SCOPE (User-Manageable) ===
                    inScope: true, // All pre-loaded requirements are in scope

                    // === DEPRECATED FIELDS (Migrate to controlsStore) ===
                    // These are loaded for backward compatibility but should NOT be edited here.
                    // Use getControlDataForMigration() to extract and migrate to controlsStore.
                    implementationDescription: row['Implementation Description (Control)'] || '',
                    controlOwner: row['Control Owner'] || '',
                    stakeholders: row['Stakeholders'] || '',
                    artifacts: row['Artifacts'] || '',
                    findings: row['Findings'] || '',
                    controlEvaluationBackLink: row['Control Evaluation Back Link'] || ''
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
                  };
                });

                set({ requirements, loading: false });
                resolve(requirements);
              },
              error: (error) => {
                set({ error: `Error parsing CSV: ${error.message}`, loading: false });
                reject(error);
              }
            });
          });
        } catch (err) {
          set({ error: `Error loading file: ${err.message}`, loading: false });
          throw err;
        }
      },

      // Export requirements to CSV
      exportRequirementsCSV: (frameworkId = null) => {
        let reqs = get().requirements;
        if (frameworkId) {
          reqs = reqs.filter(r => r.frameworkId === frameworkId);
        }

        const csvData = reqs.map(r => ({
<<<<<<< HEAD
          'Framework': r.frameworkId,
          'Function': r.function,
          'Category': r.category,
          'Subcategory': r.subcategoryId,
          'ID': r.id,
          'Implementation Example': r.implementationExample,
=======
          'Requirement ID': r.id,
          'Framework': r.frameworkId,
          'CSF Function': r.function,
          'Category Name': r.category,
          'Subcategory ID': r.subcategoryId,
          'Subcategory Description': r.subcategoryDescription || '',
          'Implementation Example': r.implementationExample,
          'Control Owner': r.controlOwner || '',
          'Stakeholders': r.stakeholders || '',
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
          'In Scope': r.inScope ? 'Yes' : 'No'
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        const frameworkSuffix = frameworkId ? `_${frameworkId}` : '';

        link.setAttribute('href', url);
        link.setAttribute('download', `requirements${frameworkSuffix}_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
<<<<<<< HEAD
        
        // Track export for backup reminder system
        const { updateLastExportDate } = require('../utils/backupTracking');
        updateLastExportDate();
=======

        // Track export for backup reminder system
        const { updateLastExportDate } = require('../utils/backupTracking');
        updateLastExportDate();
      },

      // Export requirements to Confluence Database format
      // Matches the Confluence Requirements database schema
      exportForConfluenceCSV: (frameworkId = null, controlsStore = null, userStore = null) => {
        let reqs = get().requirements;
        if (frameworkId) {
          reqs = reqs.filter(r => r.frameworkId === frameworkId);
        }

        const users = userStore?.getState?.()?.users || [];
        const getUserName = (userId) => {
          const user = users.find(u => u.id === userId);
          return user?.name || '';
        };

        // Get controls to find owner and stakeholders for each requirement
        const controls = controlsStore?.getState?.()?.controls || [];
        const getControlsForRequirement = (reqId) => {
          return controls.filter(c =>
            (c.linkedRequirementIds || []).includes(reqId)
          );
        };

        const csvData = reqs.map(r => {
          const linkedControls = getControlsForRequirement(r.id);
          const controlOwners = [...new Set(linkedControls.map(c => getUserName(c.ownerId)).filter(Boolean))];
          const controlStakeholders = [...new Set(
            linkedControls.flatMap(c => (c.stakeholderIds || []).map(id => getUserName(id)))
          )].filter(Boolean);
          const controlsInScope = linkedControls.map(c => c.controlId).join(', ');

          // Get implementation descriptions from linked controls
          const implementationDescriptions = linkedControls
            .map(c => c.implementationDescription)
            .filter(Boolean)
            .join(' | ');

          return {
            'Requirement ID': r.id,
            'Framework': r.frameworkId || 'NIST CSF 2.0',
            'CSF Function': r.function,
            'CSF Function Description': r.functionDescription || '',
            'Category Name': r.category,
            'Category Description': r.categoryDescription || '',
            'Subcategory ID': r.subcategoryId,
            'Subcategory Description': r.subcategoryDescription,
            'Implementation Example': r.implementationExample,
            'Implementation Description (Control)': implementationDescriptions,
            'In Scope': r.inScope ? 'Yes' : 'No',
            'Control Owner': controlOwners.join(', '),
            'Stakeholders': controlStakeholders.join(', '),
            'Controls In Scope': controlsInScope
          };
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        const frameworkSuffix = frameworkId ? `_${frameworkId}` : '';

        link.setAttribute('href', url);
        link.setAttribute('download', `confluence_requirements${frameworkSuffix}_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Track export for backup reminder system
        try {
          const { updateLastExportDate } = require('../utils/backupTracking');
          updateLastExportDate();
        } catch (e) {
          // Backup tracking not available
        }
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      }
    }),
    {
      name: 'csf-requirements-storage',
      partialize: (state) => ({
        requirements: state.requirements
      })
    }
  )
);

export default useRequirementsStore;
