import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { escapeCSVValue, csvFormulaGuard } from '../utils/sanitize';
import { DEFAULT_ARTIFACTS, RELOCATED_ARTIFACT_LINKS } from './defaultArtifactsData';
import { COMPREHENSIVE_ARTIFACTS, COMPREHENSIVE_ASSESSMENT_ID } from './comprehensiveAssessmentData';
import { DEMO_SEED_SOURCE } from '../utils/assessmentScope';

// Merge defaults + catalog artifacts. De-dupe by artifactId; catalog wins ties.
// Every shipped artifact is Alma demo evidence, so all of them are scoped to
// the demo assessment (issue #297) and carry seed provenance.
// The issue #306 `health` key is normalized into the seed itself, so a FRESH
// install and an UPGRADED install hold byte-identical demo records.
export const SEEDED_ARTIFACTS = (() => {
  const seen = new Set();
  const merged = [];
  for (const a of [...DEFAULT_ARTIFACTS, ...COMPREHENSIVE_ARTIFACTS]) {
    if (seen.has(a.artifactId)) continue;
    seen.add(a.artifactId);
    merged.push({ ...a, assessmentId: COMPREHENSIVE_ASSESSMENT_ID, seedSource: DEMO_SEED_SOURCE });
  }
  return normalizeArtifactFields({ artifacts: merged }).artifacts;
})();

/**
 * Health of the evidence itself (issue #306) — is this artifact current and
 * sufficient, or does it need work? Deliberately SEPARATE from `status`
 * (ACTIVE / PENDING / ARCHIVED), which tracks the record's lifecycle: Steve's
 * 2026-07-19 ratification chose two independent fields over overloading one.
 *
 * The default is '' (not set) rather than 'Healthy' — a brand new artifact
 * nobody has reviewed has not been judged healthy, and asserting otherwise
 * would put a green claim on evidence in an audit register.
 */
export const ARTIFACT_HEALTH_VALUES = ['Healthy', 'Needs Remediation'];

/**
 * Artifact Store
 * Manages evidence/artifacts linked to controls and requirements.
 * Enhanced to align with Jira AR (Artifacts) project structure.
 */

