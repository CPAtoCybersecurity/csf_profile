import React, { useMemo } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = ({ data }) => {
  // Calculate status distribution for pie chart
  const statusData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const statusCounts = data.reduce((acc, item) => {
      const status = item["Testing Status"] || "Not Started";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [data]);
  
  // Calculate in scope distribution for pie chart
  const inScopeData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const inScopeCounts = data.reduce((acc, item) => {
      const inScope = item["In Scope? "] || "No";
      acc[inScope] = (acc[inScope] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(inScopeCounts).map(([name, value]) => ({ name, value }));
  }, [data]);
  
  // Calculate score data for bar chart
  const scoreData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Group by function and calculate average scores
    const functionScores = data.reduce((acc, item) => {
      const func = item.Function || "Unknown";
      
      if (!acc[func]) {
        acc[func] = {
          function: func,
          currentCount: 0,
          currentSum: 0,
          desiredCount: 0,
          desiredSum: 0
        };
      }
      
      if (item["Current State Score"] !== null && item["Current State Score"] !== undefined) {
        acc[func].currentSum += item["Current State Score"];
        acc[func].currentCount++;
      }
      
      if (item["Desired State Score"] !== null && item["Desired State Score"] !== undefined) {
        acc[func].desiredSum += item["Desired State Score"];
        acc[func].desiredCount++;
      }
      
      return acc;
    }, {});
    
    return Object.values(functionScores).map(item => ({
      name: item.function,
      current: item.currentCount > 0 ? (item.currentSum / item.currentCount).toFixed(1) : 0,
      desired: item.desiredCount > 0 ? (item.desiredSum / item.desiredCount).toFixed(1) : 0
    }));
  }, [data]);
  
  // Colors for the charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS = {
    'Complete': '#16a34a', // green
    'Completed': '#16a34a', // green (for backward compatibility)
    'In Progress': '#2563eb', // blue
    'Not Started': '#6b7280', // gray
    'Submitted': '#f97316', // orange
    'Issues Found': '#dc2626' // red (for backward compatibility)
  };
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">No data available for dashboard</div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Testing Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* In Scope Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">In Scope Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inScopeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inScopeData.map((entry) => (
                    <Cell 
                      key={`cell-${entry.name}`} 
                      fill={entry.name === "Yes" ? "#16a34a" : "#dc2626"} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Score Comparison */}
        <div className="bg-white p-4 rounded-lg shadow-sm border md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Average Scores by Function</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scoreData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  interval={0}
                />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" name="Current State Score" fill="#2563eb" />
                <Bar dataKey="desired" name="Desired State Score" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
