import React, { useState } from 'react';
import { ChevronDown, ChevronRight, GitBranch } from 'lucide-react';
import { CSF_MAPPINGS } from '../data/csfMappings';

/**
 * CrossFrameworkPanel - Read-only cross-reference panel for CSF 2.0 categories
 *
 * Shows related ISO 27001:2022 and SP 800-53 Rev 5 controls for a given
 * CSF 2.0 category (e.g., "GV.OC", "PR.AA").
 *
 * Data source: NIST OLIR (Online Informative References) - public domain
 * https://www.nist.gov/cyberframework/informative-references
 *
 * Props:
 *   categoryId {string} - CSF 2.0 category code (e.g., "GV.OC")
 */
const CrossFrameworkPanel = ({ categoryId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mapping = categoryId ? CSF_MAPPINGS[categoryId] : null;
  const hasMapping = mapping && (
    (mapping.iso27001 && mapping.iso27001.length > 0) ||
    (mapping.sp80053 && mapping.sp80053.length > 0)
  );

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Cross-Framework References
          </span>
          {categoryId && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({categoryId})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {hasMapping && (
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-medium">
              {(mapping.iso27001?.length || 0) + (mapping.sp80053?.length || 0)}
            </span>
          )}
          {isExpanded
            ? <ChevronDown size={14} className="text-gray-400" />
            : <ChevronRight size={14} className="text-gray-400" />
          }
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-white dark:bg-gray-900">
          {!categoryId || !hasMapping ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2">
              No cross-references available for this requirement.
            </p>
          ) : (
            <div className="space-y-3 pt-1">
              {/* ISO 27001:2022 */}
              {mapping.iso27001 && mapping.iso27001.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#7c3aed' }}
                    />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      ISO/IEC 27001:2022
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mapping.iso27001.map((control) => (
                      <ControlBadge
                        key={control}
                        label={control}
                        color="purple"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SP 800-53 Rev 5 */}
              {mapping.sp80053 && mapping.sp80053.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#dc2626' }}
                    />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      NIST SP 800-53 Rev 5
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mapping.sp80053.map((control) => (
                      <ControlBadge
                        key={control}
                        label={control}
                        color="red"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Source attribution */}
              <p className="text-xs text-gray-400 dark:text-gray-600 pt-1 border-t border-gray-100 dark:border-gray-800">
                Source: NIST OLIR — public domain informative references
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * ControlBadge - Small pill badge for a framework control ID
 */
const ControlBadge = ({ label, color }) => {
  const colorMap = {
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-medium border ${colorMap[color] || colorMap.purple}`}
    >
      {label}
    </span>
  );
};

export default CrossFrameworkPanel;
