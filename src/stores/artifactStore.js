import { create } from 'zustand';
import { persist } from 'zustand/middleware';
<<<<<<< HEAD
=======
import Papa from 'papaparse';
import { DEFAULT_ARTIFACTS } from './defaultArtifactsData';

/**
 * Artifact Store
 * Manages evidence/artifacts linked to controls and requirements.
 * Enhanced to align with Jira AR (Artifacts) project structure.
 */
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)

const useArtifactStore = create(
  persist(
    (set, get) => ({
<<<<<<< HEAD
      artifacts: [],
=======
      artifacts: DEFAULT_ARTIFACTS,

      // Get all artifacts
      getArtifacts: () => get().artifacts,
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)

      // Add artifact
      addArtifact: (artifact) => {
        const newArtifact = {
          ...artifact,
          id: artifact.id || Date.now() + Math.floor(Math.random() * 1000),
<<<<<<< HEAD
          linkedSubcategoryIds: artifact.linkedSubcategoryIds || [],
=======
          artifactId: artifact.artifactId || `AR-${Date.now()}`,
          name: artifact.name || '',
          description: artifact.description || '',
          link: artifact.link || '', // URL to external evidence

          // Primary link: Control (general evidence for a control)
          controlId: artifact.controlId || null,

          // Secondary link: Evaluations (point-in-time evidence for specific assessments)
          linkedEvaluationIds: artifact.linkedEvaluationIds || [],

          // DEPRECATED: Use controlId → linkedRequirementIds instead
          complianceRequirement: artifact.complianceRequirement || null,
          linkedSubcategoryIds: artifact.linkedSubcategoryIds || [],

          type: artifact.type || 'Document', // Document, Screenshot, Log, Policy, etc.
          createdDate: artifact.createdDate || new Date().toISOString(),
          lastModified: new Date().toISOString(),
          jiraKey: artifact.jiraKey || null // Jira issue key if synced
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        };
        set((state) => ({
          artifacts: [...state.artifacts, newArtifact]
        }));
        return newArtifact.id;
      },

      // Update artifact
      updateArtifact: (id, updates) => {
        set((state) => ({
          artifacts: state.artifacts.map(artifact =>
<<<<<<< HEAD
            artifact.id === id ? { ...artifact, ...updates } : artifact
=======
            artifact.id === id
              ? { ...artifact, ...updates, lastModified: new Date().toISOString() }
              : artifact
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
          )
        }));
      },

      // Delete artifact
      deleteArtifact: (id) => {
        set((state) => ({
          artifacts: state.artifacts.filter(artifact => artifact.id !== id)
        }));
      },

      // Get artifact by ID
      getArtifactById: (id) => {
        return get().artifacts.find(artifact => artifact.id === id);
      },

<<<<<<< HEAD
=======
      // Get artifact by artifact ID string
      getArtifactByArtifactId: (artifactId) => {
        return get().artifacts.find(artifact => artifact.artifactId === artifactId);
      },

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      // Get artifact by name
      getArtifactByName: (name) => {
        return get().artifacts.find(artifact => artifact.name === name);
      },

<<<<<<< HEAD
=======
      // Get artifacts by compliance requirement
      getArtifactsByRequirement: (requirementId) => {
        return get().artifacts.filter(artifact =>
          artifact.complianceRequirement === requirementId ||
          (artifact.linkedSubcategoryIds || []).includes(requirementId)
        );
      },

      // Get artifacts by control ID
      getArtifactsByControl: (controlId) => {
        return get().artifacts.filter(artifact => artifact.controlId === controlId);
      },

      // Get artifacts by evaluation ID (NEW - for point-in-time evidence)
      getArtifactsByEvaluation: (evaluationId) => {
        return get().artifacts.filter(artifact =>
          (artifact.linkedEvaluationIds || []).includes(evaluationId)
        );
      },

      // Get artifacts by assessment (via evaluations)
      getArtifactsByAssessment: (assessmentId) => {
        return get().artifacts.filter(artifact =>
          (artifact.linkedEvaluationIds || []).some(evalId =>
            evalId && evalId.includes(assessmentId)
          )
        );
      },

      // Get artifacts by type
      getArtifactsByType: (type) => {
        return get().artifacts.filter(artifact => artifact.type === type);
      },

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      // Link artifact to subcategory
      linkToSubcategory: (artifactId, subcategoryId) => {
        set((state) => ({
          artifacts: state.artifacts.map(artifact => {
            if (artifact.id === artifactId) {
              const linkedIds = artifact.linkedSubcategoryIds || [];
              if (!linkedIds.includes(subcategoryId)) {
                return {
                  ...artifact,
<<<<<<< HEAD
                  linkedSubcategoryIds: [...linkedIds, subcategoryId]
=======
                  linkedSubcategoryIds: [...linkedIds, subcategoryId],
                  lastModified: new Date().toISOString()
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
                };
              }
            }
            return artifact;
          })
        }));
      },

      // Unlink artifact from subcategory
      unlinkFromSubcategory: (artifactId, subcategoryId) => {
        set((state) => ({
          artifacts: state.artifacts.map(artifact => {
            if (artifact.id === artifactId) {
              return {
                ...artifact,
                linkedSubcategoryIds: (artifact.linkedSubcategoryIds || [])
<<<<<<< HEAD
                  .filter(id => id !== subcategoryId)
=======
                  .filter(id => id !== subcategoryId),
                lastModified: new Date().toISOString()
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
              };
            }
            return artifact;
          })
        }));
      },

<<<<<<< HEAD
=======
      // Link artifact to compliance requirement
      linkToRequirement: (artifactId, requirementId) => {
        get().updateArtifact(artifactId, { complianceRequirement: requirementId });
      },

      // Link artifact to control
      linkToControl: (artifactId, controlId) => {
        get().updateArtifact(artifactId, { controlId });
      },

      // Link artifact to evaluation (for point-in-time evidence)
      linkToEvaluation: (artifactId, evaluationId) => {
        set((state) => ({
          artifacts: state.artifacts.map(artifact => {
            if (artifact.id === artifactId) {
              const linkedIds = artifact.linkedEvaluationIds || [];
              if (!linkedIds.includes(evaluationId)) {
                return {
                  ...artifact,
                  linkedEvaluationIds: [...linkedIds, evaluationId],
                  lastModified: new Date().toISOString()
                };
              }
            }
            return artifact;
          })
        }));
      },

      // Unlink artifact from evaluation
      unlinkFromEvaluation: (artifactId, evaluationId) => {
        set((state) => ({
          artifacts: state.artifacts.map(artifact => {
            if (artifact.id === artifactId) {
              return {
                ...artifact,
                linkedEvaluationIds: (artifact.linkedEvaluationIds || [])
                  .filter(id => id !== evaluationId),
                lastModified: new Date().toISOString()
              };
            }
            return artifact;
          })
        }));
      },

      // Bulk link artifact to multiple evaluations
      bulkLinkToEvaluations: (artifactId, evaluationIds) => {
        set((state) => ({
          artifacts: state.artifacts.map(artifact => {
            if (artifact.id === artifactId) {
              const existingIds = artifact.linkedEvaluationIds || [];
              const newIds = [...new Set([...existingIds, ...evaluationIds])];
              return {
                ...artifact,
                linkedEvaluationIds: newIds,
                lastModified: new Date().toISOString()
              };
            }
            return artifact;
          })
        }));
      },

      // Set Jira key (for sync tracking)
      setJiraKey: (artifactId, jiraKey) => {
        const artifact = get().artifacts.find(a => a.id === artifactId);
        if (artifact) {
          get().updateArtifact(artifactId, { jiraKey });
        }
      },

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      // Get artifacts for subcategory
      getArtifactsForSubcategory: (subcategoryId) => {
        return get().artifacts.filter(artifact =>
          (artifact.linkedSubcategoryIds || []).includes(subcategoryId)
        );
      },

      // Find or create artifact
<<<<<<< HEAD
      findOrCreateArtifact: (name, link = '') => {
=======
      findOrCreateArtifact: (name, link = '', complianceRequirement = null) => {
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        const existing = get().getArtifactByName(name);
        if (existing) return existing.id;

        return get().addArtifact({
<<<<<<< HEAD
          artifactId: `A${get().artifacts.length + 1}`,
          name,
          description: `Created on ${new Date().toLocaleDateString()}`,
          link,
          linkedSubcategoryIds: [],
=======
          artifactId: `AR-${get().artifacts.length + 1}`,
          name,
          description: `Created on ${new Date().toLocaleDateString()}`,
          link,
          complianceRequirement,
          linkedSubcategoryIds: complianceRequirement ? [complianceRequirement] : []
        });
      },

      // Export artifacts to CSV (standard format)
      exportArtifactsCSV: () => {
        const artifacts = get().artifacts;

        const csvData = artifacts.map(a => ({
          'Artifact ID': a.artifactId,
          'Name': a.name,
          'Description': a.description,
          'Link': a.link || '',
          'Type': a.type || 'Document',
          'Control ID': a.controlId || '',
          'Linked Evaluation IDs': (a.linkedEvaluationIds || []).join('; '),
          'Compliance Requirement': a.complianceRequirement || '', // Deprecated
          'Linked Subcategories': (a.linkedSubcategoryIds || []).join('; '), // Deprecated
          'Created Date': a.createdDate,
          'Jira Key': a.jiraKey || ''
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `artifacts_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Export to Jira AR project format
      exportForJiraCSV: () => {
        const artifacts = get().artifacts;

        // Jira CSV import format for AR project
        const csvData = artifacts.map(a => ({
          'Summary': a.name,
          'Issue Type': 'Artifact',
          'Project key': 'AR',
          'Custom field (Link)': a.link || '',
          'Custom field (Control ID)': a.controlId || '',
          'Custom field (Linked Evaluation IDs)': (a.linkedEvaluationIds || []).join('; '),
          'Custom field (Compliance Requirement)': a.complianceRequirement || '', // Deprecated
          'Custom field (Artifact Type)': a.type || 'Document',
          'Description': a.description || `Evidence artifact: ${a.name}\n\nControl: ${a.controlId || 'N/A'}\nEvaluations: ${(a.linkedEvaluationIds || []).join(', ') || 'N/A'}`
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];

        link.setAttribute('href', url);
        link.setAttribute('download', `jira_ar_import_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },

      // Import artifacts from CSV (supports both standard and Jira export formats)
      importArtifactsCSV: async (csvText) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const existingArtifacts = get().artifacts;
              const existingKeys = new Set(existingArtifacts.map(a => a.artifactId));

              const newArtifacts = results.data
                .filter(row => {
                  // Use Jira Issue key as the artifact ID if available
                  const artifactId = row['Issue key'] || row['Artifact ID'] || null;
                  // Skip if artifact already exists (by ID)
                  return !artifactId || !existingKeys.has(artifactId);
                })
                .map(row => {
                  // Use Jira Issue key as the artifact ID (e.g., AR-1768214343793-o7ihrhfh)
                  const artifactId = row['Issue key'] || row['Artifact ID'] || `AR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                  return {
                    id: Date.now() + Math.floor(Math.random() * 10000),
                    artifactId: artifactId,
                    name: row['Name'] || row['Summary'] || '',
                    description: row['Description'] || '',
                    link: row['Link'] || row['Custom field (Link)'] || '',
                    type: row['Type'] || row['Custom field (Artifact Type)'] || 'Document',

                    // Primary link
                    controlId: row['Control ID'] || row['Custom field (Control ID)'] || null,

                    // Secondary link: Evaluations
                    linkedEvaluationIds: (row['Linked Evaluation IDs'] || row['Custom field (Linked Evaluation IDs)'] || '')
                      .split(';').map(s => s.trim()).filter(Boolean),

                    // Deprecated
                    complianceRequirement: row['Compliance Requirement'] || row['Custom field (Compliance Requirement)'] || null,
                    linkedSubcategoryIds: (row['Linked Subcategories'] || '')
                      .split(';').map(s => s.trim()).filter(Boolean),

                    createdDate: row['Created Date'] || row['Created'] || new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    jiraKey: row['Issue key'] || row['Jira Key'] || null,
                    status: row['Status'] || 'ACTIVE',
                    priority: row['Priority'] || 'Medium'
                  };
                });

              set((state) => ({
                artifacts: [...state.artifacts, ...newArtifacts]
              }));

              resolve(newArtifacts.length);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        });
      },

      // Set all artifacts (for import)
      setArtifacts: (artifacts) => {
        set({ artifacts });
<<<<<<< HEAD
      },
    }),
    {
      name: 'csf-artifacts-storage',
=======
      }
    }),
    {
      name: 'csf-artifacts-storage',
      version: 5,
      migrate: (persistedState, version) => {
        // Version 2: Added link, complianceRequirement, controlId, type, jiraKey fields
        if (version < 2 && persistedState?.artifacts) {
          const migratedArtifacts = persistedState.artifacts.map(artifact => ({
            ...artifact,
            link: artifact.link || '',
            complianceRequirement: artifact.complianceRequirement || null,
            controlId: artifact.controlId || null,
            type: artifact.type || 'Document',
            jiraKey: artifact.jiraKey || null,
            createdDate: artifact.createdDate || new Date().toISOString(),
            lastModified: artifact.lastModified || new Date().toISOString()
          }));
          return { artifacts: migratedArtifacts };
        }
        // Version 3: Added default artifacts for new installations
        // Existing users with data keep their artifacts, new users get defaults
        if (version < 3) {
          if (persistedState?.artifacts?.length > 0) {
            // Existing user with data - keep their artifacts
            return persistedState;
          }
          // New user or empty state - use defaults
          return { artifacts: DEFAULT_ARTIFACTS };
        }
        // Version 4: Filter out long timestamp-based artifact IDs and reset to clean defaults
        // Removes artifacts with IDs like AR-1768214343793-1crwz9xd2, keeps only AR-## format
        if (version < 4) {
          // Reset to defaults - this cleans up old long IDs
          return { artifacts: DEFAULT_ARTIFACTS };
        }
        // Version 5: Add controlId links to default artifacts (alignment with new Controls architecture)
        // Existing users get their artifacts updated with correct control links
        if (version < 5) {
          // Use new defaults which include controlId links
          return { artifacts: DEFAULT_ARTIFACTS };
        }
        return persistedState;
      },
      partialize: (state) => ({
        artifacts: state.artifacts
      })
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
    }
  )
);

export default useArtifactStore;
