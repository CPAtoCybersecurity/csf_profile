/**
 * Data Migration Utility
 *
 * Migrates data from the old csfStore format (v1.0) to the new multi-store
 * architecture (v2.0) with separate Requirements, Controls, and Assessments stores.
 */

import useRequirementsStore from '../stores/requirementsStore';
import useControlsStore from '../stores/controlsStore';
import useAssessmentsStore from '../stores/assessmentsStore';

/**
 * Check if legacy data exists in localStorage
 */
export const hasLegacyData = () => {
  try {
    const legacyData = localStorage.getItem('csf-data-storage');
    if (!legacyData) return false;

    const parsed = JSON.parse(legacyData);
    return parsed?.state?.data?.length > 0;
  } catch (e) {
    return false;
  }
};

/**
 * Get legacy data from localStorage
 */
export const getLegacyData = () => {
  try {
    const legacyData = localStorage.getItem('csf-data-storage');
    if (!legacyData) return null;

    const parsed = JSON.parse(legacyData);
    return parsed?.state?.data || null;
  } catch (e) {
    console.error('Error reading legacy data');
    return null;
  }
};

/**
 * Migrate legacy CSF data to new store structure
 *
 * Old structure (per item):
 * - Function, Category, Subcategory ID, Implementation Example (CSF reference)
 * - In Scope, Owner, Stakeholders (ownership)
 * - Testing Status, Observations, Actual Score, Target Score (assessment)
 * - Action Plan, Due Date, remediationOwnerId (remediation)
 * - quarters: { Q1: {...}, Q2: {...}, Q3: {...}, Q4: {...} }
 *
 * New structure:
 * - Requirements: CSF reference data only
 * - Controls: User-defined controls with ownership
 * - Assessments: Testing observations and remediation
 */
export const migrateLegacyData = () => {
  const legacyData = getLegacyData();
  if (!legacyData || legacyData.length === 0) {
    return { success: false, message: 'No legacy data found' };
  }

  try {
    // 1. Migrate to Requirements store (CSF reference data)
    const requirements = legacyData.map(item => ({
      id: item.ID,
      frameworkId: 'nist-csf-2.0',
      function: item.Function || '',
      functionDescription: item['Function Description'] || '',
      category: item.Category || '',
      categoryDescription: item['Category Description'] || '',
      subcategoryId: item['Subcategory ID'] || '',
      subcategoryDescription: item['Subcategory Description'] || '',
      implementationExample: item['Implementation Example'] || '',
      inScope: item['In Scope? '] === 'Yes'
    }));

    useRequirementsStore.getState().setRequirements(requirements);

    // 2. Create controls from items that have implementation descriptions or owners
    const controlsToCreate = legacyData.filter(item =>
      item['Implementation Description'] ||
      item['Control Implementation Description'] ||
      item.ownerId ||
      (item.stakeholderIds && item.stakeholderIds.length > 0)
    );

    if (controlsToCreate.length > 0) {
      const controls = controlsToCreate.map((item, index) => ({
        controlId: `CTL-${String(index + 1).padStart(3, '0')}`,
        implementationDescription: item['Implementation Description'] ||
          item['Control Implementation Description'] ||
          `Implementation for ${item['Subcategory ID'] || item.ID}`,
        ownerId: item.ownerId || null,
        stakeholderIds: item.stakeholderIds || [],
        linkedRequirementIds: [item.ID],
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }));

      useControlsStore.getState().setControls(controls);
    }

    // 3. Create assessment from quarterly data
    const hasQuarterlyData = legacyData.some(item =>
      item.quarters && Object.keys(item.quarters).some(q => {
        const qData = item.quarters[q];
        return qData && (qData.observations || qData.testingStatus !== 'Not Started');
      })
    );

    if (hasQuarterlyData) {
      // Find which quarters have data
      const quartersWithData = [1, 2, 3, 4].filter(q =>
        legacyData.some(item => {
          const qData = item.quarters?.[`Q${q}`];
          return qData && (qData.observations || qData.testingStatus !== 'Not Started');
        })
      );

      // Create an assessment for each quarter with data
      quartersWithData.forEach(quarterNum => {
        const quarterKey = `Q${quarterNum}`;
        const itemsWithData = legacyData.filter(item => {
          const qData = item.quarters?.[quarterKey];
          return qData && (qData.observations || qData.testingStatus !== 'Not Started');
        });

        if (itemsWithData.length > 0) {
          const assessment = {
            name: `Migrated Assessment ${quarterKey}`,
            description: `Assessment data migrated from v1.0 (${quarterKey})`,
            scopeType: 'requirements',
            scopeIds: itemsWithData.map(item => item.ID),
            frameworkFilter: 'nist-csf-2.0'
          };

          const created = useAssessmentsStore.getState().createAssessment(assessment);

          // Migrate observations
          itemsWithData.forEach(item => {
            const qData = item.quarters[quarterKey];
            if (!qData) return;

            useAssessmentsStore.getState().updateObservation(created.id, item.ID, {
              auditorId: item.auditorId || null,
              testingStatus: qData.testingStatus || 'Not Started',
              observationDate: qData.observationDate || '',
              assessmentMethods: {
                examine: qData.examine || false,
                interview: qData.interview || false,
                test: qData.test || false
              },
              observations: qData.observations || '',
              linkedArtifacts: item.linkedArtifacts || [],
              actualScore: qData.actualScore || 0,
              targetScore: qData.targetScore || 0,
              remediation: {
                ownerId: item.remediationOwnerId || null,
                actionPlan: item['Action Plan'] || '',
                dueDate: item['Remediation Due Date'] || ''
              }
            });
          });
        }
      });
    }

    return {
      success: true,
      message: `Migrated ${requirements.length} requirements, ${controlsToCreate.length} controls`,
      stats: {
        requirements: requirements.length,
        controls: controlsToCreate.length,
        assessments: hasQuarterlyData ? 'Created from quarterly data' : 'None'
      }
    };

  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: 'Migration failed. Please check logs or contact support.'
    };
  }
};

/**
 * Clear legacy data from localStorage (after successful migration)
 */
export const clearLegacyData = () => {
  try {
    localStorage.removeItem('csf-data-storage');
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Export current data for backup before migration
 */
export const exportLegacyBackup = () => {
  const legacyData = getLegacyData();
  if (!legacyData) return null;

  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: legacyData
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `csf-backup-v1-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};
