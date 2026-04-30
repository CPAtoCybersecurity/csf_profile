#!/usr/bin/env node
// Generates src/stores/comprehensiveAssessmentData.js by scanning ASSESSMENT_CATALOG/.
// Output exports:
//   COMPREHENSIVE_ARTIFACTS         - array of artifact objects
//   COMPREHENSIVE_OBSERVATIONS      - { [requirementId]: observation }
//   COMPREHENSIVE_SCOPE_IDS         - array of requirement IDs
//   COMPREHENSIVE_FINDINGS          - array of finding objects (one per gap)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CATALOG = path.join(ROOT, 'ASSESSMENT_CATALOG');
const OUT = path.join(ROOT, 'src', 'stores', 'comprehensiveAssessmentData.js');

const ASSESSMENT_ID = 'ASM-2026-comprehensive-alma';
const AUDITOR_ID = 2; // Steve

// --- 1. Walk artifacts directory -----------------------------------
function scanArtifacts() {
  const dir = path.join(CATALOG, '5_Artifacts');
  const subdirToType = {
    Policies: 'Policy',
    Procedures: 'Procedure',
    Reports: 'Report',
    Inventories: 'Inventory',
    Tickets: 'Ticket',
    Evidence: 'Evidence'
  };
  const artifacts = [];
  let counter = 100; // start at AR-100 to avoid colliding with default AR-1..AR-65
  for (const sub of Object.keys(subdirToType)) {
    const subPath = path.join(dir, sub);
    if (!fs.existsSync(subPath)) continue;
    for (const file of fs.readdirSync(subPath).sort()) {
      if (file === 'README.md') continue;
      const full = path.join(subPath, file);
      const slug = file.replace(/\.[^.]+$/, '');
      const name = slug
        .replace(/^(POL|PROC|RPT|INV|TKT|EVD)-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      // Try to read first heading for nicer title
      let displayName = name;
      try {
        const head = fs.readFileSync(full, 'utf8').split('\n').find(l => l.startsWith('# '));
        if (head) displayName = head.replace(/^#\s+/, '').trim();
      } catch {}
      counter += 1;
      artifacts.push({
        slug,
        artifactId: `AR-${counter}`,
        name: displayName,
        fileName: file,
        link: `https://github.com/CPAtoCybersecurity/csf_profile/blob/main/ASSESSMENT_CATALOG/5_Artifacts/${sub}/${encodeURIComponent(file)}`,
        type: subdirToType[sub],
      });
    }
  }
  return artifacts;
}

// --- 2. Parse a control file's artifact links ----------------------
function parseControlFile(controlPath) {
  if (!fs.existsSync(controlPath)) return { artifactRefs: [], testProcedures: '', implementation: '' };
  const txt = fs.readFileSync(controlPath, 'utf8');
  const artifactRefs = [];
  const re = /\[([^\]]+)\]\((?:[^)]*\/)?5_Artifacts\/[^)]*?\/([^/)]+)\)/g;
  let m;
  while ((m = re.exec(txt))) {
    artifactRefs.push({ name: m[1].trim(), file: decodeURIComponent(m[2]).trim() });
  }
  // Implementation paragraph (after "## Alma Security Implementation")
  const implMatch = txt.match(/## Alma Security Implementation\s*\n+([^\n#][^]*?)(?=\n##|\n*$)/);
  const implementation = implMatch ? implMatch[1].trim() : '';
  return { artifactRefs, implementation };
}

