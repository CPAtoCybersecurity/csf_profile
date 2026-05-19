import React from 'react';

const STATUS_CLASS = {
  'IN PROGRESS': 'terminal-status-pill--in-progress',
  'STALLED': 'terminal-status-pill--stalled',
  'NOT STARTED': 'terminal-status-pill--not-started',
  'RESOLVED': 'terminal-status-pill--resolved',
  'PLANNED': 'terminal-status-pill--planned',
};

/**
 * StatusPill — small Bloomberg-terminal-style pill for subcategory status.
 *
 * Props:
 *   status {string} — canonical status code (matches STATUS_CLASS keys)
 *   label  {string} — display text (optional; falls back to status)
 *   title  {string} — tooltip text (optional; falls back to status)
 */
const StatusPill = ({ status, label, title }) => {
  const cls = STATUS_CLASS[status] || STATUS_CLASS['NOT STARTED'];
  return (
    <span className={`terminal-status-pill ${cls}`} title={title || status}>
      {label || status}
    </span>
  );
};

export default StatusPill;
