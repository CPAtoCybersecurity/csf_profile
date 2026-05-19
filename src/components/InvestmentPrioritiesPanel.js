import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useFindingsStore from '../stores/findingsStore';
import UserSelector from './UserSelector';
import StatusPill from './StatusPill';
import InvestmentPriorityCommentEditor from './InvestmentPriorityCommentEditor';
import { safeNum } from '../utils/dashboardMetrics';

const STATUS_OPTIONS = ['NOT STARTED', 'IN PROGRESS', 'RESOLVED'];

// Map dashboard status pill values back to the canonical finding-store status string.
const dashboardStatusToFindingStatus = (status) => {
  if (status === 'IN PROGRESS') return 'In Progress';
  if (status === 'RESOLVED') return 'Resolved';
  if (status === 'STALLED') return 'In Progress';
  return 'Not Started';
};

const FORMULA_TOOLTIP = 'score = gap × max(priorityImpact, functionWeight) × log(1 + linkedFindings)';

/**
 * InvestmentPrioritiesPanel — table of subcategories ranked by investment score.
 *
 * Props:
 *   rows                  {Array} — output of investmentPriorities()
 *   selectedAssessmentId  {string}
 *   darkMode              {boolean}
 *
 * Owner + status edits broadcast to all linked findings, re-resolving findings
 * via useFindingsStore.getState() to avoid stale-closure bugs.
 */
