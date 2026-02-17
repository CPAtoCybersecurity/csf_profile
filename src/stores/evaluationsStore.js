import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sanitizeInput } from '../utils/sanitize';

/**
 * Evaluations Store
 *
 * Manages point-in-time evaluation records for controls within assessments.
 * This is a NEW entity extracted from the embedded observations in assessmentsStore.
 *
 * Data Model:
 * - Evaluation = Point-in-time assessment of a Control for a specific quarter
 * - Links: Assessment (parent) -> Evaluation -> Control
 * - Findings link TO Evaluations (not directly to Controls)
 * - Artifacts can link to Evaluations
 *
 * Migration: Existing assessments.observations will be migrated to this store.
 */

// Helper to create a unique evaluation ID
const createEvaluationId = (assessmentId, controlId, quarter) =>
  `EVAL-${assessmentId}-${controlId}-${quarter}`;

// Parse evaluation ID to extract components
const parseEvaluationId = (evalId) => {
  const match = evalId.match(/^EVAL-(.+)-([^-]+)-([^-]+)$/);
  if (!match) return null;
  return {
    assessmentId: match[1],
    controlId: match[2],
    quarter: match[3]
  };
};

const useEvaluationsStore = create(
  persist(
    (set, get) => ({
      evaluations: [],
      loading: false,
      error: null,
      migrated: false, // Track if legacy migration has been performed

      // ============ CRUD Operations ============

      // Create a new evaluation
      createEvaluation: (evaluationData) => {
        const { assessmentId, controlId, quarter } = evaluationData;

        if (!assessmentId || !controlId || !quarter) {
          console.error('createEvaluation requires assessmentId, controlId, and quarter');
          return null;
        }

        if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) {
          console.error('quarter must be Q1, Q2, Q3, or Q4');
          return null;
        }

        const id = createEvaluationId(assessmentId, controlId, quarter);

        // Check if evaluation already exists
        const existing = get().getEvaluation(id);
        if (existing) {
          console.warn(`Evaluation ${id} already exists, use updateEvaluation instead`);
          return existing;
        }

        const now = new Date().toISOString();
        const newEvaluation = {
          id,
          assessmentId,
          controlId,
          quarter,

          // Auditor
          auditorId: evaluationData.auditorId || null,

          // Scoring
          actualScore: evaluationData.actualScore || 0,
          targetScore: evaluationData.targetScore || 0,

          // Observations
          observations: sanitizeInput(evaluationData.observations || ''),
          testProcedures: sanitizeInput(evaluationData.testProcedures || ''),

          // Testing status
          testingStatus: evaluationData.testingStatus || 'Not Started',

          // Assessment methods
          examine: evaluationData.examine || false,
          interview: evaluationData.interview || false,
          test: evaluationData.test || false,

          // Temporal
          evaluationDate: evaluationData.evaluationDate || now.split('T')[0],

          // Linked artifacts (for this specific evaluation)
          linkedArtifactIds: evaluationData.linkedArtifactIds || [],

          // Remediation (kept here for now, may move to Findings later)
          remediation: {
            ownerId: evaluationData.remediation?.ownerId || null,
            actionPlan: sanitizeInput(evaluationData.remediation?.actionPlan || ''),
            dueDate: evaluationData.remediation?.dueDate || ''
          },

          // Jira sync
          jiraKey: evaluationData.jiraKey || null,

          // Metadata
          createdDate: now,
          lastModified: now
        };

        set(state => ({
          evaluations: [...state.evaluations, newEvaluation]
        }));

        return newEvaluation;
      },

      // Get evaluation by ID
      getEvaluation: (evalId) => {
        return get().evaluations.find(e => e.id === evalId) || null;
      },

      // Get evaluation by composite key
      getEvaluationByKey: (assessmentId, controlId, quarter) => {
        const id = createEvaluationId(assessmentId, controlId, quarter);
        return get().getEvaluation(id);
      },

      // Update an existing evaluation
      updateEvaluation: (evalId, updates) => {
        const now = new Date().toISOString();

        set(state => ({
          evaluations: state.evaluations.map(e => {
            if (e.id !== evalId) return e;

            // Sanitize text fields
            const sanitizedUpdates = { ...updates };
            if (updates.observations !== undefined) {
              sanitizedUpdates.observations = sanitizeInput(updates.observations);
            }
            if (updates.testProcedures !== undefined) {
              sanitizedUpdates.testProcedures = sanitizeInput(updates.testProcedures);
            }
            if (updates.remediation?.actionPlan !== undefined) {
              sanitizedUpdates.remediation = {
                ...e.remediation,
                ...updates.remediation,
                actionPlan: sanitizeInput(updates.remediation.actionPlan)
              };
            }

            return {
              ...e,
              ...sanitizedUpdates,
              lastModified: now
            };
          })
        }));
      },

      // Delete an evaluation
      deleteEvaluation: (evalId) => {
        set(state => ({
          evaluations: state.evaluations.filter(e => e.id !== evalId)
        }));
      },

      // ============ Query Methods ============

      // Get all evaluations for an assessment
      getEvaluationsByAssessment: (assessmentId) => {
        return get().evaluations.filter(e => e.assessmentId === assessmentId);
      },

      // Get all evaluations for a control (across all assessments)
      getEvaluationsByControl: (controlId) => {
        return get().evaluations.filter(e => e.controlId === controlId);
      },

      // Get all evaluations for a specific quarter (across all assessments)
      getEvaluationsByQuarter: (quarter) => {
        return get().evaluations.filter(e => e.quarter === quarter);
      },

      // Get evaluations for an assessment filtered by quarter
      getEvaluationsByAssessmentAndQuarter: (assessmentId, quarter) => {
        return get().evaluations.filter(
          e => e.assessmentId === assessmentId && e.quarter === quarter
        );
      },

      // Get evaluation history for a control (all assessments, chronological)
      getControlEvaluationHistory: (controlId) => {
        return get().evaluations
          .filter(e => e.controlId === controlId)
          .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
      },

      // Get or create evaluation (useful for UI that needs to ensure evaluation exists)
      getOrCreateEvaluation: (assessmentId, controlId, quarter) => {
        const existing = get().getEvaluationByKey(assessmentId, controlId, quarter);
        if (existing) return existing;

        return get().createEvaluation({ assessmentId, controlId, quarter });
      },

      // ============ Bulk Operations ============

      // Create multiple evaluations (for initial migration)
      bulkCreateEvaluations: (evaluationsData) => {
        const now = new Date().toISOString();
        const existingIds = new Set(get().evaluations.map(e => e.id));

        const newEvaluations = evaluationsData
          .filter(data => {
            const id = createEvaluationId(data.assessmentId, data.controlId, data.quarter);
            return !existingIds.has(id);
          })
          .map(data => ({
            id: createEvaluationId(data.assessmentId, data.controlId, data.quarter),
            assessmentId: data.assessmentId,
            controlId: data.controlId,
            quarter: data.quarter,
            auditorId: data.auditorId || null,
            actualScore: data.actualScore || 0,
            targetScore: data.targetScore || 0,
            observations: sanitizeInput(data.observations || ''),
            testProcedures: sanitizeInput(data.testProcedures || ''),
            testingStatus: data.testingStatus || 'Not Started',
            examine: data.examine || false,
            interview: data.interview || false,
            test: data.test || false,
            evaluationDate: data.evaluationDate || now.split('T')[0],
            linkedArtifactIds: data.linkedArtifactIds || [],
            remediation: {
              ownerId: data.remediation?.ownerId || null,
              actionPlan: sanitizeInput(data.remediation?.actionPlan || ''),
              dueDate: data.remediation?.dueDate || ''
            },
            jiraKey: data.jiraKey || null,
            createdDate: data.createdDate || now,
            lastModified: now
          }));

        set(state => ({
          evaluations: [...state.evaluations, ...newEvaluations]
        }));

        return newEvaluations.length;
      },

      // Delete all evaluations for an assessment
      deleteEvaluationsByAssessment: (assessmentId) => {
        set(state => ({
          evaluations: state.evaluations.filter(e => e.assessmentId !== assessmentId)
        }));
      },

      // ============ Progress & Statistics ============

      // Get progress for an assessment
      getAssessmentProgress: (assessmentId, quarter = null) => {
        let evals = get().getEvaluationsByAssessment(assessmentId);

        if (quarter) {
          evals = evals.filter(e => e.quarter === quarter);
        }

        const total = evals.length;
        const completed = evals.filter(e => e.testingStatus === 'Complete').length;
        const inProgress = evals.filter(e => e.testingStatus === 'In Progress').length;
        const submitted = evals.filter(e => e.testingStatus === 'Submitted').length;

        return {
          total,
          completed,
          inProgress,
          submitted,
          notStarted: total - completed - inProgress - submitted,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      },

      // Get average scores for an assessment
      getAssessmentScores: (assessmentId, quarter = null) => {
        let evals = get().getEvaluationsByAssessment(assessmentId);

        if (quarter) {
          evals = evals.filter(e => e.quarter === quarter);
        }

        const scoredEvals = evals.filter(e => e.actualScore > 0 || e.targetScore > 0);

        if (scoredEvals.length === 0) {
          return { avgActual: 0, avgTarget: 0, count: 0 };
        }

        const sumActual = scoredEvals.reduce((sum, e) => sum + e.actualScore, 0);
        const sumTarget = scoredEvals.reduce((sum, e) => sum + e.targetScore, 0);

        return {
          avgActual: Math.round((sumActual / scoredEvals.length) * 100) / 100,
          avgTarget: Math.round((sumTarget / scoredEvals.length) * 100) / 100,
          count: scoredEvals.length
        };
      },

      // ============ Migration from Legacy Assessments ============

      /**
       * Migrate embedded observations from assessmentsStore to evaluations
       * This should be called once during app initialization if legacy data exists
       */
      migrateFromAssessments: (assessmentsStore) => {
        if (get().migrated) {
          console.log('Evaluations already migrated');
          return 0;
        }

        const assessments = assessmentsStore.getState().assessments || [];
        const evaluationsData = [];

        assessments.forEach(assessment => {
          const observations = assessment.observations || {};

          Object.entries(observations).forEach(([controlId, obs]) => {
            // Skip if no quarterly data
            if (!obs.quarters) return;

            ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
              const qData = obs.quarters[quarter];

              // Skip empty quarters
              if (!qData || (qData.testingStatus === 'Not Started' && !qData.observations && qData.actualScore === 0)) {
                return;
              }

              evaluationsData.push({
                assessmentId: assessment.id,
                controlId,
                quarter,
                auditorId: obs.auditorId,
                actualScore: qData.actualScore,
                targetScore: qData.targetScore,
                observations: qData.observations,
                testProcedures: obs.testProcedures,
                testingStatus: qData.testingStatus,
                examine: qData.examine,
                interview: qData.interview,
                test: qData.test,
                evaluationDate: qData.observationDate,
                linkedArtifactIds: obs.linkedArtifacts || [],
                remediation: obs.remediation,
                jiraKey: obs.jiraKey,
                createdDate: assessment.createdDate
              });
            });
          });
        });

        const count = get().bulkCreateEvaluations(evaluationsData);

        set({ migrated: true });

        console.log(`Migrated ${count} evaluations from ${assessments.length} assessments`);
        return count;
      },

      // ============ Compatibility Layer ============

      /**
       * Get observation data in legacy format (for backward compatibility)
       * This allows existing UI to work while transitioning
       */
      getObservationLegacyFormat: (assessmentId, controlId) => {
        const evals = get().evaluations.filter(
          e => e.assessmentId === assessmentId && e.controlId === controlId
        );

        if (evals.length === 0) return null;

        // Reconstruct legacy format
        const firstEval = evals[0];
        const quarters = {};

        evals.forEach(e => {
          quarters[e.quarter] = {
            actualScore: e.actualScore,
            targetScore: e.targetScore,
            observations: e.observations,
            observationDate: e.evaluationDate,
            testingStatus: e.testingStatus,
            examine: e.examine,
            interview: e.interview,
            test: e.test
          };
        });

        return {
          auditorId: firstEval.auditorId,
          testProcedures: firstEval.testProcedures,
          linkedArtifacts: firstEval.linkedArtifactIds,
          remediation: firstEval.remediation,
          jiraKey: firstEval.jiraKey,
          quarters
        };
      },

      /**
       * Update from legacy observation format (for backward compatibility)
       * This allows existing UI to work while transitioning
       */
      updateFromLegacyFormat: (assessmentId, controlId, legacyData) => {
        const { quarters, ...commonData } = legacyData;

        if (quarters) {
          Object.entries(quarters).forEach(([quarter, qData]) => {
            const evalId = createEvaluationId(assessmentId, controlId, quarter);
            const existing = get().getEvaluation(evalId);

            if (existing) {
              // Update existing evaluation
              get().updateEvaluation(evalId, {
                ...commonData,
                ...qData,
                evaluationDate: qData.observationDate,
                linkedArtifactIds: legacyData.linkedArtifacts
              });
            } else if (qData.testingStatus !== 'Not Started' || qData.observations || qData.actualScore > 0) {
              // Create new evaluation if it has meaningful data
              get().createEvaluation({
                assessmentId,
                controlId,
                quarter,
                ...commonData,
                ...qData,
                evaluationDate: qData.observationDate,
                linkedArtifactIds: legacyData.linkedArtifacts
              });
            }
          });
        }
      },

      // Reset store (for testing)
      reset: () => {
        set({ evaluations: [], migrated: false, loading: false, error: null });
      }
    }),
    {
      name: 'csf-evaluations-storage',
      version: 1,
      partialize: (state) => ({
        evaluations: state.evaluations,
        migrated: state.migrated
      })
    }
  )
);

export default useEvaluationsStore;

// Export helpers for use in other modules
export { createEvaluationId, parseEvaluationId };
