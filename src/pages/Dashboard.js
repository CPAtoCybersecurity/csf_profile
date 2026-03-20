import React, { useMemo, useState, useEffect } from 'react';
import { ClipboardList, FileText } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useUIStore from '../stores/uiStore';
import useFindingsStore from '../stores/findingsStore';
import useArtifactStore from '../stores/artifactStore';
import KPICard from '../components/KPICard';
import { generateExecutiveSummary } from '../utils/executiveSummaryPDF';
import { generateAuditReportMarkdown } from '../utils/auditReportMarkdown';
import EvidenceTracker from '../components/EvidenceTracker';

// Format number to always show one decimal place
const formatScore = (value) => {
  if (value === null || value === undefined) return null;
  return Number(value).toFixed(1);
};

// Define the order of functions for the pivot table
const FUNCTION_ORDER = ['GOVERN (GV)', 'IDENTIFY (ID)', 'PROTECT (PR)', 'DETECT (DE)', 'RESPOND (RS)', 'RECOVER (RC)'];

// Function weights for gap prioritization scoring
const FUNCTION_WEIGHTS = {
  'GOVERN (GV)': 1.2,
  'IDENTIFY (ID)': 1.0,
  'PROTECT (PR)': 1.1,
  'DETECT (DE)': 1.1,
  'RESPOND (RS)': 1.0,
  'RECOVER (RC)': 0.9,
};

// Map function names to standard format
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

// Extract category ID from control ID (e.g., "GV.OC-01 Ex1" -> "GV.OC")
const extractCategoryId = (controlId) => {
  if (!controlId) return 'Unknown';
  const match = controlId.match(/^([A-Z]{2}\.[A-Z]{2})/);
  return match ? match[1] : controlId.split('-')[0] || 'Unknown';
};

// Define the order of category IDs for the subcategory table
const CATEGORY_ORDER = [
  'GV.OC', 'GV.OV', 'GV.PO', 'GV.RM', 'GV.RR', 'GV.SC',
  'ID.AM', 'ID.IM', 'ID.RA',
  'PR.AA', 'PR.AT', 'PR.DS', 'PR.IR', 'PR.PS',
  'DE.AE', 'DE.CM',
  'RS.AN', 'RS.CO', 'RS.MA', 'RS.MI',
  'RC.CO', 'RC.RP',
];

// Status colors for pie chart
const STATUS_COLORS = {
  'Complete': '#22c55e',      // green-500
  'In Progress': '#3b82f6',    // blue-500
  'Not Started': '#9ca3af',    // gray-400
  'Blocked': '#ef4444',        // red-500
  'Submitted': '#f59e0b', // amber-500
};

// Status order for consistent display
const STATUS_ORDER = ['Not Started', 'In Progress', 'Submitted', 'Complete', 'Blocked'];

