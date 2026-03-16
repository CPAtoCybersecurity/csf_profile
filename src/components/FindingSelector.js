import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useFindingsStore from '../stores/findingsStore';

const FindingSelector = ({
  label,
  selectedFindings,
  onChange,
  multiple = true,
  disabled = false
}) => {
  const navigate = useNavigate();
  const findings = useFindingsStore((state) => state.findings);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle selecting a finding
  const handleSelectFinding = (finding) => {
    if (multiple) {
      // For multiple selection - store finding IDs
      if (selectedFindings && selectedFindings.includes(finding.id)) {
        // Remove finding if already selected
        onChange(selectedFindings.filter(id => id !== finding.id));
      } else {
        // Add finding to selection
        onChange([...(selectedFindings || []), finding.id]);
      }
    } else {
      // For single selection
      onChange(finding.id === selectedFindings ? null : finding.id);
    }
  };

  // Get finding by ID
  const getFindingById = (findingId) => {
    return findings.find(f => f.id === findingId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-600 text-white';
      case 'In Progress':
        return 'bg-blue-600 text-white';
      case 'Not Started':
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Navigate to finding detail
  const handleNavigateToFinding = (e, findingId) => {
    e.stopPropagation();
    navigate(`/findings?selected=${encodeURIComponent(findingId)}`);
  };

  return (
    <div>
      {label && <span className="text-sm font-medium text-gray-500">{label}:</span>}

      {disabled ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {multiple ? (
            selectedFindings && selectedFindings.length > 0 ? (
              selectedFindings.map(findingId => {
                const finding = getFindingById(findingId);
                return (
                  <button
                    key={findingId}
                    onClick={(e) => handleNavigateToFinding(e, findingId)}
                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full text-xs flex items-center gap-1 transition-colors"
                    style={{ backgroundColor: '#f97316' }}
                    title={finding?.summary || 'View finding'}
                  >
                    <AlertTriangle size={10} />
                    {finding?.jiraKey || findingId}
                  </button>
                );
              })
            ) : (
              <span className="text-gray-400 dark:text-gray-500">No findings linked</span>
            )
          ) : (
            <span className="dark:text-gray-200">
              {selectedFindings ? (getFindingById(selectedFindings)?.summary || selectedFindings) : "None"}
            </span>
          )}
        </div>
      ) : (
        <div className="relative mt-1" ref={dropdownRef}>
          <div
            className="w-full p-2 border dark:border-gray-600 rounded-lg flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer bg-white dark:bg-gray-700"
            onClick={() => setDropdownOpen(prevState => !prevState)}
          >
            {multiple ? (
              selectedFindings && selectedFindings.length > 0 ? (
                selectedFindings.map(findingId => {
                  const finding = getFindingById(findingId);
                  return (
                    <span key={findingId} className="px-2 py-1 bg-orange-500 text-white font-medium rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: '#f97316' }}>
                      <AlertTriangle size={10} />
                      {finding?.jiraKey || findingId}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(selectedFindings.filter(id => id !== findingId));
                        }}
                        className="text-orange-100 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="text-gray-400 dark:text-gray-500">Select findings</span>
              )
            ) : (
              <span className="dark:text-gray-200">
                {selectedFindings ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-500" />
                    {getFindingById(selectedFindings)?.summary || selectedFindings}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">Select a finding</span>
                )}
              </span>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {findings.length > 0 ? (
                <>
                  {multiple && selectedFindings?.length > 0 && (
                    <div
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      onClick={() => onChange([])}
                    >
                      Clear selection
                    </div>
                  )}

                  {findings.map(finding => (
                    <div
                      key={finding.id}
                      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                        multiple
                          ? selectedFindings && selectedFindings.includes(finding.id) ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                          : selectedFindings === finding.id ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                      }`}
                      onClick={() => handleSelectFinding(finding)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-amber-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {finding.jiraKey || finding.id}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(finding.status)}`}>
                          {finding.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">
                        {finding.summary}
                      </div>
                      {finding.complianceRequirement && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          CSF: {finding.complianceRequirement}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  <AlertTriangle size={24} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p>No findings available</p>
                  <p className="text-xs mt-1">Create findings in the Findings tab first</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindingSelector;
