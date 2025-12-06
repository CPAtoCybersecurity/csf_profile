import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import useCSFStore from '../stores/csfStore';
import useUIStore from '../stores/uiStore';

const Dashboard = () => {
  const data = useCSFStore((state) => state.data);
  const darkMode = useUIStore((state) => state.darkMode);

  // Calculate status distribution for pie chart
  const statusData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const statusCounts = data.reduce((acc, item) => {
      const status = item['Testing Status'] || 'Not Started';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate in scope distribution for pie chart
  const inScopeData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const inScopeCounts = data.reduce((acc, item) => {
      const inScope = item['In Scope? '] || 'No';
      acc[inScope] = (acc[inScope] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(inScopeCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Calculate score gap by function
  const functionScoreData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const inScopeItems = data.filter(item => item['In Scope? '] === 'Yes');
    const functionGroups = inScopeItems.reduce((acc, item) => {
      const func = item.Function || 'Unknown';
      if (!acc[func]) {
        acc[func] = { total: 0, current: 0, desired: 0 };
      }
      acc[func].total++;
      acc[func].current += item['Current State Score'] || 0;
      acc[func].desired += item['Desired State Score'] || 0;
      return acc;
    }, {});

    return Object.entries(functionGroups).map(([name, stats]) => ({
      name: name.substring(0, 10),
      fullName: name,
      current: +(stats.current / stats.total).toFixed(1),
      desired: +(stats.desired / stats.total).toFixed(1),
      gap: +((stats.desired - stats.current) / stats.total).toFixed(1),
    }));
  }, [data]);

  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    'Complete': '#16a34a',
    'Completed': '#16a34a',
    'In Progress': '#2563eb',
    'Not Started': '#6b7280',
    'Submitted': '#f97316',
    'Issues Found': '#dc2626'
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const inScopeItems = data.filter(item => item['In Scope? '] === 'Yes');
    const completedItems = inScopeItems.filter(item =>
      item['Testing Status'] === 'Complete' || item['Testing Status'] === 'Completed'
    );

    const avgCurrent = inScopeItems.length > 0
      ? inScopeItems.reduce((sum, item) => sum + (item['Current State Score'] || 0), 0) / inScopeItems.length
      : 0;

    const avgDesired = inScopeItems.length > 0
      ? inScopeItems.reduce((sum, item) => sum + (item['Desired State Score'] || 0), 0) / inScopeItems.length
      : 0;

    return {
      total: data.length,
      inScope: inScopeItems.length,
      completed: completedItems.length,
      completionRate: inScopeItems.length > 0 ? (completedItems.length / inScopeItems.length * 100).toFixed(1) : 0,
      avgCurrent: avgCurrent.toFixed(1),
      avgDesired: avgDesired.toFixed(1),
      avgGap: (avgDesired - avgCurrent).toFixed(1),
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold dark:text-white">No data available for dashboard</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-full">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Dashboard</h1>

      {/* Summary Cards */}
      {summaryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summaryStats.total}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Controls</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{summaryStats.inScope}</div>
            <div className="text-sm text-green-600 dark:text-green-400">In Scope</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{summaryStats.completed}</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Completed</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{summaryStats.completionRate}%</div>
            <div className="text-sm text-amber-600 dark:text-amber-400">Completion Rate</div>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{summaryStats.avgCurrent}</div>
            <div className="text-sm text-cyan-600 dark:text-cyan-400">Avg Current</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{summaryStats.avgDesired}</div>
            <div className="text-sm text-indigo-600 dark:text-indigo-400">Avg Desired</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">{summaryStats.avgGap}</div>
            <div className="text-sm text-red-600 dark:text-red-400">Avg Gap</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Testing Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* In Scope Distribution */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">In Scope Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inScopeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inScopeData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.name === 'Yes' ? '#16a34a' : '#dc2626'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Score by Function */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Average Scores by Function (In Scope Only)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={functionScoreData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis
                dataKey="name"
                tick={{ fill: darkMode ? '#9ca3af' : '#374151' }}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: darkMode ? '#9ca3af' : '#374151' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#fff',
                  borderColor: darkMode ? '#374151' : '#e5e7eb',
                  color: darkMode ? '#fff' : '#000'
                }}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              />
              <Legend />
              <Bar dataKey="current" name="Current Score" fill="#2563eb" />
              <Bar dataKey="desired" name="Desired Score" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
