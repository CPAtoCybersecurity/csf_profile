import React, { useState, useRef, useCallback } from 'react';
import {
  Settings as SettingsIcon,
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
  Shield
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

// Utils
import { exportCompleteDatabase, exportAssessmentsJSON } from '../utils/dataExport';

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

  const fileInputRef = useRef(null);
  const newFrameworkFileInputRef = useRef(null);
  const [importFrameworkId, setImportFrameworkId] = useState(null);

  // Export handlers
  const handleExportCompleteDatabase = useCallback(() => {
    try {
      exportCompleteDatabase({
        controlsStore: useControlsStore,
        assessmentsStore: useAssessmentsStore,
        requirementsStore: useRequirementsStore,
        frameworksStore: useFrameworksStore,
        artifactStore: useArtifactStore,
        userStore: useUserStore
      });
      toast.success('Complete database exported as JSON');
    } catch (err) {
      console.error('Export complete database error:', err);
      toast.error('Unable to export database. Please try again.');
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
    <div className="p-4 bg-white min-h-full">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="space-y-8">
        {/* Backup & Data Persistence Settings */}
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold dark:text-white">Backup & Data Persistence</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Data Storage Warning */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Important: Local Data Storage</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      All assessment data is stored in your browser's IndexedDB. This data can be lost if you:
                    </p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1 mb-3">
                      <li>Clear your browser cache or site data</li>
                      <li>Uninstall or reset your browser</li>
                      <li>Use browser cleanup utilities</li>
                      <li>Reach browser storage limits</li>
                    </ul>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <strong>Always export your data regularly to prevent data loss.</strong>
                    </p>
                  </div>
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
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 
                             text-white rounded-lg transition-colors font-medium inline-flex items-center gap-2"
                    >
                      <Download size={16} />
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
        </div>

        {/* Framework Management */}
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Framework Management</h2>
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
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{framework.description}</p>
                      </td>
                      <td className="p-3 text-sm">{framework.version}</td>
                      <td className="p-3 text-sm">
                        {framework.sourceUrl ? (
                          <a
                            href={framework.sourceUrl}
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
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Clock size={14} />
                            Coming Soon
                          </span>
                        ) : framework.enabled ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <Check size={14} />
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500">
                            <X size={14} />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                            onClick={() => handleImportClick(framework.id)}
                            title="Import requirements CSV"
                          >
                            <Upload size={16} />
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                            onClick={() => toggleFramework(framework.id)}
                            title={framework.enabled ? 'Disable framework' : 'Enable framework'}
                          >
                            {framework.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                            onClick={() => setEditingFramework({ ...framework })}
                            title="Edit framework"
                          >
                            <Edit size={16} />
                          </button>
                          {!framework.isDefault && (
                            <button
                              className="p-1.5 hover:bg-red-100 rounded text-red-600"
                              onClick={() => handleDeleteFramework(framework.id)}
                              title="Delete framework"
                            >
                              <Trash2 size={16} />
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

          {/* Import New Framework */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-800">Import New Framework</h3>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  onClick={() => newFrameworkFileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  Import CSV
                </button>
                <button
                  className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  onClick={handleDownloadTemplate}
                >
                  <Download size={14} />
                  Download Template
                </button>
              </div>
            </div>
            <p className="text-sm text-blue-700 mb-2">
              Import requirements using a CSV file with the following columns:
            </p>
            <code className="text-xs bg-blue-100 p-2 rounded block overflow-x-auto">
              FRAMEWORK, CSF FUNCTION, CATEGORY, SUBCATEGORY ID, SUBCATEGORY DESCRIPTION, ID, IMPLEMENTATION EXAMPLE
            </code>
            <p className="text-xs text-blue-600 mt-2">
              All frameworks map to CSF Functions (Govern, Identify, Protect, Detect, Respond, Recover).
              The FRAMEWORK column should match a framework ID (e.g., nist-csf-2.0, soc2-2017, iso27001-2022).
            </p>
          </div>

          {/* Data Export */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-green-800">Data Export</h3>
                <p className="text-sm text-green-700 mt-1">Export your assessment data in JSON format for backup, integration, or analysis</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={handleExportCompleteDatabase}
              >
                <Download size={16} />
                Export Complete Database
              </button>
              <button
                className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={handleExportAssessments}
              >
                <Download size={16} />
                Export Assessments Only
              </button>
            </div>
            <p className="text-xs text-green-600 mt-3">
              <strong>Complete Database:</strong> Exports all controls, assessments, requirements, frameworks, artifacts, and user data in a single JSON file (csf_assessment_YYYY-MM-DD.json)
            </p>
            <p className="text-xs text-green-600 mt-2">
              <strong>Assessments Only:</strong> Exports assessment observations and scores with enhanced readability (assessments_YYYY-MM-DD.json)
            </p>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-500">Total Requirements</p>
              <p className="text-2xl font-bold text-blue-600">{requirements.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-500">Total Controls</p>
              <p className="text-2xl font-bold text-green-600">{controls.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold text-purple-600">{assessments.length}</p>
            </div>
          </div>

          {/* Case Study Materials */}
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-purple-800">Alma Security Case Study Materials</h3>
              <a
                href="https://github.com/CPAtoCybersecurity/csf_profile/tree/main/EXAMPLE%20BUSINESS%20CASE%20STUDY%20FOR%20ASSESSMENT"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
              >
                <ExternalLink size={14} />
                View on GitHub
              </a>
            </div>
            <p className="text-sm text-purple-700 mb-2">
              Supplementary materials for the Alma Security fictional business case study, designed for students and practitioners to practice NIST CSF 2.0 control assessments.
            </p>
            <div className="text-xs text-purple-600 space-y-1">
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

      {/* Edit Framework Modal */}
      {editingFramework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={handleUpdateFramework}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
