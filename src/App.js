import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useStore } from './stores/useStore';
import { AlertCircle, CheckCircle, PieChart, Shield } from 'lucide-react';

// Helper to calculate evidence completion
const useEvidenceMetrics = () => {
  const { controls, requirements } = useStore();
  
  const metrics = useMemo(() => {
    const totalInScope = requirements.filter(r => r.inScope).length;
    if (totalInScope === 0) return { overall: 0, categories: {} };

    const controlsWithArtifacts = new Set();
    controls.forEach(c => {
      if (c.artifacts && c.artifacts.length > 0) {
        controlsWithArtifacts.add(c.id);
      }
    });

    const categoryStats = {};
    requirements.filter(r => r.inScope).forEach(r => {
      const cat = r.category;
      if (!categoryStats[cat]) categoryStats[cat] = { total: 0, documented: 0 };
      categoryStats[cat].total += 1;
      if (controlsWithArtifacts.has(r.id)) categoryStats[cat].documented += 1;
    });

    const totalDocumented = controlsWithArtifacts.size;
    const overall = (totalDocumented / totalInScope) * 100;

    return { overall: Math.round(overall), categoryStats };
  }, [controls, requirements]);

  return metrics;
};

const ProgressBar = ({ percentage }) => {
  const color = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
    </div>
  );
};

// ... existing App component logic ...
export default function App() {
  // Placeholder for the integration of the new components into the routing
  return (
    <Router>
       {/* Existing routing logic */}
    </Router>
  );
}