const Dashboard = () => {
  const assessments = useAssessmentsStore((state) => state.assessments);
  const getControl = useControlsStore((state) => state.getControl);
  const requirements = useRequirementsStore((state) => state.requirements);
  const darkMode = useUIStore((state) => state.darkMode);
  const findings = useFindingsStore((state) => state.findings);
  const artifacts = useArtifactStore((state) => state.artifacts);

  // Build a lookup map from requirement/control ID to Function and Category
  // This supports both requirements-based and controls-based assessments
  const requirementLookup = useMemo(() => {
    const lookup = new Map();

    requirements.forEach(req => {
      // Store by the full ID (e.g., "GV.SC-04 Ex1")
      if (req.id) {
        lookup.set(req.id, {
          function: normalizeFunctionName(req.function),
          category: req.category,
          categoryId: extractCategoryId(req.subcategoryId || req.id),
          subcategoryId: req.subcategoryId
        });
      }
    });

    return lookup;
  }, [requirements]);

  // Selected assessment (default to first assessment)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(1); // 1-4 for Q1-Q4 - unified quarter for all dashboard components

  // Audit report modal state
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditMetadata, setAuditMetadata] = useState({
    reportNumber: 'IA-2025-001',
    engagementType: 'Cybersecurity Program Assessment (NIST CSF 2.0)',
    assessmentPeriod: '',
    reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    classification: 'Confidential',
    preparedFor: 'Board of Directors and Audit Committee',
    preparedBy: 'Internal Audit Department',
    leadAssessor: '',
    qualityReviewer: '',
    organizationName: '',
  });

  // Set default assessment on load
  useEffect(() => {
    if (!selectedAssessmentId && assessments.length > 0) {
      setSelectedAssessmentId(assessments[0].id);
    }
  }, [assessments, selectedAssessmentId]);

  // Get selected assessment
  const selectedAssessment = useMemo(() => {
    return assessments.find(a => a.id === selectedAssessmentId);
  }, [assessments, selectedAssessmentId]);

  // Chart colors based on theme
  const chartColors = {
    text: darkMode ? '#e5e7eb' : '#374151',
    textMuted: darkMode ? '#9ca3af' : '#6b7280',
    grid: darkMode ? '#374151' : '#e5e7eb',
    background: darkMode ? '#1f2937' : '#ffffff',
    border: darkMode ? '#374151' : '#e5e7eb',
  };

  // Build dashboard data from selected assessment
  const dashboardData = useMemo(() => {
    if (!selectedAssessment) return [];

    const { scopeIds, observations, scopeType } = selectedAssessment;

    return scopeIds.map(itemId => {
      const obs = observations[itemId] || {};
      const quarters = obs.quarters || {};

      // Look up function and category from requirements
      // This works for both controls and requirements since controls use implementation example IDs
      let functionName = 'Unknown';
      let categoryId = extractCategoryId(itemId);

      // First, try to look up directly in requirements by ID
      const reqInfo = requirementLookup.get(itemId);
      if (reqInfo) {
        functionName = reqInfo.function;
        categoryId = reqInfo.categoryId;
      } else if (scopeType === 'controls') {
        // For controls, also check the controlsStore for additional info
        const control = getControl(itemId);
        if (control) {
          // If control has a csfCategoryId (for non-CSF frameworks), use that
          if (control.csfCategoryId) {
            categoryId = control.csfCategoryId;
            // Derive function from CSF category prefix
            const prefix = control.csfCategoryId.substring(0, 2);
            const prefixMap = { 'GV': 'GOVERN (GV)', 'ID': 'IDENTIFY (ID)', 'PR': 'PROTECT (PR)', 'DE': 'DETECT (DE)', 'RS': 'RESPOND (RS)', 'RC': 'RECOVER (RC)' };
            functionName = prefixMap[prefix] || 'Unknown';
          } else if (control.function) {
            functionName = normalizeFunctionName(control.function);
            categoryId = extractCategoryId(control.subcategoryId || control.controlId);
          }
        } else {
          // Fallback: infer from ID prefix for NIST CSF format IDs
          const prefix = itemId.substring(0, 2);
          const prefixMap = { 'GV': 'GOVERN (GV)', 'ID': 'IDENTIFY (ID)', 'PR': 'PROTECT (PR)', 'DE': 'DETECT (DE)', 'RS': 'RESPOND (RS)', 'RC': 'RECOVER (RC)' };
          functionName = prefixMap[prefix] || 'Unknown';
        }
      } else {
        // For requirements-type assessments, fallback to prefix inference
        const prefix = itemId.substring(0, 2);
        const prefixMap = { 'GV': 'GOVERN (GV)', 'ID': 'IDENTIFY (ID)', 'PR': 'PROTECT (PR)', 'DE': 'DETECT (DE)', 'RS': 'RESPOND (RS)', 'RC': 'RECOVER (RC)' };
        functionName = prefixMap[prefix] || 'Unknown';
      }

      return {
        itemId,
        function: functionName,
        categoryId,
        quarters: {
          Q1: quarters.Q1 || { actualScore: 0, targetScore: 0, testingStatus: 'Not Started' },
          Q2: quarters.Q2 || { actualScore: 0, targetScore: 0, testingStatus: 'Not Started' },
          Q3: quarters.Q3 || { actualScore: 0, targetScore: 0, testingStatus: 'Not Started' },
          Q4: quarters.Q4 || { actualScore: 0, targetScore: 0, testingStatus: 'Not Started' },
        }
      };
    });
  }, [selectedAssessment, getControl, requirementLookup]);

  // Calculate pivot table data: Score by Function by Quarter
  const pivotTableData = useMemo(() => {
    if (dashboardData.length === 0) return [];

    // Group by function and calculate average scores per quarter
    const functionGroups = dashboardData.reduce((acc, item) => {
      const func = item.function;
      if (!acc[func]) {
        acc[func] = {
          name: func,
          Q1: { actualTotal: 0, targetTotal: 0, count: 0 },
          Q2: { actualTotal: 0, targetTotal: 0, count: 0 },
          Q3: { actualTotal: 0, targetTotal: 0, count: 0 },
          Q4: { actualTotal: 0, targetTotal: 0, count: 0 },
        };
      }

      ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
        const qData = item.quarters[q];
        if (qData && (qData.actualScore !== undefined || qData.targetScore !== undefined)) {
          acc[func][q].actualTotal += qData.actualScore || 0;
          acc[func][q].targetTotal += qData.targetScore || 0;
          acc[func][q].count++;
        }
      });

      return acc;
    }, {});

    // Convert to array and calculate averages
    const results = Object.values(functionGroups).map(group => ({
      name: group.name,
      Q1Actual: group.Q1.count > 0 ? +(group.Q1.actualTotal / group.Q1.count).toFixed(1) : null,
      Q1Target: group.Q1.count > 0 ? +(group.Q1.targetTotal / group.Q1.count).toFixed(1) : null,
      Q2Actual: group.Q2.count > 0 ? +(group.Q2.actualTotal / group.Q2.count).toFixed(1) : null,
      Q2Target: group.Q2.count > 0 ? +(group.Q2.targetTotal / group.Q2.count).toFixed(1) : null,
      Q3Actual: group.Q3.count > 0 ? +(group.Q3.actualTotal / group.Q3.count).toFixed(1) : null,
      Q3Target: group.Q3.count > 0 ? +(group.Q3.targetTotal / group.Q3.count).toFixed(1) : null,
      Q4Actual: group.Q4.count > 0 ? +(group.Q4.actualTotal / group.Q4.count).toFixed(1) : null,
      Q4Target: group.Q4.count > 0 ? +(group.Q4.targetTotal / group.Q4.count).toFixed(1) : null,
    }));

    // Sort by the defined function order
    return results.sort((a, b) => {
      const indexA = FUNCTION_ORDER.indexOf(a.name);
      const indexB = FUNCTION_ORDER.indexOf(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [dashboardData]);

  // Calculate bar chart data for functions (Actual + Gap to Target)
  const functionBarChartData = useMemo(() => {
    if (!pivotTableData || pivotTableData.length === 0) return { data: [], maxTarget: 5 };

    const quarterKey = `Q${selectedQuarter}`;
    const actualKey = `${quarterKey}Actual`;
    const targetKey = `${quarterKey}Target`;

    let maxTarget = 0;
    const chartData = pivotTableData.map(row => {
      const actual = row[actualKey] || 0;
      const target = row[targetKey] || 0;
      const gap = Math.max(0, target - actual);

      if (target > maxTarget) maxTarget = target;

      return {
        name: row.name,
        actual: actual,
        gap: gap,
        target: target,
      };
    });

    return { data: chartData, maxTarget: maxTarget || 5 };
  }, [pivotTableData, selectedQuarter]);

  // Calculate subcategory (Category ID) data for the selected quarter
  const subcategoryData = useMemo(() => {
    if (dashboardData.length === 0) return [];

    const quarterKey = `Q${selectedQuarter}`;

    // Group by Category ID and calculate averages
    const categoryGroups = dashboardData.reduce((acc, item) => {
      const categoryId = item.categoryId;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          targetTotal: 0,
          actualScoreTotal: 0,
          count: 0,
        };
      }

      const quarterData = item.quarters[quarterKey];
      if (quarterData) {
        acc[categoryId].targetTotal += quarterData.targetScore || 0;
        acc[categoryId].actualScoreTotal += quarterData.actualScore || 0;
        acc[categoryId].count++;
      }

      return acc;
    }, {});

    // Convert to array and calculate averages
    const results = Object.values(categoryGroups)
      .filter(group => group.count > 0)
      .map(group => ({
        categoryId: group.categoryId,
        desiredTarget: +(group.targetTotal / group.count).toFixed(1),
        actualScore: +(group.actualScoreTotal / group.count).toFixed(1),
      }));

    // Sort by the defined category order
    return results.sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a.categoryId);
      const indexB = CATEGORY_ORDER.indexOf(b.categoryId);
      if (indexA === -1 && indexB === -1) return a.categoryId.localeCompare(b.categoryId);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [dashboardData, selectedQuarter]);

  // Calculate grand totals for subcategory table
  const grandTotals = useMemo(() => {
    if (subcategoryData.length === 0) return { desiredTarget: 0, actualScore: 0 };

    const totals = subcategoryData.reduce(
      (acc, item) => ({
        desiredTarget: acc.desiredTarget + item.desiredTarget,
        actualScore: acc.actualScore + item.actualScore,
      }),
      { desiredTarget: 0, actualScore: 0 }
    );

    return {
      desiredTarget: +(totals.desiredTarget / subcategoryData.length).toFixed(1),
      actualScore: +(totals.actualScore / subcategoryData.length).toFixed(1),
    };
  }, [subcategoryData]);

  // Prepare radar chart data
  const radarChartData = useMemo(() => {
    return subcategoryData.map(item => ({
      category: item.categoryId,
      'Target': item.desiredTarget,
      'Actual Score': item.actualScore,
    }));
  }, [subcategoryData]);

  // Calculate assessment status data for pie chart
  const statusChartData = useMemo(() => {
    if (dashboardData.length === 0) return [];

    const quarterKey = `Q${selectedQuarter}`;

    // Count statuses
    const statusCounts = dashboardData.reduce((acc, item) => {
      const quarterData = item.quarters[quarterKey];
      const status = quarterData?.testingStatus || 'Not Started';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort by STATUS_ORDER
    const results = Object.entries(statusCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || '#9ca3af',
      }))
      .sort((a, b) => {
        const indexA = STATUS_ORDER.indexOf(a.name);
        const indexB = STATUS_ORDER.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

    return results;
  }, [dashboardData, selectedQuarter]);

  // Calculate total for percentage display
  const statusTotal = useMemo(() => {
    return statusChartData.reduce((sum, item) => sum + item.value, 0);
  }, [statusChartData]);

  // Calculate top 10 priority gaps for the selected quarter
  const priorityGaps = useMemo(() => {
    if (!dashboardData || dashboardData.length === 0) return [];

    const quarterKey = `Q${selectedQuarter}`;

    const gaps = dashboardData
      .map(item => {
        const quarterData = (item.quarters || {})[quarterKey];
        if (!quarterData) return null;
        const actual = quarterData.actualScore ?? 0;
        const target = quarterData.targetScore ?? 0;
        const gap = target - actual;
        if (gap <= 0) return null;
        const weight = FUNCTION_WEIGHTS[item.function] ?? 1.0;
        const priorityScore = +(gap * weight).toFixed(2);
        return {
          itemId: item.itemId || '',
          function: item.function || 'Unknown',
          actual: +actual.toFixed(1),
          target: +target.toFixed(1),
          gap: +gap.toFixed(1),
          priorityScore,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10);

    return gaps;
  }, [dashboardData, selectedQuarter]);

  // Colors for each CSF function in the trend line chart
  const FUNCTION_LINE_COLORS = {
    'GOVERN (GV)': '#8b5cf6',
    'IDENTIFY (ID)': '#3b82f6',
    'PROTECT (PR)': '#10b981',
    'DETECT (DE)': '#f59e0b',
    'RESPOND (RS)': '#ef4444',
    'RECOVER (RC)': '#6366f1',
  };

  // Calculate quarterly trend data: average actualScore per function per quarter
  const trendChartData = useMemo(() => {
    if (dashboardData.length === 0) return [];

    // Only include quarters up to and including the selected quarter
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].slice(0, selectedQuarter);

    // Build a map: { Q1: { 'GOVERN (GV)': [scores...], ... }, Q2: {...}, ... }
    const quarterFunctionScores = {};
    quarters.forEach(q => {
      quarterFunctionScores[q] = {};
      FUNCTION_ORDER.forEach(fn => {
        quarterFunctionScores[q][fn] = [];
      });
    });

    dashboardData.forEach(item => {
      const fn = item.function;
      if (!FUNCTION_ORDER.includes(fn)) return;
      quarters.forEach(q => {
        const score = item.quarters[q]?.actualScore;
        if (score !== undefined) {
          quarterFunctionScores[q][fn].push(score);
        }
      });
    });

    // Build Recharts data rows, skipping quarters where ALL functions have 0 scores
    const rows = quarters.map(q => {
      const row = { quarter: q };
      let allZero = true;
      FUNCTION_ORDER.forEach(fn => {
        const scores = quarterFunctionScores[q][fn];
        if (scores.length > 0) {
          const avg = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
          row[fn] = avg;
          if (avg !== 0) allZero = false;
        }
      });
      row._allZero = allZero;
      return row;
    });

    // Filter out quarters where all scores are 0
    return rows
      .filter(row => !row._allZero)
      .map(({ _allZero, ...rest }) => rest);
  }, [dashboardData, selectedQuarter]);

  // ── KPI Cards ──────────────────────────────────────────────────────────────
  const kpiData = useMemo(() => {
    const quarterKey = `Q${selectedQuarter}`;
    const prevQuarterKey = selectedQuarter > 1 ? `Q${selectedQuarter - 1}` : null;

    if (!selectedAssessment || dashboardData.length === 0) {
      return {
        overallScore: { value: '--', trend: null },
        inScopeItems: { value: '--', trend: null },
        evidenceCoverage: { value: '--', trend: null },
        openFindings: { value: '--', trend: null },
      };
    }

    // 1. Overall Score — average actualScore for selected quarter
    const scoresThisQ = dashboardData
      .map(item => item.quarters[quarterKey]?.actualScore)
      .filter(s => s !== undefined && s !== null && s > 0);

    const overallScore = scoresThisQ.length > 0
      ? (scoresThisQ.reduce((a, b) => a + b, 0) / scoresThisQ.length).toFixed(1)
      : '--';

    let overallTrend = null;
    if (prevQuarterKey) {
      const scoresPrevQ = dashboardData
        .map(item => item.quarters[prevQuarterKey]?.actualScore)
        .filter(s => s !== undefined && s !== null && s > 0);
      if (scoresPrevQ.length > 0 && scoresThisQ.length > 0) {
        const prevAvg = scoresPrevQ.reduce((a, b) => a + b, 0) / scoresPrevQ.length;
        const delta = (parseFloat(overallScore) - prevAvg).toFixed(1);
        overallTrend = {
          value: delta >= 0 ? `+${delta}` : `${delta}`,
          direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
        };
      }
    }

    // 2. In-Scope Items — count of scopeIds
    const inScopeCount = selectedAssessment.scopeIds?.length || 0;

    // 3. Evidence Coverage — % of in-scope items with at least one artifact
    const controlsWithArtifacts = new Set(
      artifacts
        .filter(a => a.controlId)
        .map(a => a.controlId)
    );
    const scopeIds = selectedAssessment.scopeIds || [];
    const coveredCount = scopeIds.filter(id => controlsWithArtifacts.has(id)).length;
    const evidencePct = inScopeCount > 0
      ? `${Math.round((coveredCount / inScopeCount) * 100)}%`
      : '--';

    // 4. Open Findings — status !== 'Resolved'
    const openCount = findings.filter(f => f.status !== 'Resolved').length;

    return {
      overallScore: { value: overallScore, trend: overallTrend },
      inScopeItems: { value: inScopeCount, trend: null },
      evidenceCoverage: {
        value: evidencePct,
        subtitle: inScopeCount > 0 ? `${coveredCount} of ${inScopeCount} items` : null,
        trend: null,
      },
      openFindings: { value: openCount, trend: null },
    };
  }, [selectedAssessment, dashboardData, selectedQuarter, artifacts, findings]);
  // ── End KPI Cards ──────────────────────────────────────────────────────────

  if (assessments.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900 min-h-full flex items-center justify-center">
        <EmptyState
          icon={ClipboardList}
          title="No assessment data yet"
          description="Create your first assessment to see dashboard analytics."
          actionLabel="Go to Assessments"
          actionLink="/assessments"
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Assessment:</span>
            <select
              value={selectedAssessmentId || ''}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="p-2 border rounded-lg bg-white min-w-[200px]"
            >
              {assessments.map(assessment => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Quarter:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              className="p-2 border rounded-lg bg-white font-medium"
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
          </div>
          <button
            onClick={() =>
              generateExecutiveSummary({
                assessment: selectedAssessment,
                requirements,
                findings,
                artifacts,
                selectedQuarter,
              })
            }
            disabled={!selectedAssessment}
            className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Export Executive Summary PDF"
          >
            <FileText size={15} />
            Export Summary
          </button>
          <button
            onClick={() => setShowAuditModal(true)}
            disabled={!selectedAssessment}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Export Audit Report as Markdown"
          >
            <ClipboardList size={15} />
            Audit Report
          </button>
        </div>
      </div>

      {/* Assessment Info */}
      {selectedAssessment && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-blue-900">{selectedAssessment.name}</span>
              {selectedAssessment.description && (
                <span className="text-blue-700 ml-2">— {selectedAssessment.description}</span>
              )}
            </div>
            <div className="text-sm text-blue-600">
              {selectedAssessment.scopeIds?.length || 0} items in scope
            </div>
          </div>
        </div>
      )}

      {dashboardData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <ClipboardList size={48} className="mb-4 opacity-50 text-gray-400" />
          <div className="text-xl font-semibold text-gray-600">No data in this assessment</div>
          <p className="text-gray-500 mt-2">Add items to the assessment scope to see dashboard data</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              title="Overall Score"
              value={kpiData.overallScore.value}
              subtitle="Avg actual score this quarter"
              trend={kpiData.overallScore.trend}
              darkMode={darkMode}
            />
            <KPICard
              title="In-Scope Items"
              value={kpiData.inScopeItems.value}
              subtitle="Controls / requirements in scope"
              trend={kpiData.inScopeItems.trend}
              darkMode={darkMode}
            />
            <KPICard
              title="Evidence Coverage"
              value={kpiData.evidenceCoverage.value}
              subtitle={kpiData.evidenceCoverage.subtitle || 'Items with linked artifacts'}
              trend={kpiData.evidenceCoverage.trend}
              darkMode={darkMode}
            />
            <KPICard
              title="Open Findings"
              value={kpiData.openFindings.value}
              subtitle="Findings not yet resolved"
              trend={kpiData.openFindings.trend}
              darkMode={darkMode}
            />
          </div>

          {/* Pivot Table and Bar Chart Side by Side */}
          <div className="flex gap-4 mb-6">
            {/* Pivot Table: Score by Function by Quarter */}
            <div className="card flex-shrink-0" style={{padding: '0.75rem'}}>
              <h2 className="text-base font-semibold mb-3">Function Scores by Quarter</h2>
            <div className="overflow-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th rowSpan={2} className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 align-bottom">Function</th>
                    <th colSpan={3} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q1</th>
                    <th colSpan={3} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q2</th>
                    <th colSpan={3} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q3</th>
                    <th colSpan={3} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q4</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Variance</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Variance</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Variance</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
                    <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {pivotTableData.map((row, index) => {
                    const q1Variance = row.Q1Actual !== null && row.Q1Target !== null ? +(row.Q1Actual - row.Q1Target).toFixed(1) : null;
                    const q2Variance = row.Q2Actual !== null && row.Q2Target !== null ? +(row.Q2Actual - row.Q2Target).toFixed(1) : null;
                    const q3Variance = row.Q3Actual !== null && row.Q3Target !== null ? +(row.Q3Actual - row.Q3Target).toFixed(1) : null;
                    const q4Variance = row.Q4Actual !== null && row.Q4Target !== null ? +(row.Q4Actual - row.Q4Target).toFixed(1) : null;
                    return (
                    <tr key={row.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">{row.name}</td>
                      {/* Q1 */}
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q1Actual !== null ? (
                          <span className={`font-semibold ${row.Q1Actual >= row.Q1Target ? 'text-green-600' : row.Q1Actual >= row.Q1Target * 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                            {formatScore(row.Q1Actual)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q1Target !== null ? (
                          <span className="text-gray-700">{formatScore(row.Q1Target)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {q1Variance !== null ? (
                          <span className={`font-semibold ${q1Variance >= 0 ? 'text-green-600' : q1Variance >= -1 ? 'text-amber-600' : 'text-red-600'}`}>
                            {q1Variance >= 0 ? '+' : ''}{formatScore(q1Variance)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {/* Q2 */}
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q2Actual !== null ? (
                          <span className={`font-semibold ${row.Q2Actual >= row.Q2Target ? 'text-green-600' : row.Q2Actual >= row.Q2Target * 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                            {formatScore(row.Q2Actual)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q2Target !== null ? (
                          <span className="text-gray-700">{formatScore(row.Q2Target)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {q2Variance !== null ? (
                          <span className={`font-semibold ${q2Variance >= 0 ? 'text-green-600' : q2Variance >= -1 ? 'text-amber-600' : 'text-red-600'}`}>
                            {q2Variance >= 0 ? '+' : ''}{formatScore(q2Variance)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {/* Q3 */}
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q3Actual !== null ? (
                          <span className={`font-semibold ${row.Q3Actual >= row.Q3Target ? 'text-green-600' : row.Q3Actual >= row.Q3Target * 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                            {formatScore(row.Q3Actual)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q3Target !== null ? (
                          <span className="text-gray-700">{formatScore(row.Q3Target)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {q3Variance !== null ? (
                          <span className={`font-semibold ${q3Variance >= 0 ? 'text-green-600' : q3Variance >= -1 ? 'text-amber-600' : 'text-red-600'}`}>
                            {q3Variance >= 0 ? '+' : ''}{formatScore(q3Variance)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {/* Q4 */}
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q4Actual !== null ? (
                          <span className={`font-semibold ${row.Q4Actual >= row.Q4Target ? 'text-green-600' : row.Q4Actual >= row.Q4Target * 0.7 ? 'text-amber-600' : 'text-red-600'}`}>
                            {formatScore(row.Q4Actual)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {row.Q4Target !== null ? (
                          <span className="text-gray-700">{formatScore(row.Q4Target)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-200 px-3 py-3 text-center">
                        {q4Variance !== null ? (
                          <span className={`font-semibold ${q4Variance >= 0 ? 'text-green-600' : q4Variance >= -1 ? 'text-amber-600' : 'text-red-600'}`}>
                            {q4Variance >= 0 ? '+' : ''}{formatScore(q4Variance)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  )})}
                  {pivotTableData.length === 0 && (
                    <tr>
                      <td colSpan={13} className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                        No data available. Add quarterly scores to see the pivot table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
              <div className="mt-3 text-xs text-gray-500">
                Actual score colors: <span className="text-green-600 font-semibold">Green (meets target)</span>, <span className="text-amber-600 font-semibold">Amber (70%+ of target)</span>, <span className="text-red-600 font-semibold">Red (&lt;70% of target)</span>
              </div>
            </div>

            {/* Function Bar Chart */}
            <div className="card flex-1" style={{padding: '0.75rem'}}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">Function Actual vs Target (Q{selectedQuarter})</h2>
              </div>

              {functionBarChartData.data.length > 0 ? (
                <div id="audit-chart-bar">
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart
                    data={functionBarChartData.data}
                    margin={{ top: 15, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: chartColors.text }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 11, fill: chartColors.text }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        formatScore(value),
                        name === 'actual' ? 'Actual Score' : name === 'gap' ? 'Gap to Target' : name
                      ]}
                      contentStyle={{ backgroundColor: chartColors.background, border: `1px solid ${chartColors.border}`, borderRadius: 6, fontSize: 12, color: chartColors.text }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value) => (
                        <span style={{ color: chartColors.text, fontSize: 12 }}>
                          {value === 'actual' ? 'Actual Score' : value === 'gap' ? 'Gap to Target' : value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="actual"
                      stackId="a"
                      fill="#60a5fa"
                      radius={[0, 0, 0, 0]}
                      name="actual"
                      barSize={80}
                    />
                    <Bar
                      dataKey="gap"
                      stackId="a"
                      fill="#f9a8d4"
                      radius={[4, 4, 0, 0]}
                      name="gap"
                      barSize={80}
                    />
                    <ReferenceLine
                      y={functionBarChartData.maxTarget}
                      stroke="#1e40af"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{
                        value: `Target (${formatScore(functionBarChartData.maxTarget)})`,
                        position: 'insideTopRight',
                        fill: '#1e40af',
                        fontSize: 11,
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                  No data for Q{selectedQuarter}.
                </div>
              )}
            </div>
          </div>

          {/* Evidence Completeness Tracker */}
          <div className="mb-6">
            <EvidenceTracker assessment={selectedAssessment} artifacts={artifacts} />
          </div>

          {/* Subcategory Assessment Section */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">CSF Subcategories (Q{selectedQuarter})</h2>
            </div>

            <div className="flex gap-6">
              {/* Subcategory Table */}
              <div className="flex-shrink-0">
                <table className="border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">Actual</th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">Target</th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subcategoryData.map((row, index) => {
                      const variance = +(row.actualScore - row.desiredTarget).toFixed(1);
                      return (
                        <tr key={row.categoryId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-3 py-1 text-sm font-medium text-gray-900">{row.categoryId}</td>
                          <td className="border border-gray-300 px-3 py-1 text-sm text-center">
                            <span className={`font-semibold ${
                              row.actualScore >= row.desiredTarget ? 'text-green-600' :
                              row.actualScore >= row.desiredTarget * 0.7 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {formatScore(row.actualScore)}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-1 text-sm text-center">{formatScore(row.desiredTarget)}</td>
                          <td className="border border-gray-300 px-3 py-1 text-sm text-center">
                            <span className={`font-semibold ${
                              variance >= 0 ? 'text-green-600' : variance >= -1 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {variance >= 0 ? '+' : ''}{formatScore(variance)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {subcategoryData.length > 0 && (
                      <tr className="bg-blue-100 font-semibold">
                        <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">Grand Total</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                          <span className={`${
                            grandTotals.actualScore >= grandTotals.desiredTarget ? 'text-green-600' :
                            grandTotals.actualScore >= grandTotals.desiredTarget * 0.7 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {formatScore(grandTotals.actualScore)}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center">{formatScore(grandTotals.desiredTarget)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                          {(() => {
                            const totalVariance = +(grandTotals.actualScore - grandTotals.desiredTarget).toFixed(1);
                            return (
                              <span className={`${
                                totalVariance >= 0 ? 'text-green-600' : totalVariance >= -1 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {totalVariance >= 0 ? '+' : ''}{formatScore(totalVariance)}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    )}
                    {subcategoryData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No data available for Q{selectedQuarter}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Radar Chart */}
              <div className="flex-1 min-w-0">
                <div className="text-center mb-2">
                  <h3 className="text-base font-semibold text-gray-700">CSF Subcategories; Q{selectedQuarter}</h3>
                </div>
                {radarChartData.length > 0 ? (
                  <div id="audit-chart-radar">
                  <ResponsiveContainer width="100%" height={500}>
                    <RadarChart data={radarChartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid gridType="polygon" stroke={chartColors.grid} />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fontSize: 10, fill: chartColors.text }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={{ fontSize: 10, fill: chartColors.text }}
                        tickCount={6}
                      />
                      <Radar
                        name="Target"
                        dataKey="Target"
                        stroke="#1e40af"
                        fill="#bfdbfe"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Radar
                        name="Actual"
                        dataKey="Actual Score"
                        stroke="#0891b2"
                        fill="#f9a8d4"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => <span style={{ color: chartColors.text, fontSize: 12 }}>{value}</span>}
                      />
                      <Tooltip
                        formatter={(value) => formatScore(value)}
                        contentStyle={{ backgroundColor: chartColors.background, border: `1px solid ${chartColors.border}`, borderRadius: 8, color: chartColors.text }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    No data available for radar chart.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Status Pie Chart */}
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Assessment Status (Q{selectedQuarter})</h2>
            </div>

            <div className="flex gap-8 items-center">
              {/* Pie Chart */}
              <div className="flex-shrink-0">
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width={520} height={400}>
                    <PieChart margin={{ left: 100, right: 80 }}>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={{ stroke: chartColors.textMuted }}
                        label={({ name, percent, x, y }) => (
                          <text x={x} y={y} fill={chartColors.text} textAnchor="middle" dominantBaseline="middle" fontSize={12}>
                            {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        )}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} items (${((value / statusTotal) * 100).toFixed(1)}%)`, name]}
                        contentStyle={{ backgroundColor: chartColors.background, border: `1px solid ${chartColors.border}`, borderRadius: 8, color: chartColors.text }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center" style={{ width: 520, height: 400 }}>
                    <span className="text-gray-500">No data available for Q{selectedQuarter}.</span>
                  </div>
                )}
              </div>

              {/* Legend / Status Table */}
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Q{selectedQuarter} Status Summary</h3>
                <table className="border-collapse w-full max-w-md">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">Count</th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusChartData.map((item, index) => (
                      <tr key={item.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.name}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center font-medium">
                          {item.value}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                          {statusTotal > 0 ? ((item.value / statusTotal) * 100).toFixed(1) : 0}%
                        </td>
                      </tr>
                    ))}
                    {statusChartData.length > 0 && (
                      <tr className="bg-blue-100 font-semibold">
                        <td className="border border-gray-300 px-3 py-2 text-sm">Total</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center">{statusTotal}</td>
                        <td className="border border-gray-300 px-3 py-2 text-sm text-center">100%</td>
                      </tr>
                    )}
                    {statusChartData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                          No data available for Q{selectedQuarter}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quarterly Trend Line Chart */}
          <div className="card mt-6">
            <h2 className="text-lg font-semibold mb-4">Score Trends by Quarter</h2>
            {trendChartData.length > 0 ? (
              <div id="audit-chart-trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={trendChartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fontSize: 12, fill: chartColors.text }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 7]}
                    tick={{ fontSize: 11, fill: chartColors.text }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    formatter={(value, name) => [Number(value).toFixed(2), name]}
                    contentStyle={{
                      backgroundColor: chartColors.background,
                      border: `1px solid ${chartColors.border}`,
                      borderRadius: 6,
                      fontSize: 12,
                      color: chartColors.text,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value) => (
                      <span style={{ color: chartColors.text, fontSize: 12 }}>{value}</span>
                    )}
                  />
                  {FUNCTION_ORDER.map(fn => (
                    <Line
                      key={fn}
                      type="monotone"
                      dataKey={fn}
                      stroke={FUNCTION_LINE_COLORS[fn]}
                      strokeWidth={2}
                      dot={true}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                No quarterly score data available to display trends.
              </div>
            )}
          </div>
        </>
      )}

      {/* Audit Report Metadata Modal */}
      {showAuditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Audit Report Settings</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['organizationName', 'Organization Name'],
                ['reportNumber', 'Report Number'],
                ['engagementType', 'Engagement Type'],
                ['assessmentPeriod', 'Assessment Period'],
                ['reportDate', 'Report Date'],
                ['classification', 'Classification'],
                ['preparedFor', 'Prepared For'],
                ['preparedBy', 'Prepared By'],
                ['leadAssessor', 'Lead Assessor'],
                ['qualityReviewer', 'Quality Reviewer'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>{label}</label>
                  <input
                    type="text"
                    value={auditMetadata[key]}
                    onChange={(e) => setAuditMetadata(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
              <button
                onClick={() => setShowAuditModal(false)}
                style={{ padding: '8px 16px', fontSize: 14, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  generateAuditReportMarkdown({
                    assessment: selectedAssessment,
                    requirements,
                    findings,
                    artifacts,
                    selectedQuarter,
                    reportMetadata: auditMetadata,
                  });
                  setShowAuditModal(false);
                }}
                style={{ padding: '8px 16px', backgroundColor: '#374151', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', borderRadius: 6, cursor: 'pointer' }}
              >
                Generate Markdown Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gap Prioritization Matrix */}
      <div className={`card mt-6 p-4 rounded-lg shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Priority Gaps (Q{selectedQuarter})
          </h2>
        </div>
        {priorityGaps.length === 0 ? (
          <p className={`text-sm text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No gaps detected — all scores meet or exceed targets.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-xs uppercase border-b ${darkMode ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200'}`}>
                <th className="text-left py-2 px-3">Rank</th>
                <th className="text-left py-2 px-3">ID</th>
                <th className="text-left py-2 px-3">Function</th>
                <th className="text-right py-2 px-3">Actual</th>
                <th className="text-right py-2 px-3">Target</th>
                <th className="text-right py-2 px-3">Gap</th>
                <th className="text-right py-2 px-3">Priority Score</th>
              </tr>
            </thead>
            <tbody>
              {priorityGaps.map((row, index) => {
                let scoreClass;
                if (row.priorityScore >= 3.0) {
                  scoreClass = darkMode
                    ? 'text-red-400 bg-red-900/30'
                    : 'text-red-600 bg-red-50';
                } else if (row.priorityScore >= 2.0) {
                  scoreClass = darkMode
                    ? 'text-orange-400 bg-orange-900/30'
                    : 'text-orange-600 bg-orange-50';
                } else if (row.priorityScore >= 1.0) {
                  scoreClass = darkMode
                    ? 'text-yellow-400 bg-yellow-900/30'
                    : 'text-yellow-600 bg-yellow-50';
                } else {
                  scoreClass = darkMode
                    ? 'text-green-400 bg-green-900/30'
                    : 'text-green-600 bg-green-50';
                }
                return (
                  <tr
                    key={`${row.itemId}-${index}`}
                    className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <td className={`py-2 px-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {index + 1}
                    </td>
                    <td className={`py-2 px-3 font-mono text-xs ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {row.itemId}
                    </td>
                    <td className={`py-2 px-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {row.function}
                    </td>
                    <td className={`py-2 px-3 text-right font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {formatScore(row.actual)}
                    </td>
                    <td className={`py-2 px-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatScore(row.target)}
                    </td>
                    <td className={`py-2 px-3 text-right font-semibold text-red-500 dark:text-red-400`}>
                      {formatScore(row.gap)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded font-semibold text-xs ${scoreClass}`}>
                        {row.priorityScore.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
