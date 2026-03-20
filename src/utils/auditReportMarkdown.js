import DOMPurify from 'dompurify';

// CSF function order and display names
const FUNCTION_ORDER = ['GOVERN (GV)', 'IDENTIFY (ID)', 'PROTECT (PR)', 'DETECT (DE)', 'RESPOND (RS)', 'RECOVER (RC)'];
const FUNCTION_SHORT = {
  'GOVERN (GV)': 'Govern (GV)',
  'IDENTIFY (ID)': 'Identify (ID)',
  'PROTECT (PR)': 'Protect (PR)',
  'DETECT (DE)': 'Detect (DE)',
  'RESPOND (RS)': 'Respond (RS)',
  'RECOVER (RC)': 'Recover (RC)',
};

/**
 * Map function names to standard format (matches Dashboard.js normalizeFunctionName)
 */
const normalizeFunctionName = (func) => {
  if (!func) return 'Unknown';
  const upper = func.toUpperCase();
  if (upper.includes('GOVERN') || upper.startsWith('GV')) return 'GOVERN (GV)';
  if (upper.includes('IDENTIFY') || upper.startsWith('ID')) return 'IDENTIFY (ID)';
  if (upper.includes('PROTECT') || upper.startsWith('PR')) return 'PROTECT (PR)';
  if (upper.includes('DETECT') || upper.startsWith('DE')) return 'DETECT (DE)';
  if (upper.includes('RESPOND') || upper.startsWith('RS')) return 'RESPOND (RS)';
  if (upper.includes('RECOVER') || upper.startsWith('RC')) return 'RECOVER (RC)';
  return func;
};

/**
 * Prefix-based function inference from control ID (e.g., "GV.SC-04 Ex1" -> "GOVERN (GV)")
 */
const PREFIX_MAP = {
  'GV': 'GOVERN (GV)',
  'ID': 'IDENTIFY (ID)',
  'PR': 'PROTECT (PR)',
  'DE': 'DETECT (DE)',
  'RS': 'RESPOND (RS)',
  'RC': 'RECOVER (RC)',
};

/**
 * Sanitize user-generated text for safe markdown embedding
 */
const sanitize = (text) => {
  if (!text) return '';
  return DOMPurify.sanitize(String(text));
};

/**
 * Capture an SVG chart from the DOM by container ID and return a base64 data URI.
 * Returns null if the container or SVG is not found.
 */
const captureSvgChart = (containerId) => {
  try {
    const container = document.getElementById(containerId);
    if (!container) return null;
    const svg = container.querySelector('svg');
    if (!svg) return null;

    // Clone SVG and set explicit dimensions for standalone rendering
    const clone = svg.cloneNode(true);
    const width = svg.getAttribute('width') || svg.getBoundingClientRect().width || 600;
    const height = svg.getAttribute('height') || svg.getBoundingClientRect().height || 400;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);

    // Add white background for visibility in markdown viewers
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', '#ffffff');
    clone.insertBefore(bg, clone.firstChild);

    // Force all text elements to black with report-matching font for print/export
    clone.querySelectorAll('text').forEach(textEl => {
      textEl.setAttribute('fill', '#000000');
      textEl.style.fill = '#000000';
      textEl.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    });

    const serialized = new XMLSerializer().serializeToString(clone);
    const base64 = btoa(unescape(encodeURIComponent(serialized)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    console.warn(`Failed to capture SVG from #${containerId}:`, e);
    return null;
  }
};

/**
 * Color helpers for HTML table cells
 */
const gapCellColor = (actual, target) => {
  if (target === 0) return '#f3f4f6'; // gray-100
  if (actual >= target) return '#dcfce7'; // green-100
  if (actual >= target * 0.7) return '#fef3c7'; // amber-100
  return '#fee2e2'; // red-100
};

const gapTextColor = (actual, target) => {
  if (target === 0) return '#6b7280'; // gray-500
  if (actual >= target) return '#16a34a'; // green-600
  if (actual >= target * 0.7) return '#d97706'; // amber-600
  return '#dc2626'; // red-600
};

const ratingBadge = (rating) => {
  const colors = {
    'Satisfactory': { bg: '#dcfce7', text: '#16a34a' },
    'Needs Improvement': { bg: '#fef3c7', text: '#d97706' },
    'Unsatisfactory': { bg: '#fee2e2', text: '#dc2626' },
    'Not Assessed': { bg: '#f3f4f6', text: '#6b7280' },
  };
  const c = colors[rating] || colors['Not Assessed'];
  return `<span style="background:${c.bg};color:${c.text};padding:2px 8px;border-radius:4px;font-weight:600;font-size:13px">${rating}</span>`;
};

/**
 * Format a numeric score to one decimal place
 */
const formatScore = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0.0';
  return Number(value).toFixed(1);
};

