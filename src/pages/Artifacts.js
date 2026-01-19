import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Edit, Trash2, Save, X, Plus, Link as LinkIcon, Upload, Download, ChevronRight, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useCSFStore from '../stores/csfStore';
import useArtifactStore from '../stores/artifactStore';
import useUserStore from '../stores/userStore';
import useControlsStore from '../stores/controlsStore';
import useSort from '../hooks/useSort';
import { extractArtifactsFromProfile } from '../updateArtifactLinks';

const Artifacts = () => {
  const navigate = useNavigate();
  const data = useCSFStore((state) => state.data);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const setArtifacts = useArtifactStore((state) => state.setArtifacts);
  const addArtifact = useArtifactStore((state) => state.addArtifact);
  const updateArtifact = useArtifactStore((state) => state.updateArtifact);
  const deleteArtifact = useArtifactStore((state) => state.deleteArtifact);
  const users = useUserStore((state) => state.users);
  const getControlsByRequirement = useControlsStore((state) => state.getControlsByRequirement);

  const [formData, setFormData] = useState({
    id: null,
    artifactId: '',
    name: '',
    description: '',
    link: '',
    status: 'ACTIVE',
    assigneeId: null,
    reporterId: null,
    priority: 'Medium',
    linkedSubcategoryIds: []
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sorting
  const { sort, sortedData, handleSort } = useSort(artifacts);

  // Get linked controls for the selected artifact
  const linkedControls = useMemo(() => {
    if (!selectedArtifact?.linkedSubcategoryIds?.length) return [];
    const controlsSet = new Set();
    const controls = [];
    selectedArtifact.linkedSubcategoryIds.forEach(reqId => {
      const reqControls = getControlsByRequirement(reqId);
      reqControls.forEach(ctrl => {
        if (!controlsSet.has(ctrl.controlId)) {
          controlsSet.add(ctrl.controlId);
          controls.push(ctrl);
        }
      });
    });
    return controls;
  }, [selectedArtifact, getControlsByRequirement]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // File input ref for CSV import
  const fileInputRef = useRef(null);

  // Load artifacts from localStorage or profile data on component mount
  useEffect(() => {
    const storedArtifacts = localStorage.getItem('artifacts');
    const isFirstTimeDownload = !localStorage.getItem('hasDownloaded');

    if (storedArtifacts && !isFirstTimeDownload) {
      setArtifacts(JSON.parse(storedArtifacts));
    } else if (data && data.length > 0) {
      // Extract artifacts from profile data
      const extractedArtifacts = extractArtifactsFromProfile(data);
      if (extractedArtifacts.length > 0) {
        setArtifacts(extractedArtifacts);
      }
    }
  }, [data, setArtifacts]);

  // Handle CSV import - uses store's importArtifactsCSV (same as Settings Jira import)
  const handleImportCSV = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await useArtifactStore.getState().importArtifactsCSV(text);
      toast.success(`Imported ${count} artifacts`);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }

    event.target.value = '';
  }, []);

  // Handle CSV export - uses store's exportForJiraCSV (same as Settings Jira export)
  const handleExportCSV = useCallback(() => {
    try {
      useArtifactStore.getState().exportForJiraCSV();
      toast.success('Artifacts exported to CSV');
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    }
  }, []);

  // Extract all subcategory IDs from the data
  const subcategoryIds = data ? [...new Set(data.map(item => item.ID))].filter(Boolean).sort() : [];

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

  // Handle subcategory ID selection
  const handleSubcategoryIdChange = (subcategoryId) => {
    const updatedIds = [...formData.linkedSubcategoryIds];

    if (updatedIds.includes(subcategoryId)) {
      const index = updatedIds.indexOf(subcategoryId);
      updatedIds.splice(index, 1);
    } else {
      updatedIds.push(subcategoryId);
    }

    setFormData({
      ...formData,
      linkedSubcategoryIds: updatedIds
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editMode) {
      updateArtifact(formData.id, formData);
      setSelectedArtifact({ ...formData });
      toast.success('Artifact updated');
    } else {
      const newArtifact = {
        ...formData,
        artifactId: formData.artifactId || `AR-${artifacts.length + 1}`,
        status: formData.status || 'ACTIVE',
        priority: formData.priority || 'Medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addArtifact(newArtifact);
      toast.success('Artifact added');
    }

    setEditMode(false);
  };

  // Handle edit artifact
  const handleEdit = (artifact) => {
    setFormData({
      ...artifact,
      linkedSubcategoryIds: artifact.linkedSubcategoryIds || []
    });
    setEditMode(true);
    setSelectedArtifact(artifact);
  };

  // Handle delete artifact
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this artifact?')) {
      deleteArtifact(id);
      toast.success('Artifact deleted');

      if (selectedArtifact && selectedArtifact.id === id) {
        setSelectedArtifact(null);
        resetForm();
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      artifactId: '',
      name: '',
      description: '',
      link: '',
      status: 'ACTIVE',
      assigneeId: null,
      reporterId: null,
      priority: 'Medium',
      linkedSubcategoryIds: []
    });
    setEditMode(false);
    setErrors({});
    setDropdownOpen(false);
  };

  // Handle view artifact details
  const handleViewDetails = (artifact) => {
    setSelectedArtifact(artifact);
    setEditMode(false);
    setFormData({
      ...artifact,
      linkedSubcategoryIds: artifact.linkedSubcategoryIds || []
    });
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-white';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-white';
    }
  };

  // Get user by ID
  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header - Jira style */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Artifacts</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{artifacts.length} items</p>
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
              title="Import artifacts from CSV"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 py-2 px-3 rounded text-sm"
              title="Export artifacts to CSV"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => {
                resetForm();
                setSelectedArtifact(null);
                setEditMode(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
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
        <div className={`${selectedArtifact || editMode ? 'w-1/2' : 'w-full'} overflow-auto border-r dark:border-gray-700`}>
          {/* Column headers */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="w-8 flex-shrink-0"></div>
              <div className="w-56 flex-shrink-0">ID</div>
              <div className="flex-1 min-w-0">Summary</div>
              <div className="w-28 flex-shrink-0">Assignee</div>
              <div className="w-28 flex-shrink-0">Reporter</div>
              <div className="w-24 flex-shrink-0">Status</div>
              <div className="w-20 flex-shrink-0">Priority</div>
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {sortedData.length > 0 ? (
              sortedData.map((artifact) => {
                const assignee = getUserById(artifact.assigneeId);
                const reporter = getUserById(artifact.reporterId);

                return (
                  <div
                    key={artifact.id}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedArtifact?.id === artifact.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                    onClick={() => handleViewDetails(artifact)}
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
                    <div className="w-56 flex-shrink-0">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate block">
                        {artifact.artifactId || `AR-${artifact.id}`}
                      </span>
                    </div>

                    {/* Summary/Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{artifact.name}</p>
                    </div>

                    {/* Assignee */}
                    <div className="w-28 flex-shrink-0">
                      {assignee ? (
                        <div className="flex items-center gap-1.5" title={assignee.name}>
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {assignee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{assignee.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <User size={16} />
                          <span className="text-sm">Unassigned</span>
                        </div>
                      )}
                    </div>

                    {/* Reporter */}
                    <div className="w-28 flex-shrink-0">
                      {reporter ? (
                        <div className="flex items-center gap-1.5" title={reporter.name}>
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium">
                            {reporter.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{reporter.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-24 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(artifact.status || 'ACTIVE')}`}>
                        {artifact.status || 'ACTIVE'}
                        <ChevronRight size={12} className="ml-1 rotate-90" />
                      </span>
                    </div>

                    {/* Priority */}
                    <div className="w-20 flex-shrink-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{artifact.priority || 'Medium'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No artifacts found.</p>
                <p className="text-sm mt-1">Click "Create" to add a new artifact.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right - Detail Panel */}
        {(selectedArtifact || editMode) && (
          <div className="w-1/2 overflow-auto bg-white dark:bg-gray-900">
            <div className="p-6">
              {/* Detail Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {editMode && !selectedArtifact ? 'New Artifact' : formData.artifactId || `AR-${formData.id}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!editMode && selectedArtifact && (
                    <>
                      <button
                        onClick={() => setEditMode(true)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedArtifact.id)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedArtifact(null);
                      resetForm();
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="mb-6">
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 ${errors.name ? 'border-red-500' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500'} pb-1 focus:outline-none`}
                    placeholder="Enter artifact name"
                  />
                ) : (
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedArtifact?.name}</h1>
                )}
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-3 mb-6">
                {editMode ? (
                  <select
                    name="status"
                    value={formData.status || 'ACTIVE'}
                    onChange={handleChange}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${getStatusStyle(formData.status || 'ACTIVE')} border-none cursor-pointer`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${getStatusStyle(selectedArtifact?.status || 'ACTIVE')}`}>
                    {selectedArtifact?.status || 'ACTIVE'}
                    <ChevronRight size={14} className="ml-1 rotate-90" />
                  </span>
                )}
              </div>

              {/* Key details section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <ChevronRight size={16} className="rotate-90" />
                  Key details
                </h3>

                {/* Link */}
                <div className="mb-4">
                  <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Link</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="link"
                      value={formData.link || ''}
                      onChange={handleChange}
                      className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      placeholder="https://..."
                    />
                  ) : selectedArtifact?.link ? (
                    <a
                      href={selectedArtifact.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <LinkIcon size={14} />
                      {selectedArtifact.link}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No link provided</p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Description</label>
                  {editMode ? (
                    <textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedArtifact?.description || 'Add a description...'}
                    </p>
                  )}
                </div>

                {/* Linked Subcategories */}
                <div className="mb-4">
                  <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Linked Subcategories</label>
                  {editMode ? (
                    <div className="relative" ref={dropdownRef}>
                      <div
                        className="w-full p-2 border dark:border-gray-600 rounded flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer bg-white dark:bg-gray-700"
                        onClick={() => setDropdownOpen(prev => !prev)}
                      >
                        {formData.linkedSubcategoryIds?.length > 0 ? (
                          formData.linkedSubcategoryIds.map(id => (
                            <span key={id} className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs flex items-center gap-1">
                              {id}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSubcategoryIdChange(id);
                                }}
                                className="text-blue-100 hover:text-white"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">Select subcategories</span>
                        )}
                      </div>
                      {dropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-600 rounded shadow-lg max-h-40 overflow-y-auto">
                          {subcategoryIds.length > 0 ? (
                            subcategoryIds.map(id => (
                              <div
                                key={id}
                                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm ${
                                  formData.linkedSubcategoryIds?.includes(id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                }`}
                                onClick={() => handleSubcategoryIdChange(id)}
                              >
                                {id}
                              </div>
                            ))
                          ) : (
                            <p className="p-2 text-gray-500 text-sm">No subcategories available</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {selectedArtifact?.linkedSubcategoryIds?.length > 0 ? (
                        selectedArtifact.linkedSubcategoryIds.map(id => (
                          <span key={id} className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs">
                            {id}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">No subcategories linked</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Linked Controls */}
                <div className="mb-4">
                  <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1 flex items-center gap-1">
                    <Shield size={14} />
                    Linked Controls
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {linkedControls.length > 0 ? (
                      linkedControls.map(ctrl => (
                        <button
                          key={ctrl.controlId}
                          onClick={() => navigate(`/controls?selected=${encodeURIComponent(ctrl.controlId)}`)}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs flex items-center gap-1 transition-colors"
                          title={ctrl.implementationDescription || 'View control'}
                        >
                          <Shield size={10} />
                          {ctrl.controlId}
                        </button>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">No controls linked to these requirements</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <ChevronRight size={16} className="rotate-90" />
                  Details
                </h3>

                <div className="space-y-4">
                  {/* Assignee */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Assignee</span>
                    {editMode ? (
                      <select
                        name="assigneeId"
                        value={formData.assigneeId || ''}
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
                        {getUserById(selectedArtifact?.assigneeId)?.name || 'Unassigned'}
                      </span>
                    )}
                  </div>

                  {/* Reporter */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Reporter</span>
                    {editMode ? (
                      <select
                        name="reporterId"
                        value={formData.reporterId || ''}
                        onChange={handleChange}
                        className="p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">None</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {getUserById(selectedArtifact?.reporterId)?.name || 'None'}
                      </span>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Priority</span>
                    {editMode ? (
                      <select
                        name="priority"
                        value={formData.priority || 'Medium'}
                        onChange={handleChange}
                        className="p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">{selectedArtifact?.priority || 'Medium'}</span>
                    )}
                  </div>

                  {/* Artifact ID (for new artifacts) */}
                  {editMode && !selectedArtifact && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Artifact ID</span>
                      <input
                        type="text"
                        name="artifactId"
                        value={formData.artifactId || ''}
                        onChange={handleChange}
                        className="p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white w-32"
                        placeholder={`AR-${artifacts.length + 1}`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Save/Cancel buttons for edit mode */}
              {editMode && (
                <div className="flex gap-2 mt-6 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
                  >
                    <Save size={16} />
                    {selectedArtifact ? 'Save Changes' : 'Create Artifact'}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedArtifact) {
                        setEditMode(false);
                        setFormData({
                          ...selectedArtifact,
                          linkedSubcategoryIds: selectedArtifact.linkedSubcategoryIds || []
                        });
                      } else {
                        setSelectedArtifact(null);
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

export default Artifacts;
