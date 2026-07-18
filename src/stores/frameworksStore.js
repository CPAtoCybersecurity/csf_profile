import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Default frameworks - used for initial state and migrations
const defaultFrameworks = [
  {
    id: 'nist-csf-2.0',
    name: 'NIST CSF 2.0',
    shortName: 'CSF',
    version: '2.0',
    source: 'NIST',
    sourceUrl: 'https://www.nist.gov/cyberframework',
    description: 'NIST Cybersecurity Framework',
    enabled: true,
    color: '#2563eb',
    hierarchyLabels: {
      level1: 'CSF Function',
      level2: 'Category',
      level3: 'Subcategory',
      level4: 'Implementation Example'
    },
    importedDate: new Date().toISOString(),
    isDefault: true
  }
];

// Pre-seeded frameworks retired in v6 — the app is NIST CSF 2.0 only.
// Users bring any additional framework via "Import New Framework" (custom upload).
const RETIRED_SEED_FRAMEWORK_IDS = ['iso27001-2022', 'fedramp-sp800-53', 'cmmc-sp800-171'];

const useFrameworksStore = create(
  persist(
    (set, get) => ({
      frameworks: defaultFrameworks,

      // Get all enabled frameworks
      getEnabledFrameworks: () => {
        return get().frameworks.filter(f => f.enabled);
      },

      // Get framework by ID
      getFramework: (frameworkId) => {
        return get().frameworks.find(f => f.id === frameworkId);
      },

      // Get default framework
      getDefaultFramework: () => {
        return get().frameworks.find(f => f.isDefault) || get().frameworks[0];
      },

      // Replace all frameworks (bulk setter for database restore / import).
      // Guarantees at least one framework remains default so the app always
      // has an active framework to render.
      setFrameworks: (frameworks) => {
        if (!Array.isArray(frameworks) || frameworks.length === 0) return;
        const hasDefault = frameworks.some(f => f.isDefault);
        set({
          frameworks: hasDefault
            ? frameworks
            : frameworks.map((f, i) => (i === 0 ? { ...f, isDefault: true } : f))
        });
      },

      // Add new framework
      addFramework: (framework) => {
        const newFramework = {
          id: framework.id || `custom-${Date.now()}`,
          name: framework.name,
          shortName: framework.shortName,
          version: framework.version || '',
          source: framework.source || 'Custom Import',
          sourceUrl: framework.sourceUrl || '',
          description: framework.description || '',
          color: framework.color || '#6b7280',
          enabled: true,
          importedDate: null,
          isDefault: false,
          hierarchyLabels: framework.hierarchyLabels || {
            level1: 'CSF Function',
            level2: 'Category',
            level3: 'Subcategory',
            level4: 'Implementation Example'
          }
        };
        set((state) => ({
          frameworks: [...state.frameworks, newFramework]
        }));
        return newFramework.id;
      },

      // Update framework
      updateFramework: (frameworkId, updates) => {
        set((state) => ({
          frameworks: state.frameworks.map(f =>
            f.id === frameworkId ? { ...f, ...updates } : f
          )
        }));
      },

      // Toggle framework enabled/disabled
      toggleFramework: (frameworkId) => {
        set((state) => ({
          frameworks: state.frameworks.map(f =>
            f.id === frameworkId ? { ...f, enabled: !f.enabled } : f
          )
        }));
      },

      // Set default framework
      setDefaultFramework: (frameworkId) => {
        set((state) => ({
          frameworks: state.frameworks.map(f => ({
            ...f,
            isDefault: f.id === frameworkId
          }))
        }));
      },

      // Mark framework as imported (has data)
      markFrameworkImported: (frameworkId) => {
        set((state) => ({
          frameworks: state.frameworks.map(f =>
            f.id === frameworkId
              ? { ...f, importedDate: new Date().toISOString() }
              : f
          )
        }));
      },

      // Delete framework (only if custom and no requirements linked)
      deleteFramework: (frameworkId) => {
        const framework = get().getFramework(frameworkId);
        if (framework?.isDefault) {
          console.warn('Cannot delete default framework');
          return false;
        }
        set((state) => ({
          frameworks: state.frameworks.filter(f => f.id !== frameworkId)
        }));
        return true;
      },

      // Get framework color for UI badges
      getFrameworkColor: (frameworkId) => {
        const framework = get().getFramework(frameworkId);
        return framework?.color || '#6b7280'; // gray-500 default
      },

      // Get framework short name for badges
      getFrameworkShortName: (frameworkId) => {
        const framework = get().getFramework(frameworkId);
        return framework?.shortName || frameworkId;
      }
    }),
    {
      name: 'csf-frameworks-storage',
      version: 6,
      migrate: (persistedState, version) => {
        // Version 2: Reset to new default frameworks (removed SOC2, HIPAA, PCI-DSS; updated names; added source)
        // Version 3: Shortened framework names (removed Rev from name since it's in VERSION column)
        // Version 4: Added comingSoon flag to ISO, FedRAMP, CMMC
        // Version 5: Removed comingSoon from ISO 27001 and FedRAMP (cross-framework mappings added)
        // Version 6: NIST CSF 2.0 only — drop the pre-seeded ISO 27001, FedRAMP, and CMMC
        //            frameworks. Any user-imported custom frameworks are preserved.
        if (version < 5) {
          return { frameworks: defaultFrameworks };
        }
        if (version < 6) {
          const kept = (persistedState?.frameworks || []).filter(
            (f) => !RETIRED_SEED_FRAMEWORK_IDS.includes(f.id)
          );
          const hasNist = kept.some((f) => f.id === 'nist-csf-2.0');
          return {
            ...persistedState,
            frameworks: hasNist ? kept : [...defaultFrameworks, ...kept]
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        frameworks: state.frameworks
      })
    }
  )
);

export default useFrameworksStore;
