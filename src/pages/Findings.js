import React, { useState, useRef, useCallback } from 'react';
import { Edit, Trash2, Save, X, Plus, Upload, Download, ChevronRight, User, AlertTriangle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import useFindingsStore from '../stores/findingsStore';
import useUserStore from '../stores/userStore';
import useSort from '../hooks/useSort';

const Findings = () => {
  const findings = useFindingsStore((state) => state.findings);
  const createFinding = useFindingsStore((state) => state.createFinding);
  const updateFinding = useFindingsStore((state) => state.updateFinding);
  const deleteFinding = useFindingsStore((state) => state.deleteFinding);
  const importFindingsCSV = useFindingsStore((state) => state.importFindingsCSV);
  const exportFindingsCSV = useFindingsStore((state) => state.exportFindingsCSV);
  const users = useUserStore((state) => state.users);

  const [formData, setFormData] = useState({
    id: null,
    summary: '',
    description: '',
    complianceRequirement: '',
    rootCause: '',
    remediationActionPlan: '',
    remediationOwner: null,
    dueDate: '',
    status: 'Not Started',
    priority: 'Medium'
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFinding, setSelectedFinding] = useState(null);

  // Sorting
  const { sortedData } = useSort(findings);

  // File input ref for CSV import
  const fileInputRef = useRef(null);

  // Handle CSV import
  const handleImportCSV = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importFindingsCSV(text, useUserStore);
      toast.success(`Imported ${count} findings`);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }

    event.target.value = '';
  }, [importFindingsCSV]);

  // Handle CSV export
  const handleExportCSV = useCallback(() => {
    try {
      exportFindingsCSV(useUserStore);
      toast.success('Findings exported to CSV');
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    }
  }, [exportFindingsCSV]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editMode && selectedFinding) {
      updateFinding(selectedFinding.id, formData);
      setSelectedFinding({ ...selectedFinding, ...formData });
      toast.success('Finding updated');
    } else {
      const newFinding = createFinding(formData);
      toast.success('Finding created');
      setSelectedFinding(newFinding);
    }

    setEditMode(false);
  };

  // Handle edit finding
  const handleEdit = (finding) => {
    setFormData({
      ...finding
    });
    setEditMode(true);
    setSelectedFinding(finding);
  };

  // Handle delete finding
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this finding?')) {
      deleteFinding(id);
      toast.success('Finding deleted');

      if (selectedFinding && selectedFinding.id === id) {
        setSelectedFinding(null);
        resetForm();
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      summary: '',
      description: '',
      complianceRequirement: '',
      rootCause: '',
      remediationActionPlan: '',
      remediationOwner: null,
      dueDate: '',
      status: 'Not Started',
      priority: 'Medium'
    });
    setEditMode(false);
    setErrors({});
  };

  // Handle view finding details
  const handleViewDetails = (finding) => {
    setSelectedFinding(finding);
    setEditMode(false);
    setFormData({ ...finding });
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-600 dark:text-white';
      case 'Not Started':
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  // Get priority badge style
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-600 dark:text-white';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-600 dark:text-white';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white';
      case 'Low':
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  // Get user by ID
  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  // Check if finding is overdue
  const isOverdue = (finding) => {
    if (!finding.dueDate || finding.status === 'Resolved') return false;
    return new Date(finding.dueDate) < new Date();
  };

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle size={24} className="text-amber-500" />
              Findings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{findings.length} items</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportCSV}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-2 px-3 rounded text-sm"
              title="Import findings from CSV"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-2 px-3 rounded text-sm"
              title="Export findings to CSV"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => {
                resetForm();
                setSelectedFinding(null);
                setEditMode(true);
              }}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded text-sm"
            >
              <Plus size={16} />
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Main content - Two column layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left - Table */}
        <div className={`${selectedFinding || editMode ? 'w-1/2' : 'w-full'} overflow-auto border-r dark:border-gray-700`}>
          {/* Column headers */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="w-8 flex-shrink-0"></div>
              <div className="w-24 flex-shrink-0">ID</div>
              <div className="flex-1 min-w-0">Summary</div>
              <div className="w-24 flex-shrink-0">CSF Ref</div>
              <div className="w-24 flex-shrink-0">Owner</div>
              <div className="w-24 flex-shrink-0">Due Date</div>
              <div className="w-24 flex-shrink-0">Status</div>
              <div className="w-20 flex-shrink-0">Priority</div>
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {sortedData.length > 0 ? (
              sortedData.map((finding) => {
                const owner = getUserById(finding.remediationOwner);
                const overdue = isOverdue(finding);

                return (
                  <div
                    key={finding.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedFinding?.id === finding.id ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                    } ${overdue ? 'border-l-4 border-l-red-500' : ''}`}
                    onClick={() => handleViewDetails(finding)}
                  >
                    {/* Checkbox */}
                    <div className="w-8 flex-shrink-0">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* ID */}
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline truncate block">
                        {finding.jiraKey || finding.id}
                      </span>
                    </div>

                    {/* Summary */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{finding.summary}</p>
                    </div>

                    {/* CSF Reference */}
                    <div className="w-24 flex-shrink-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
                        {finding.complianceRequirement || '-'}
                      </span>
                    </div>

                    {/* Owner */}
                    <div className="w-24 flex-shrink-0">
                      {owner ? (
                        <div className="flex items-center gap-1.5" title={owner.name}>
                          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-medium">
                            {owner.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{owner.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <User size={16} />
                          <span className="text-sm">Unassigned</span>
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="w-24 flex-shrink-0">
                      <span className={`text-sm flex items-center gap-1 ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                        {overdue && <AlertTriangle size={12} />}
                        {formatDate(finding.dueDate)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="w-24 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(finding.status)}`}>
                        {finding.status}
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="w-20 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityStyle(finding.priority)}`}>
                        {finding.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No findings found.</p>
                <p className="text-sm mt-1">Click "Create" to add a new finding or import from CSV.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Detail Panel */}
        {(selectedFinding || editMode) && (
          <div className="w-1/2 overflow-auto bg-white dark:bg-gray-900">
            <div className="p-6">
              {/* Detail Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    {editMode && !selectedFinding ? 'New Finding' : formData.jiraKey || formData.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!editMode && selectedFinding && (
                    <>
                      <button
                        onClick={() => handleEdit(selectedFinding)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedFinding.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedFinding(null);
                      resetForm();
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                {editMode ? (
                  <input
                    type="text"
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    className={`w-full text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 ${errors.summary ? 'border-red-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-amber-500'} pb-1 focus:outline-none`}
                    placeholder="Enter finding summary"
                  />
                ) : (
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedFinding?.summary}</h1>
                )}
                {errors.summary && <p className="text-red-500 text-xs mt-1">{errors.summary}</p>}
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-3 mb-6">
                {editMode ? (
                  <>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${getStatusStyle(formData.status)} border-none cursor-pointer`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${getPriorityStyle(formData.priority)} border-none cursor-pointer`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </>
                ) : (
                  <>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${getStatusStyle(selectedFinding?.status)}`}>
                      {selectedFinding?.status}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${getPriorityStyle(selectedFinding?.priority)}`}>
                      {selectedFinding?.priority}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ChevronRight size={16} className="rotate-90" />
                  Description
                </h3>
                {editMode ? (
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the finding..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedFinding?.description || 'No description provided.'}
                  </p>
                )}
              </div>

              {/* Root Cause */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ChevronRight size={16} className="rotate-90" />
                  Root Cause
                </h3>
                {editMode ? (
                  <textarea
                    name="rootCause"
                    value={formData.rootCause || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="What is the root cause of this finding?"
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedFinding?.rootCause || 'No root cause documented.'}
                  </p>
                )}
              </div>

              {/* Remediation Action Plan */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <ChevronRight size={16} className="rotate-90" />
                  Remediation Action Plan
                </h3>
                {editMode ? (
                  <textarea
                    name="remediationActionPlan"
                    value={formData.remediationActionPlan || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="Who will do what by when?"
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedFinding?.remediationActionPlan || 'No remediation plan documented.'}
                  </p>
                )}
              </div>

              {/* Details section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <ChevronRight size={16} className="rotate-90" />
                  Details
                </h3>

                <div className="space-y-4">
                  {/* CSF Compliance Requirement */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">CSF Reference</span>
                    {editMode ? (
                      <input
                        type="text"
                        name="complianceRequirement"
                        value={formData.complianceRequirement || ''}
                        onChange={handleChange}
                        className="p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white w-32"
                        placeholder="e.g., DE.CM-01"
                      />
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedFinding?.complianceRequirement || '-'}
                      </span>
                    )}
                  </div>

                  {/* Remediation Owner */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Remediation Owner</span>
                    {editMode ? (
                      <select
                        name="remediationOwner"
                        value={formData.remediationOwner || ''}
                        onChange={handleChange}
                        className="p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getUserById(selectedFinding?.remediationOwner)?.name || 'Unassigned'}
                      </span>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar size={14} />
                      Due Date
                    </span>
                    {editMode ? (
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                        onChange={handleChange}
                        className="p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <span className={`text-sm ${isOverdue(selectedFinding) ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                        {formatDate(selectedFinding?.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* Created Date */}
                  {!editMode && selectedFinding && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Created</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(selectedFinding?.createdDate)}
                      </span>
                    </div>
                  )}

                  {/* Last Modified */}
                  {!editMode && selectedFinding && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Last Modified</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(selectedFinding?.lastModified)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Save/Cancel buttons for edit mode */}
              {editMode && (
                <div className="flex gap-2 mt-6 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded text-sm"
                  >
                    <Save size={16} />
                    {selectedFinding ? 'Save Changes' : 'Create Finding'}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedFinding) {
                        setEditMode(false);
                        setFormData({ ...selectedFinding });
                      } else {
                        setSelectedFinding(null);
                        resetForm();
                      }
                    }}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded text-sm"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Findings;