const InvestmentPrioritiesPanel = ({ rows, selectedAssessmentId, darkMode }) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [draftComment, setDraftComment] = useState('');
  const updateFinding = useFindingsStore((state) => state.updateFinding);

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const totalRows = safeRows.length;
  const visibleRows = showAll ? safeRows : safeRows.slice(0, 5);
  const totalLinkedFindings = safeRows.reduce((sum, r) => sum + (r.linkedFindings || 0), 0);
  const visibleLinkedFindings = visibleRows.reduce((sum, r) => sum + (r.linkedFindings || 0), 0);

  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const headerColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const headerRowClass = darkMode ? 'text-gray-400 border-gray-600' : 'text-gray-500 border-gray-200';
  const rowBorderClass = darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50';

  const broadcastUpdate = useCallback(
    (subcategoryId, patch) => {
      const row = safeRows.find((r) => r.categoryId === subcategoryId);
      if (!row || !row.linkedFindingIds || row.linkedFindingIds.length === 0) return 0;
      const ids = row.linkedFindingIds;
      const fresh = useFindingsStore.getState().findings;
      const toUpdate = fresh.filter((f) => ids.includes(f.id) && f.assessmentId === selectedAssessmentId);
      toUpdate.forEach((f) => updateFinding(f.id, patch));
      return toUpdate.length;
    },
    [safeRows, selectedAssessmentId, updateFinding]
  );

  const handleOwnerChange = useCallback(
    (subcategoryId, newOwnerId) => {
      const n = broadcastUpdate(subcategoryId, { remediationOwner: newOwnerId });
      if (n > 0) toast.success(`Updated owner on ${n} findings`);
    },
    [broadcastUpdate]
  );

  const handleStatusChange = useCallback(
    (subcategoryId, newDashboardStatus) => {
      const findingStatus = dashboardStatusToFindingStatus(newDashboardStatus);
      const n = broadcastUpdate(subcategoryId, { status: findingStatus });
      if (n > 0) toast.success(`Updated status on ${n} findings`);
    },
    [broadcastUpdate]
  );

  const handleToggleExpand = (row) => {
    if (!row.commentFindingId) return;
    if (expandedRow === row.categoryId) {
      setExpandedRow(null);
      setDraftComment('');
    } else {
      setExpandedRow(row.categoryId);
      setDraftComment(row.commentFindingDescription || '');
    }
  };

  const handleSaveComment = (row) => {
    if (!row.commentFindingId) return;
    updateFinding(row.commentFindingId, { description: draftComment });
    toast.success('Updated analyst comment');
    setExpandedRow(null);
    setDraftComment('');
  };

  if (totalRows === 0) {
    return (
      <div className={`card border p-4 ${cardBg}`} style={{ borderRadius: 0 }}>
        <h2 className={`text-base font-semibold mb-2 ${headerColor}`}>Top investment priorities</h2>
        <p className={`text-sm ${subColor}`}>No subcategory data for this assessment.</p>
      </div>
    );
  }

  return (
    <div className={`card border p-4 ${cardBg}`} style={{ borderRadius: 0 }}>
      <div className="flex items-baseline justify-between mb-1">
        <h2 className={`text-base font-semibold ${headerColor}`} title={FORMULA_TOOLTIP}>
          Top investment priorities
        </h2>
      </div>
      <div className={`text-xs mb-3 ${subColor}`} title={FORMULA_TOOLTIP}>
        Highest gap × business impact · <span style={{ fontVariantNumeric: 'tabular-nums' }}>{visibleLinkedFindings}</span> of{' '}
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalLinkedFindings}</span> findings
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className={`text-xs uppercase border-b ${headerRowClass}`}>
            <th className="text-left py-2 px-2">#</th>
            <th className="text-left py-2 px-2">Subcategory</th>
            <th className="text-left py-2 px-2">Function</th>
            <th className="text-right py-2 px-2">Gap</th>
            <th className="text-left py-2 px-2">Linked Findings</th>
            <th className="text-left py-2 px-2">Owner</th>
            <th className="text-left py-2 px-2" title="IN PROGRESS · STALLED >60d · NOT STARTED · RESOLVED — derived from linked findings (Open → Not Started, Done/Closed → Resolved)">
              Status
            </th>
            <th className="py-2 px-2" />
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => {
            const linkedCount = safeNum(row.linkedFindings, 0);
            const critCount = safeNum(row.critCount, 0);
            const gap = safeNum(row.gap, 0);
            const formatGap = (n) => (typeof n === 'number' ? n.toFixed(1) : n);
            const canExpand = !!row.commentFindingId;
            const isExpanded = expandedRow === row.categoryId;
            return (
              <React.Fragment key={row.categoryId}>
                <tr className={`border-b ${rowBorderClass}`}>
                  <td className={`py-2 px-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {row.rank}
                  </td>
                  <td className={`py-2 px-2 font-mono text-xs ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {row.categoryId}
                  </td>
                  <td className={`py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {row.function}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatGap(gap)}
                  </td>
                  <td className={`py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {linkedCount} ({critCount} crit)
                  </td>
                  <td className="py-2 px-2">
                    {linkedCount > 0 ? (
                      <UserSelector
                        label=""
                        selectedUsers={row.owner}
                        onChange={(newId) => handleOwnerChange(row.categoryId, newId)}
                        multiple={false}
                      />
                    ) : (
                      <span className={subColor}>--</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <StatusPill status={row.status} label={row.statusLabel} title={FORMULA_TOOLTIP} />
                      {linkedCount > 0 && (
                        <select
                          aria-label={`Change status for ${row.categoryId}`}
                          value={row.status === 'STALLED' ? 'IN PROGRESS' : row.status === 'RESOLVED' ? 'RESOLVED' : row.status}
                          onChange={(e) => handleStatusChange(row.categoryId, e.target.value)}
                          className={`text-xs border px-1 py-0.5 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    {canExpand && (
                      <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse analyst comment' : 'Expand analyst comment'}
                        onClick={() => handleToggleExpand(row)}
                        className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    )}
                  </td>
                </tr>
                {isExpanded && canExpand && (
                  <tr className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                    <InvestmentPriorityCommentEditor
                      categoryId={row.categoryId}
                      findingId={row.commentFindingId}
                      value={draftComment}
                      onChange={setDraftComment}
                      onCancel={() => handleToggleExpand(row)}
                      onSave={() => handleSaveComment(row)}
                      subtitleColor={subColor}
                      darkMode={darkMode}
                    />
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {totalRows > 5 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className={`text-xs ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {showAll ? `Show top 5` : `Show all ${totalRows}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default InvestmentPrioritiesPanel;