const useArtifactStore = create(
  persist(
    (set, get) => ({
      artifacts: SEEDED_ARTIFACTS,

      // Get all artifacts
      getArtifacts: () => get().artifacts,

      // Add artifact
      addArtifact: (artifact) => {
        const newArtifact = {
          ...artifact,
          id: artifact.id || uuidv4(),
          artifactId: artifact.artifactId || `AR-${uuidv4()}`,
          name: artifact.name || '',
          description: artifact.description || '',
          link: artifact.link || '', // URL to external evidence

          // Primary link: Control (general evidence for a control)
          controlId: artifact.controlId || null,

          // Assessment scope (issue #297): null = visible in every scope
          assessmentId: artifact.assessmentId || null,

          // Secondary link: Evaluations (point-in-time evidence for specific assessments)
          linkedEvaluationIds: artifact.linkedEvaluationIds || [],

          // DEPRECATED: Use controlId → linkedRequirementIds instead
          complianceRequirement: artifact.complianceRequirement || null,
          linkedSubcategoryIds: artifact.linkedSubcategoryIds || [],

          type: artifact.type || 'Document', // Document, Screenshot, Log, Policy, etc.

          // Evidence health (issue #306) — '' means nobody has judged it yet
          health: artifact.health || '',

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
          'Artifact ID': csvFormulaGuard(a.artifactId),
          // 'Name' → 'Artifact Name' (issue #306). Import still accepts the
          // old header, so files exported by earlier versions keep working.
          'Artifact Name': csvFormulaGuard(a.name),
          'Description': csvFormulaGuard(a.description),
          'Link': csvFormulaGuard(a.link || ''),
          'Type': csvFormulaGuard(a.type || 'Document'),
          'Status': csvFormulaGuard(a.status || 'ACTIVE'),
          'Health': csvFormulaGuard(a.health || ''),
          'Priority': csvFormulaGuard(a.priority || 'Medium'),
          'Control ID': csvFormulaGuard(a.controlId || ''),
          'Assessment ID': csvFormulaGuard(a.assessmentId || ''),
          'Linked Evaluation IDs': csvFormulaGuard((a.linkedEvaluationIds || []).join('; ')),
          'Compliance Requirement': csvFormulaGuard(a.complianceRequirement || ''), // Deprecated
          'Linked Subcategories': csvFormulaGuard((a.linkedSubcategoryIds || []).join('; ')), // Deprecated
          // Every one of these round-trips through importArtifactsCSV, so
          // every one is user-controlled and must be escaped. 'Last Updated'
          // is new in issue #306; the rest were already importable and
          // already exported raw — same defect class, fixed together.
          'Created Date': csvFormulaGuard(a.createdDate),
          'Last Updated': csvFormulaGuard(a.lastModified || ''),
          'Jira Key': csvFormulaGuard(a.jiraKey || '')
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
          'Summary': escapeCSVValue(a.name),
          'Issue Type': 'Artifact',
          'Project key': 'AR',
          'Custom field (Link)': escapeCSVValue(a.link || ''),
          'Custom field (Control ID)': escapeCSVValue(a.controlId || ''),
          'Custom field (Linked Evaluation IDs)': (a.linkedEvaluationIds || []).join('; '),
          'Custom field (Compliance Requirement)': escapeCSVValue(a.complianceRequirement || ''), // Deprecated
          'Custom field (Artifact Type)': escapeCSVValue(a.type || 'Document'),
          'Description': escapeCSVValue(a.description || `Evidence artifact: ${a.name}\n\nControl: ${a.controlId || 'N/A'}\nEvaluations: ${(a.linkedEvaluationIds || []).join(', ') || 'N/A'}`)
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
                  const artifactId = row['Issue key'] || row['Artifact ID'] || `AR-${uuidv4()}`;

                  return {
                    id: uuidv4(),
                    artifactId: artifactId,
                    // 'Artifact Name' is the current header (issue #306);
                    // 'Name' is what this app used to export and 'Summary' is
                    // the Jira AR column. All three still land here.
                    name: row['Artifact Name'] || row['Name'] || row['Summary'] || '',
                    description: row['Description'] || '',
                    link: row['Link'] || row['Custom field (Link)'] || '',
                    type: row['Type'] || row['Custom field (Artifact Type)'] || 'Document',

                    // Primary link
                    controlId: row['Control ID'] || row['Custom field (Control ID)'] || null,

                    // Assessment scope (issue #297). Header-name based, so older
                    // CSVs without the column simply land unassigned (null =
                    // visible in every per-assessment view). An id that names no
                    // current assessment is preserved as-is — it stays reachable
                    // under the All scope and survives a later restore of that
                    // assessment; imports never silently rewrite it.
                    assessmentId: (row['Assessment ID'] || '').trim() || null,

                    // Secondary link: Evaluations
                    linkedEvaluationIds: (row['Linked Evaluation IDs'] || row['Custom field (Linked Evaluation IDs)'] || '')
                      .split(';').map(s => s.trim()).filter(Boolean),

                    // Deprecated
                    complianceRequirement: row['Compliance Requirement'] || row['Custom field (Compliance Requirement)'] || null,
                    linkedSubcategoryIds: (row['Linked Subcategories'] || '')
                      .split(';').map(s => s.trim()).filter(Boolean),

                    createdDate: row['Created Date'] || row['Created'] || new Date().toISOString(),
                    // Honor an exported 'Last Updated' so an export → import
                    // round-trip preserves when the evidence actually changed.
                    // Without the column this is a brand new local record, so
                    // "now" is the honest answer.
                    lastModified: (row['Last Updated'] || '').trim() || new Date().toISOString(),
                    jiraKey: row['Issue key'] || row['Jira Key'] || null,
                    status: row['Status'] || 'ACTIVE',
                    // issue #306 — blank stays blank ("not set"), never
                    // defaulted to Healthy
                    health: (row['Health'] || '').trim(),
                    priority: row['Priority'] || 'Medium'
                  };
                });

              set((state) => ({
                artifacts: [...state.artifacts, ...newArtifacts]
              }));

              resolve(newArtifacts.length);
            },
            error: (error) => {
              reject(new Error('Failed to import CSV file. Please verify the file format.'));
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
      version: 9,
      migrate: (persistedState, version) => migrateArtifactsState(persistedState, version),
      partialize: (state) => ({
        artifacts: state.artifacts
      })
    }
  )
);

/**
 * Rewrite artifact links that this app seeded and that a repository restructure later broke.
 *
 * Matches on the exact dead URL, so a link the user typed or edited is left alone. Idempotent:
 * once rewritten, the old string is gone and subsequent runs match nothing. Only the `link`
 * field is repaired — a URL a user pasted into a description is their prose, not our data.
 *
 * The lookup is own-property-only. A link reading `toString` or `__proto__` — reachable through
 * CSV import, which takes the column raw — would otherwise resolve to an inherited member and
 * replace the link with a function or an object, which JSON.stringify then drops on the way
 * into localStorage. Silent field loss is not an acceptable failure mode for a migration.
 */
/**
 * Full persisted-state migration for csf-artifacts-storage. Exported so tests
 * exercise the EXACT production path. Version 7 (#287), version 8 (#297) and
 * version 9 (#306) run after the version chain rather than as more branches in
 * it — the branches return early, so a user coming from v5 would never reach a
 * branch placed at the end. Repairing afterwards covers every upgrade path,
 * and all three passes are no-ops on states that already carry the new data.
 */
export function migrateArtifactsState(persistedState, version) {
  return normalizeArtifactFields(
    stampSeededDemoArtifacts(repairRelocatedLinks(applyVersionMigrations(persistedState, version)))
  );
}

/**
 * Version 9 (issue #306): give every artifact the `health` key and a
 * `lastModified` the panel can render.
 *
 * Absent-only: an existing string is never rewritten, so '' (deliberately
 * "not set") survives untouched. `lastModified` falls back to `createdDate`
 * rather than to now — stamping now would claim the evidence was updated
 * today, which is exactly the fact the field exists to report.
 *
 * Exported because the restore path (dataImport) uses zustand's bulk setters,
 * which bypass this store's load-time migrate entirely.
 */
export function normalizeArtifactFields(state) {
  const artifacts = state?.artifacts;
  if (!Array.isArray(artifacts)) return state;

  let changed = false;
  const normalized = artifacts.map((artifact) => {
    if (!artifact || typeof artifact !== 'object') return artifact;
    const patch = {};
    if (typeof artifact.health !== 'string') patch.health = '';
    // Only write lastModified when there is a real value to write. Patching a
    // blank back to a blank would make this pass non-idempotent, which is the
    // one property a migration that runs on every load cannot afford.
    const hasLastModified = typeof artifact.lastModified === 'string' && artifact.lastModified !== '';
    const createdDate = typeof artifact.createdDate === 'string' ? artifact.createdDate : '';
    if (!hasLastModified && createdDate) patch.lastModified = createdDate;
    else if (typeof artifact.lastModified !== 'string') patch.lastModified = '';
    if (Object.keys(patch).length === 0) return artifact;
    changed = true;
    return { ...artifact, ...patch };
  });

  return changed ? { ...state, artifacts: normalized } : state;
}

/**
 * Version 8 (issue #297): scope the shipped demo artifacts to the demo assessment.
 *
 * Existing installs hold copies of the seeded Alma artifacts with no assessmentId, so they
 * bleed into every assessment's Artifacts view. Stamp exactly those copies with the demo
 * assessment id and seed provenance. Heal-in-place with a conservative guard:
 *
 * - Match requires BOTH the seeded artifactId AND the exact seeded name — the Artifacts page
 *   suggests `AR-<n>` ids for new records, so an id alone can collide with a user's own
 *   artifact. A seeded record the user renamed stays unstamped (null = visible everywhere,
 *   so nothing the user can see is ever lost).
 * - An artifact that already has ANY assessmentId is never touched.
 *
 * Idempotent: once stamped, the no-assessmentId guard matches nothing.
 */
export function stampSeededDemoArtifacts(state) {
  const artifacts = state?.artifacts;
  if (!Array.isArray(artifacts)) return state;

  const seededNamesById = new Map(SEEDED_ARTIFACTS.map(a => [a.artifactId, a.name]));

  let changed = false;
  const stamped = artifacts.map(artifact => {
    // Absent-only: any existing assessmentId OR seedSource means this record
    // has already been classified (locally or by the install that exported
    // it) — never re-derive over an existing classification.
    if (!artifact || artifact.assessmentId || artifact.seedSource) return artifact;
    // The match must be POSITIVE on both sides — a record with an unknown
    // artifactId and no name must not match via undefined === undefined.
    const seededName = seededNamesById.get(artifact.artifactId);
    if (!seededName || seededName !== artifact.name) return artifact;
    changed = true;
    return { ...artifact, assessmentId: COMPREHENSIVE_ASSESSMENT_ID, seedSource: DEMO_SEED_SOURCE };
  });

  return changed ? { ...state, artifacts: stamped } : state;
}

export function repairRelocatedLinks(state) {
  const artifacts = state?.artifacts;
  if (!Array.isArray(artifacts)) return state;

  let changed = false;
  const repaired = artifacts.map(artifact => {
    const link = artifact?.link;
    if (typeof link !== 'string') return artifact;
    if (!Object.prototype.hasOwnProperty.call(RELOCATED_ARTIFACT_LINKS, link)) return artifact;

    const replacement = RELOCATED_ARTIFACT_LINKS[link];
    if (typeof replacement !== 'string') return artifact;

    changed = true;
    return { ...artifact, link: replacement };
  });

  return changed ? { ...state, artifacts: repaired } : state;
}

function applyVersionMigrations(persistedState, version) {
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
        // Version 6: Merge in ASSESSMENT_CATALOG artifacts (Policies, Procedures,
        // Reports, Inventories, Tickets, Evidence). De-dupe by artifactId or by name.
        if (version < 6) {
          const existing = persistedState?.artifacts || [];
          const existingIds = new Set(existing.map(a => a.artifactId));
          const existingNames = new Set(existing.map(a => (a.name || '').toLowerCase()));
          const additions = COMPREHENSIVE_ARTIFACTS.filter(a =>
            !existingIds.has(a.artifactId) && !existingNames.has((a.name || '').toLowerCase())
          );
          return { ...persistedState, artifacts: [...existing, ...additions] };
        }
        return persistedState;
}

export default useArtifactStore;
