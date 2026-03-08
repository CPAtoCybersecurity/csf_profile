import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingUp, CheckCircle, Info } from 'lucide-react';

const WEIGHTS = { Govern: 1.2, Identify: 1.0, Protect: 1.1, Detect: 1.1, Respond: 1.0, Recover: 0.9 };

const GapPriorityMatrix = ({ subcategories }) => {
  const gaps = subcategories
    .filter(sc => sc.targetScore > sc.currentScore)
    .map(sc => {
      const gap = sc.targetScore - sc.currentScore;
      const weight = WEIGHTS[sc.function] || 1.0;
      return { ...sc, gap, priorityScore: gap * weight };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 10);

  const getColor = (score) => {
    if (score >= 2.0) return 'text-red-600 bg-red-50';
    if (score >= 1.2) return 'text-orange-600 bg-orange-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        <TrendingUp className="w-5 h-5" /> Gap Prioritization Matrix
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Gap</th>
              <th className="px-4 py-3">Priority Score</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {gaps.map(gap => (
              <tr key={gap.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 font-medium">{gap.id}</td>
                <td className="px-4 py-3">{gap.gap.toFixed(2)}</td>
                <td className={`px-4 py-3 font-bold ${getColor(gap.priorityScore)}`}>{gap.priorityScore.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <Link to={`/subcategories/${gap.id}`} className="text-blue-600 hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GapPriorityMatrix;