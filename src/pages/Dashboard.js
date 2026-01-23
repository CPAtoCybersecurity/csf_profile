import React, { useMemo, useState, useEffect } from 'react';
import { ClipboardList } from 'lucide-react';
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
} from 'recharts';
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useUIStore from '../stores/uiStore';

// Format number to always show one decimal place
const formatScore = (value) => {
  if (value === null || value === undefined) return null;
  return Number(value).toFixed(1);
};

// Define the order of functions for the pivot table
const FUNCTION_ORDER = ['GOVERN (GV)', 'IDENTIFY (ID)', 'PROTECT (PR)', 'DETECT (DE)', 'RESPOND (RS)', 'RECOVER (RC)'];

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

  if (assessments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ClipboardList size={48} className="mb-4 opacity-50 text-gray-400" />
        <div className="text-xl font-semibold text-gray-600">No assessments available</div>
        <p className="text-gray-500 mt-2">Create an assessment in the Assessments tab to see dashboard data</p>
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
          {/* Pivot Table and Bar Chart Side by Side */}
          <div className="flex gap-4 mb-6">
            {/* Pivot Table: Score by Function by Quarter */}
            <div className="bg-white p-3 rounded-lg shadow-sm border flex-shrink-0">
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
            <div className="bg-white p-3 rounded-lg shadow-sm border flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold">Function Actual vs Target (Q{selectedQuarter})</h2>
              </div>

              {functionBarChartData.data.length > 0 ? (
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
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                  No data for Q{selectedQuarter}.
                </div>
              )}
            </div>
          </div>

          {/* Subcategory Assessment Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
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
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    No data available for radar chart.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Status Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mt-6">
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
