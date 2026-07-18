/**
 * Data Transformer
 * Converts between CSF Profile format and Atlassian formats
 */

import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

/**
 * Transform CSF Profile Controls to Confluence Database format
 */
export function controlsToConfluence(controls, users) {
  return controls.map(control => ({
    'Control ID': control.controlId,
    'Implementation Description': control.implementationDescription,
    'Control Owner': findUserName(control.ownerId, users),
    'Stakeholders': control.stakeholderIds?.map(id => findUserName(id, users)).join(', ') || '',
    'Linked Requirements': control.linkedRequirementIds?.join(', ') || '',
    'Created Date': control.createdDate,
    'Last Modified': control.lastModified
  }));
}

/**
 * Transform CSF Profile Requirements to Confluence Database format
 */
export function requirementsToConfluence(requirements) {
  return requirements.map(req => ({
    'Requirement ID': req.id,
    'Framework': req.frameworkId || 'nist-csf-2.0',
    'Function': req.function,
    'Category': req.category,
    'Category ID': req.categoryId,
    'Subcategory ID': req.subcategoryId,
    'Subcategory Description': req.subcategoryDescription,
    'Implementation Example': req.implementationExample,
    'In Scope': req.inScope ? 'Yes' : 'No'
  }));
}

/**
 * Transform CSF Profile Assessments to Jira issue format
 */
export function assessmentsToJira(assessments, controls, users, config) {
  const issues = [];

  for (const assessment of assessments) {
    // Each assessment can have multiple controls (scopeIds)
    for (const controlId of assessment.scopeIds || []) {
      const observation = assessment.observations?.[controlId] || {};

      // Create one issue per quarter that has data
      for (const quarter of ['Q1', 'Q2', 'Q3', 'Q4']) {
        const quarterData = observation.quarters?.[quarter];

        // Skip if no data for this quarter
        if (!quarterData || quarterData.testingStatus === 'Not Started') {
          continue;
        }

        const control = controls.find(c => c.controlId === controlId);
        const auditor = findUserEmail(observation.auditorId, users);

        issues.push({
          fields: {
            project: { key: config.projectKey },
            issuetype: { id: config.issueTypeId },
            summary: `WP-${assessment.name}-${controlId}-${quarter}`,
            description: formatJiraDescription(control, observation, quarterData, config),
            assignee: auditor ? { emailAddress: auditor } : null,
            [config.fields.controlId]: controlId,
            [config.fields.quarter]: { value: quarter },
            [config.fields.year]: extractYear(quarterData.observationDate),
            [config.fields.targetScore]: { value: String(quarterData.targetScore || 0) },
            [config.fields.actualScore]: { value: String(quarterData.actualScore || 0) },
            [config.fields.testingStatus]: { value: quarterData.testingStatus || 'Not Started' },
            [config.fields.testProcedures]: observation.testProcedures || '',
            [config.fields.observations]: quarterData.observations || ''
          }
        });
      }
    }
  }

  return issues;
}

/**
 * Transform Confluence Controls to CSF Profile format
 */
export function confluenceToControls(confluenceData, users) {
  return confluenceData.map(row => ({
    controlId: row['Control ID'],
    implementationDescription: row['Implementation Description'],
    ownerId: findUserIdByName(row['Control Owner'], users),
    stakeholderIds: row['Stakeholders']
      ?.split(',')
      .map(name => findUserIdByName(name.trim(), users))
      .filter(id => id !== null) || [],
    linkedRequirementIds: row['Linked Requirements']
      ?.split(',')
      .map(id => id.trim())
      .filter(id => id) || [],
    createdDate: row['Created Date'] || new Date().toISOString(),
    lastModified: row['Last Modified'] || new Date().toISOString()
  }));
}

/**
 * Transform Confluence Requirements to CSF Profile format
 */
export function confluenceToRequirements(confluenceData) {
  return confluenceData.map(row => ({
    id: row['Requirement ID'],
    frameworkId: row['Framework'] || 'nist-csf-2.0',
    function: row['Function'],
    category: row['Category'],
    categoryId: row['Category ID'],
    subcategoryId: row['Subcategory ID'],
    subcategoryDescription: row['Subcategory Description'],
    implementationExample: row['Implementation Example'],
    inScope: row['In Scope']?.toLowerCase() === 'yes'
  }));
}