// --- 3. Parse a test procedure file --------------------------------
function parseTestProcedureFile(tpPath) {
  if (!fs.existsSync(tpPath)) return '';
  const txt = fs.readFileSync(tpPath, 'utf8');
  const tpMatch = txt.match(/## Test Procedures\s*\n+([^]*?)(?=\n## |\n---|\n*$)/);
  if (!tpMatch) return '';
  // Pull numbered top-level items only
  const lines = tpMatch[1].split('\n');
  const procs = [];
  for (const line of lines) {
    const m = line.match(/^(\d+)\.\s*\*\*(.+?)\*\*/);
    if (m) procs.push(`${m[1]}. ${m[2]}`);
  }
  return procs.join('\n');
}

// --- 4. Parse Q1 observation file ----------------------------------
function parseObservationFile(obsPath) {
  if (!fs.existsSync(obsPath)) return null;
  const txt = fs.readFileSync(obsPath, 'utf8');

  const dateMatch = txt.match(/\*\*Observation Date:\*\*\s*([\d-]+)/);
  const statusMatch = txt.match(/\*\*Testing Status:\*\*\s*(\w[\w ]*)/);

  const examine = /\| Examine \| Yes/i.test(txt);
  const interview = /\| Interview \| Yes/i.test(txt);
  const test = /\| Test \| Yes/i.test(txt);

  const actualMatch = txt.match(/\| Actual Score \|\s*(\d+)/);
  const targetMatch = txt.match(/\| Target Score \|\s*(\d+)/);

  // Build observations summary: Strengths & Gaps bullets
  const findingsSection = txt.match(/## (Findings|Observation)\s*\n([^]*?)(?=\n## |\n---|\n*$)/);
  let obsText = '';
  if (findingsSection) {
    obsText = findingsSection[2].trim();
  }
  // Extract gaps as separate finding items
  const gaps = [];
  const gapsSec = txt.match(/### Gaps\s*\n([^]*?)(?=\n### |\n## |\n---|\n*$)/);
  if (gapsSec) {
    const items = gapsSec[1].split(/\n-\s+/).slice(1);
    for (const it of items) {
      const cleaned = it.trim().replace(/\n/g, ' ');
      if (cleaned) gaps.push(cleaned);
    }
  }

  // Recommendations
  const recs = [];
  const recsSec = txt.match(/## Recommendations\s*\n([^]*?)(?=\n## |\n---|\n*$)/);
  if (recsSec) {
    const lines = recsSec[1].split('\n').filter(l => /^\|\s*\d+\s*\|/.test(l));
    for (const l of lines) {
      const cells = l.split('|').map(c => c.trim());
      if (cells[2]) recs.push(cells[2]);
    }
  }

  return {
    actualScore: actualMatch ? parseInt(actualMatch[1], 10) : 0,
    targetScore: targetMatch ? parseInt(targetMatch[1], 10) : 0,
    observations: obsText,
    observationDate: dateMatch ? dateMatch[1] : '',
    testingStatus: statusMatch ? statusMatch[1].trim() : 'Not Started',
    examine, interview, test,
    gaps, recs,
  };
}

// --- 5. Iterate subcategories with Q1 obs --------------------------
function buildAssessmentData(artifacts) {
  const obsDir = path.join(CATALOG, '4_Observations');
  const ctlDir = path.join(CATALOG, '2_Controls');
  const tpDir  = path.join(CATALOG, '3_Test_Procedures');

  const artifactByFile = new Map(artifacts.map(a => [a.fileName, a]));
  const artifactByName = new Map(artifacts.map(a => [a.name.toLowerCase(), a]));

  const scopeIds = [];
  const observations = {};
  const findings = [];
  let findingCounter = 1000;

  for (const fn of fs.readdirSync(obsDir)) {
    if (!['GV','ID','PR','DE','RS','RC'].includes(fn)) continue;
    const fnDir = path.join(obsDir, fn);
    for (const file of fs.readdirSync(fnDir).sort()) {
      const m = file.match(/^([A-Z]{2}\.[A-Z]{2,3}-\d{2})-Q1\.md$/);
      if (!m) continue;
      const subId = m[1];

      // Find controls (Ex1, Ex2 ...) for this subcategory
      const ctlSubDir = path.join(ctlDir, fn);
      if (!fs.existsSync(ctlSubDir)) continue;
      const ctlFiles = fs.readdirSync(ctlSubDir)
        .filter(f => f.startsWith(`${subId}_Ex`) && f.endsWith('.md'))
        .sort();
      if (!ctlFiles.length) continue;

      // Pick the first Ex
      const reqId = ctlFiles[0].replace(/_/, ' ').replace(/\.md$/, '');
      scopeIds.push(reqId);

      // Parse content
      const ctlInfo = parseControlFile(path.join(ctlSubDir, ctlFiles[0]));
      const tpText = parseTestProcedureFile(path.join(tpDir, fn, `${subId}.md`));
      const obs = parseObservationFile(path.join(fnDir, file));
      if (!obs) continue;

      // Resolve artifact refs to real artifact names
      const linkedArtifactNames = [];
      for (const ref of ctlInfo.artifactRefs) {
        const hit = artifactByFile.get(ref.file);
        if (hit) linkedArtifactNames.push(hit.name);
      }

      // Q2-Q4 default
      const empty = () => ({ actualScore: 0, targetScore: 0, observations: '', observationDate: '', testingStatus: 'Not Started', examine: false, interview: false, test: false });

      // Pre-allocate finding IDs for this requirement so we can link them on the observation
      const reqFindingIds = [];
      if (obs.gaps.length && obs.actualScore < obs.targetScore) {
        for (let g = 0; g < obs.gaps.length; g++) {
          reqFindingIds.push(`FND-${findingCounter + 1 + g}`);
        }
      }

      observations[reqId] = {
        auditorId: AUDITOR_ID,
        testProcedures: tpText || ctlInfo.implementation,
        linkedArtifacts: linkedArtifactNames,
        linkedFindings: reqFindingIds,
        remediation: { ownerId: null, actionPlan: '', dueDate: '' },
        quarters: {
          Q1: {
            actualScore: obs.actualScore,
            targetScore: obs.targetScore,
            observations: obs.observations.replace(/\s+/g, ' ').trim().slice(0, 4000),
            observationDate: obs.observationDate,
            testingStatus: obs.testingStatus,
            examine: obs.examine, interview: obs.interview, test: obs.test
          },
          Q2: empty(), Q3: empty(), Q4: empty()
        }
      };

      // Findings: each gap becomes a finding
      if (obs.gaps.length && obs.actualScore < obs.targetScore) {
        for (const gap of obs.gaps) {
          findingCounter += 1;
          const summary = gap.split(/\.\s/)[0].replace(/^\*\*/, '').replace(/\*\*/g, '').slice(0, 120);
          findings.push({
            id: `FND-${findingCounter}`,
            summary,
            description: gap.slice(0, 1500),
            complianceRequirement: reqId,
            controlId: reqId,
            assessmentId: ASSESSMENT_ID,
            rootCause: '',
            remediationActionPlan: obs.recs.join(' | ').slice(0, 1500),
            remediationOwner: null,
            dueDate: '',
            status: 'Open',
            priority: (obs.targetScore - obs.actualScore) >= 3 ? 'High' : 'Medium',
            createdDate: '2026-04-30T00:00:00.000Z',
            lastModified: '2026-04-30T00:00:00.000Z',
            jiraKey: `FND-${findingCounter}`,
            linkedArtifacts: linkedArtifactNames
          });
        }
      }
    }
  }

  return { scopeIds, observations, findings };
}

// --- 6. Render output JS module ------------------------------------
function render(artifacts, scopeIds, observations, findings) {
  const artifactRecords = artifacts.map((a, idx) => ({
    id: 1000 + idx,
    artifactId: a.artifactId,
    name: a.name,
    description: `Catalog evidence: ${a.fileName}`,
    link: a.link,
    complianceRequirement: null,
    controlId: null,
    linkedSubcategoryIds: [],
    linkedEvaluationIds: [],
    type: a.type,
    createdDate: '2026-04-30T00:00:00.000Z',
    lastModified: '2026-04-30T00:00:00.000Z',
    jiraKey: a.artifactId,
    status: 'ACTIVE'
  }));

  return `// AUTO-GENERATED by scripts/generate-comprehensive-assessment.mjs
// DO NOT EDIT BY HAND. Regenerate via: node scripts/generate-comprehensive-assessment.mjs

export const COMPREHENSIVE_ASSESSMENT_ID = ${JSON.stringify(ASSESSMENT_ID)};

export const COMPREHENSIVE_ARTIFACTS = ${JSON.stringify(artifactRecords, null, 2)};

export const COMPREHENSIVE_SCOPE_IDS = ${JSON.stringify(scopeIds, null, 2)};

export const COMPREHENSIVE_OBSERVATIONS = ${JSON.stringify(observations, null, 2)};

export const COMPREHENSIVE_FINDINGS = ${JSON.stringify(findings, null, 2)};
`;
}

// --- main -----------------------------------------------------------
const artifacts = scanArtifacts();
const { scopeIds, observations, findings } = buildAssessmentData(artifacts);
const output = render(artifacts, scopeIds, observations, findings);
fs.writeFileSync(OUT, output);
console.log(`Wrote ${OUT}`);
console.log(`  Artifacts: ${artifacts.length}`);
console.log(`  Scope items: ${scopeIds.length}`);
console.log(`  Observations: ${Object.keys(observations).length}`);
console.log(`  Findings: ${findings.length}`);
