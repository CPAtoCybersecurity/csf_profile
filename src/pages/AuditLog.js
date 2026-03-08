import React, { useState, useMemo } from 'react';
import { Download, Trash2, History, Search, Filter } from 'lucide-react';
import useAuditLogStore from '../stores/auditLogStore';

// Human-readable action labels and badge colors
const ACTION_META = {
  score_changed: { label: 'Score Changed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  status_changed: { label: 'Status Changed', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  finding_created: { label: 'Finding Created', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  finding_updated: { label: 'Finding Updated', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  finding_deleted: { label: 'Finding Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  observation_updated: { label: 'Observation Updated', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
};

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'score_changed', label: 'Score Changed' },
  { value: 'status_changed', label: 'Status Changed' },
  { value: 'finding_created', label: 'Finding Created' },
  { value: 'finding_updated', label: 'Finding Updated' },
  { value: 'finding_deleted', label: 'Finding Deleted' },
  { value: 'observation_updated', label: 'Observation Updated' },
];

const formatTimestamp = (isoString) => {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

const ActionBadge = ({ action }) => {
  const meta = ACTION_META[action] || { label: action, color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
      {meta.label}
    </span>
  );
};

const AuditLog = () => {
  const entries = useAuditLogStore((state) => state.entries);
  const clearLog = useAuditLogStore((state) => state.clearLog);
  const exportCSV = useAuditLogStore((state) => state.exportCSV);

  const [actionFilter, setActionFilter] = useState('');
  const [entitySearch, setEntitySearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => {
    let result = entries;
    if (actionFilter) result = result.filter(e => e.action === actionFilter);
    if (entitySearch.trim()) {
      const term = entitySearch.trim().toLowerCase();
      result = result.filter(e => e.entity?.toLowerCase().includes(term));
    }
    return result;
  }, [entries, actionFilter, entitySearch]);

  const handleClear = () => {
    if (confirmClear) {
      clearLog();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  const handleCancelClear = () => setConfirmClear(false);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History size={22} className="text-gray-600 dark:text-gray-300" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Audit Log</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Change history for assessment activities
              {filtered.length !== entries.length
                ? ` — showing ${filtered.length} of ${entries.length} entries`
                : ` — ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>

          {confirmClear ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Confirm clear?</span>
              <button
                onClick={handleClear}
                className="px-2.5 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Yes, clear
              </button>
              <button
                onClick={handleCancelClear}
                className="px-2.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleClear}
              disabled={entries.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-red-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={14} />
              Clear Log
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Filter size={14} />
          <span>Filter:</span>
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-2.5 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ACTION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search entity..."
            value={entitySearch}
            onChange={e => setEntitySearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
          />
        </div>

        {(actionFilter || entitySearch) && (
          <button
            onClick={() => { setActionFilter(''); setEntitySearch(''); }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <History size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No audit entries yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Changes to assessments will appear here automatically.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={40} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No entries match your filters</p>
            <button
              onClick={() => { setActionFilter(''); setEntitySearch(''); }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Timestamp
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    Action
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs font-mono">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ActionBadge action={entry.action} />
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200 font-medium max-w-xs truncate">
                      {entry.entity || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {entry.field || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {entry.oldValue != null || entry.newValue != null ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          {entry.oldValue != null && (
                            <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-mono">
                              {entry.oldValue}
                            </span>
                          )}
                          {entry.oldValue != null && entry.newValue != null && (
                            <span className="text-gray-400">→</span>
                          )}
                          {entry.newValue != null && (
                            <span className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-mono">
                              {entry.newValue}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {entry.user || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