/**
 * Map a maturity score (1-10 scale) to a label
 */
const scoreToMaturityLabel = (score) => {
  if (score < 2) return 'Insecurity';
  if (score < 5) return 'Some Security';
  if (score < 6) return 'Minimally Acceptable';
  if (score < 7) return 'Optimized';
  if (score < 8) return 'Fully Optimized';
  return 'Too Much Security (Waste)';
};

/**
 * Compute function rating based on actual vs target
 */
const computeFunctionRating = (avgActual, avgTarget) => {
  if (avgTarget === 0) return 'Not Assessed';
  if (avgActual >= avgTarget) return 'Satisfactory';
  if (avgActual >= avgTarget * 0.7) return 'Needs Improvement';
  return 'Unsatisfactory';
};

/**
 * Priority sort order for findings
 */
const PRIORITY_ORDER = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };

const sortByPriority = (a, b) => {
  const aOrder = PRIORITY_ORDER[a.priority] ?? 4;
  const bOrder = PRIORITY_ORDER[b.priority] ?? 4;
  return aOrder - bOrder;
};

/**
 * Generate a professional internal audit report in markdown format.
 *
 * All data comes from function parameters - nothing is hardcoded.
 * User-generated text is sanitized with DOMPurify before embedding.
 *
 * @param {Object} params
 * @param {Object} params.assessment - Assessment object from assessmentsStore
 * @param {Array} params.requirements - Requirements array from requirementsStore
 * @param {Array} params.findings - Findings array from findingsStore
 * @param {Array} params.artifacts - Artifacts array from artifactStore
 * @param {number} params.selectedQuarter - Quarter number 1-4
 * @param {Object} params.reportMetadata - Report metadata fields
 */
