import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useArtifactStore = create(
  persist(
    (set, get) => ({
      artifacts: [],

      // Add artifact
      addArtifact: (artifact) => {
        const newArtifact = {
          ...artifact,
          id: artifact.id || Date.now() + Math.floor(Math.random() * 1000),
          linkedSubcategoryIds: artifact.linkedSubcategoryIds || [],
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
            artifact.id === id ? { ...artifact, ...updates } : artifact
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

      // Get artifact by name
      getArtifactByName: (name) => {
        return get().artifacts.find(artifact => artifact.name === name);
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
                  linkedSubcategoryIds: [...linkedIds, subcategoryId]
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
                  .filter(id => id !== subcategoryId)
              };
            }
            return artifact;
          })
        }));
      },

      // Get artifacts for subcategory
      getArtifactsForSubcategory: (subcategoryId) => {
        return get().artifacts.filter(artifact =>
          (artifact.linkedSubcategoryIds || []).includes(subcategoryId)
        );
      },

      // Find or create artifact
      findOrCreateArtifact: (name, link = '') => {
        const existing = get().getArtifactByName(name);
        if (existing) return existing.id;

        return get().addArtifact({
          artifactId: `A${get().artifacts.length + 1}`,
          name,
          description: `Created on ${new Date().toLocaleDateString()}`,
          link,
          linkedSubcategoryIds: [],
        });
      },

      // Set all artifacts (for import)
      setArtifacts: (artifacts) => {
        set({ artifacts });
      },
    }),
    {
      name: 'csf-artifacts-storage',
    }
  )
);

export default useArtifactStore;
