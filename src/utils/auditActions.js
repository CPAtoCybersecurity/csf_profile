/**
 * Audit-log action metadata shared by the global Audit Log page and the
 * per-record History tab (RecordPanel). One home so a new action type can't
 * render labeled in one surface and raw in the other.
 */
export const ACTION_META = {
  score_changed: { label: 'Score Changed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  status_changed: { label: 'Status Changed', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  finding_created: { label: 'Finding Created', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  finding_updated: { label: 'Finding Updated', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  finding_deleted: { label: 'Finding Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  observation_updated: { label: 'Observation Updated', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  control_created: { label: 'Control Created', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  control_updated: { label: 'Control Updated', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  control_deleted: { label: 'Control Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  assessment_created: { label: 'Assessment Created', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  assessment_updated: { label: 'Assessment Updated', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  assessment_deleted: { label: 'Assessment Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  comment_added: { label: 'Comment Added', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  comment_deleted: { label: 'Comment Deleted', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
};

export const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  ...Object.entries(ACTION_META).map(([value, meta]) => ({ value, label: meta.label }))
];

export const formatAuditTimestamp = (isoString) => {
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
