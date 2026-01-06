import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Search, Filter, Plus, Edit, Save, Trash2, X, CheckCircle, XCircle,
  Download, Upload, ClipboardList, Calendar, FileSearch, ChevronRight, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// Components
import FrameworkBadge from '../components/FrameworkBadge';
import UserSelector from '../components/UserSelector';
import ArtifactSelector from '../components/ArtifactSelector';
import DropdownPortal from '../components/DropdownPortal';
import SortableHeader from '../components/SortableHeader';

// Stores
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';
import useUserStore from '../stores/userStore';

const Assessments = () => {
  // Store state
  const assessments = useAssessmentsStore((state) => state.assessments);
  const currentAssessmentId = useAssessmentsStore((state) => state.currentAssessmentId);
  const setCurrentAssessmentId = useAssessmentsStore((state) => state.setCurrentAssessmentId);
  const createAssessment = useAssessmentsStore((state) => state.createAssessment);
  const updateAssessment = useAssessmentsStore((state) => state.updateAssessment);
  const deleteAssessment = useAssessmentsStore((state) => state.deleteAssessment);
  const getObservation = useAssessmentsStore((state) => state.getObservation);
  const updateObservation = useAssessmentsStore((state) => state.updateObservation);
  const updateQuarterlyObservation = useAssessmentsStore((state) => state.updateQuarterlyObservation);
  const addToScope = useAssessmentsStore((state) => state.addToScope);
  const removeFromScope = useAssessmentsStore((state) => state.removeFromScope);
  const bulkAddToScope = useAssessmentsStore((state) => state.bulkAddToScope);
  const getAssessmentProgress = useAssessmentsStore((state) => state.getAssessmentProgress);
  const exportAssessmentCSV = useAssessmentsStore((state) => state.exportAssessmentCSV);
  const importAssessmentsCSV = useAssessmentsStore((state) => state.importAssessmentsCSV);
  const exportAllAssessmentsCSV = useAssessmentsStore((state) => state.exportAllAssessmentsCSV);
  const cloneAssessment = useAssessmentsStore((state) => state.cloneAssessment);

  const controls = useControlsStore((state) => state.controls);
  const getControl = useControlsStore((state) => state.getControl);

  const requirements = useRequirementsStore((state) => state.requirements);
  const getRequirement = useRequirementsStore((state) => state.getRequirement);

  const frameworks = useFrameworksStore((state) => state.frameworks);
  const getEnabledFrameworks = useFrameworksStore((state) => state.getEnabledFrameworks);

  const users = useUserStore((state) => state.users);

  // Local state
  const [view, setView] = useState('list'); // 'list', 'scope', 'assess'
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1'); // Q1, Q2, Q3, Q4

  // New assessment modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    name: '',
    description: '',
    scopeType: 'controls',
    frameworkFilter: ''
  });

  // Scope picker state
  const [scopePickerSearch, setScopePickerSearch] = useState('');
  const [availableItemsSort, setAvailableItemsSort] = useState({ key: 'subcategoryId', direction: 'asc' });

  // Refs
  const fileInputRef = useRef(null);

  // Get current assessment
  const currentAssessment = useMemo(() => {
    return assessments.find(a => a.id === currentAssessmentId);
  }, [assessments, currentAssessmentId]);

  // Get progress for current assessment
  const progress = useMemo(() => {
    if (!currentAssessmentId) return null;
    return getAssessmentProgress(currentAssessmentId);
  }, [currentAssessmentId, getAssessmentProgress, currentAssessment]);

  // Get scoped items for current assessment
  const scopedItems = useMemo(() => {
    if (!currentAssessment) return [];

    return (currentAssessment.scopeIds || []).map(itemId => {
      if (currentAssessment.scopeType === 'controls') {
        const control = getControl(itemId);
        return control ? { ...control, type: 'control', itemId: control.controlId } : null;
      } else {
        const req = getRequirement(itemId);
        return req ? { ...req, type: 'requirement', itemId: req.id } : null;
      }
    }).filter(Boolean);
  }, [currentAssessment, getControl, getRequirement]);

  // Get available items for scope selection
  const availableItems = useMemo(() => {
    if (!currentAssessment) return [];

    const scopeIds = currentAssessment.scopeIds || [];

    let items = [];

    if (currentAssessment.scopeType === 'controls') {
      items = controls.filter(c => !scopeIds.includes(c.controlId));
      if (scopePickerSearch) {
        const search = scopePickerSearch.toLowerCase();
        items = items.filter(c =>
          c.controlId.toLowerCase().includes(search) ||
          c.implementationDescription?.toLowerCase().includes(search)
        );
      }
      items = items.map(c => ({ ...c, type: 'control', itemId: c.controlId }));
    } else {
      items = requirements.filter(r => !scopeIds.includes(r.id));
      if (currentAssessment.frameworkFilter) {
        items = items.filter(r => r.frameworkId === currentAssessment.frameworkFilter);
      }
      if (scopePickerSearch) {
        const search = scopePickerSearch.toLowerCase();
        items = items.filter(r =>
          r.id.toLowerCase().includes(search) ||
          r.subcategoryId?.toLowerCase().includes(search) ||
          r.function?.toLowerCase().includes(search) ||
          r.implementationExample?.toLowerCase().includes(search)
        );
      }
      items = items.map(r => ({ ...r, type: 'requirement', itemId: r.id }));
    }

    // Apply sorting
    items.sort((a, b) => {
      let aVal = '';
      let bVal = '';

      if (availableItemsSort.key === 'subcategoryId') {
        aVal = a.type === 'control' ? a.controlId : (a.subcategoryId || a.id);
        bVal = b.type === 'control' ? b.controlId : (b.subcategoryId || b.id);
      } else if (availableItemsSort.key === 'id') {
        aVal = a.type === 'control' ? a.controlId : a.id;
        bVal = b.type === 'control' ? b.controlId : b.id;
      } else if (availableItemsSort.key === 'implementationExample') {
        aVal = a.type === 'control' ? a.implementationDescription : (a.implementationExample || '');
        bVal = b.type === 'control' ? b.implementationDescription : (b.implementationExample || '');
      } else if (availableItemsSort.key === 'category') {
        aVal = a.category || '';
        bVal = b.category || '';
      } else {
        aVal = a[availableItemsSort.key] || '';
        bVal = b[availableItemsSort.key] || '';
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return availableItemsSort.direction === 'asc' ? comparison : -comparison;
    });

    return items;
  }, [currentAssessment, controls, requirements, scopePickerSearch, availableItemsSort]);

  // Get current observation
  const currentObservation = useMemo(() => {
    if (!currentAssessmentId || !selectedItemId) return null;
    return getObservation(currentAssessmentId, selectedItemId);
  }, [currentAssessmentId, selectedItemId, getObservation, currentAssessment]);

  // Helper functions
  const getUserName = useCallback((userId) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  }, [users]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Complete': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'Submitted': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  }, []);

  const enabledFrameworks = useMemo(() => getEnabledFrameworks(), [frameworks]);

  // Handlers
  const handleCreateAssessment = useCallback(() => {
    if (!newAssessment.name) {
      toast.error('Assessment name is required');
      return;
    }

    const created = createAssessment(newAssessment);
    setShowNewModal(false);
    setNewAssessment({ name: '', description: '', scopeType: 'controls', frameworkFilter: '' });
    setView('scope');
    toast.success(`Assessment "${created.name}" created`);
  }, [newAssessment, createAssessment]);

  const handleSelectAssessment = useCallback((assessment) => {
    setCurrentAssessmentId(assessment.id);
    setView('scope');
    setSelectedItemId(null);
  }, [setCurrentAssessmentId]);

  const handleDeleteAssessment = useCallback((assessmentId) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (window.confirm(`Delete assessment "${assessment?.name}"?`)) {
      deleteAssessment(assessmentId);
      setView('list');
      toast.success('Assessment deleted');
    }
  }, [assessments, deleteAssessment]);

  const handleCloneAssessment = useCallback((assessmentId) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    const newName = prompt('Enter name for cloned assessment:', `${assessment?.name} (Copy)`);
    if (newName) {
      const cloned = cloneAssessment(assessmentId, newName);
      setCurrentAssessmentId(cloned.id);
      setView('scope');
      toast.success('Assessment cloned');
    }
  }, [assessments, cloneAssessment, setCurrentAssessmentId]);

  const handleAddToScope = useCallback((itemId) => {
    if (!currentAssessmentId) return;
    addToScope(currentAssessmentId, itemId);
  }, [currentAssessmentId, addToScope]);

  const handleRemoveFromScope = useCallback((itemId) => {
    if (!currentAssessmentId) return;
    removeFromScope(currentAssessmentId, itemId);
  }, [currentAssessmentId, removeFromScope]);

  const handleAddAllInScope = useCallback(() => {
    if (!currentAssessmentId || currentAssessment?.scopeType !== 'requirements') return;

    const inScopeReqs = requirements
      .filter(r => r.inScope)
      .filter(r => !currentAssessment.frameworkFilter || r.frameworkId === currentAssessment.frameworkFilter)
      .map(r => r.id);

    bulkAddToScope(currentAssessmentId, inScopeReqs);
    toast.success(`Added ${inScopeReqs.length} in-scope requirements`);
  }, [currentAssessmentId, currentAssessment, requirements, bulkAddToScope]);

  const handleSelectItem = useCallback((itemId) => {
    setSelectedItemId(itemId);
    setView('assess');
    setEditMode(false);
  }, []);

  const handleObservationChange = useCallback((field, value) => {
    if (!currentAssessmentId || !selectedItemId) return;
    updateObservation(currentAssessmentId, selectedItemId, { [field]: value });
  }, [currentAssessmentId, selectedItemId, updateObservation]);

  const handleQuarterlyChange = useCallback((field, value) => {
    if (!currentAssessmentId || !selectedItemId) return;
    updateQuarterlyObservation(currentAssessmentId, selectedItemId, selectedQuarter, { [field]: value });
  }, [currentAssessmentId, selectedItemId, selectedQuarter, updateQuarterlyObservation]);

  const handleRemediationChange = useCallback((field, value) => {
    if (!currentAssessmentId || !selectedItemId) return;
    const currentObs = getObservation(currentAssessmentId, selectedItemId);
    updateObservation(currentAssessmentId, selectedItemId, {
      remediation: {
        ...currentObs.remediation,
        [field]: value
      }
    });
  }, [currentAssessmentId, selectedItemId, getObservation, updateObservation]);

  const handleExport = useCallback(() => {
    if (!currentAssessmentId) return;
    exportAssessmentCSV(currentAssessmentId, useControlsStore, useRequirementsStore, useUserStore);
    toast.success('Assessment exported');
  }, [currentAssessmentId, exportAssessmentCSV]);

  const handleAvailableItemsSort = useCallback((key) => {
    setAvailableItemsSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importAssessmentsCSV(text, useUserStore);
      toast.success(`Imported ${count} assessment(s)`);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }

    e.target.value = '';
  }, [importAssessmentsCSV]);

  const handleExportAll = useCallback(() => {
    exportAllAssessmentsCSV(useControlsStore, useRequirementsStore, useUserStore);
    toast.success('Assessments exported');
  }, [exportAllAssessmentsCSV]);

  const handleDownloadTemplate = useCallback(() => {
    const templateData = [
      {
        'ID': 'GV.OC-01 Ex1',
        'Assessment': '2025 Security Assessment',
        'Scope Type': 'controls',
        'Auditor': 'Auditor Name <auditor@example.com>',
        'Test Procedure(s)': 'Review documentation; Interview control owner; Test implementation',
        'Q1 Actual Score': '5',
        'Q1 Target Score': '5',
        'Q1 Observations': 'Q1 observation notes',
        'Q1 Observation Date': '2025-01-15',
        'Q1 Testing Status': 'Complete',
        'Q1 Examine': 'Yes',
        'Q1 Interview': 'Yes',
        'Q1 Test': 'Yes',
        'Q2 Actual Score': '6',
        'Q2 Target Score': '5',
        'Q2 Observations': 'Q2 observation notes',
        'Q2 Observation Date': '2025-04-15',
        'Q2 Testing Status': 'Complete',
        'Q2 Examine': 'Yes',
        'Q2 Interview': 'Yes',
        'Q2 Test': 'Yes',
        'Q3 Actual Score': '',
        'Q3 Target Score': '',
        'Q3 Observations': '',
        'Q3 Observation Date': '',
        'Q3 Testing Status': 'Not Started',
        'Q3 Examine': 'No',
        'Q3 Interview': 'No',
        'Q3 Test': 'No',
        'Q4 Actual Score': '',
        'Q4 Target Score': '',
        'Q4 Observations': '',
        'Q4 Observation Date': '',
        'Q4 Testing Status': 'Not Started',
        'Q4 Examine': 'No',
        'Q4 Interview': 'No',
        'Q4 Test': 'No',
        'Linked Artifacts': 'artifact1; artifact2',
        'Remediation Owner': 'Owner Name <owner@example.com>',
        'Action Plan': 'Example remediation action',
        'Remediation Due Date': '2025-03-01'
      }
    ];

    const headers = [
      'ID', 'Assessment', 'Scope Type', 'Auditor', 'Test Procedure(s)',
      'Q1 Actual Score', 'Q1 Target Score', 'Q1 Observations', 'Q1 Observation Date', 'Q1 Testing Status', 'Q1 Examine', 'Q1 Interview', 'Q1 Test',
      'Q2 Actual Score', 'Q2 Target Score', 'Q2 Observations', 'Q2 Observation Date', 'Q2 Testing Status', 'Q2 Examine', 'Q2 Interview', 'Q2 Test',
      'Q3 Actual Score', 'Q3 Target Score', 'Q3 Observations', 'Q3 Observation Date', 'Q3 Testing Status', 'Q3 Examine', 'Q3 Interview', 'Q3 Test',
      'Q4 Actual Score', 'Q4 Target Score', 'Q4 Observations', 'Q4 Observation Date', 'Q4 Testing Status', 'Q4 Examine', 'Q4 Interview', 'Q4 Test',
      'Linked Artifacts', 'Remediation Owner', 'Action Plan', 'Remediation Due Date'
    ];
    const csv = [
      headers.join(','),
      templateData.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'assessments_template.csv';
    link.click();
    toast.success('Template downloaded');
  }, []);

  // Render assessment list view
  const renderListView = () => (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList size={24} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold">Assessments</h1>
            <p className="text-sm text-gray-600">{assessments.length} assessment(s)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            onClick={() => setShowNewModal(true)}
          >
            <Plus size={16} />
            New Assessment
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            onClick={handleImportClick}
            title="Import assessments from CSV"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            onClick={handleExportAll}
            title="Export all assessments to CSV"
          >
            <Download size={16} />
            Export
          </button>
          <button
            className="flex items-center gap-2 py-2 px-4 rounded-lg"
            style={{ backgroundColor: '#e5e7eb', color: '#1f2937' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onClick={handleDownloadTemplate}
            title="Download CSV template"
          >
            <Download size={16} />
            Template
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ClipboardList size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No assessments yet</p>
            <p className="text-sm mt-2">Click "New Assessment" to create one or "Import" to import from CSV</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assessments.map(assessment => {
              const prog = getAssessmentProgress(assessment.id);
              return (
                <div
                  key={assessment.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => handleSelectAssessment(assessment)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{assessment.name}</h3>
                      {assessment.description && (
                        <p className="text-gray-600 text-sm mt-1">{assessment.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Scope: {assessment.scopeType === 'controls' ? 'Controls' : 'Requirements'}</span>
                        <span>{prog.total} items</span>
                        <span className={getStatusColor(assessment.status)}>
                          {prog.completed}/{prog.total} complete
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleCloneAssessment(assessment.id)}
                        title="Clone assessment"
                      >
                        <Copy size={16} className="text-gray-500" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={() => handleDeleteAssessment(assessment.id)}
                        title="Delete assessment"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{prog.percentage}% complete</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render scope definition view
  const renderScopeView = () => (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="p-2 hover:bg-gray-200 rounded"
              onClick={() => setView('list')}
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{currentAssessment?.name}</h1>
              <p className="text-sm text-gray-600">
                Define scope - {currentAssessment?.scopeType === 'controls' ? 'Select Controls' : 'Select Requirements'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentAssessment?.scopeType === 'requirements' && (
              <button
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
                onClick={handleAddAllInScope}
              >
                <CheckCircle size={16} />
                Add All In-Scope
              </button>
            )}
            <button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Progress summary */}
        {progress && (
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="text-gray-600">Progress:</span>
            <span className="px-2 py-1 bg-gray-200 rounded">{progress.total} scoped</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{progress.completed} complete</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{progress.inProgress} in progress</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Scoped items */}
        <div className="w-1/2 border-r overflow-auto">
          <div className="p-3 bg-gray-50 border-b sticky top-0">
            <h3 className="font-medium">Scoped Items ({scopedItems.length})</h3>
          </div>
          {scopedItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No items in scope</p>
              <p className="text-sm mt-1">Add items from the right panel</p>
            </div>
          ) : (
            <div className="divide-y">
              {scopedItems.map(item => {
                const obs = currentAssessment ? currentAssessment.observations?.[item.itemId] : null;
                return (
                  <div
                    key={item.itemId}
                    className={`p-3 flex items-center justify-between hover:bg-blue-50 cursor-pointer ${
                      selectedItemId === item.itemId ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleSelectItem(item.itemId)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.type === 'requirement' && (
                          <FrameworkBadge frameworkId={item.frameworkId} size="xs" />
                        )}
                        <span className="font-medium">
                          {item.type === 'control' ? item.controlId : item.subcategoryId || item.id}
                        </span>
                        {obs?.testingStatus && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(obs.testingStatus)}`}>
                            {obs.testingStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                        {item.type === 'control'
                          ? item.implementationDescription
                          : item.category}
                      </p>
                    </div>
                    <button
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromScope(item.itemId);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available items */}
        <div className="w-1/2 overflow-auto flex flex-col">
          <div className="p-3 bg-gray-50 border-b sticky top-0 z-10">
            <h3 className="font-medium mb-2">Available Items ({availableItems.length})</h3>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Search by ID, category, or implementation example..."
              value={scopePickerSearch}
              onChange={(e) => setScopePickerSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="w-8 p-2"></th>
                  <SortableHeader
                    label="Subcategory"
                    sortKey="subcategoryId"
                    currentSort={availableItemsSort}
                    onSort={handleAvailableItemsSort}
                  />
                  <SortableHeader
                    label="ID"
                    sortKey="id"
                    currentSort={availableItemsSort}
                    onSort={handleAvailableItemsSort}
                  />
                  <SortableHeader
                    label="Implementation Example"
                    sortKey="implementationExample"
                    currentSort={availableItemsSort}
                    onSort={handleAvailableItemsSort}
                  />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availableItems.slice(0, 100).map(item => (
                  <tr
                    key={item.itemId}
                    className="hover:bg-green-50 cursor-pointer"
                    onClick={() => handleAddToScope(item.itemId)}
                  >
                    <td className="p-2 text-center">
                      <Plus size={16} className="text-green-600 inline" />
                    </td>
                    <td className="p-2 text-sm">
                      <div className="flex items-center gap-2">
                        {item.type === 'requirement' && (
                          <FrameworkBadge frameworkId={item.frameworkId} size="xs" />
                        )}
                        <span className="font-medium">
                          {item.type === 'control' ? item.controlId : item.subcategoryId || item.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.category || ''}
                      </p>
                    </td>
                    <td className="p-2 text-sm font-mono text-xs text-gray-600">
                      {item.type === 'control' ? item.controlId : item.id}
                    </td>
                    <td className="p-2 text-sm">
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-md">
                        {item.type === 'control'
                          ? item.implementationDescription
                          : item.implementationExample || '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {availableItems.length > 100 && (
              <p className="p-3 text-center text-gray-500 text-sm border-t">
                Showing first 100 of {availableItems.length} items. Use search to filter.
              </p>
            )}
            {availableItems.length === 0 && (
              <p className="p-4 text-center text-gray-500 text-sm">
                No available items. All items may already be scoped.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render assessment view
  const renderAssessView = () => {
    const currentItem = scopedItems.find(i => i.itemId === selectedItemId);

    return (
      <div className="flex flex-col h-full">
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="p-2 hover:bg-gray-200 rounded"
                onClick={() => setView('scope')}
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{currentAssessment?.name}</h1>
                <p className="text-sm text-gray-600">Assessment Observations</p>
              </div>
            </div>
            <button
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Item list */}
          <div className="w-64 min-w-64 border-r overflow-auto flex-shrink-0">
            {scopedItems.map(item => {
              const obs = currentAssessment?.observations?.[item.itemId];
              return (
                <div
                  key={item.itemId}
                  className={`p-3 border-b cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 ${
                    selectedItemId === item.itemId ? 'bg-blue-100 dark:bg-gray-600' : ''
                  }`}
                  onClick={() => {
                    setSelectedItemId(item.itemId);
                    setEditMode(false);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium whitespace-nowrap text-sm">
                      {item.type === 'control' ? item.controlId : item.subcategoryId || item.id}
                    </span>
                    {obs?.testingStatus && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(obs.testingStatus)}`}>
                        {obs.testingStatus}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Observation detail */}
          <div className="flex-1 overflow-auto p-4">
            {currentObservation && currentItem ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {currentItem.type === 'control' ? currentItem.controlId : currentItem.subcategoryId || currentItem.id}
                    </h2>
                    {currentItem.type === 'requirement' && (
                      <FrameworkBadge frameworkId={currentItem.frameworkId} />
                    )}
                  </div>
                  {editMode ? (
                    <button
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md"
                      onClick={() => setEditMode(false)}
                    >
                      <Save size={16} />
                      Done
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                </div>

                {/* Item description */}
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-sm text-gray-600">
                    {currentItem.type === 'control'
                      ? currentItem.implementationDescription
                      : currentItem.implementationExample || currentItem.category}
                  </p>
                </div>

                {/* Assessment fields - Per-item info */}
                <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                  <h3 className="font-medium text-gray-700 border-b pb-2">Assessment Information</h3>

                  <UserSelector
                    label="Auditor"
                    selectedUsers={currentObservation.auditorId}
                    onChange={(userId) => handleObservationChange('auditorId', userId)}
                    disabled={!editMode}
                  />

                  <div>
                    <label className="text-sm font-medium text-gray-500">Test Procedure(s)</label>
                    {editMode ? (
                      <textarea
                        value={currentObservation.testProcedures || ''}
                        onChange={(e) => handleObservationChange('testProcedures', e.target.value)}
                        className="mt-1 w-full p-2 border rounded h-20"
                        placeholder="Document test procedures..."
                      />
                    ) : (
                      <div className="mt-1 prose prose-sm max-w-none">
                        <ReactMarkdown>{currentObservation.testProcedures || 'No test procedures defined'}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <ArtifactSelector
                    label="Linked Artifacts"
                    selectedArtifacts={currentObservation.linkedArtifacts || []}
                    onChange={(artifacts) => handleObservationChange('linkedArtifacts', artifacts)}
                    disabled={!editMode}
                  />
                </div>

                {/* Quarterly Observations */}
                <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-medium text-gray-700">Quarterly Observations</h3>
                    <div className="flex gap-1">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                        const qData = currentObservation.quarters?.[q] || {};
                        const hasData = qData.testingStatus && qData.testingStatus !== 'Not Started';
                        return (
                          <button
                            key={q}
                            onClick={() => setSelectedQuarter(q)}
                            className={`px-3 py-1 text-sm font-medium rounded-t transition-colors ${
                              selectedQuarter === q
                                ? 'bg-blue-600 text-white'
                                : hasData
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {q}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(() => {
                    const quarterData = currentObservation.quarters?.[selectedQuarter] || {};
                    return (
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-500">Testing Status</label>
                            {editMode ? (
                              <select
                                value={quarterData.testingStatus || 'Not Started'}
                                onChange={(e) => handleQuarterlyChange('testingStatus', e.target.value)}
                                className="mt-1 w-full p-2 border rounded"
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Complete">Complete</option>
                              </select>
                            ) : (
                              <p className={`mt-1 px-2 py-1 inline-block rounded ${getStatusColor(quarterData.testingStatus || 'Not Started')}`}>
                                {quarterData.testingStatus || 'Not Started'}
                              </p>
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-500">Observation Date</label>
                            {editMode ? (
                              <input
                                type="date"
                                value={quarterData.observationDate || ''}
                                onChange={(e) => handleQuarterlyChange('observationDate', e.target.value)}
                                className="mt-1 w-full p-2 border rounded"
                              />
                            ) : (
                              <p className="mt-1">{quarterData.observationDate || 'Not set'}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Assessment Method(s)</label>
                          <div className="mt-1 flex gap-4">
                            {['examine', 'interview', 'test'].map((method) => (
                              <label key={method} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={quarterData[method] || false}
                                  onChange={(e) => handleQuarterlyChange(method, e.target.checked)}
                                  disabled={!editMode}
                                  className="rounded"
                                />
                                <span className="text-sm capitalize">{method}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">{selectedQuarter} Observations</label>
                          {editMode ? (
                            <textarea
                              value={quarterData.observations || ''}
                              onChange={(e) => handleQuarterlyChange('observations', e.target.value)}
                              className="mt-1 w-full p-2 border rounded h-32"
                              placeholder={`Document ${selectedQuarter} observations...`}
                            />
                          ) : (
                            <div className="mt-1 prose prose-sm max-w-none">
                              <ReactMarkdown>{quarterData.observations || 'No observations'}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-500">Actual Score</label>
                            {editMode ? (
                              <select
                                value={quarterData.actualScore || 0}
                                onChange={(e) => handleQuarterlyChange('actualScore', Number(e.target.value))}
                                className="mt-1 w-full p-2 border rounded"
                              >
                                {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="mt-1 text-lg font-bold">{quarterData.actualScore || 0}</p>
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-500">Target Score</label>
                            {editMode ? (
                              <select
                                value={quarterData.targetScore || 0}
                                onChange={(e) => handleQuarterlyChange('targetScore', Number(e.target.value))}
                                className="mt-1 w-full p-2 border rounded"
                              >
                                {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="mt-1 text-lg font-bold">{quarterData.targetScore || 0}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Remediation Plan */}
                <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                  <h3 className="font-medium text-gray-700 border-b pb-2">Remediation Plan</h3>

                  <UserSelector
                    label="Remediation Owner"
                    selectedUsers={currentObservation.remediation?.ownerId}
                    onChange={(userId) => handleRemediationChange('ownerId', userId)}
                    disabled={!editMode}
                  />

                  <div>
                    <label className="text-sm font-medium text-gray-500">Action Plan</label>
                    {editMode ? (
                      <textarea
                        value={currentObservation.remediation?.actionPlan || ''}
                        onChange={(e) => handleRemediationChange('actionPlan', e.target.value)}
                        className="mt-1 w-full p-2 border rounded h-24"
                        placeholder="Document remediation actions..."
                      />
                    ) : (
                      <div className="mt-1 prose prose-sm max-w-none">
                        <ReactMarkdown>{currentObservation.remediation?.actionPlan || 'No action plan'}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Due Date</label>
                    {editMode ? (
                      <input
                        type="date"
                        value={currentObservation.remediation?.dueDate || ''}
                        onChange={(e) => handleRemediationChange('dueDate', e.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                      />
                    ) : (
                      <p className="mt-1">{currentObservation.remediation?.dueDate || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileSearch size={48} className="mb-4 opacity-50" />
                <p>Select an item to assess</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {view === 'list' && renderListView()}
      {view === 'scope' && currentAssessment && renderScopeView()}
      {view === 'assess' && currentAssessment && renderAssessView()}

      {/* New Assessment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold">New Assessment</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Assessment Name *</label>
                <input
                  type="text"
                  className="mt-1 w-full p-2 border rounded"
                  placeholder="e.g., Q1 2025 Security Assessment"
                  value={newAssessment.name}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 w-full p-2 border rounded h-20"
                  placeholder="Optional description..."
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Scope Type</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="scopeType"
                      value="controls"
                      checked={newAssessment.scopeType === 'controls'}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, scopeType: e.target.value }))}
                    />
                    <div>
                      <span className="font-medium">By Controls</span>
                      {controls.length > 0 && (
                        <span className="text-green-600 ml-2">(Recommended - {controls.length} available)</span>
                      )}
                      <p className="text-xs text-gray-500">Assess your organization's defined controls</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="scopeType"
                      value="requirements"
                      checked={newAssessment.scopeType === 'requirements'}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, scopeType: e.target.value }))}
                    />
                    <div>
                      <span className="font-medium">By Requirements</span>
                      <p className="text-xs text-gray-500">Assess directly against framework requirements</p>
                    </div>
                  </label>
                </div>
              </div>

              {newAssessment.scopeType === 'requirements' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Framework Filter (Optional)</label>
                  <select
                    className="mt-1 w-full p-2 border rounded"
                    value={newAssessment.frameworkFilter}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, frameworkFilter: e.target.value }))}
                  >
                    <option value="">All Frameworks</option>
                    {enabledFrameworks.map(fw => (
                      <option key={fw.id} value={fw.id}>{fw.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowNewModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={handleCreateAssessment}
              >
                Create Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;
