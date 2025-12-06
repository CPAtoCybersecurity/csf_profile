import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import useUIStore from '../stores/uiStore';

const ScoringLegend = () => {
  const [legendData, setLegendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useUIStore((state) => state.darkMode);

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
      return darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100';
    }

    // Special case for Too Much Security row (8.1-10.0)
    if (description && description.includes('Too Much Security')) {
      return darkMode ? 'bg-red-900/50' : 'bg-red-100';
    }

    // For other rows, use the security level
    switch(securityLevel) {
      case 'Not Enough':
        // For all other "Not Enough" rows except Some Security
        if (score !== '2.0-4.9') {
          return darkMode ? 'bg-red-900/50' : 'bg-red-100';
        }
        return darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100';
      case 'Just Right':
        return darkMode ? 'bg-green-900/50' : 'bg-green-100';
      case 'Too Much':
        // Override for Too Much Security
        return darkMode ? 'bg-red-900/50' : 'bg-red-100';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900 min-h-full">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Scoring Legend</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl font-semibold dark:text-white">Loading scoring legend data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900 min-h-full">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Scoring Legend</h1>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl font-semibold text-red-600 dark:text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-full">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Scoring Legend</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Evaluation Criteria</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">How Secure (Resilient)?</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {legendData.length > 0 ? (
              legendData.map((item, index) => (
                <tr key={index} className={getSecurityLevelColor(item['How Secure (Resilient)?'], item.Description, item.Score)}>
                  <td className="p-3 text-sm font-medium dark:text-white">{item.Score}</td>
                  <td className="p-3 text-sm dark:text-white">{item.Description}</td>
                  <td className="p-3 text-sm dark:text-white">{item['Evaluation Criteria']}</td>
                  <td className="p-3 text-sm dark:text-white">{item['How Secure (Resilient)?']}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                  No scoring legend data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">About Scoring</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          This scoring legend provides guidance for evaluating security controls within your organization.
          Use these criteria to assess your current security posture and identify areas for improvement.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
            <h3 className="font-medium dark:text-white">Too Much</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Security measures are excessive and impacting productivity.</p>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h3 className="font-medium dark:text-white">Just Right</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Security measures are appropriate and effective.</p>
          </div>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'}`}>
            <h3 className="font-medium dark:text-white">Some Security</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Security measures need improvement but are on the right track.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringLegend;
