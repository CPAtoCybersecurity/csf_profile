import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Upload,
  Download,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Edit,
  ExternalLink,
  Clock,
  AlertCircle,
  Gauge,
  Shield,
  Cloud,
  Layers,
  Building2,
  Database,
  FileText,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import FrameworkBadge from '../components/FrameworkBadge';

// Stores
import useFrameworksStore from '../stores/frameworksStore';
import useRequirementsStore from '../stores/requirementsStore';
import useControlsStore from '../stores/controlsStore';
import useAssessmentsStore from '../stores/assessmentsStore';
import useUserStore from '../stores/userStore';
import useArtifactStore from '../stores/artifactStore';
import useFindingsStore from '../stores/findingsStore';
import useMetricsStore from '../stores/metricsStore';
import useOrgProfileStore from '../stores/orgProfileStore';
import OrgProfileWizard from '../components/OrgProfileWizard';

// Utils
import { exportCompleteDatabase, exportAssessmentsJSON, exportShareableDatabase } from '../utils/dataExport';
import { importCompleteDatabase, validateDatabaseExport } from '../utils/dataImport';
import { sanitizeExternalUrl } from '../utils/externalLinks';
import { previewPackImport, importPack } from '../utils/packImport';
import {
  parseMetricsCSV,
  validateMetricsCatalog,
  previewMetricsImport,
  importMetricsCatalog,
  catalogSlugFromFilename,
  downloadMetricsCatalogCSV
} from '../utils/metricsImport';

// Utils
import {
  getBackupReminderFrequency,
  setBackupReminderFrequency,
  getTimeSinceLastExport,
  getLastExportDate
} from '../utils/backupTracking';

