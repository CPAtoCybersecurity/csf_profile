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

      // Update a requirement
      updateRequirement: (requirementId, updates) => {
        set((state) => ({
          requirements: state.requirements.map(r =>
            r.id === requirementId ? { ...r, ...updates } : r
          )
        }));
      },

      // Delete a requirement
      deleteRequirement: (requirementId) => {
        set((state) => ({
          requirements: state.requirements.filter(r => r.id !== requirementId)
        }));
      },

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

      // Load initial CSF data (migrated from csfStore)
      loadInitialData: async () => {
        try {
          set({ loading: true, error: null });

          const response = await fetch('/tblProfile_Demo.csv');
          const csvText = await response.text();

          return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                const requirements = results.data.map(row => {
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
          'Requirement ID': r.id,
          'Framework': r.frameworkId,
          'CSF Function': r.function,
          'Category Name': r.category,
          'Subcategory ID': r.subcategoryId,
          'Subcategory Description': r.subcategoryDescription || '',
          'Implementation Example': r.implementationExample,
          'Control Owner': r.controlOwner || '',
          'Stakeholders': r.stakeholders || '',
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
