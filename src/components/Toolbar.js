import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUIStore from '../stores/uiStore';
import useAssessmentsStore from '../stores/assessmentsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFindingsStore from '../stores/findingsStore';
import useArtifactStore from '../stores/artifactStore';
import AutoSaveIndicator from './AutoSaveIndicator';
import UndoRedoButtons from './UndoRedoButtons';
import ThemeToggle from './ThemeToggle';
import { generateExecutiveSummary } from '../utils/executiveSummaryPDF';
import { filterByScope } from '../utils/assessmentScope';
import {
  getTimeSinceLastExport,
  getLastExportDate,
  getBackupWarningLevel,
} from '../utils/backupTracking';

const QUARTERS = [1, 2, 3, 4];

/**
 * The top toolbar of the main column — successor to the dense navy
 * TerminalStatusBar strip. Same controls and the same behavior; what changed
 * is that it sits inside the content column at normal weight instead of
 * spanning the viewport as a 22px intel feed. The SYS / USER / CONN readouts
 * the old strip carried were decoration, not state, and did not come across.
 */
const Toolbar = ({ onBackupClick }) => {
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
        // Only this assessment's records belong in its summary (issue #297)
        findings: filterByScope(findings, currentAssessment.id),
        artifacts: filterByScope(artifacts, currentAssessment.id),
        selectedQuarter,
      });
    } catch (err) {
      // Toast is transient — keep a durable trace so export failures are
      // diagnosable after the 3s window closes.
      console.error('Export summary failed:', err);
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

  return (
    <header className="app-toolbar" role="status" aria-live="polite">
      <div className="app-toolbar-group">
        <label className="app-toolbar-label" htmlFor="toolbar-assessment">Assessment</label>
        <select
          id="toolbar-assessment"
          className="app-toolbar-select"
          value={currentAssessmentId || ''}
          onChange={handleAssessmentChange}
          aria-label="Current assessment"
        >
          <option value="">Select an assessment…</option>
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name || a.id}
            </option>
          ))}
        </select>
      </div>

      {/* Assessment year (issue #291) — shown ahead of the quarter selector */}
      {currentAssessment?.year && (
        <div className="app-toolbar-group">
          <span className="app-toolbar-label">Year</span>
          <span className="app-toolbar-value">{currentAssessment.year}</span>
        </div>
      )}

      <div className="app-toolbar-group">
        <span className="app-toolbar-segmented" role="tablist" aria-label="Quarter selector">
          {QUARTERS.map((q) => (
            <button
              key={q}
              type="button"
              role="tab"
              aria-selected={selectedQuarter === q}
              className={`app-toolbar-segment${selectedQuarter === q ? ' is-active' : ''}`}
              onClick={() => setSelectedQuarter(q)}
            >
              Q{q}
            </button>
          ))}
        </span>
      </div>

      <div className="app-toolbar-spacer" />

      <div className="app-toolbar-group">
        <span
          className={`app-toolbar-chip app-toolbar-chip-${backupLevel || 'neutral'}`}
          title={backupTooltip}
        >
          Backup {backupAge}
        </span>
        {backupLevel !== 'success' && (
          <button
            type="button"
            className="btn-terminal"
            onClick={onBackupClick}
            title="Export data now"
          >
            Back up now
          </button>
        )}
      </div>

      <div className="app-toolbar-group">
        <button
          type="button"
          className="btn-terminal"
          onClick={handleExportSummary}
          disabled={!hasAssessment}
          title="Export executive summary PDF for current assessment"
        >
          Export summary
        </button>
        <button
          type="button"
          className="btn-terminal"
          onClick={handleAuditReport}
          disabled={!hasAssessment}
          title="Open audit report for current assessment"
        >
          Audit report
        </button>
      </div>

      <div className="app-toolbar-group">
        <button
          type="button"
          className="app-toolbar-kbd-hint"
          onClick={() => window.dispatchEvent(new CustomEvent('keyboard-show-help'))}
          title="Show keyboard shortcuts (press ?)"
          aria-label="Show keyboard shortcuts"
        >
          <kbd className="terminal-kbd">?</kbd>
        </button>
        <AutoSaveIndicator />
        <UndoRedoButtons />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Toolbar;
