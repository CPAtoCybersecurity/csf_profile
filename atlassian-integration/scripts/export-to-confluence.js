#!/usr/bin/env node
/**
 * Export CSF Profile Requirements and Controls to Confluence
 *
 * Usage:
 *   node scripts/export-to-confluence.js --file ../exports/csf-export.json --type requirements
 *   node scripts/export-to-confluence.js --file ../exports/csf-export.json --type controls
 *   node scripts/export-to-confluence.js --file ../exports/csf-export.json --type all --dry-run
 */

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import AtlassianClient from '../lib/atlassian-client.js';
import {
  controlsToConfluence,
  requirementsToConfluence,
  toCSV
} from '../lib/data-transformer.js';

dotenv.config();

program
  .name('export-to-confluence')
  .description('Export CSF Profile data to Confluence as CSV for database import')
  .requiredOption('-f, --file <path>', 'Path to CSF Profile JSON export file')
  .option('-t, --type <type>', 'Data type to export: requirements, controls, or all', 'all')
  .option('-o, --output <dir>', 'Output directory for CSV files', './output')
  .option('--dry-run', 'Preview without creating files')
  .parse();

const options = program.opts();

async function main() {
  console.log('CSF Profile → Confluence Export\n');

  // Load export file
  const filePath = path.resolve(options.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  console.log(`Loading: ${filePath}`);
  const exportData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!exportData.data) {
    console.error('Error: Invalid export file format. Expected "data" property.');
    process.exit(1);
  }

  const { requirements, controls, users } = exportData.data;

  console.log(`Found: ${requirements?.length || 0} requirements, ${controls?.length || 0} controls`);

  // Create output directory
  const outputDir = path.resolve(options.output);
  if (!options.dryRun && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const exports = [];

  // Export Requirements
  if (options.type === 'requirements' || options.type === 'all') {
    if (requirements && requirements.length > 0) {
      console.log('\nTransforming requirements...');
      const confluenceReqs = requirementsToConfluence(requirements);
      const reqCSV = toCSV(confluenceReqs);

      const reqFile = path.join(outputDir, 'confluence-requirements.csv');
      exports.push({
        type: 'Requirements',
        file: reqFile,
        count: confluenceReqs.length,
        csv: reqCSV
      });

      console.log(`  Transformed ${confluenceReqs.length} requirements`);

      if (!options.dryRun) {
        fs.writeFileSync(reqFile, reqCSV);
        console.log(`  ✓ Saved: ${reqFile}`);
      }
    } else {
      console.log('\nNo requirements to export.');
    }
  }

  // Export Controls
  if (options.type === 'controls' || options.type === 'all') {
    if (controls && controls.length > 0) {
      console.log('\nTransforming controls...');
      const confluenceControls = controlsToConfluence(controls, users);
      const controlCSV = toCSV(confluenceControls);

      const controlFile = path.join(outputDir, 'confluence-controls.csv');
      exports.push({
        type: 'Controls',
        file: controlFile,
        count: confluenceControls.length,
        csv: controlCSV
      });

      console.log(`  Transformed ${confluenceControls.length} controls`);

      if (!options.dryRun) {
        fs.writeFileSync(controlFile, controlCSV);
        console.log(`  ✓ Saved: ${controlFile}`);
      }
    } else {
      console.log('\nNo controls to export.');
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('EXPORT SUMMARY');
  console.log('═'.repeat(60));

  for (const exp of exports) {
    console.log(`\n${exp.type}:`);
    console.log(`  Records: ${exp.count}`);
    console.log(`  File: ${exp.file}`);

    if (options.dryRun) {
      console.log('\n  Preview (first 3 lines of CSV):');
      const lines = exp.csv.split('\n').slice(0, 4);
      lines.forEach(line => console.log(`    ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`));
    }
  }

  if (options.dryRun) {
    console.log('\n[DRY RUN] No files were created.');
    console.log('Remove --dry-run flag to create files.');
  } else {
    console.log('\n' + '─'.repeat(60));
    console.log('NEXT STEPS:');
    console.log('─'.repeat(60));
    console.log('1. Open your Confluence database');
    console.log('2. Click the ⋮ menu → Import from CSV');
    console.log('3. Upload the generated CSV file');
    console.log('4. Map columns to database fields');
    console.log('5. Click Import');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
