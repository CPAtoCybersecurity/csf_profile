#!/usr/bin/env node
/**
 * Import assessments from Jira back to CSF Profile format
 *
 * Usage:
 *   node scripts/import-from-jira.js --output csf-import.json
 *   node scripts/import-from-jira.js --project CSFA --output csf-import.json
 */

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import AtlassianClient from '../lib/atlassian-client.js';
import { jiraToAssessments } from '../lib/data-transformer.js';

dotenv.config();

program
  .name('import-from-jira')
  .description('Import assessment work papers from Jira to CSF Profile format')
  .option('-p, --project <key>', 'Jira project key', process.env.JIRA_PROJECT_KEY)
  .option('-o, --output <path>', 'Output JSON file path', './output/jira-import.json')
  .option('--jql <query>', 'Custom JQL query to filter issues')
  .option('--dry-run', 'Show what would be imported without creating file')
  .parse();

const options = program.opts();

async function main() {
  console.log('Jira → CSF Profile Import\n');

  if (!options.project) {
    console.error('Error: Project key required. Use --project or set JIRA_PROJECT_KEY in .env');
    process.exit(1);
  }

  // Build configuration
  const config = {
    projectKey: options.project,
    fields: {
      controlId: process.env.JIRA_FIELD_CONTROL_ID,
      quarter: process.env.JIRA_FIELD_QUARTER,
      year: process.env.JIRA_FIELD_YEAR,
      targetScore: process.env.JIRA_FIELD_TARGET_SCORE,
      actualScore: process.env.JIRA_FIELD_ACTUAL_SCORE,
      testingStatus: process.env.JIRA_FIELD_TESTING_STATUS,
      testProcedures: process.env.JIRA_FIELD_TEST_PROCEDURES,
      observations: process.env.JIRA_FIELD_OBSERVATIONS
    }
  };

  console.log('Connecting to Jira...');
  const client = new AtlassianClient();

  if (!await client.testConnection()) {
    process.exit(1);
  }

  // Build JQL query
  const jql = options.jql || `project = ${options.project} ORDER BY created DESC`;
  console.log(`\nSearching with JQL: ${jql}`);

  // Determine which fields to fetch
  const customFields = Object.values(config.fields).filter(f => f);
  const fetchFields = [
    'summary', 'status', 'assignee', 'created', 'updated',
    ...customFields
  ];

  console.log('Fetching issues...');
  const issues = await client.searchIssues(jql, fetchFields);

  console.log(`Found ${issues.length} issues`);

  if (issues.length === 0) {
    console.log('No issues to import.');
    return;
  }

  // Preview issues
  console.log('\nIssues found:');
  console.log('─'.repeat(60));
  for (const issue of issues.slice(0, 10)) {
    const controlId = issue.fields[config.fields.controlId] || 'N/A';
    const quarter = issue.fields[config.fields.quarter]?.value || 'N/A';
    console.log(`  ${issue.key}: ${issue.fields.summary}`);
    console.log(`    Control: ${controlId}, Quarter: ${quarter}, Status: ${issue.fields.status?.name}`);
  }
  if (issues.length > 10) {
    console.log(`  ... and ${issues.length - 10} more`);
  }
  console.log('─'.repeat(60));

  // Transform to CSF Profile format
  console.log('\nTransforming to CSF Profile format...');
  const assessments = jiraToAssessments(issues, config);

  console.log(`Created ${assessments.length} assessment(s):`);
  for (const assessment of assessments) {
    console.log(`  - ${assessment.name}: ${assessment.scopeIds.length} controls`);
  }

  // Build import structure
  const importData = {
    importDate: new Date().toISOString(),
    source: 'Jira',
    sourceProject: options.project,
    jqlQuery: jql,
    data: {
      assessments
    }
  };

  if (options.dryRun) {
    console.log('\n[DRY RUN] Preview of import data:');
    console.log(JSON.stringify(importData, null, 2).substring(0, 2000));
    console.log('\n[DRY RUN] No files were created.');
    return;
  }

  // Write output file
  const outputPath = path.resolve(options.output);
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(importData, null, 2));

  console.log('\n' + '═'.repeat(60));
  console.log('IMPORT COMPLETE');
  console.log('═'.repeat(60));
  console.log(`Output: ${outputPath}`);
  console.log(`Assessments: ${assessments.length}`);

  console.log('\n' + '─'.repeat(60));
  console.log('NEXT STEPS:');
  console.log('─'.repeat(60));
  console.log('1. Open CSF Profile Assessment Database');
  console.log('2. Go to Settings → Import');
  console.log('3. Upload the generated JSON file');
  console.log('4. Review and confirm import');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