const Settings = () => {
  const frameworks = useFrameworksStore((state) => state.frameworks);
  const addFramework = useFrameworksStore((state) => state.addFramework);
  const updateFramework = useFrameworksStore((state) => state.updateFramework);
  const toggleFramework = useFrameworksStore((state) => state.toggleFramework);
  const deleteFramework = useFrameworksStore((state) => state.deleteFramework);
  const setDefaultFramework = useFrameworksStore((state) => state.setDefaultFramework);
  const markFrameworkImported = useFrameworksStore((state) => state.markFrameworkImported);

  const requirements = useRequirementsStore((state) => state.requirements);
  const importRequirementsCSV = useRequirementsStore((state) => state.importRequirementsCSV);
  const exportRequirementsCSV = useRequirementsStore((state) => state.exportRequirementsCSV);
  const getRequirementCount = useRequirementsStore((state) => state.getRequirementCount);

  const controls = useControlsStore((state) => state.controls);
  const assessments = useAssessmentsStore((state) => state.assessments);

  // Local state
  const [editingFramework, setEditingFramework] = useState(null);
  const [backupFrequency, setBackupFrequency] = useState(getBackupReminderFrequency());
  const [showOrgProfileWizard, setShowOrgProfileWizard] = useState(false);

  // Organization profile (optional tailoring input; never in share exports)
  const orgProfileSet = useOrgProfileStore((s) => s.hasProfile)();
  const orgCloudConsent = useOrgProfileStore((s) => s.cloudConsent);
  const setOrgCloudConsent = useOrgProfileStore((s) => s.setCloudConsent);
  const clearOrgProfile = useOrgProfileStore((s) => s.clearProfile);

  const fileInputRef = useRef(null);
  const newFrameworkFileInputRef = useRef(null);
  const [importFrameworkId, setImportFrameworkId] = useState(null);

  // Jira import refs
  const findingsImportRef = useRef(null);
  const artifactsImportRef = useRef(null);
  const assessmentsImportRef = useRef(null);

  // Database restore ref
  const restoreImportRef = useRef(null);

  // Private data-pack import
  const packImportRef = useRef(null);
  const [packPreview, setPackPreview] = useState(null); // { parsed, preview }
  const [includePackData, setIncludePackData] = useState(false);
  const metricsImportRef = useRef(null);
  const [metricsPreview, setMetricsPreview] = useState(null); // { validation, preview }
  const importedMetrics = useMetricsStore((s) => s.metrics);
  const metricsCatalogs = useMemo(() => {
    const bySlug = new Map();
    importedMetrics.forEach((m) => {
      const entry = bySlug.get(m.catalogSlug) || { catalogSlug: m.catalogSlug, count: 0, importedAt: '' };
      entry.count += 1;
      if ((m.importedAt || '') > entry.importedAt) entry.importedAt = m.importedAt || '';
      bySlug.set(m.catalogSlug, entry);
    });
    return [...bySlug.values()].sort((a, b) => a.catalogSlug.localeCompare(b.catalogSlug));
  }, [importedMetrics]);

  // Export handlers
  const handleExportCompleteDatabase = useCallback(() => {
    try {
      exportCompleteDatabase({
        controlsStore: useControlsStore,
        assessmentsStore: useAssessmentsStore,
        requirementsStore: useRequirementsStore,
        frameworksStore: useFrameworksStore,
        artifactStore: useArtifactStore,
        userStore: useUserStore,
        findingsStore: useFindingsStore,
        metricsStore: useMetricsStore,
        orgProfileStore: useOrgProfileStore
      });
      toast.success('Complete database exported as JSON');
    } catch (err) {
      console.error('Complete DB export error:', err);
      toast.error('Export failed. Please try again.');
    }
  }, []);

  const handleExportShareable = useCallback(() => {
    try {
      if (includePackData) {
        const confirmed = window.confirm(
          'Include private pack data in this export?\n\n' +
          'The file will contain your organization\'s private assessment values and risk entries, ' +
          'AND any procedure text tailored from your org profile (org name, crown-jewel references). ' +
          'Your org profile itself stays excluded either way. ' +
          'Only do this for a copy you keep to yourself — never for a file you plan to share.'
        );
        if (!confirmed) return;
      }
      exportShareableDatabase({
        controlsStore: useControlsStore,
        assessmentsStore: useAssessmentsStore,
        requirementsStore: useRequirementsStore,
        frameworksStore: useFrameworksStore,
        artifactStore: useArtifactStore,
        userStore: useUserStore,
        findingsStore: useFindingsStore,
        metricsStore: useMetricsStore,
        orgProfileStore: useOrgProfileStore
      }, { includePrivate: includePackData });
      toast.success(includePackData
        ? 'Export created WITH private pack data — handle with care'
        : 'Shareable export created (private pack data excluded)');
    } catch (err) {
      console.error('Shareable export error:', err);
      toast.error('Export failed. Please try again.');
    }
  }, [includePackData]);

  // Pack import — preview first, no writes until the user confirms.
  const handlePackFileSelected = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const preview = previewPackImport(parsed, {
        assessmentsStore: useAssessmentsStore,
        findingsStore: useFindingsStore,
        frameworksStore: useFrameworksStore,
        requirementsStore: useRequirementsStore
      });
      if (!preview.validation.ok) {
        toast.error(`Pack rejected: ${preview.validation.errors.join(' ')}`);
        return;
      }
      setPackPreview({ parsed, preview });
    } catch (err) {
      console.error('Pack preview error:', err);
      toast.error(err.message || 'Could not read the pack file.');
    }
  }, []);

  const handleConfirmPackImport = useCallback(() => {
    if (!packPreview) return;
    try {
      const result = importPack(packPreview.parsed, {
        assessmentsStore: useAssessmentsStore,
        findingsStore: useFindingsStore,
        frameworksStore: useFrameworksStore,
        requirementsStore: useRequirementsStore
      });
      toast.success(
        `${result.replaced ? 'Replaced' : 'Created'} "${packPreview.preview.orgName}" pack data — ` +
        `${result.applied.metricValues} subcategory value sets, ${result.applied.risks} risks`
      );
    } catch (err) {
      console.error('Pack import error:', err);
      toast.error(err.message || 'Pack import failed.');
    } finally {
      setPackPreview(null);
    }
  }, [packPreview]);

  // Metrics catalogue import — preview first, no writes until the user confirms.
  const handleMetricsFileSelected = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const validation = validateMetricsCatalog(parseMetricsCSV(await file.text()));
      if (!validation.ok) {
        toast.error(`Catalogue rejected: ${validation.errors.slice(0, 3).join(' ')}`);
        return;
      }
      const catalogSlug = catalogSlugFromFilename(file.name);
      const preview = previewMetricsImport(validation, {
        metricsStore: useMetricsStore,
        orgProfileStore: useOrgProfileStore,
        frameworksStore: useFrameworksStore,
        requirementsStore: useRequirementsStore
      }, { catalogSlug });
      setMetricsPreview({ validation, preview });
    } catch (err) {
      console.error('Metrics catalogue preview error:', err);
      toast.error(err.message || 'Could not read the catalogue file.');
    }
  }, []);

  const handleConfirmMetricsImport = useCallback(() => {
    if (!metricsPreview) return;
    try {
      const result = importMetricsCatalog(metricsPreview.validation, {
        metricsStore: useMetricsStore,
        orgProfileStore: useOrgProfileStore
      }, { catalogSlug: metricsPreview.preview.catalogSlug });
      toast.success(
        `${result.replaced ? 'Replaced' : 'Imported'} catalogue "${metricsPreview.preview.catalogSlug}" — ` +
        `${result.imported} metrics`
      );
    } catch (err) {
      console.error('Metrics catalogue import error:', err);
      toast.error(err.message || 'Catalogue import failed.');
    } finally {
      setMetricsPreview(null);
    }
  }, [metricsPreview]);

  const handleRemoveCatalog = useCallback((catalogSlug) => {
    if (!window.confirm(`Remove catalogue "${catalogSlug}" and all its metrics from this app?`)) return;
    useMetricsStore.getState().removeCatalog(catalogSlug);
    toast.success(`Removed catalogue "${catalogSlug}"`);
  }, []);

  const handleExportCatalog = useCallback((catalogSlug) => {
    try {
      const records = useMetricsStore.getState().metrics.filter((m) => m.catalogSlug === catalogSlug);
      downloadMetricsCatalogCSV(records, catalogSlug);
      toast.success(`Exported catalogue "${catalogSlug}" as CSV`);
    } catch (err) {
      console.error('Catalogue export error:', err);
      toast.error('Catalogue export failed.');
    }
  }, []);

  const handleExportAssessments = useCallback(() => {
    try {
      exportAssessmentsJSON(useAssessmentsStore, useControlsStore, useUserStore);
      toast.success('Assessments exported as JSON');
    } catch (err) {
      console.error('Export assessments error:', err);
      toast.error('Export failed. Please try again.');
    }
  }, []);

  // Restore handler — full replace of store data from a complete-database export.
  const handleRestoreDatabase = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const stores = {
        controlsStore: useControlsStore,
        assessmentsStore: useAssessmentsStore,
        requirementsStore: useRequirementsStore,
        frameworksStore: useFrameworksStore,
        artifactStore: useArtifactStore,
        userStore: useUserStore,
        findingsStore: useFindingsStore,
        metricsStore: useMetricsStore,
        orgProfileStore: useOrgProfileStore
      };

      const validation = validateDatabaseExport(parsed);
      if (!validation.ok) {
        toast.error(`Restore rejected: ${validation.errors.join(' ')}`);
        return;
      }

      const summary = Object.entries(validation.counts)
        .map(([section, count]) => `${section}: ${count}`)
        .join(', ');
      const warningText = validation.warnings.length ? `\n\nNote: ${validation.warnings.join(' ')}` : '';
      const confirmed = window.confirm(
        `RESTORE DATABASE — this REPLACES your current data.\n\n` +
        `File contains — ${summary}.${warningText}\n\n` +
        `A backup download of your current data will be ATTEMPTED first ` +
        `(csf_pre_restore_*.backup.json) — browsers cannot guarantee it lands, ` +
        `so only continue if you also have a recent export of your own. Continue?`
      );
      if (!confirmed) return;

      const result = importCompleteDatabase(parsed, stores);
      toast.success(`Database restored (${result.applied.length} sections). Backup of prior data downloaded.`);
    } catch (err) {
      console.error('Database restore error:', err);
      toast.error(err.message || 'Restore failed. Please verify the file and try again.');
    }
  }, []);

  // Get requirement count for each framework
  const getFrameworkStats = useCallback((frameworkId) => {
    const reqCount = getRequirementCount(frameworkId);
    const controlCount = controls.filter(c =>
      (c.linkedRequirementIds || []).some(reqId => {
        const req = requirements.find(r => r.id === reqId);
        return req && req.frameworkId === frameworkId;
      })
    ).length;

    return { reqCount, controlCount };
  }, [requirements, controls, getRequirementCount]);

  // Handlers
  const handleImportClick = useCallback((frameworkId) => {
    setImportFrameworkId(frameworkId);
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !importFrameworkId) return;

    try {
      const text = await file.text();
      const count = await importRequirementsCSV(text, importFrameworkId);
      markFrameworkImported(importFrameworkId);
      toast.success(`Imported ${count} requirements for ${importFrameworkId}`);
    } catch (err) {
      console.error('File import error:', err);
      toast.error('Import failed. Please verify the CSV file and try again.');
    }

    e.target.value = '';
    setImportFrameworkId(null);
  }, [importFrameworkId, importRequirementsCSV, markFrameworkImported]);

  const handleNewFrameworkImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      // Parse CSV to detect framework IDs
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toUpperCase());
      const frameworkColIndex = headers.findIndex(h => h === 'FRAMEWORK');

      if (frameworkColIndex === -1) {
        toast.error('CSV must have a FRAMEWORK column');
        e.target.value = '';
        return;
      }

      // Get unique framework IDs from the CSV
      const frameworkIds = new Set();
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple CSV parsing (handles basic cases)
        const cols = line.split(',');
        const fwId = cols[frameworkColIndex]?.trim();
        if (fwId) frameworkIds.add(fwId);
      }

      // Create any frameworks that don't exist
      let newFrameworksCreated = 0;
      frameworkIds.forEach(fwId => {
        const existing = frameworks.find(f => f.id === fwId);
        if (!existing) {
          addFramework({
            id: fwId,
            name: fwId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            shortName: fwId.split('-')[0].toUpperCase().slice(0, 6),
            version: '',
            description: `Imported from ${file.name}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
          });
          newFrameworksCreated++;
        }
      });

      // Import requirements for each framework
      let totalImported = 0;
      for (const fwId of frameworkIds) {
        const count = await importRequirementsCSV(text, fwId);
        markFrameworkImported(fwId);
        totalImported += count;
      }

      if (newFrameworksCreated > 0) {
        toast.success(`Created ${newFrameworksCreated} new framework(s) and imported ${totalImported} requirements`);
      } else {
        toast.success(`Imported ${totalImported} requirements`);
      }
    } catch (err) {
      console.error('New framework import error:', err);
      toast.error('Import failed. Please verify the CSV format and try again.');
    }

    e.target.value = '';
  }, [frameworks, addFramework, importRequirementsCSV, markFrameworkImported]);

  const handleDeleteFramework = useCallback((frameworkId) => {
    const framework = frameworks.find(f => f.id === frameworkId);
    const stats = getFrameworkStats(frameworkId);

    if (stats.reqCount > 0) {
      toast.error(`Cannot delete ${framework?.name} - has ${stats.reqCount} requirements. Clear requirements first.`);
      return;
    }

    if (window.confirm(`Delete framework "${framework?.name}"?`)) {
      deleteFramework(frameworkId);
      toast.success('Framework deleted');
    }
  }, [frameworks, getFrameworkStats, deleteFramework]);

  const handleUpdateFramework = useCallback(() => {
    if (!editingFramework) return;
    updateFramework(editingFramework.id, editingFramework);
    setEditingFramework(null);
    toast.success('Framework updated');
  }, [editingFramework, updateFramework]);

  const handleBackupFrequencyChange = useCallback((days) => {
    setBackupFrequency(days);
    setBackupReminderFrequency(days);
    toast.success(`Backup reminder frequency updated to ${days} day${days !== 1 ? 's' : ''}`);
  }, []);

  // Jira import handlers
  const handleFindingsImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await useFindingsStore.getState().importFindingsCSV(text, useUserStore);
      toast.success(`Imported ${count} findings from Jira`);
    } catch (err) {
      console.error('Findings import error:', err);
      toast.error('Import failed. Please try again.');
    }

    e.target.value = '';
  }, []);

  const handleArtifactsImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await useArtifactStore.getState().importArtifactsCSV(text);
      toast.success(`Imported ${count} artifacts from Jira`);
    } catch (err) {
      console.error('Artifacts import error:', err);
      toast.error('Import failed. Please try again.');
    }

    e.target.value = '';
  }, []);

  const handleAssessmentsImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await useAssessmentsStore.getState().importAssessmentsCSV(text, useUserStore);
      toast.success(`Imported ${count} assessment(s) from Jira`);
    } catch (err) {
      console.error('Assessments import error:', err);
      toast.error('Import failed. Please try again.');
    }

    e.target.value = '';
  }, []);

  const handleDownloadTemplate = useCallback(() => {
    const templateContent = `FRAMEWORK,CSF FUNCTION,CATEGORY,SUBCATEGORY ID,SUBCATEGORY DESCRIPTION,ID,IMPLEMENTATION EXAMPLE
nist-csf-2.0,GOVERN (GV),Organizational Context (GV.OC),GV.OC-01,The organizational mission is understood and informs cybersecurity risk management,GV.OC-01 Ex1,"Ex1: Share the organization's mission (e.g., through vision and mission statements, marketing, and service strategies) to provide a basis for identifying risks that may impede that mission"
nist-csf-2.0,GOVERN (GV),Organizational Context (GV.OC),GV.OC-01,The organizational mission is understood and informs cybersecurity risk management,GV.OC-01 Ex2,Ex2: Document how the mission influences cybersecurity risk management decisions
nist-csf-2.0,IDENTIFY (ID),Asset Management (ID.AM),ID.AM-01,Inventories of hardware managed by the organization are maintained,ID.AM-01 Ex1,"Ex1: Maintain inventories for all types of hardware, including IT, IoT, OT, and mobile devices"
nist-csf-2.0,PROTECT (PR),Identity Management and Access Control (PR.AA),PR.AA-01,Identities and credentials for authorized users are managed,PR.AA-01 Ex1,Ex1: Issue unique user identifiers and credentials to all personnel who require access
nist-csf-2.0,DETECT (DE),Continuous Monitoring (DE.CM),DE.CM-01,Networks and network services are monitored to find potentially adverse events,DE.CM-01 Ex1,Ex1: Monitor network traffic flows to detect potentially adverse events
nist-csf-2.0,RESPOND (RS),Incident Management (RS.MA),RS.MA-01,"The incident response plan is executed in coordination with relevant third parties once an incident is declared",RS.MA-01 Ex1,Ex1: Execute the incident response plan when an incident is detected or reported
nist-csf-2.0,RECOVER (RC),Incident Recovery Plan Execution (RC.RP),RC.RP-01,The recovery portion of the incident response plan is executed once initiated from the incident response process,RC.RP-01 Ex1,Ex1: Execute the recovery plan when recovery is initiated`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'requirements_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  }, []);

  return (
    <div className="p-6 min-h-full" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="settings-section-desc" style={{ fontSize: '13px' }}>
            Manage backups, your data, and the NIST CSF 2.0 framework for this workspace.
          </p>
        </div>

        {/* Experimental Notice for CSV Import/Export */}
        <div className="callout callout-warning flex items-start gap-3 mb-6">
          <AlertCircle size={18} style={{ color: '#c97b00', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <p className="settings-section-title" style={{ fontSize: '12px' }}>Experimental Features</p>
            <p className="settings-section-desc">
              The CSV import/export features are experimental. Data formats and functionality
              may change. Feedback welcome from the community!
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Backup & Data Persistence Settings */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Shield size={16} style={{ color: 'var(--accent)' }} />
              <h2 className="settings-section-title">Backup &amp; Data Persistence</h2>
            </div>
            <div className="space-y-4">
              {/* Data Storage Warning */}
              <div className="callout callout-warning flex items-start gap-3">
                <AlertCircle style={{ color: '#c97b00', flexShrink: 0, marginTop: '2px' }} size={18} />
                <div>
                  <h3 className="settings-section-title" style={{ fontSize: '12px' }}>Important: Local Data Storage</h3>
                  <p className="settings-section-desc mb-2">
                    All assessment data is stored in your browser's local storage. This data can be lost if you:
                  </p>
                  <ul className="settings-section-desc list-disc list-inside space-y-1 mb-2">
                    <li>Clear your browser cache or site data</li>
                    <li>Uninstall or reset your browser</li>
                    <li>Use browser cleanup utilities</li>
                    <li>Reach browser storage limits</li>
                  </ul>
                  <p className="settings-section-desc" style={{ fontWeight: 600 }}>
                    Always export your data regularly to prevent data loss.
                  </p>
                </div>
              </div>

              {/* Last Backup Info */}
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Last Backup</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last export: <strong>{getTimeSinceLastExport()}</strong>
                    </p>
                    {getLastExportDate() && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {getLastExportDate().toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        exportRequirementsCSV();
                        toast.success('Data exported successfully!');
                      }}
                      className="btn-terminal"
                    >
                      <Download size={14} />
                      Export Data Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Backup Reminder Frequency */}
              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Backup Reminder Frequency</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configure how often you'd like to be reminded to export your data.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="backupFrequency"
                      value="1"
                      checked={backupFrequency === 1}
                      onChange={() => handleBackupFrequencyChange(1)}
                      className="text-blue-600 dark:text-blue-500 cursor-pointer"
                    />
                    <span className="text-sm dark:text-gray-300">Daily</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="backupFrequency"
                      value="7"
                      checked={backupFrequency === 7}
                      onChange={() => handleBackupFrequencyChange(7)}
                      className="text-blue-600 dark:text-blue-500 cursor-pointer"
                    />
                    <span className="text-sm dark:text-gray-300">Weekly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="backupFrequency"
                      value="30"
                      checked={backupFrequency === 30}
                      onChange={() => handleBackupFrequencyChange(30)}
                      className="text-blue-600 dark:text-blue-500 cursor-pointer"
                    />
                    <span className="text-sm dark:text-gray-300">Monthly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="backupFrequency"
                      value="90"
                      checked={backupFrequency === 90}
                      onChange={() => handleBackupFrequencyChange(90)}
                      className="text-blue-600 dark:text-blue-500 cursor-pointer"
                    />
                    <span className="text-sm dark:text-gray-300">Quarterly</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                  Current setting: Remind me every <strong>{backupFrequency} day{backupFrequency !== 1 ? 's' : ''}</strong>
                </p>
              </div>

              {/* Best Practices */}
              <div className="border-t dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Best Practices</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Export data at the end of each work session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Store exported CSV files in multiple locations (cloud storage, external drive)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Use descriptive filenames with dates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Test your backups by importing them periodically</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Framework Management */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Layers size={16} style={{ color: 'var(--accent)' }} />
              <h2 className="settings-section-title">Framework Management</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Framework</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Requirements</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {frameworks.map(framework => {
                  const stats = getFrameworkStats(framework.id);
                  return (
                    <tr key={framework.id} className={!framework.enabled ? 'bg-gray-50 opacity-60' : ''}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <FrameworkBadge frameworkId={framework.id} showName />
                          {framework.isDefault && (
                            <span className="badge badge-warning">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{framework.description}</p>
                      </td>
                      <td className="p-3 text-sm">{framework.version}</td>
                      <td className="p-3 text-sm">
                        {sanitizeExternalUrl(framework.sourceUrl) ? (
                          <a
                            href={sanitizeExternalUrl(framework.sourceUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            {framework.source}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-gray-600">{framework.source || '-'}</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {stats.reqCount > 0 ? (
                          <span className="text-green-600 font-medium">{stats.reqCount}</span>
                        ) : (
                          <span className="text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {framework.comingSoon ? (
                          <span className="badge badge-warning">
                            <Clock size={12} />
                            Coming Soon
                          </span>
                        ) : framework.enabled ? (
                          <span className="badge badge-success">
                            <Check size={12} />
                            Enabled
                          </span>
                        ) : (
                          <span className="badge badge-neutral">
                            <X size={12} />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="btn-icon"
                            onClick={() => handleImportClick(framework.id)}
                            title="Import requirements CSV"
                          >
                            <Upload size={15} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => toggleFramework(framework.id)}
                            title={framework.enabled ? 'Disable framework' : 'Enable framework'}
                          >
                            {framework.enabled ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => setEditingFramework({ ...framework })}
                            title="Edit framework"
                          >
                            <Edit size={15} />
                          </button>
                          {!framework.isDefault && (
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => handleDeleteFramework(framework.id)}
                              title="Delete framework"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Import New Framework — bring your own framework */}
          <div className="card">
            <div className="card-header flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Upload size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="settings-section-title">Import Your Own Framework</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn-terminal"
                  onClick={() => newFrameworkFileInputRef.current?.click()}
                >
                  <Upload size={13} />
                  Import CSV
                </button>
                <button
                  className="btn-terminal"
                  onClick={handleDownloadTemplate}
                >
                  <Download size={13} />
                  Template
                </button>
              </div>
            </div>
            <p className="settings-section-desc mb-2">
              NIST CSF 2.0 is the built-in framework. To assess against another framework, import
              your own requirements using a CSV file with the following columns:
            </p>
            <code className="callout callout-info block overflow-x-auto" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              FRAMEWORK, CSF FUNCTION, CATEGORY, SUBCATEGORY ID, SUBCATEGORY DESCRIPTION, ID, IMPLEMENTATION EXAMPLE
            </code>
            <p className="settings-section-desc mt-2">
              All frameworks map to CSF Functions (Govern, Identify, Protect, Detect, Respond, Recover).
              The FRAMEWORK column should match a framework ID (e.g., nist-csf-2.0, soc2-2017, iso27001-2022).
            </p>
          </div>

          {/* Data Export */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Download size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <h3 className="settings-section-title">Data Export</h3>
                <p className="settings-section-desc">Export your assessment data in JSON format for backup, integration, or analysis</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-terminal"
                onClick={handleExportCompleteDatabase}
              >
                <Download size={14} />
                Complete Database
              </button>
              <button
                className="btn-terminal"
                onClick={handleExportAssessments}
              >
                <Download size={14} />
                Assessments Only
              </button>
              <button
                className="btn-terminal"
                onClick={handleExportShareable}
              >
                <Download size={14} />
                Shareable Copy
              </button>
            </div>
            <p className="settings-section-desc mt-3">
              <strong>Complete Database:</strong> Exports all controls, assessments, requirements, frameworks, artifacts, findings, and user data in a single JSON file (csf_assessment_YYYY-MM-DD.json)
            </p>
            <p className="settings-section-desc mt-2">
              <strong>Assessments Only:</strong> Exports assessment observations and scores with enhanced readability (assessments_YYYY-MM-DD.json)
            </p>
            <p className="settings-section-desc mt-2">
              <strong>Shareable Copy:</strong> Same as Complete Database but excludes private data-pack records by default (csf_share_YYYY-MM-DD.json) — safe for demos and sharing
            </p>
            <label className="flex items-center gap-2 settings-section-desc mt-2" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includePackData}
                onChange={(e) => setIncludePackData(e.target.checked)}
              />
              Include private pack data in the shareable copy (asks for confirmation)
            </label>
          </div>

          {/* Database Restore — destructive, visually distinct from export */}
          <div className="card" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--terminal-red)' }}>
            <div className="card-header flex items-center gap-2">
              <RotateCcw size={16} style={{ color: 'var(--terminal-red)' }} />
              <div>
                <h3 className="settings-section-title">Restore From Backup</h3>
                <p className="settings-section-desc">
                  Replaces ALL current data with the contents of a Complete Database export. A backup of your current data downloads automatically before anything is replaced.
                </p>
              </div>
            </div>
            <button
              className="btn-terminal btn-terminal-danger"
              onClick={() => restoreImportRef.current?.click()}
            >
              <Upload size={14} />
              Restore Complete Database
            </button>
            <p className="settings-section-desc mt-3">
              Accepts csf_assessment_*.json files created by Export Complete Database. This is a full replace, not a merge.
            </p>
          </div>

          {/* Organization profile — optional tailoring input; the most sensitive
              record in the app (crown jewels + tooling). Never in share exports. */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Building2 size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <h3 className="settings-section-title">Organization Profile (optional)</h3>
                <p className="settings-section-desc">
                  Business type, size, key systems, security tools, and crown jewels — used to tailor
                  community test procedures to your environment. Every question is skippable.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="btn-terminal"
                onClick={() => setShowOrgProfileWizard(true)}
              >
                {orgProfileSet ? 'Edit Profile' : 'Set Up Profile'}
              </button>
              {orgProfileSet && (
                <button
                  className="text-sm hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => {
                    if (window.confirm('Clear the organization profile from this browser? Tailored text already in assessments is not changed.')) {
                      clearOrgProfile();
                      toast.success('Organization profile cleared');
                    }
                  }}
                >
                  Clear profile
                </button>
              )}
            </div>
            {orgProfileSet && (
              <label className="flex items-start gap-2 mt-3" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={orgCloudConsent}
                  onChange={(e) => setOrgCloudConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5"
                />
                <span className="settings-section-desc">
                  Allow sending my profile to a <strong>cloud</strong> AI provider (Claude API) for procedure
                  tailoring. Local Ollama never needs this — nothing leaves your machine there.
                </span>
              </label>
            )}
            <p className="settings-section-desc mt-3">
              Stored only in this browser. <strong>Never included in shareable exports</strong> — tailored
              procedure text is swapped back to the community version there. It rides complete backups
              only; password-protect backups that carry it.
            </p>
          </div>

          {/* Private data pack — additive import, deliberately distinct from the destructive Restore card above */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Database size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <h3 className="settings-section-title">Private Data Pack</h3>
                <p className="settings-section-desc">
                  Load your organization's private assessment values and risk entries from a local pack file.
                  Additive: it creates a pack-owned assessment and never touches data you entered by hand.
                </p>
              </div>
            </div>
            <button
              className="btn-terminal"
              onClick={() => packImportRef.current?.click()}
            >
              <Upload size={14} />
              Import Data Pack
            </button>
            <p className="settings-section-desc mt-3">
              Accepts *.csfpack.json files — see PRIVATE_DATA.md in the repository for the format.
              You will see a preview before anything is written. Re-importing a pack replaces what that
              pack owns and never duplicates it. Pack data stays on this machine and is excluded from
              shareable exports by default.
            </p>
          </div>

          {/* Metrics catalogue — bring your own KPIs/KRIs as a local CSV; additive like the pack card */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Gauge size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <h3 className="settings-section-title">Metrics Catalogue (CSV)</h3>
                <p className="settings-section-desc">
                  Bring your own KPIs, KRIs, and metrics mapped to CSF subcategories. The app ships
                  no metric content — your catalogue is a separate local file that stays on this machine.
                </p>
              </div>
            </div>
            <button
              className="btn-terminal"
              onClick={() => metricsImportRef.current?.click()}
            >
              <Upload size={14} />
              Import Metrics Catalogue
            </button>
            <p className="settings-section-desc mt-3">
              Accepts *.csfmetrics.csv files — see PRIVATE_DATA.md for the column format. You will see
              a preview before anything is written. Re-importing a catalogue replaces it, never duplicates.
              Imported metrics are excluded from shareable exports by default, and catalogues with a
              restricted license (NC/ND/proprietary) can never leave via a shareable export. Browse them
              under Metrics in the navigation.
            </p>

            {metricsCatalogs.length > 0 && (
              <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                {metricsCatalogs.map((cat) => (
                  <div key={cat.catalogSlug} className="flex items-center justify-between text-sm">
                    <div className="min-w-0" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-mono font-medium">{cat.catalogSlug}</span>
                      <span style={{ color: 'var(--text-muted)' }}> — {cat.count} metrics
                        {cat.importedAt ? `, imported ${cat.importedAt.split('T')[0]}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className="btn-terminal"
                        style={{ fontSize: '10px', padding: '2px 8px' }}
                        onClick={() => handleExportCatalog(cat.catalogSlug)}
                      >
                        <Download size={12} />
                        CSV
                      </button>
                      <button
                        className="btn-terminal btn-terminal-danger"
                        style={{ fontSize: '10px', padding: '2px 8px' }}
                        onClick={() => handleRemoveCatalog(cat.catalogSlug)}
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CSV Import / Export */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Cloud size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <h3 className="settings-section-title">CSV Import / Export</h3>
                <p className="settings-section-desc">Export and import records as CSV (Jira/Confluence-compatible format)</p>
              </div>
            </div>

            {/* Control Evaluations for Jira EVAL */}
            <div className="mb-4">
              <h4 className="settings-section-title mb-2" style={{ fontSize: '11px' }}>Control Evaluations (Jira EVAL Project)</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-terminal"
                  onClick={() => {
                    try {
                      useAssessmentsStore.getState().exportAllForJiraCSV(
                        useControlsStore,
                        useRequirementsStore,
                        useUserStore
                      );
                      toast.success('Exported all assessments for Jira EVAL import');
                    } catch (err) {
                      console.error('Assessment export error:', err);
                      toast.error('Assessment export failed. Please try again.');
                    }
                  }}
                >
                  <Download size={14} />
                  Export for Jira
                </button>
                <button
                  className="btn-terminal btn-terminal-success"
                  onClick={() => assessmentsImportRef.current?.click()}
                >
                  <Upload size={14} />
                  Import from Jira
                </button>
              </div>
              <p className="settings-section-desc mt-2">
                Export: CSV formatted for Jira EVAL project with Work Paper issue type and quarterly scores
              </p>
              <p className="settings-section-desc mt-1">
                Import: CSV exported from Jira EVAL project (matches standard assessment format)
              </p>
            </div>

            {/* Requirements for Confluence */}
            <div className="mb-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h4 className="settings-section-title mb-2" style={{ fontSize: '11px' }}>Requirements (Confluence Database)</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-terminal"
                  onClick={() => {
                    try {
                      useRequirementsStore.getState().exportForConfluenceCSV(
                        null,
                        useControlsStore,
                        useUserStore
                      );
                      toast.success('Exported requirements for Confluence import');
                    } catch (err) {
                      console.error('Requirements export error:', err);
                      toast.error('Requirements export failed. Please try again.');
                    }
                  }}
                >
                  <Download size={14} />
                  Export for Confluence
                </button>
              </div>
              <p className="settings-section-desc mt-2">
                Creates CSV matching Confluence Requirements database schema with linked controls and stakeholders
              </p>
            </div>

            {/* Findings for Jira FND */}
            <div className="mb-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h4 className="settings-section-title mb-2" style={{ fontSize: '11px' }}>Findings (Jira FND Project)</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-terminal"
                  onClick={() => {
                    try {
                      useFindingsStore.getState().exportForJiraCSV(useUserStore);
                      toast.success('Exported findings for Jira FND import');
                    } catch (err) {
                      console.error('Findings export error:', err);
                      toast.error('Findings export failed. Please try again.');
                    }
                  }}
                >
                  <Download size={14} />
                  Export for Jira
                </button>
                <button
                  className="btn-terminal btn-terminal-success"
                  onClick={() => findingsImportRef.current?.click()}
                >
                  <Upload size={14} />
                  Import from Jira
                </button>
              </div>
              <p className="settings-section-desc mt-2">
                Export: CSV for Jira FND project with Finding issue type, remediation plans, and due dates
              </p>
              <p className="settings-section-desc mt-1">
                Import: CSV exported from Jira FND project with findings data
              </p>
            </div>

            {/* Artifacts for Jira AR */}
            <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
              <h4 className="settings-section-title mb-2" style={{ fontSize: '11px' }}>Artifacts (Jira AR Project)</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn-terminal"
                  onClick={() => {
                    try {
                      useArtifactStore.getState().exportForJiraCSV();
                      toast.success('Exported artifacts for Jira AR import');
                    } catch (err) {
                      console.error('Artifacts export error::', err);
                      toast.error('Artifacts export failed. Please try again.');
                    }
                  }}
                >
                  <Download size={14} />
                  Export for Jira
                </button>
                <button
                  className="btn-terminal btn-terminal-success"
                  onClick={() => artifactsImportRef.current?.click()}
                >
                  <Upload size={14} />
                  Import from Jira
                </button>
              </div>
              <p className="settings-section-desc mt-2">
                Export: CSV for Jira AR project with Artifact issue type, links, and compliance mappings
              </p>
              <p className="settings-section-desc mt-1">
                Import: CSV exported from Jira AR project with artifact data
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Requirements</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{requirements.length}</p>
            </div>
            <div className="card">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Controls</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{controls.length}</p>
            </div>
            <div className="card">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Assessments</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{assessments.length}</p>
            </div>
          </div>

          {/* Case Study Materials */}
          <div className="card">
            <div className="card-header flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="settings-section-title">Alma Security Case Study Materials</h3>
              </div>
              <a
                href="https://github.com/CPAtoCybersecurity/csf_profile/tree/main/EXAMPLE%20BUSINESS%20CASE%20STUDY%20FOR%20ASSESSMENT"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-terminal"
              >
                <ExternalLink size={13} />
                View on GitHub
              </a>
            </div>
            <p className="settings-section-desc mb-2">
              Supplementary materials for the Alma Security fictional business case study, designed for students and practitioners to practice NIST CSF 2.0 control assessments.
            </p>
            <div className="settings-section-desc space-y-1">
              <p><strong>Includes:</strong> Company background, security policies, risk register, technology environment details</p>
              <p><strong>CSV Exports:</strong> Pre-loaded Alma Security controls and Q1 assessment data for import/export practice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleFileImport}
      />
      <input
        type="file"
        ref={newFrameworkFileInputRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleNewFrameworkImport}
      />
      {/* Jira import file inputs */}
      <input
        type="file"
        ref={findingsImportRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleFindingsImport}
      />
      <input
        type="file"
        ref={artifactsImportRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleArtifactsImport}
      />
      <input
        type="file"
        ref={assessmentsImportRef}
        style={{ display: 'none' }}
        accept=".csv"
        onChange={handleAssessmentsImport}
      />
      <input
        type="file"
        ref={restoreImportRef}
        style={{ display: 'none' }}
        accept=".json,application/json"
        onChange={handleRestoreDatabase}
      />
      <input
        type="file"
        ref={packImportRef}
        style={{ display: 'none' }}
        accept=".json,application/json"
        onChange={handlePackFileSelected}
      />
      <input
        type="file"
        ref={metricsImportRef}
        style={{ display: 'none' }}
        accept=".csv,text/csv"
        onChange={handleMetricsFileSelected}
      />

      {/* Pack Import Preview Modal — shows exactly what will happen before any write */}
      {packPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Import data pack</h3>
              <p className="text-sm text-gray-600 mt-1">
                {packPreview.preview.orgName} — pack "{packPreview.preview.slug}" version {String(packPreview.preview.packVersion)}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside">
                <li>
                  {packPreview.preview.willReplace
                    ? `Replaces the existing pack-owned assessment "${packPreview.preview.existingName}".`
                    : `Creates a new pack-owned assessment${packPreview.preview.frameworkName ? ` against ${packPreview.preview.frameworkName}` : ''}.`}
                </li>
                <li>
                  {packPreview.preview.metricValues.resolved} of {packPreview.preview.metricValues.count} subcategory
                  value sets matched the active framework.
                </li>
                <li>{packPreview.preview.risks.count} risk entries import as findings.</li>
                {packPreview.preview.metricValues.unresolved.length > 0 && (
                  <li className="text-amber-700">
                    Not matched (skipped): {packPreview.preview.metricValues.unresolved.join(', ')}
                  </li>
                )}
                {(packPreview.preview.metricValues.ambiguous || []).map((a) => (
                  <li key={a.subcategoryId} className="text-amber-700">
                    {a.subcategoryId} matched {a.matches} requirement rows — values attach to {a.attachedTo}
                  </li>
                ))}
                {packPreview.preview.notApplied.length > 0 && (
                  <li className="text-amber-700">
                    Accepted but not applied by this build: {packPreview.preview.notApplied.join(', ')}
                  </li>
                )}
                {packPreview.preview.validation.warnings.map((w) => (
                  <li key={w} className="text-amber-700">{w}</li>
                ))}
              </ul>
              {packPreview.preview.localEditsSinceImport && (
                <p className="mt-4 text-sm text-red-700 font-medium">
                  Warning: the pack-owned assessment was edited in this app after the last import.
                  Importing now discards those local edits.
                </p>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="text-sm px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setPackPreview(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-terminal"
                  style={{ padding: '6px 12px' }}
                  onClick={handleConfirmPackImport}
                >
                  Import Pack
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Catalogue Preview Modal — shows exactly what will happen before any write */}
      {metricsPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Import metrics catalogue</h3>
              <p className="text-sm text-gray-600 mt-1">
                Catalogue "{metricsPreview.preview.catalogSlug}" — {metricsPreview.preview.total} metrics
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside">
                <li>
                  {metricsPreview.preview.countsByType.KPI} KPI, {metricsPreview.preview.countsByType.KRI} KRI,{' '}
                  {metricsPreview.preview.countsByType.metric} metric.
                </li>
                <li>
                  {metricsPreview.preview.willReplace
                    ? `Replaces the ${metricsPreview.preview.existingCount} metrics this catalogue currently has.`
                    : 'New catalogue — nothing existing is touched.'}
                </li>
                {metricsPreview.preview.licenses.length > 0 && (
                  <li>License: {metricsPreview.preview.licenses.join(', ')}</li>
                )}
                {metricsPreview.preview.restricted && (
                  <li className="text-teal-700">
                    Restricted license detected — this catalogue can never leave via a shareable export.
                  </li>
                )}
                {metricsPreview.preview.unresolved.length > 0 && (
                  <li className="text-amber-700">
                    {metricsPreview.preview.unresolved.length} subcategory ID(s) not in the active framework
                    (imported anyway, shown under Metrics once the framework has them):{' '}
                    {metricsPreview.preview.unresolved.slice(0, 6).join(', ')}
                    {metricsPreview.preview.unresolved.length > 6 ? ', …' : ''}
                  </li>
                )}
                {metricsPreview.validation.warnings.slice(0, 4).map((w) => (
                  <li key={w} className="text-amber-700">{w}</li>
                ))}
              </ul>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="text-sm px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setMetricsPreview(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-terminal"
                  style={{ padding: '6px 12px' }}
                  onClick={handleConfirmMetricsImport}
                >
                  Import Catalogue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Framework Modal */}
      {editingFramework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit Framework</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditingFramework(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Framework Name</label>
                <input
                  type="text"
                  className="mt-1 w-full p-2 border rounded"
                  value={editingFramework.name}
                  onChange={(e) => setEditingFramework(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Short Name</label>
                <input
                  type="text"
                  className="mt-1 w-full p-2 border rounded"
                  value={editingFramework.shortName}
                  onChange={(e) => setEditingFramework(prev => ({ ...prev, shortName: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Version</label>
                <input
                  type="text"
                  className="mt-1 w-full p-2 border rounded"
                  value={editingFramework.version}
                  onChange={(e) => setEditingFramework(prev => ({ ...prev, version: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 w-full p-2 border rounded h-20"
                  value={editingFramework.description}
                  onChange={(e) => setEditingFramework(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Badge Color</label>
                <input
                  type="color"
                  className="mt-1 w-full h-10 border rounded cursor-pointer"
                  value={editingFramework.color}
                  onChange={(e) => setEditingFramework(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingFramework.isDefault}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDefaultFramework(editingFramework.id);
                      }
                      setEditingFramework(prev => ({ ...prev, isDefault: e.target.checked }));
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">Set as default framework</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setEditingFramework(null)}
              >
                Cancel
              </button>
              <button
                className="btn-terminal"
                style={{ padding: '6px 12px' }}
                onClick={handleUpdateFramework}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrgProfileWizard && (
        <OrgProfileWizard onClose={() => setShowOrgProfileWizard(false)} />
      )}
    </div>
  );
};

export default Settings;
