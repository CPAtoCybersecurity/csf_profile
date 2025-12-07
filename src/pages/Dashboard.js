import React, { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import useCSFStore from '../stores/csfStore';

// Format number to always show one decimal place
const formatScore = (value) => {
  if (value === null || value === undefined) return null;
  return Number(value).toFixed(1);
};

// Define the order of functions for the pivot table
const FUNCTION_ORDER = ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'];

const Dashboard = () => {
  const data = useCSFStore((state) => state.data);
  const [filterInScope, setFilterInScope] = useState(''); // '', 'Yes', or 'No'

  // Filter data based on In Scope selection
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (filterInScope === '') return data;
    return data.filter(item => item['In Scope? '] === filterInScope);
  }, [data, filterInScope]);

  // Calculate pivot table data: Score by Function by Quarter (with actual and target)
  const pivotTableData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // When filter is applied, use filtered data; otherwise use in-scope items
    const itemsToUse = filterInScope !== '' ? filteredData : filteredData.filter(item => item['In Scope? '] === 'Yes');

    // Group by function and calculate average scores per quarter
    const functionGroups = itemsToUse.reduce((acc, item) => {
      const func = item.Function || 'Unknown';
      if (!acc[func]) {
        acc[func] = {
          name: func,
          Q1: { actualTotal: 0, targetTotal: 0, count: 0 },
          Q2: { actualTotal: 0, targetTotal: 0, count: 0 },
          Q3: { actualTotal: 0, targetTotal: 0, count: 0 },
          Q4: { actualTotal: 0, targetTotal: 0, count: 0 },
        };
      }

      // Get quarterly scores
      const quarters = item.quarters || {};
      ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
        if (quarters[q]) {
          if (quarters[q].actualScore !== undefined || quarters[q].targetScore !== undefined) {
            acc[func][q].actualTotal += quarters[q].actualScore || 0;
            acc[func][q].targetTotal += quarters[q].targetScore || 0;
            acc[func][q].count++;
          }
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
      // Put unknown functions at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [filteredData, filterInScope]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">No data available for dashboard</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">In Scope:</span>
          <select
            value={filterInScope}
            onChange={(e) => setFilterInScope(e.target.value)}
            className="p-2 border rounded-lg bg-white"
          >
            <option value="">All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>

      {/* Pivot Table: Score by Function by Quarter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Average Scores by Function by Quarter (In Scope Only)</h2>
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th rowSpan={2} className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 align-bottom">Function</th>
                <th colSpan={2} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q1</th>
                <th colSpan={2} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q2</th>
                <th colSpan={2} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q3</th>
                <th colSpan={2} className="border border-gray-200 px-3 py-2 text-center font-semibold text-gray-700">Q4</th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600">Target</th>
              </tr>
            </thead>
            <tbody>
              {pivotTableData.map((row, index) => (
                <tr key={row.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">{row.name}</td>
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
                </tr>
              ))}
              {pivotTableData.length === 0 && (
                <tr>
                  <td colSpan={9} className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                    No data available. Select items as "In Scope" and add quarterly scores to see the pivot table.
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
    </div>
  );
};

export default Dashboard;