export const generateAuditReportMarkdown = ({
  assessment,
  requirements,
  findings,
  artifacts,
  selectedQuarter,
  reportMetadata: {
    reportNumber,
    engagementType,
    assessmentPeriod,
    reportDate,
    classification,
    preparedFor,
    preparedBy,
    leadAssessor,
    qualityReviewer,
    organizationName,
  }
}) => {
  const quarterKey = `Q${selectedQuarter}`;

  // ── Step 1: Build requirement lookup ──────────────────────────────────
  const requirementLookup = new Map();
  (requirements || []).forEach(req => {
    if (req.id) {
      requirementLookup.set(req.id, {
        function: normalizeFunctionName(req.function),
        description: req.description || '',
      });
    }
  });

  // ── Step 2: Build artifact lookup (controlId -> artifact count) ──────
  const artifactsByControl = new Map();
  (artifacts || []).forEach(art => {
    if (art.controlId) {
      if (!artifactsByControl.has(art.controlId)) {
        artifactsByControl.set(art.controlId, []);
      }
      artifactsByControl.get(art.controlId).push(art);
    }
  });

  // ── Step 3: Resolve function for each scopeId, extract quarter data ──
  const scopeIds = assessment?.scopeIds || [];
  const observations = assessment?.observations || {};

  const controlData = scopeIds.map(controlId => {
    const obs = observations[controlId] || {};
    const quarters = obs.quarters || {};
    const qData = quarters[quarterKey] || {};

    // Resolve function name - requirements first, then prefix inference
    let functionName = 'Unknown';
    const reqInfo = requirementLookup.get(controlId);
    if (reqInfo) {
      functionName = reqInfo.function;
    } else {
      const prefix = controlId.substring(0, 2);
      functionName = PREFIX_MAP[prefix] || 'Unknown';
    }

    const actualScore = Number(qData.actualScore) || 0;
    const targetScore = Number(qData.targetScore) || 0;
    const gap = targetScore - actualScore;
    const description = reqInfo?.description || '';

    return {
      controlId,
      functionName,
      actualScore,
      targetScore,
      gap,
      description,
      testingStatus: qData.testingStatus || 'Not Started',
      observations: qData.observations || '',
    };
  });

  // ── Step 4: Compute function-level aggregates ────────────────────────
  const functionAggregates = {};
  FUNCTION_ORDER.forEach(fn => {
    functionAggregates[fn] = { controls: [], totalActual: 0, totalTarget: 0, count: 0 };
  });

  controlData.forEach(cd => {
    const fn = cd.functionName;
    if (functionAggregates[fn]) {
      functionAggregates[fn].controls.push(cd);
      functionAggregates[fn].totalActual += cd.actualScore;
      functionAggregates[fn].totalTarget += cd.targetScore;
      functionAggregates[fn].count += 1;
    }
  });

  FUNCTION_ORDER.forEach(fn => {
    const agg = functionAggregates[fn];
    agg.avgActual = agg.count > 0 ? agg.totalActual / agg.count : 0;
    agg.avgTarget = agg.count > 0 ? agg.totalTarget / agg.count : 0;
    agg.avgGap = agg.avgTarget - agg.avgActual;
    agg.rating = computeFunctionRating(agg.avgActual, agg.avgTarget);
  });

  // ── Step 5: Compute overall statistics ───────────────────────────────
  const totalControls = controlData.length;
  const overallActual = totalControls > 0
    ? controlData.reduce((sum, cd) => sum + cd.actualScore, 0) / totalControls : 0;
  const overallTarget = totalControls > 0
    ? controlData.reduce((sum, cd) => sum + cd.targetScore, 0) / totalControls : 0;

  const controlsMeetingTarget = controlData.filter(cd => cd.actualScore >= cd.targetScore).length;
  const controlsBelowTarget = totalControls - controlsMeetingTarget;

  const overallMaturity = scoreToMaturityLabel(overallActual);

  // ── Step 6: Compute overall assessment rating ────────────────────────
  const functionsWithData = FUNCTION_ORDER.filter(fn => functionAggregates[fn].count > 0);
  const functionsBelowTarget = functionsWithData.filter(
    fn => functionAggregates[fn].avgActual < functionAggregates[fn].avgTarget
  );
  const fractionBelow = functionsWithData.length > 0
    ? functionsBelowTarget.length / functionsWithData.length : 0;

  let overallRating;
  let ratingDescription;
  if (fractionBelow === 0) {
    overallRating = 'SATISFACTORY';
    ratingDescription = `meets or exceeds target maturity levels across all assessed NIST CSF 2.0 functions. The organization demonstrates a mature cybersecurity posture with effective controls in place.`;
  } else if (fractionBelow <= 0.5) {
    overallRating = 'NEEDS IMPROVEMENT';
    ratingDescription = `demonstrates an established cybersecurity program with areas requiring targeted improvement. While several functions meet target maturity levels, ${functionsBelowTarget.length} of ${functionsWithData.length} assessed functions fall below their target scores, indicating opportunities for enhancement.`;
  } else {
    overallRating = 'UNSATISFACTORY';
    ratingDescription = `requires significant improvement to meet target maturity levels. The majority of assessed functions (${functionsBelowTarget.length} of ${functionsWithData.length}) fall below their target scores, indicating systemic gaps in the cybersecurity program.`;
  }

  // ── Step 7: Sort findings by priority ────────────────────────────────
  const sortedFindings = [...(findings || [])].sort(sortByPriority);
  const findingsByCriticality = {
    Critical: sortedFindings.filter(f => f.priority === 'Critical').length,
    High: sortedFindings.filter(f => f.priority === 'High').length,
    Medium: sortedFindings.filter(f => f.priority === 'Medium').length,
    Low: sortedFindings.filter(f => f.priority === 'Low').length,
  };

  // ── Step 8: Compute evidence coverage ────────────────────────────────
  const controlsWithEvidence = controlData.filter(
    cd => artifactsByControl.has(cd.controlId)
  ).length;
  const evidenceCoverage = totalControls > 0
    ? ((controlsWithEvidence / totalControls) * 100).toFixed(1) : '0.0';

  // ── Step 9: Top 3 risks from priority gaps ───────────────────────────
  const topRisks = [...controlData]
    .filter(cd => cd.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  // ── Step 10: Previous quarter data for trend analysis ────────────────
  let previousQuarterAvg = null;
  if (selectedQuarter > 1) {
    const prevKey = `Q${selectedQuarter - 1}`;
    const prevScores = scopeIds.map(id => {
      const obs = observations[id] || {};
      const quarters = obs.quarters || {};
      const pData = quarters[prevKey] || {};
      return Number(pData.actualScore) || 0;
    });
    const prevTotal = prevScores.reduce((s, v) => s + v, 0);
    previousQuarterAvg = scopeIds.length > 0 ? prevTotal / scopeIds.length : null;
  }

  // ── Step 11: Governance vs Operations gap analysis ───────────────────
  const govAgg = functionAggregates['GOVERN (GV)'];
  const nonGovFunctions = FUNCTION_ORDER.filter(fn => fn !== 'GOVERN (GV)');
  const nonGovCounts = nonGovFunctions.reduce((acc, fn) => {
    acc.totalActual += functionAggregates[fn].totalActual;
    acc.count += functionAggregates[fn].count;
    return acc;
  }, { totalActual: 0, count: 0 });
  const opsAvg = nonGovCounts.count > 0 ? nonGovCounts.totalActual / nonGovCounts.count : 0;

  // ═══════════════════════════════════════════════════════════════════════
  // MARKDOWN GENERATION
  // ═══════════════════════════════════════════════════════════════════════

  const sections = [];

  // ── HEADER ───────────────────────────────────────────────────────────
  sections.push(`# Internal Audit Report
# Cybersecurity Program Assessment
# ${sanitize(organizationName)}

---

**Report No.:** ${sanitize(reportNumber)}
**Engagement Type:** ${sanitize(engagementType)}
**Assessment Period:** ${sanitize(assessmentPeriod)}
**Report Date:** ${sanitize(reportDate)}
**Classification:** ${sanitize(classification)}

---

| | |
|---|---|
| **Prepared For:** | ${sanitize(preparedFor)} |
| **Prepared By:** | ${sanitize(preparedBy)} |
| **Lead Assessor:** | ${sanitize(leadAssessor)} |
| **Quality Reviewer:** | ${sanitize(qualityReviewer)} |
| **Report Status:** | Final |

---`);

  // ── TABLE OF CONTENTS ────────────────────────────────────────────────
  sections.push(`## Table of Contents

1. [Independent Assessment Opinion](#1-independent-assessment-opinion)
2. [Executive Summary](#2-executive-summary)
3. [Scope and Methodology](#3-scope-and-methodology)
4. [Overall Maturity Assessment](#4-overall-maturity-assessment)
5. [Risk-Rated Findings](#5-risk-rated-findings)
6. [Management Response and Action Plans](#6-management-response-and-action-plans)
7. [Conclusion](#7-conclusion)
- [Appendix A: CSF Function Scoring Detail](#appendix-a-csf-function-scoring-detail)
- [Appendix B: Assessment Criteria and Rating Definitions](#appendix-b-assessment-criteria-and-rating-definitions)
- [Appendix C: Distribution List](#appendix-c-distribution-list)

---`);

  // ── SECTION 1: Independent Assessment Opinion ────────────────────────
  sections.push(`## 1. Independent Assessment Opinion

**Overall Assessment Rating: ${overallRating}**

Based on our assessment of ${totalControls} control implementations across all six NIST CSF 2.0 functions, we conclude that ${sanitize(organizationName)}'s cybersecurity program ${ratingDescription}

**Key Statistics:**
- **Controls Assessed:** ${totalControls}
- **Controls Below Target:** ${controlsBelowTarget} of ${totalControls}
- **Overall Average Score:** ${formatScore(overallActual)} / ${formatScore(overallTarget)} (target)
- **Overall Maturity Level:** ${overallMaturity}
- **Evidence Coverage:** ${evidenceCoverage}% of controls have linked artifacts

---`);

  // ── SECTION 2: Executive Summary ─────────────────────────────────────
  let executiveSummary = `## 2. Executive Summary

### Key Results

| Metric | Value |
|---|---|
| **Overall Maturity Score** | ${formatScore(overallActual)} / 10.0 (${overallMaturity}) |
| **Controls Meeting Target** | ${controlsMeetingTarget} of ${totalControls} (${totalControls > 0 ? ((controlsMeetingTarget / totalControls) * 100).toFixed(0) : 0}%) |
| **Controls Below Target** | ${controlsBelowTarget} of ${totalControls} |
| **Critical Findings** | ${findingsByCriticality.Critical} |
| **High Findings** | ${findingsByCriticality.High} |
| **Medium Findings** | ${findingsByCriticality.Medium} |
| **Low Findings** | ${findingsByCriticality.Low} |
| **Evidence Coverage** | ${evidenceCoverage}% |

### Assessment Rating Summary by Function

<table>
<tr style="background:#1e40af"><th style="padding:8px;text-align:left;color:#fff">Function</th><th style="padding:8px;text-align:center;color:#fff">Avg Score</th><th style="padding:8px;text-align:center;color:#fff">Target</th><th style="padding:8px;text-align:center;color:#fff">Gap</th><th style="padding:8px;text-align:center;color:#fff">Rating</th></tr>
`;

  FUNCTION_ORDER.forEach(fn => {
    const agg = functionAggregates[fn];
    if (agg.count > 0) {
      const shortName = FUNCTION_SHORT[fn] || fn;
      const bg = gapCellColor(agg.avgActual, agg.avgTarget);
      const tc = gapTextColor(agg.avgActual, agg.avgTarget);
      executiveSummary += `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb"><strong>${shortName}</strong></td><td style="padding:6px 8px;text-align:center;color:${tc};font-weight:600;border-bottom:1px solid #e5e7eb">${formatScore(agg.avgActual)}</td><td style="padding:6px 8px;text-align:center;border-bottom:1px solid #e5e7eb">${formatScore(agg.avgTarget)}</td><td style="padding:6px 8px;text-align:center;background:${bg};color:${tc};font-weight:600;border-bottom:1px solid #e5e7eb">${formatScore(agg.avgGap)}</td><td style="padding:6px 8px;text-align:center;border-bottom:1px solid #e5e7eb">${ratingBadge(agg.rating)}</td></tr>\n`;
    }
  });

  executiveSummary += `<tr style="background:#eff6ff;font-weight:700"><td style="padding:8px">Overall</td><td style="padding:8px;text-align:center">${formatScore(overallActual)}</td><td style="padding:8px;text-align:center">${formatScore(overallTarget)}</td><td style="padding:8px;text-align:center">${formatScore(overallTarget - overallActual)}</td><td style="padding:8px;text-align:center">${ratingBadge(overallRating)}</td></tr>\n</table>`;

  if (topRisks.length > 0) {
    executiveSummary += `\n\n### Top ${topRisks.length} Priority Gaps\n\n`;
    topRisks.forEach((risk, idx) => {
      executiveSummary += `${idx + 1}. **${sanitize(risk.controlId)}** — Gap of ${formatScore(risk.gap)} (Actual: ${formatScore(risk.actualScore)}, Target: ${formatScore(risk.targetScore)})\n`;
    });
  }

  executiveSummary += '\n\n---';
  sections.push(executiveSummary);

  // ── SECTION 3: Scope and Methodology ─────────────────────────────────
  let scopeSection = `## 3. Scope and Methodology

### Assessment Scope

This assessment evaluated ${sanitize(organizationName)}'s implementation of the NIST Cybersecurity Framework (CSF) 2.0 across the following functions:

| Function | Controls Assessed |
|---|---|
`;

  FUNCTION_ORDER.forEach(fn => {
    const agg = functionAggregates[fn];
    if (agg.count > 0) {
      scopeSection += `| ${FUNCTION_SHORT[fn] || fn} | ${agg.count} |\n`;
    }
  });

  scopeSection += `| **Total** | **${totalControls}** |\n`;

  scopeSection += `
### Scoring Framework

Controls were evaluated on a 1-10 scale. See [Appendix B](#appendix-b-assessment-criteria-and-rating-definitions) for full scoring definitions.

### Methodology

Assessment procedures included:
- **Examine:** Review of policies, procedures, and technical documentation
- **Interview:** Discussions with control owners and subject matter experts
- **Test:** Technical validation through sampling, inspection, and tool-based verification

---`;

  sections.push(scopeSection);

  // ── SECTION 4: Overall Maturity Assessment ───────────────────────────
  let maturitySection = `## 4. Overall Maturity Assessment

### Current Maturity Profile

The organization's overall cybersecurity maturity is assessed at **${overallMaturity}** (${formatScore(overallActual)} / 10.0).

| Dimension | Average Score | Maturity Level |
|---|---|---|
| Governance (GV) | ${formatScore(govAgg.avgActual)} | ${scoreToMaturityLabel(govAgg.avgActual)} |
| Operations (ID, PR, DE, RS, RC) | ${formatScore(opsAvg)} | ${scoreToMaturityLabel(opsAvg)} |
| **Overall** | **${formatScore(overallActual)}** | **${overallMaturity}** |

### Governance vs Operations Gap Analysis

`;

  const govOpsGap = govAgg.avgActual - opsAvg;
  if (Math.abs(govOpsGap) < 0.5) {
    maturitySection += `Governance and operational maturity are closely aligned (gap: ${formatScore(Math.abs(govOpsGap))}), indicating balanced investment across policy and technical implementation.\n`;
  } else if (govOpsGap > 0) {
    maturitySection += `Governance maturity (${formatScore(govAgg.avgActual)}) exceeds operational maturity (${formatScore(opsAvg)}) by ${formatScore(govOpsGap)} points, suggesting that policies and frameworks are more mature than their technical implementation.\n`;
  } else {
    maturitySection += `Operational maturity (${formatScore(opsAvg)}) exceeds governance maturity (${formatScore(govAgg.avgActual)}) by ${formatScore(Math.abs(govOpsGap))} points, suggesting that technical controls are more mature than the governing policies and frameworks.\n`;
  }

  if (previousQuarterAvg !== null) {
    const trend = overallActual - previousQuarterAvg;
    maturitySection += `\n### Quarter-over-Quarter Trend\n\n`;
    maturitySection += `| Period | Average Score | Change |\n|---|---|---|\n`;
    maturitySection += `| Q${selectedQuarter - 1} | ${formatScore(previousQuarterAvg)} | — |\n`;
    maturitySection += `| Q${selectedQuarter} | ${formatScore(overallActual)} | ${trend >= 0 ? '+' : ''}${formatScore(trend)} |\n`;

    if (trend > 0) {
      maturitySection += `\nThe organization demonstrated improvement of ${formatScore(trend)} points from Q${selectedQuarter - 1} to Q${selectedQuarter}, reflecting continued maturation of the cybersecurity program.\n`;
    } else if (trend < 0) {
      maturitySection += `\nScores decreased by ${formatScore(Math.abs(trend))} points from Q${selectedQuarter - 1} to Q${selectedQuarter}. This may indicate regression in control effectiveness or more rigorous assessment criteria applied in the current period.\n`;
    } else {
      maturitySection += `\nScores remained stable between Q${selectedQuarter - 1} and Q${selectedQuarter}.\n`;
    }
  }

  // Embed dashboard charts if available
  const barChartUri = captureSvgChart('audit-chart-bar');
  const radarChartUri = captureSvgChart('audit-chart-radar');
  const trendChartUri = captureSvgChart('audit-chart-trend');

  maturitySection += '\n### Dashboard Visualizations\n\n';
  if (barChartUri) {
    maturitySection += `#### Function Actual vs Target (Q${selectedQuarter})\n\n<img src="${barChartUri}" alt="Function Actual vs Target bar chart" width="700" />\n\n`;
  }
  if (radarChartUri) {
    maturitySection += `#### CSF Subcategory Radar (Q${selectedQuarter})\n\n<div style="text-align:left"><img src="${radarChartUri}" alt="CSF subcategory radar chart" width="1800" /></div>\n\n`;
  }
  if (trendChartUri) {
    maturitySection += `#### Score Trends by Quarter\n\n<img src="${trendChartUri}" alt="Quarterly score trends" width="1400" />\n\n`;
    maturitySection += `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:4px;font-size:13px">`;
    maturitySection += `<span><span style="color:#8b5cf6;font-weight:700">━━</span> Govern (GV)</span>`;
    maturitySection += `<span><span style="color:#3b82f6;font-weight:700">━━</span> Identify (ID)</span>`;
    maturitySection += `<span><span style="color:#10b981;font-weight:700">━━</span> Protect (PR)</span>`;
    maturitySection += `<span><span style="color:#f59e0b;font-weight:700">━━</span> Detect (DE)</span>`;
    maturitySection += `<span><span style="color:#ef4444;font-weight:700">━━</span> Respond (RS)</span>`;
    maturitySection += `<span><span style="color:#6366f1;font-weight:700">━━</span> Recover (RC)</span>`;
    maturitySection += `</div>\n\n`;
  }
  if (!barChartUri && !radarChartUri && !trendChartUri) {
    maturitySection += '*Charts not available — ensure dashboard charts are visible when generating the report.*\n\n';
  }

  maturitySection += '---';
  sections.push(maturitySection);

  // ── SECTION 5: Risk-Rated Findings ───────────────────────────────────
  let findingsSection = `## 5. Risk-Rated Findings\n\n`;

  if (sortedFindings.length === 0) {
    findingsSection += `No findings were identified during this assessment period.\n`;
  } else {
    findingsSection += `A total of **${sortedFindings.length}** findings were identified during the assessment.\n\n`;

    sortedFindings.forEach((finding, idx) => {
      findingsSection += `### Finding ${idx + 1}: ${sanitize(finding.summary)}\n\n`;
      findingsSection += `**Risk Rating: ${sanitize(finding.priority)}**\n\n`;
      findingsSection += `**Affected Controls:** ${sanitize(finding.controlId)}\n\n`;
      findingsSection += `**Condition:** ${sanitize(finding.rootCause || finding.description || 'Not documented')}\n\n`;
      findingsSection += `**Recommendation:** ${sanitize(finding.remediationActionPlan || 'Remediation plan pending')}\n\n`;
      findingsSection += `---\n\n`;
    });
  }

  sections.push(findingsSection);

  // ── SECTION 6: Management Response and Action Plans ──────────────────
  let mgmtSection = `## 6. Management Response and Action Plans\n\n`;

  if (sortedFindings.length === 0) {
    mgmtSection += `No management responses required — no findings identified.\n`;
  } else {
    sortedFindings.forEach((finding, idx) => {
      mgmtSection += `### Finding ${idx + 1}: ${sanitize(finding.summary)} (${sanitize(finding.priority)})\n\n`;
      mgmtSection += `**Management Response:** ${sanitize(finding.remediationActionPlan || 'Response pending')}\n\n`;
      mgmtSection += `**Status:** ${sanitize(finding.status || 'Open')}\n\n`;
      mgmtSection += `**Planned Completion:** ${sanitize(finding.dueDate || 'TBD')}\n\n`;
    });
  }

  mgmtSection += '---';
  sections.push(mgmtSection);

  // ── SECTION 7: Conclusion ────────────────────────────────────────────
  let conclusionSection = `## 7. Conclusion\n\n`;

  conclusionSection += `This assessment evaluated ${totalControls} control implementations across the six NIST CSF 2.0 functions for ${sanitize(organizationName)}. `;

  if (controlsMeetingTarget === totalControls) {
    conclusionSection += `All ${totalControls} controls meet or exceed their target maturity levels, demonstrating a strong and well-managed cybersecurity program.\n`;
  } else {
    conclusionSection += `Of the ${totalControls} controls assessed, ${controlsMeetingTarget} (${totalControls > 0 ? ((controlsMeetingTarget / totalControls) * 100).toFixed(0) : 0}%) meet or exceed target maturity levels, while ${controlsBelowTarget} controls require improvement to reach their target scores.\n`;
  }

  if (sortedFindings.length > 0) {
    conclusionSection += `\n${sortedFindings.length} findings were identified, of which ${findingsByCriticality.Critical + findingsByCriticality.High} are rated Critical or High priority and require immediate management attention.\n`;
  }

  if (previousQuarterAvg !== null) {
    const trend = overallActual - previousQuarterAvg;
    if (trend > 0) {
      conclusionSection += `\nThe organization showed positive momentum with a ${formatScore(trend)}-point improvement from Q${selectedQuarter - 1} to Q${selectedQuarter}, indicating that remediation efforts are taking effect.\n`;
    } else if (trend < 0) {
      conclusionSection += `\nThe decrease of ${formatScore(Math.abs(trend))} points from Q${selectedQuarter - 1} to Q${selectedQuarter} warrants review of remediation program effectiveness and resource allocation.\n`;
    }
  }

  conclusionSection += `\nManagement should prioritize remediation of identified findings in accordance with the action plans outlined in Section 6 and monitor progress through the quarterly assessment cycle.\n`;

  conclusionSection += '\n---';
  sections.push(conclusionSection);

  // ── APPENDIX A: CSF Function Scoring Detail ──────────────────────────
  let appendixA = `## Appendix A: CSF Function Scoring Detail\n\n`;

  FUNCTION_ORDER.forEach(fn => {
    const agg = functionAggregates[fn];
    if (agg.count === 0) return;

    const shortName = FUNCTION_SHORT[fn] || fn;
    appendixA += `### ${shortName} — Rating: ${ratingBadge(agg.rating)}\n\n`;
    appendixA += `<table>\n<tr style="background:#1e40af"><th style="padding:6px 10px;text-align:left;color:#fff">Control ID</th><th style="padding:6px 10px;text-align:center;color:#fff">Q${selectedQuarter} Score</th><th style="padding:6px 10px;text-align:center;color:#fff">Target</th><th style="padding:6px 10px;text-align:center;color:#fff">Gap</th></tr>\n`;

    // Sort controls within each function by controlId
    const sortedControls = [...agg.controls].sort((a, b) =>
      a.controlId.localeCompare(b.controlId)
    );

    sortedControls.forEach((cd, idx) => {
      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      const scoreBg = gapCellColor(cd.actualScore, cd.targetScore);
      const scoreTc = gapTextColor(cd.actualScore, cd.targetScore);
      const gapVal = cd.gap;
      const gapBg = gapVal <= 0 ? '#dcfce7' : gapVal < 2 ? '#fef3c7' : '#fee2e2';
      const gapTc = gapVal <= 0 ? '#16a34a' : gapVal < 2 ? '#d97706' : '#dc2626';
      appendixA += `<tr style="background:${rowBg}"><td style="padding:4px 10px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:13px">${sanitize(cd.controlId)}</td><td style="padding:4px 10px;text-align:center;border-bottom:1px solid #e5e7eb;color:${scoreTc};font-weight:600">${formatScore(cd.actualScore)}</td><td style="padding:4px 10px;text-align:center;border-bottom:1px solid #e5e7eb">${formatScore(cd.targetScore)}</td><td style="padding:4px 10px;text-align:center;border-bottom:1px solid #e5e7eb;background:${gapBg};color:${gapTc};font-weight:600">${formatScore(cd.gap)}</td></tr>\n`;
    });

    appendixA += `<tr style="background:#eff6ff;font-weight:700"><td style="padding:6px 10px">Average</td><td style="padding:6px 10px;text-align:center">${formatScore(agg.avgActual)}</td><td style="padding:6px 10px;text-align:center">${formatScore(agg.avgTarget)}</td><td style="padding:6px 10px;text-align:center">${formatScore(agg.avgGap)}</td></tr>\n</table>\n\n`;
  });

  appendixA += '---';
  sections.push(appendixA);

  // ── APPENDIX B: Assessment Criteria and Rating Definitions ───────────
  sections.push(`## Appendix B: Assessment Criteria and Rating Definitions

### Finding Risk Ratings

| Rating | Definition |
|---|---|
| **Critical** | Immediate risk to the organization requiring urgent remediation. Significant control failures or gaps that could lead to material security incidents. |
| **High** | Significant risk requiring prompt remediation. Control deficiencies that materially reduce the effectiveness of the cybersecurity program. |
| **Medium** | Moderate risk requiring planned remediation. Control gaps that may reduce program effectiveness if not addressed within a reasonable timeframe. |
| **Low** | Minor risk for inclusion in ongoing improvement plans. Opportunities to enhance controls beyond current baseline requirements. |

### Function Assessment Ratings

| Rating | Criteria |
|---|---|
| **Satisfactory** | Function average score meets or exceeds the target score. Controls are operating effectively. |
| **Needs Improvement** | Function average score is at least 70% of the target but below full target. Controls are partially effective with identified gaps. |
| **Unsatisfactory** | Function average score is below 70% of the target. Controls have significant deficiencies requiring immediate attention. |

### Scoring Scale (1-10)

| Score | Level | How Secure? |
|---|---|---|
| 0 - 1.9 | Insecurity | Organization rarely or never does this. Not enough security. |
| 2.0 - 4.9 | Some Security | Organization sometimes does this, but unreliably. Rework is common. Not enough security. |
| 5.0 - 5.9 | Minimally Acceptable | Organization does this consistently, with some minor flaws. Just right. |
| 6.1 - 6.9 | Optimized | Organization does this consistently, with great effectiveness and high quality. Just right. |
| 7.0 - 7.9 | Fully Optimized | Organization does this consistently, with fully optimized effectiveness and quality. Just right. |
| 8.1 - 10.0 | Too Much Security (Waste) | Organization does this at excessive financial cost. People can't easily get their work done. |

---`);

  // ── APPENDIX C: Distribution List ────────────────────────────────────
  sections.push(`## Appendix C: Distribution List

| Role | Name |
|---|---|
| **Prepared For** | ${sanitize(preparedFor)} |
| **Prepared By** | ${sanitize(preparedBy)} |
| **Lead Assessor** | ${sanitize(leadAssessor)} |
| **Quality Reviewer** | ${sanitize(qualityReviewer)} |

---

*This report was generated from the NIST CSF 2.0 Profile Assessment Database.*
*${sanitize(classification)} — Distribution restricted to authorized recipients.*`);

  // ═══════════════════════════════════════════════════════════════════════
  // ASSEMBLE AND DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════════

  const markdown = sections.join('\n\n');

  // Trigger browser download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Audit-Report-${date}.md`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return markdown;
};
