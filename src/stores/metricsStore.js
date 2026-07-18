import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Metrics catalogue store — user-imported KPI/KRI/metric DEFINITIONS.
 *
 * Definitions arrive via CSV import (Settings → Metrics Catalogue) and are
 * "bring your own": the repository ships no metric content beyond the
 * fictional Alma fixture. Quarterly VALUES stay in assessmentsStore; a
 * quarter's optional `metricId` links a recorded value to a definition here.
 *
 * Every imported record carries provenance (`source: "csv-import"`,
 * `catalogSlug`, `importedAt`) — the shareable export (dataExport.js) uses it
 * to exclude imported definitions by default, and catalogues whose `license`
 * is NC/ND/proprietary are hard-blocked from ever leaving via share export
 * (see metricsImport.js licenseIsRestricted).
 */
const useMetricsStore = create(
  persist(
    (set, get) => ({
      metrics: [],

      /** Full replace — restore (dataImport.js) uses this. */
      setMetrics: (metrics) => set({ metrics: Array.isArray(metrics) ? metrics : [] }),

      /**
       * Idempotent per-catalogue replace: drops every record owned by
       * `catalogSlug`, then appends the new records. Re-importing a catalogue
       * updates it in place and never duplicates it.
       */
      replaceCatalog: (catalogSlug, records) => set((state) => ({
        metrics: [
          ...state.metrics.filter((m) => m.catalogSlug !== catalogSlug),
          ...records
        ]
      })),

      /** Remove an imported catalogue entirely. */
      removeCatalog: (catalogSlug) => set((state) => ({
        metrics: state.metrics.filter((m) => m.catalogSlug !== catalogSlug)
      })),

      /** Distinct imported catalogues with per-catalogue counts. */
      getCatalogs: () => {
        const bySlug = new Map();
        get().metrics.forEach((m) => {
          const entry = bySlug.get(m.catalogSlug) || {
            catalogSlug: m.catalogSlug,
            count: 0,
            importedAt: m.importedAt || ''
          };
          entry.count += 1;
          if ((m.importedAt || '') > entry.importedAt) entry.importedAt = m.importedAt;
          bySlug.set(m.catalogSlug, entry);
        });
        return [...bySlug.values()].sort((a, b) => a.catalogSlug.localeCompare(b.catalogSlug));
      }
    }),
    {
      name: 'csf-metrics-storage',
      version: 1,
      partialize: (state) => ({ metrics: state.metrics })
    }
  )
);

export default useMetricsStore;
