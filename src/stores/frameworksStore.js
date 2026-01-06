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
  },
  {
    id: 'iso27001-2022',
    name: 'ISO/IEC 27001:2022',
    shortName: 'ISO',
    version: '2022',
    source: 'CSF 2.0 Informative References',
    sourceUrl: 'https://www.nist.gov/cyberframework/informative-references',
    description: 'Information Security Management System',
    enabled: true,
    comingSoon: true,
    color: '#7c3aed',
    hierarchyLabels: {
      level1: 'Clause/Annex',
      level2: 'Control Category',
      level3: 'Control',
      level4: 'Implementation Guidance'
    },
    importedDate: null,
    isDefault: false
  },
  {
    id: 'fedramp-sp800-53',
    name: 'FedRAMP (SP 800-53)',
    shortName: 'FedRAMP',
    version: 'Rev 5',
    source: 'CSF 2.0 Informative References',
    sourceUrl: 'https://www.nist.gov/cyberframework/informative-references',
    description: 'Federal Risk and Authorization Management Program',
    enabled: true,
    comingSoon: true,
    color: '#dc2626',
    hierarchyLabels: {
      level1: 'Control Family',
      level2: 'Control',
      level3: 'Control Enhancement',
      level4: 'Implementation Guidance'
    },
    importedDate: null,
    isDefault: false
  },
  {
    id: 'cmmc-sp800-171',
    name: 'CMMC (SP 800-171)',
    shortName: 'CMMC',
    version: 'Rev 3',
    source: 'CSF 2.0 Informative References',
    sourceUrl: 'https://www.nist.gov/cyberframework/informative-references',
    description: 'Cybersecurity Maturity Model Certification',
    enabled: true,
    comingSoon: true,
    color: '#059669',
    hierarchyLabels: {
      level1: 'Domain',
      level2: 'Capability',
      level3: 'Practice',
      level4: 'Assessment Objective'
    },
    importedDate: null,
    isDefault: false
  }
];

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
      version: 4,
      migrate: (persistedState, version) => {
        // Version 2: Reset to new default frameworks (removed SOC2, HIPAA, PCI-DSS; updated names; added source)
        // Version 3: Shortened framework names (removed Rev from name since it's in VERSION column)
        // Version 4: Added comingSoon flag to ISO, FedRAMP, CMMC
        if (version < 4) {
          return { frameworks: defaultFrameworks };
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
