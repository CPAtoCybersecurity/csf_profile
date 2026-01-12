#!/usr/bin/env node
/**
 * Export CSF Profile Assessments to Jira
 *
 * Usage:
 *   node scripts/export-to-jira.js --file ../exports/csf-export.json
 *   node scripts/export-to-jira.js --file ../exports/csf-export.json --dry-run
 */

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import AtlassianClient from '../lib/atlassian-client.js';
import { assessmentsToJira } from '../lib/data-transformer.js';

dotenv.config();

program
  .name('export-to-jira')
  .description('Export CSF Profile assessments to Jira as work paper issues')
  .requiredOption('-f, --file <path>', 'Path to CSF Profile JSON export file')
  .option('--dry-run', 'Show what would be created without actually creating issues')
  .option('--assessment <name>', 'Only export a specific assessment by name')
  .option('--quarter <q>', 'Only export a specific quarter (Q1, Q2, Q3, Q4)')
  .parse();

const options = program.opts();

async function main() {
  console.log('CSF Profile → Jira Export\n');

  // Load export file
  const filePath = path.resolve(options.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Loading: ${filePath}`);
  const exportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Validate structure
  if (!exportData.data) {
    console.error('Error: Invalid export file format. Expected "data" property.');
    process.exit(1);
  }

  const { assessments, controls, users } = exportData.data;

  console.log(`Found: ${assessments?.length || 0} assessments, ${controls?.length || 0} controls`);

  // Filter if specific assessment requested
  let targetAssessments = assessments || [];
  if (options.assessment) {
    targetAssessments = targetAssessments.filter(a =>
      a.name.toLowerCase().includes(options.assessment.toLowerCase())
    );
    console.log(`Filtered to ${targetAssessments.length} assessments matching "${options.assessment}"`);
  }

  if (targetAssessments.length === 0) {
    console.log('No assessments to export.');
    return;
  }

  // Build Jira field configuration from env
  const config = {
    projectKey: process.env.JIRA_PROJECT_KEY,
    issueTypeId: process.env.JIRA_ASSESSMENT_ISSUE_TYPE_ID,
    confluenceControlsDbUrl: process.env.CONFLUENCE_CONTROLS_DB_ID
      ? `${process.env.ATLASSIAN_SITE_URL}/wiki/spaces/${process.env.CONFLUENCE_SPACE_KEY}/database/${process.env.CONFLUENCE_CONTROLS_DB_ID}`
      : null,
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

  // Validate configuration
  if (!config.projectKey || !config.issueTypeId) {
    console.error('Error: Missing JIRA_PROJECT_KEY or JIRA_ASSESSMENT_ISSUE_TYPE_ID in .env');
    process.exit(1);
  }

  // Transform data
  console.log('\nTransforming assessments to Jira format...');
  const jiraIssues = assessmentsToJira(targetAssessments, controls, users, config);

  // Filter by quarter if specified
  let issuesToCreate = jiraIssues;
  if (options.quarter) {
    const q = options.quarter.toUpperCase();
    issuesToCreate = jiraIssues.filter(issue =>
      issue.fields[config.fields.quarter]?.value === q
    );
    console.log(`Filtered to ${issuesToCreate.length} issues for ${q}`);
  }

  console.log(`Total issues to create: ${issuesToCreate.length}`);

  if (issuesToCreate.length === 0) {
    console.log('No issues to create.');
    return;
  }

  // Show preview
  console.log('\nPreview of issues to create:');
  console.log('─'.repeat(60));
  for (const issue of issuesToCreate.slice(0, 5)) {
    console.log(`  ${issue.fields.summary}`);
    console.log(`    Control: ${issue.fields[config.fields.controlId]}`);
    console.log(`    Quarter: ${issue.fields[config.fields.quarter]?.value}`);
    console.log(`    Status: ${issue.fields[config.fields.testingStatus]?.value}`);
  }
  if (issuesToCreate.length > 5) {
    console.log(`  ... and ${issuesToCreate.length - 5} more`);
  }
  console.log('─'.repeat(60));

  if (options.dryRun) {
    console.log('\n[DRY RUN] No issues were created.');
    console.log('Remove --dry-run flag to create issues in Jira.');
    return;
  }

  // Create issues in Jira
  console.log('\nConnecting to Jira...');
  const client = new AtlassianClient();

  if (!await client.testConnection()) {
    process.exit(1);
  }

  console.log('\nCreating issues...');
  const created = [];
  const errors = [];

  for (const issue of issuesToCreate) {
    try {
      const result = await client.createIssue(
        config.projectKey,
        config.issueTypeId,
        issue.fields
      );
      created.push({
        key: result.key,
        summary: issue.fields.summary,
        url: client.getIssueBrowseUrl(result.key)
      });
      console.log(`  ✓ Created: ${result.key} - ${issue.fields.summary}`);
    } catch (error) {
      errors.push({
        summary: issue.fields.summary,
        error: error.response?.data?.errors || error.message
      });
      console.log(`  ✗ Failed: ${issue.fields.summary}`);
      console.log(`    Error: ${JSON.stringify(error.response?.data?.errors || error.message)}`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('EXPORT SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Created: ${created.length}`);
  console.log(`Failed: ${errors.length}`);

  if (created.length > 0) {
    console.log('\nCreated Issues:');
    for (const issue of created) {
      console.log(`  ${issue.key}: ${issue.url}`);
    }
  }

  if (errors.length > 0) {
    console.log('\nFailed Issues:');
    for (const err of errors) {
      console.log(`  ${err.summary}: ${JSON.stringify(err.error)}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
