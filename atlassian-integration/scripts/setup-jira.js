#!/usr/bin/env node
/**
 * Setup helper for Jira project configuration
 *
 * This script helps you find the IDs needed for your .env file:
 * - Issue type IDs
 * - Custom field IDs
 * - Project information
 *
 * Usage:
 *   node scripts/setup-jira.js
 */

import dotenv from 'dotenv';
import AtlassianClient from '../lib/atlassian-client.js';

dotenv.config();

async function main() {
  console.log('Jira Setup Helper\n');
  console.log('This script will help you find the IDs needed for your .env file.\n');

  const client = new AtlassianClient();

  if (!await client.testConnection()) {
    console.log('\nFix your connection settings in .env and try again.');
    process.exit(1);
  }

  const projectKey = process.env.JIRA_PROJECT_KEY;

  if (!projectKey) {
    console.log('\nSet JIRA_PROJECT_KEY in your .env file first.');
    process.exit(1);
  }

  console.log(`\nProject: ${projectKey}`);

  // Get project info
  console.log('\n' + '═'.repeat(60));
  console.log('PROJECT INFORMATION');
  console.log('═'.repeat(60));

  try {
    const project = await client.getProject(projectKey);
    console.log(`Name: ${project.name}`);
    console.log(`Key: ${project.key}`);
    console.log(`ID: ${project.id}`);
    console.log(`Lead: ${project.lead?.displayName || 'N/A'}`);
  } catch (error) {
    console.log('Error fetching project information.');
  }

  // Get issue types
  console.log('\n' + '═'.repeat(60));
  console.log('ISSUE TYPES');
  console.log('═'.repeat(60));
  console.log('Find your Assessment Work Paper issue type and note the ID:\n');

  try {
    const issueTypes = await client.getIssueTypes(projectKey);
    for (const type of issueTypes) {
      console.log(`  ${type.name}`);
      console.log(`    ID: ${type.id}`);
      console.log(`    Description: ${type.description || 'N/A'}`);
      console.log('');
    }

    console.log('Add to .env:');
    console.log('  JIRA_ASSESSMENT_ISSUE_TYPE_ID=<id from above>');
  } catch (error) {
    console.log('Error fetching issue types.');
  }

  // Get custom fields
  console.log('\n' + '═'.repeat(60));
  console.log('CUSTOM FIELDS');
  console.log('═'.repeat(60));
  console.log('Find your custom fields and note their IDs:\n');

  try {
    const fields = await client.getCustomFields();

    // Filter to likely relevant fields
    const relevantTerms = ['control', 'quarter', 'year', 'score', 'target', 'actual',
      'testing', 'status', 'procedure', 'observation', 'assessment'];

    const relevantFields = fields.filter(f =>
      relevantTerms.some(term => f.name.toLowerCase().includes(term))
    );

    if (relevantFields.length > 0) {
      console.log('Potentially relevant custom fields:\n');
      for (const field of relevantFields) {
        console.log(`  ${field.name}`);
        console.log(`    ID: ${field.id}`);
        console.log(`    Type: ${field.schema?.type || 'N/A'}`);
        console.log('');
      }
    }

    console.log('All custom fields:');
    console.log('─'.repeat(40));
    for (const field of fields.slice(0, 30)) {
      console.log(`  ${field.id}: ${field.name}`);
    }
    if (fields.length > 30) {
      console.log(`  ... and ${fields.length - 30} more`);
    }

    console.log('\nAdd to .env (update with your actual field IDs):');
    console.log('  JIRA_FIELD_CONTROL_ID=customfield_XXXXX');
    console.log('  JIRA_FIELD_QUARTER=customfield_XXXXX');
    console.log('  JIRA_FIELD_YEAR=customfield_XXXXX');
    console.log('  JIRA_FIELD_TARGET_SCORE=customfield_XXXXX');
    console.log('  JIRA_FIELD_ACTUAL_SCORE=customfield_XXXXX');
    console.log('  JIRA_FIELD_TESTING_STATUS=customfield_XXXXX');
    console.log('  JIRA_FIELD_TEST_PROCEDURES=customfield_XXXXX');
    console.log('  JIRA_FIELD_OBSERVATIONS=customfield_XXXXX');

  } catch (error) {
    console.log('Error fetching custom fields.');
  }

  console.log('\n' + '═'.repeat(60));
  console.log('SETUP COMPLETE');
  console.log('═'.repeat(60));
  console.log('Update your .env file with the IDs shown above.');
  console.log('Then run the export scripts to sync your data.');
}

main().catch(err => {
  console.error('Fatal error occurred.');
  process.exit(1);
});
