import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUIStore from '../stores/uiStore';
import useAssessmentsStore from '../stores/assessmentsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFindingsStore from '../stores/findingsStore';
import useArtifactStore from '../stores/artifactStore';
import { generateExecutiveSummary } from '../utils/executiveSummaryPDF';
import {
  getTimeSinceLastExport,
  getLastExportDate,
  getBackupWarningLevel,
} from '../utils/backupTracking';

const QUARTERS = [1, 2, 3, 4];

const TerminalStatusBar = ({ onBackupClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedQuarter = useUIStore((s) => s.selectedQuarter);
  const setSelectedQuarter = useUIStore((s) => s.setSelectedQuarter);
  const requestAuditModal = useUIStore((s) => s.requestAuditModal);

  const assessments = useAssessmentsStore((s) => s.assessments || []);
  const currentAssessmentId = useAssessmentsStore((s) => s.currentAssessmentId);
  const setCurrentAssessmentId = useAssessmentsStore((s) => s.setCurrentAssessmentId);

  const requirements = useRequirementsStore((s) => s.requirements || []);
  const findings = useFindingsStore((s) => s.findings || []);
  const artifacts = useArtifactStore((s) => s.artifacts || []);

  // Backup indicator state (mirrors LastBackupIndicator behavior)
  const [backupAge, setBackupAge] = useState(() => getTimeSinceLastExport());
  const [backupLevel, setBackupLevel] = useState(() => getBackupWarningLevel());

  useEffect(() => {
    const refresh = () => {
      setBackupAge(getTimeSinceLastExport());
      setBackupLevel(getBackupWarningLevel());
    };
    refresh();
    const id = setInterval(refresh, 60000);
    window.addEventListener('csfExportCompleted', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('csfExportCompleted', refresh);
    };
  }, []);

  const handleAssessmentChange = (e) => {
    const v = e.target.value;
    setCurrentAssessmentId(v || null);
  };

  const currentAssessment = assessments.find((a) => a.id === currentAssessmentId);
  const hasAssessment = Boolean(currentAssessment);

  const handleExportSummary = useCallback(() => {
    if (!hasAssessment) {
      toast.error('Select an assessment first');
      return;
    }
    try {
      generateExecutiveSummary({
        assessment: currentAssessment,
        requirements,
        findings,
        artifacts,
        selectedQuarter,
      });
    } catch (err) {
      toast.error(`Export failed: ${err.message || err}`);
    }
  }, [hasAssessment, currentAssessment, requirements, findings, artifacts, selectedQuarter]);

  const handleAuditReport = useCallback(() => {
    if (!hasAssessment) {
      toast.error('Select an assessment first');
      return;
    }
    requestAuditModal();
    if (location.pathname !== '/dashboard') navigate('/dashboard');
  }, [hasAssessment, requestAuditModal, navigate, location.pathname]);

  const backupTooltip = (() => {
    const d = getLastExportDate();
    return d ? `Last backup: ${d.toLocaleString()}` : 'No backup yet — export your data to protect your work';
  })();

  const backupLevelClass = `terminal-statusbar-backup-${backupLevel || 'neutral'}`;

  return (
    <div className="terminal-statusbar" role="status" aria-live="polite">
      <span className="terminal-statusbar-segment">
        <span className="terminal-statusbar-label">SYS</span>
        <span className="terminal-statusbar-value">CSF_PROFILE / v2.2</span>
      </span>

      <span className="terminal-statusbar-segment">
        <span className="terminal-statusbar-label">ASSESSMENT</span>
        <select
          className="terminal-statusbar-select"
          value={currentAssessmentId || ''}
          onChange={handleAssessmentChange}
          aria-label="Current assessment"
        >
          <option value="">-- SELECT --</option>
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>
              {(a.name || a.id).toUpperCase()}
            </option>
          ))}
        </select>
      </span>

      {/* Assessment year (issue #291) — shown ahead of the quarter selector */}
      {currentAssessment?.year && (
        <span className="terminal-statusbar-segment">
          <span className="terminal-statusbar-label">YEAR</span>
          <span className="terminal-statusbar-value">{currentAssessment.year}</span>
        </span>
      )}

      <span className="terminal-statusbar-segment">
        <span className="terminal-statusbar-label">QTR</span>
        <span className="terminal-statusbar-qbtns" role="tablist" aria-label="Quarter selector">
          {QUARTERS.map((q) => (
            <button
              key={q}
              type="button"
              role="tab"
              aria-selected={selectedQuarter === q}
              className={`terminal-statusbar-qbtn${selectedQuarter === q ? ' is-active' : ''}`}
              onClick={() => setSelectedQuarter(q)}
            >
              Q{q}
            </button>
          ))}
        </span>
      </span>

      <span className="terminal-statusbar-segment">
        <span className="terminal-statusbar-label">BACKUP</span>
        <span className={`terminal-statusbar-backup ${backupLevelClass}`} title={backupTooltip}>
          {backupAge}
        </span>
        {backupLevel !== 'success' && (
          <button
            type="button"
            className="terminal-statusbar-action terminal-statusbar-action-cta"
            onClick={onBackupClick}
            title="Export data now"
          >
            [ BACKUP NOW ]
          </button>
        )}
      </span>

      <span className="terminal-statusbar-segment terminal-statusbar-flex" />

      <span className="terminal-statusbar-segment">
        <button
          type="button"
          className="terminal-statusbar-kbdhints"
          onClick={() => window.dispatchEvent(new CustomEvent('keyboard-show-help'))}
          title="Show keyboard shortcuts (press ?)"
          aria-label="Show keyboard shortcuts"
        >
          <kbd className="terminal-kbd">?</kbd>
          <span className="terminal-statusbar-kbdlabel">Shortcuts</span>
          <kbd className="terminal-kbd">/</kbd>
          <span className="terminal-statusbar-kbdlabel">Search</span>
          <kbd className="terminal-kbd">↑↓</kbd>
          <span className="terminal-statusbar-kbdlabel">Nav</span>
        </button>
      </span>

      <span className="terminal-statusbar-segment">
        <button
          type="button"
          className="terminal-statusbar-action"
          onClick={handleExportSummary}
          disabled={!hasAssessment}
          title="Export executive summary PDF for current assessment"
        >
          [ EXPORT SUMMARY ]
        </button>
      </span>
      <span className="terminal-statusbar-segment">
        <button
          type="button"
          className="terminal-statusbar-action"
          onClick={handleAuditReport}
          disabled={!hasAssessment}
          title="Open audit report for current assessment"
        >
          [ AUDIT REPORT ]
        </button>
      </span>

      <span className="terminal-statusbar-segment">
        <span className="terminal-statusbar-label">USER</span>
        <span className="terminal-statusbar-value">GRC_ANALYST</span>
      </span>
      <span className="terminal-statusbar-segment">
        <span className="terminal-statusbar-label">CONN</span>
        <span className="terminal-statusbar-value">SECURE<span className="terminal-blink">_</span></span>
      </span>
    </div>
  );
};

export default TerminalStatusBar;
