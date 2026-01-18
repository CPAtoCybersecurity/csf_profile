import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Search, Filter, Plus, Edit, Save, Trash2, Link, X,
  Upload, Download, Users, User, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// Components
import FrameworkBadge from '../components/FrameworkBadge';
import UserSelector from '../components/UserSelector';
import DropdownPortal from '../components/DropdownPortal';
import SortableHeader from '../components/SortableHeader';

// Stores
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';
import useUserStore from '../stores/userStore';

const UserControls = () => {
  // Store state
  const controls = useControlsStore((state) => state.controls);
  const createControl = useControlsStore((state) => state.createControl);
  const updateControl = useControlsStore((state) => state.updateControl);
  const deleteControl = useControlsStore((state) => state.deleteControl);
  const linkRequirement = useControlsStore((state) => state.linkRequirement);
  const unlinkRequirement = useControlsStore((state) => state.unlinkRequirement);
  const getNextControlId = useControlsStore((state) => state.getNextControlId);
  const exportControlsCSV = useControlsStore((state) => state.exportControlsCSV);
  const exportControlsJSON = useControlsStore((state) => state.exportControlsJSON);
  const importControlsCSV = useControlsStore((state) => state.importControlsCSV);

  const requirements = useRequirementsStore((state) => state.requirements);
  const getRequirement = useRequirementsStore((state) => state.getRequirement);

  const frameworks = useFrameworksStore((state) => state.frameworks);
  const getEnabledFrameworks = useFrameworksStore((state) => state.getEnabledFrameworks);

  const users = useUserStore((state) => state.users);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterFramework, setFilterFramework] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sort, setSort] = useState({ key: 'controlId', direction: 'asc' });

  const [selectedControlId, setSelectedControlId] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New control form state
  const [newControl, setNewControl] = useState({
    controlId: '',
    implementationDescription: '',
    ownerId: null,
    stakeholderIds: [],
    linkedRequirementIds: []
  });

  // Requirement picker state
  const [reqPickerOpen, setReqPickerOpen] = useState(false);
  const [reqPickerSearch, setReqPickerSearch] = useState('');
  const [reqPickerFramework, setReqPickerFramework] = useState('');
  const [reqPanelWidth, setReqPanelWidth] = useState(380);
  const [isResizingReqPanel, setIsResizingReqPanel] = useState(false);

  // Dropdown states
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const [frameworkDropdownOpen, setFrameworkDropdownOpen] = useState(false);

  // Refs
  const ownerTriggerRef = useRef(null);
  const frameworkTriggerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Resize handlers for requirement picker panel
  const handleReqPanelMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizingReqPanel(true);
  }, []);

  const handleReqPanelMouseMove = useCallback((e) => {
    if (!isResizingReqPanel) return;
    const newWidth = window.innerWidth - e.clientX;
    setReqPanelWidth(Math.max(320, Math.min(800, newWidth)));
  }, [isResizingReqPanel]);

  const handleReqPanelMouseUp = useCallback(() => {
    setIsResizingReqPanel(false);
  }, []);

  // Add/remove event listeners for resize
  useEffect(() => {
    if (isResizingReqPanel) {
      document.addEventListener('mousemove', handleReqPanelMouseMove);
      document.addEventListener('mouseup', handleReqPanelMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleReqPanelMouseMove);
      document.removeEventListener('mouseup', handleReqPanelMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingReqPanel, handleReqPanelMouseMove, handleReqPanelMouseUp]);

  // Get user name helper
  const getUserName = useCallback((userId) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  }, [users]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...controls];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.controlId?.toLowerCase().includes(search) ||
        c.implementationDescription?.toLowerCase().includes(search)
      );
    }

    if (filterOwner) {
      result = result.filter(c => c.ownerId === filterOwner);
    }

    if (filterFramework) {
      // Filter controls that have linked requirements from this framework
      result = result.filter(c =>
        (c.linkedRequirementIds || []).some(reqId => {
          const req = getRequirement(reqId);
          return req && req.frameworkId === filterFramework;
        })
      );
    }

    result.sort((a, b) => {
      const aVal = a[sort.key] || '';
      const bVal = b[sort.key] || '';
      const comparison = String(aVal).localeCompare(String(bVal));
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [controls, searchTerm, filterOwner, filterFramework, sort, getRequirement]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Get current control
  const currentControl = useMemo(() => {
    if (isCreating) return newControl;
    return controls.find(c => c.controlId === selectedControlId);
  }, [controls, selectedControlId, isCreating, newControl]);

  // Get linked requirements for current control
  const linkedRequirements = useMemo(() => {
    if (!currentControl) return [];
    return (currentControl.linkedRequirementIds || [])
      .map(id => getRequirement(id))
      .filter(Boolean);
  }, [currentControl, getRequirement]);

  // Filtered requirements for picker
  const filteredRequirements = useMemo(() => {
    let reqs = requirements;

    if (reqPickerFramework) {
      reqs = reqs.filter(r => r.frameworkId === reqPickerFramework);
    }

    if (reqPickerSearch) {
      const search = reqPickerSearch.toLowerCase();
      reqs = reqs.filter(r =>
        r.id?.toLowerCase().includes(search) ||
        r.subcategoryId?.toLowerCase().includes(search) ||
        r.function?.toLowerCase().includes(search) ||
        r.category?.toLowerCase().includes(search)
      );
    }

    // Exclude already linked requirements
    if (currentControl) {
      const linkedIds = currentControl.linkedRequirementIds || [];
      reqs = reqs.filter(r => !linkedIds.includes(r.id));
    }

    return reqs.slice(0, 50); // Limit for performance
  }, [requirements, reqPickerFramework, reqPickerSearch, currentControl]);

  // Handlers
  const handleSort = useCallback((key) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleSelectControl = useCallback((control) => {
    setSelectedControlId(control.controlId);
    setDetailPanelOpen(true);
    setEditMode(false);
    setIsCreating(false);
  }, []);

  const handleNewControl = useCallback(() => {
    setIsCreating(true);
    setNewControl({
      controlId: getNextControlId(),
      implementationDescription: '',
      ownerId: null,
      stakeholderIds: [],
      linkedRequirementIds: []
    });
    setDetailPanelOpen(true);
    setEditMode(true);
  }, [getNextControlId]);

  const handleSaveNewControl = useCallback(() => {
    if (!newControl.controlId) {
      toast.error('Control ID is required');
      return;
    }

    const created = createControl(newControl);
    setSelectedControlId(created.controlId);
    setIsCreating(false);
    setEditMode(false);
    toast.success(`Control ${created.controlId} created`);
  }, [newControl, createControl]);

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setDetailPanelOpen(false);
    setEditMode(false);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    if (isCreating) {
      setNewControl(prev => ({ ...prev, [field]: value }));
    } else if (selectedControlId) {
      updateControl(selectedControlId, { [field]: value });
    }
  }, [isCreating, selectedControlId, updateControl]);

  const handleDeleteControl = useCallback(() => {
    if (!selectedControlId) return;
    if (window.confirm(`Delete control ${selectedControlId}?`)) {
      deleteControl(selectedControlId);
      setSelectedControlId(null);
      setDetailPanelOpen(false);
      toast.success('Control deleted');
    }
  }, [selectedControlId, deleteControl]);

  const handleLinkRequirement = useCallback((reqId) => {
    if (isCreating) {
      setNewControl(prev => ({
        ...prev,
        linkedRequirementIds: [...(prev.linkedRequirementIds || []), reqId]
      }));
    } else if (selectedControlId) {
      linkRequirement(selectedControlId, reqId);
    }
    setReqPickerOpen(false);
    setReqPickerSearch('');
  }, [isCreating, selectedControlId, linkRequirement]);

  const handleUnlinkRequirement = useCallback((reqId) => {
    if (isCreating) {
      setNewControl(prev => ({
        ...prev,
        linkedRequirementIds: (prev.linkedRequirementIds || []).filter(id => id !== reqId)
      }));
    } else if (selectedControlId) {
      unlinkRequirement(selectedControlId, reqId);
    }
  }, [isCreating, selectedControlId, unlinkRequirement]);

  const handleExport = useCallback(() => {
    exportControlsCSV(useUserStore);
    toast.success('Controls exported');
  }, [exportControlsCSV]);

  const handleExportJSON = useCallback(() => {
    exportControlsJSON(useUserStore);
    toast.success('Controls exported as JSON');
  }, [exportControlsJSON]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importControlsCSV(text, useUserStore);
      toast.success(`Imported ${count} controls`);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }

    e.target.value = '';
  }, [importControlsCSV]);

  const handleDownloadTemplate = useCallback(() => {
    const templateData = [
      {
        'Control ID': 'CTL-001',
        'Control Implementation Description': 'Example control description',
        'Control Owner ID': 'Owner Name <owner@example.com>',
        'Stakeholder IDs': 'Person One <person1@example.com>; Person Two <person2@example.com>',
        'Linked Requirements': 'GV.OC-01-01; GV.OC-01-02'
      }
    ];

    const headers = ['Control ID', 'Control Implementation Description', 'Control Owner ID', 'Stakeholder IDs', 'Linked Requirements'];
    const csv = [
      headers.join(','),
      templateData.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')).join('\n')
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'controls_template.csv';
    link.click();
    toast.success('Template downloaded');
  }, []);

  const enabledFrameworks = useMemo(() => getEnabledFrameworks(), [frameworks]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 p-4 flex flex-wrap items-center gap-4 border-b relative z-50">
        {/* Search */}
        <div className="relative w-48">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-8 pr-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Search controls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Owner filter */}
        <div className="w-40">
          <div
            ref={ownerTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setOwnerDropdownOpen(!ownerDropdownOpen)}
          >
            <span className="truncate">
              {filterOwner ? getUserName(filterOwner) : 'All Owners'}
            </span>
            <Filter size={16} className="text-gray-500 flex-shrink-0" />
          </div>
          <DropdownPortal
            isOpen={ownerDropdownOpen}
            onClose={() => setOwnerDropdownOpen(false)}
            triggerRef={ownerTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="radio"
                  className="mr-2"
                  checked={filterOwner === ''}
                  onChange={() => {
                    setFilterOwner('');
                    setOwnerDropdownOpen(false);
                  }}
                />
                <span>All Owners</span>
              </label>
              {users.map((user) => (
                <label key={user.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={filterOwner === user.id}
                    onChange={() => {
                      setFilterOwner(user.id);
                      setOwnerDropdownOpen(false);
                    }}
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* Framework filter (filters by linked requirements) */}
        <div className="w-40">
          <div
            ref={frameworkTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setFrameworkDropdownOpen(!frameworkDropdownOpen)}
          >
            <span className="truncate">
              {filterFramework
                ? enabledFrameworks.find(f => f.id === filterFramework)?.shortName
                : 'All Frameworks'}
            </span>
            <Filter size={16} className="text-gray-500 flex-shrink-0" />
          </div>
          <DropdownPortal
            isOpen={frameworkDropdownOpen}
            onClose={() => setFrameworkDropdownOpen(false)}
            triggerRef={frameworkTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="radio"
                  className="mr-2"
                  checked={filterFramework === ''}
                  onChange={() => {
                    setFilterFramework('');
                    setFrameworkDropdownOpen(false);
                  }}
                />
                <span>All Frameworks</span>
              </label>
              {enabledFrameworks.map((fw) => (
                <label key={fw.id} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={filterFramework === fw.id}
                    onChange={() => {
                      setFilterFramework(fw.id);
                      setFrameworkDropdownOpen(false);
                    }}
                  />
                  <FrameworkBadge frameworkId={fw.id} />
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            onClick={handleNewControl}
          >
            <Plus size={16} />
            New Control
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
            title="Import controls from CSV"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            onClick={handleExport}
            title="Export controls as CSV"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            onClick={handleExportJSON}
            title="Export controls as JSON"
          >
            <Download size={16} />
            Export JSON
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

      <div className="flex flex-1 min-h-0 relative z-0">
        {/* Table */}
        <div className={`${detailPanelOpen ? 'w-2/3' : 'w-full'} overflow-auto transition-all duration-300`}>
          {controls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-center px-4">
              <Users size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No controls defined</p>
              <p className="text-sm mt-2">Click "New Control" to create a control or "Import" to import from CSV</p>
              <p className="text-sm mt-4 text-gray-400 dark:text-gray-500 leading-relaxed">
                There are two options for creating assessments: by <span className="font-medium text-gray-500 dark:text-gray-400">Requirement</span> or by <span className="font-medium text-gray-500 dark:text-gray-400">Control</span>.
                Typically, assessment by requirement is recommended for CSF, ISO 27001, and similar frameworks/standards, with the organization filling out an Implementation Description for each requirement.
                Use controls for SOC 2 or frameworks where many requirements link to a single control.
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <SortableHeader label="Control ID" sortKey="controlId" currentSort={sort} onSort={handleSort} />
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Implementation Description
                  </th>
                  <SortableHeader label="Control Owner" sortKey="ownerId" currentSort={sort} onSort={handleSort} />
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stakeholder(s)
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linked Requirements
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((control) => (
                  <tr
                    key={control.controlId}
                    className={`hover:bg-blue-50 cursor-pointer ${
                      selectedControlId === control.controlId ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleSelectControl(control)}
                  >
                    <td className="p-3 text-sm font-medium font-mono">{control.controlId}</td>
                    <td className="p-3 text-sm">
                      <div className="max-w-md line-clamp-2 text-gray-600">
                        {control.implementationDescription || 'No description'}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span>{getUserName(control.ownerId)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {(control.stakeholderIds || []).length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-gray-400" />
                          <span>{control.stakeholderIds.length} stakeholder(s)</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {(control.linkedRequirementIds || []).slice(0, 3).map(reqId => {
                          const req = getRequirement(reqId);
                          return req ? (
                            <span key={reqId} className="inline-flex items-center">
                              <FrameworkBadge frameworkId={req.frameworkId} size="xs" />
                              <span className="ml-1 text-xs">{req.subcategoryId || req.id}</span>
                            </span>
                          ) : null;
                        })}
                        {(control.linkedRequirementIds || []).length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{control.linkedRequirementIds.length - 3} more
                          </span>
                        )}
                        {(control.linkedRequirementIds || []).length === 0 && (
                          <span className="text-gray-400">No requirements linked</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {controls.length > 0 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border-t">
              <div className="flex items-center">
                <p className="text-sm text-gray-700 mr-4">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>{' '}
                  of <span className="font-medium">{filteredData.length}</span> controls
                </p>

                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-2">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(e.target.value === 'All' ? filteredData.length : Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border rounded p-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value="All">All</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-md">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {detailPanelOpen && (
          <div className="w-1/3 overflow-auto p-4 bg-gray-50 border-l">
            {currentControl ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold font-mono">{currentControl.controlId}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailPanelOpen(false)}
                      className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                    {!isCreating && (
                      <>
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
                      </>
                    )}
                    {isCreating && (
                      <>
                        <button
                          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded-md"
                          onClick={handleCancelCreate}
                        >
                          Cancel
                        </button>
                        <button
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md"
                          onClick={handleSaveNewControl}
                        >
                          <Save size={16} />
                          Create
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Control Details */}
                <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
                  {/* Control ID */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Control ID</label>
                    {editMode || isCreating ? (
                      <input
                        type="text"
                        value={currentControl.controlId}
                        onChange={(e) => handleFieldChange('controlId', e.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                        disabled={!isCreating} // Can only edit ID when creating
                      />
                    ) : (
                      <p className="mt-1 font-mono">{currentControl.controlId}</p>
                    )}
                  </div>

                  {/* Implementation Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Control Implementation Description</label>
                    {editMode || isCreating ? (
                      <textarea
                        value={currentControl.implementationDescription || ''}
                        onChange={(e) => handleFieldChange('implementationDescription', e.target.value)}
                        className="mt-1 w-full p-2 border rounded h-32"
                        placeholder="Describe how this control is implemented..."
                      />
                    ) : (
                      <div className="mt-1 prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {currentControl.implementationDescription || 'No description'}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Control Owner */}
                  <UserSelector
                    label="Control Owner"
                    selectedUsers={currentControl.ownerId}
                    onChange={(userId) => handleFieldChange('ownerId', userId)}
                    disabled={!editMode && !isCreating}
                  />

                  {/* Stakeholders */}
                  <UserSelector
                    label="Stakeholder(s)"
                    selectedUsers={currentControl.stakeholderIds || []}
                    onChange={(userIds) => handleFieldChange('stakeholderIds', userIds)}
                    multiple={true}
                    disabled={!editMode && !isCreating}
                  />
                </div>

                {/* Linked Requirements */}
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-700">Linked Requirements</h3>
                    {(editMode || isCreating) && (
                      <button
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        onClick={() => setReqPickerOpen(true)}
                      >
                        <Link size={14} />
                        Link Requirement
                      </button>
                    )}
                  </div>

                  {linkedRequirements.length === 0 ? (
                    <p className="text-gray-500 text-sm">No requirements linked</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedRequirements.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FrameworkBadge frameworkId={req.frameworkId} size="xs" />
                            <div>
                              <span className="font-medium text-sm">{req.subcategoryId || req.id}</span>
                              <p className="text-xs text-gray-500 line-clamp-1">{req.category}</p>
                            </div>
                          </div>
                          {(editMode || isCreating) && (
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleUnlinkRequirement(req.id)}
                              title="Unlink requirement"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                {!isCreating && editMode && (
                  <button
                    className="flex items-center gap-2 text-red-600 hover:text-red-800"
                    onClick={handleDeleteControl}
                  >
                    <Trash2 size={16} />
                    Delete Control
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ChevronRight size={48} className="mb-4 opacity-50" />
                <p>Select a control to view details</p>
              </div>
            )}
          </div>
        )}

        {/* Requirement Picker Side Panel (Expandable) */}
        {reqPickerOpen && (
          <div
            style={{
              width: `${reqPanelWidth}px`,
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
            }}
            className="flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            {/* Resize Handle */}
            <div
              onMouseDown={handleReqPanelMouseDown}
              style={{
                position: 'absolute',
                left: '-4px',
                top: 0,
                bottom: 0,
                width: '8px',
                cursor: 'col-resize',
                zIndex: 10
              }}
              className={`transition-colors ${
                isResizingReqPanel ? 'bg-blue-500' : 'bg-gray-300 hover:bg-blue-400 dark:bg-gray-500 dark:hover:bg-blue-500'
              }`}
              title="Drag to resize"
            />

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
              <h3 className="text-sm font-medium text-gray-700 dark:text-white">Link Requirement</h3>
              <button
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={() => {
                  setReqPickerOpen(false);
                  setReqPickerSearch('');
                }}
                title="Close panel"
              >
                <X size={16} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Search requirements..."
                  value={reqPickerSearch}
                  onChange={(e) => setReqPickerSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={reqPickerFramework}
                onChange={(e) => setReqPickerFramework(e.target.value)}
              >
                <option value="">All Frameworks</option>
                {enabledFrameworks.map(fw => (
                  <option key={fw.id} value={fw.id}>{fw.shortName}</option>
                ))}
              </select>
            </div>

            {/* Requirements List */}
            <div className="flex-1 overflow-auto min-h-0">
              {filteredRequirements.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No requirements found</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleLinkRequirement(req.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FrameworkBadge frameworkId={req.frameworkId} size="sm" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{req.subcategoryId || req.id}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{req.function} / {req.category}</div>
                        </div>
                      </div>
                      <Plus size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserControls;
