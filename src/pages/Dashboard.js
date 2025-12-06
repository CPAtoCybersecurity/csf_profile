import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

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
                  label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}%, ${value}`}
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
                  label={({ name, percent, value }) => `${name}: ${(percent * 100).toFixed(0)}%, ${value}`}
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
      </div>
    </div>
  );
};

export default Dashboard;