/**
 * Transform Jira issues to CSF Profile Assessments format
 */
export function jiraToAssessments(jiraIssues, config) {
  // Group issues by assessment (extract from summary pattern)
  const grouped = {};

  for (const issue of jiraIssues) {
    const fields = issue.fields;
    const controlId = fields[config.fields.controlId];
    const quarter = fields[config.fields.quarter]?.value;

    // Extract assessment name from summary: "WP-{name}-{controlId}-{quarter}"
    const match = fields.summary?.match(/^WP-(.+)-(.+)-(Q[1-4])$/);
    const assessmentName = match?.[1] || 'Imported Assessment';

    if (!grouped[assessmentName]) {
      grouped[assessmentName] = {
        id: `imported-${assessmentName}`,
        name: assessmentName,
        description: 'Imported from Jira',
        scopeType: 'controls',
        scopeIds: [],
        status: 'In Progress',
        observations: {}
      };
    }

    const assessment = grouped[assessmentName];

    if (controlId && !assessment.scopeIds.includes(controlId)) {
      assessment.scopeIds.push(controlId);
    }

    if (!assessment.observations[controlId]) {
      assessment.observations[controlId] = {
        auditorId: null, // Would need user mapping
        testProcedures: fields[config.fields.testProcedures] || '',
        linkedArtifacts: [],
        quarters: {
          Q1: createEmptyQuarter(),
          Q2: createEmptyQuarter(),
          Q3: createEmptyQuarter(),
          Q4: createEmptyQuarter()
        }
      };
    }

    if (quarter) {
      assessment.observations[controlId].quarters[quarter] = {
        actualScore: parseInt(fields[config.fields.actualScore]?.value) || 0,
        targetScore: parseInt(fields[config.fields.targetScore]?.value) || 0,
        observations: fields[config.fields.observations] || '',
        observationDate: extractDateFromIssue(issue),
        testingStatus: fields[config.fields.testingStatus]?.value || 'Not Started',
        examine: false,
        interview: false,
        test: false
      };
    }
  }

  return Object.values(grouped);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function findUserName(userId, users) {
  const user = users?.find(u => u.id === userId);
  return user?.name || '';
}

function findUserEmail(userId, users) {
  const user = users?.find(u => u.id === userId);
  return user?.email || null;
}

function findUserIdByName(name, users) {
  if (!name) return null;
  const user = users?.find(u =>
    u.name?.toLowerCase() === name.toLowerCase() ||
    u.email?.toLowerCase() === name.toLowerCase()
  );
  return user?.id || null;
}

function extractYear(dateString) {
  if (!dateString) return new Date().getFullYear();
  const date = new Date(dateString);
  return date.getFullYear();
}

function extractDateFromIssue(issue) {
  return issue.fields.updated?.split('T')[0] || new Date().toISOString().split('T')[0];
}

function createEmptyQuarter() {
  return {
    actualScore: 0,
    targetScore: 0,
    observations: '',
    observationDate: '',
    testingStatus: 'Not Started',
    examine: false,
    interview: false,
    test: false
  };
}

function formatJiraDescription(control, observation, quarterData, config) {
  const confluenceLink = config.confluenceControlsDbUrl
    ? `[View Control in Confluence|${config.confluenceControlsDbUrl}]`
    : '';

  return `
h2. Control Details
${confluenceLink}

*Control ID:* ${control?.controlId || 'N/A'}

*Implementation Description:*
${control?.implementationDescription || 'N/A'}

*Linked Requirements:* ${control?.linkedRequirementIds?.join(', ') || 'None'}

h2. Assessment Methods
* Examine: ${quarterData.examine ? '(/) Yes' : '(x) No'}
* Interview: ${quarterData.interview ? '(/) Yes' : '(x) No'}
* Test: ${quarterData.test ? '(/) Yes' : '(x) No'}

h2. Linked Artifacts
${observation.linkedArtifacts?.length > 0
  ? observation.linkedArtifacts.map(a => `* ${a}`).join('\n')
  : 'No artifacts linked'}
`.trim();
}

// ============================================
// CSV UTILITIES
// ============================================

export function parseCSV(csvContent) {
  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

export function toCSV(data) {
  if (!data || data.length === 0) return '';
  return stringify(data, {
    header: true
  });
}
