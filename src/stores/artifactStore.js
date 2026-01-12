import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';

/**
 * Artifact Store
 * Manages evidence/artifacts linked to controls and requirements.
 * Enhanced to align with Jira AR (Artifacts) project structure.
 */

const useArtifactStore = create(
  persist(
    (set, get) => ({
      artifacts: [],

      // Get all artifacts
      getArtifacts: () => get().artifacts,

      // Add artifact
      addArtifact: (artifact) => {
        const newArtifact = {
          ...artifact,
          id: artifact.id || Date.now() + Math.floor(Math.random() * 1000),
          artifactId: artifact.artifactId || `AR-${Date.now()}`,
          name: artifact.name || '',
          description: artifact.description || '',
          link: artifact.link || '', // URL to external evidence
          complianceRequirement: artifact.complianceRequirement || null, // Linked requirement ID
          controlId: artifact.controlId || null, // Linked control ID
          linkedSubcategoryIds: artifact.linkedSubcategoryIds || [],
          type: artifact.type || 'Document', // Document, Screenshot, Log, Policy, etc.
          createdDate: artifact.createdDate || new Date().toISOString(),
          lastModified: new Date().toISOString(),
          jiraKey: artifact.jiraKey || null // Jira issue key if synced
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
            artifact.id === id
              ? { ...artifact, ...updates, lastModified: new Date().toISOString() }
              : artifact
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

      // Get artifact by artifact ID string
      getArtifactByArtifactId: (artifactId) => {
        return get().artifacts.find(artifact => artifact.artifactId === artifactId);
      },

      // Get artifact by name
      getArtifactByName: (name) => {
        return get().artifacts.find(artifact => artifact.name === name);
      },

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

      // Get artifacts by type
      getArtifactsByType: (type) => {
        return get().artifacts.filter(artifact => artifact.type === type);
      },

      // Link artifact to subcategory
      linkToSubcategory: (artifactId, subcategoryId) => {
        set((state) => ({
          artifacts: state.artifacts.map(artifact => {
            if (artifact.id === artifactId) {
              const linkedIds = artifact.linkedSubcategoryIds || [];
              if (!linkedIds.includes(subcategoryId)) {
                return {
                  ...artifact,
                  linkedSubcategoryIds: [...linkedIds, subcategoryId],
                  lastModified: new Date().toISOString()
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
                  .filter(id => id !== subcategoryId),
                lastModified: new Date().toISOString()
              };
            }
            return artifact;
          })
        }));
      },

      // Link artifact to compliance requirement
      linkToRequirement: (artifactId, requirementId) => {
        get().updateArtifact(artifactId, { complianceRequirement: requirementId });
      },

      // Link artifact to control
      linkToControl: (artifactId, controlId) => {
        get().updateArtifact(artifactId, { controlId });
      },

      // Set Jira key (for sync tracking)
      setJiraKey: (artifactId, jiraKey) => {
        const artifact = get().artifacts.find(a => a.id === artifactId);
        if (artifact) {
          get().updateArtifact(artifactId, { jiraKey });
        }
      },

      // Get artifacts for subcategory
      getArtifactsForSubcategory: (subcategoryId) => {
        return get().artifacts.filter(artifact =>
          (artifact.linkedSubcategoryIds || []).includes(subcategoryId)
        );
      },

      // Find or create artifact
      findOrCreateArtifact: (name, link = '', complianceRequirement = null) => {
        const existing = get().getArtifactByName(name);
        if (existing) return existing.id;

        return get().addArtifact({
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
          'Compliance Requirement': a.complianceRequirement || '',
          'Control ID': a.controlId || '',
          'Linked Subcategories': (a.linkedSubcategoryIds || []).join('; '),
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
          'Custom field (Compliance Requirement)': a.complianceRequirement || '',
          'Custom field (Control ID)': a.controlId || '',
          'Custom field (Artifact Type)': a.type || 'Document',
          'Description': a.description || `Evidence artifact: ${a.name}`
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

      // Import artifacts from CSV
      importArtifactsCSV: async (csvText) => {
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const newArtifacts = results.data.map(row => ({
                id: Date.now() + Math.floor(Math.random() * 10000),
                artifactId: row['Artifact ID'] || `AR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: row['Name'] || row['Summary'] || '',
                description: row['Description'] || '',
                link: row['Link'] || row['Custom field (Link)'] || '',
                type: row['Type'] || row['Custom field (Artifact Type)'] || 'Document',
                complianceRequirement: row['Compliance Requirement'] || row['Custom field (Compliance Requirement)'] || null,
                controlId: row['Control ID'] || row['Custom field (Control ID)'] || null,
                linkedSubcategoryIds: (row['Linked Subcategories'] || '')
                  .split(';').map(s => s.trim()).filter(Boolean),
                createdDate: row['Created Date'] || new Date().toISOString(),
                lastModified: new Date().toISOString(),
                jiraKey: row['Jira Key'] || null
              }));

              set((state) => ({
                artifacts: [...state.artifacts, ...newArtifacts]
              }));

              resolve(newArtifacts.length);
            },
            error: (error) => {
              reject(new Error(`CSV parsing error: ${error.message}`));
            }
          });
        });
      },

      // Set all artifacts (for import)
      setArtifacts: (artifacts) => {
        set({ artifacts });
      }
    }),
    {
      name: 'csf-artifacts-storage',
      version: 2,
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
        return persistedState;
      },
      partialize: (state) => ({
        artifacts: state.artifacts
      })
    }
  )
);

export default useArtifactStore;
