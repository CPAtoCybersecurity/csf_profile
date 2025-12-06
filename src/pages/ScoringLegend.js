import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const ScoringLegend = () => {
  const [legendData, setLegendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLegendData = async () => {
      try {
        const response = await fetch('/scoring_legend.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setLegendData(results.data);
            setLoading(false);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(`Error loading file: ${err.message}`);
        setLoading(false);
      }
    };
    
    loadLegendData();
  }, []);

  // Function to determine the background color based on the "How Secure" value and description
  const getSecurityLevelColor = (securityLevel, description, score) => {
    // Special case for Some Security row (2.0-4.9)
    if (score === '2.0-4.9' && description === 'Some Security') {
      return 'bg-yellow-100';
    }
    
    // Special case for Too Much Security row (8.1-10.0)
    if (description && description.includes('Too Much Security')) {
      return 'bg-red-100';
    }
    
    // For other rows, use the security level
    switch(securityLevel) {
      case 'Not Enough':
        // For all other "Not Enough" rows except Some Security
        if (score !== '2.0-4.9') {
          return 'bg-red-100';
        }
        return 'bg-yellow-100';
      case 'Just Right':
        return 'bg-green-100';
      case 'Too Much':
        // Override for Too Much Security
        return 'bg-red-100';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Scoring Legend</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl font-semibold">Loading scoring legend data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Scoring Legend</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl font-semibold text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Scoring Legend</h1>
      
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evaluation Criteria</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">How Secure (Resilient)?</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {legendData.length > 0 ? (
              legendData.map((item, index) => (
                <tr key={index} className={getSecurityLevelColor(item['How Secure (Resilient)?'], item.Description, item.Score)}>
                  <td className="p-3 text-sm font-medium">{item.Score}</td>
                  <td className="p-3 text-sm">{item.Description}</td>
                  <td className="p-3 text-sm">{item['Evaluation Criteria']}</td>
                  <td className="p-3 text-sm">{item['How Secure (Resilient)?']}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-3 text-center text-sm text-gray-500">
                  No scoring legend data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-2">About Scoring</h2>
        <p className="text-sm text-gray-700">
          This scoring legend provides guidance for evaluating security controls within your organization. 
          Use these criteria to assess your current security posture and identify areas for improvement.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-red-100">
            <h3 className="font-medium">Too Much</h3>
            <p className="text-sm text-gray-700">Security measures are excessive and impacting productivity.</p>
          </div>
          <div className="p-3 rounded-lg bg-green-100">
            <h3 className="font-medium">Just Right</h3>
            <p className="text-sm text-gray-700">Security measures are appropriate and effective.</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-100">
            <h3 className="font-medium">Some Security</h3>
            <p className="text-sm text-gray-700">Security measures need improvement but are on the right track.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringLegend;
