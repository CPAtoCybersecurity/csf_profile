import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Search, Filter, Upload, Download, FileText, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import FrameworkBadge from '../components/FrameworkBadge';
import CSFBadge, { SubcategoryBadge } from '../components/CSFBadge';
import DropdownPortal from '../components/DropdownPortal';
import SortableHeader from '../components/SortableHeader';
import RequirementDetailPanel from '../components/RequirementDetailPanel';

// Stores
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';
import useControlsStore from '../stores/controlsStore';
import useArtifactStore from '../stores/artifactStore';
import useFindingsStore from '../stores/findingsStore';
import useUserStore from '../stores/userStore';
import useUIStore from '../stores/uiStore';

const Requirements = () => {
  // Store state
  const requirements = useRequirementsStore((state) => state.requirements);
  const loading = useRequirementsStore((state) => state.loading);
  const loadInitialData = useRequirementsStore((state) => state.loadInitialData);
  const importRequirementsCSV = useRequirementsStore((state) => state.importRequirementsCSV);
  const exportRequirementsCSV = useRequirementsStore((state) => state.exportRequirementsCSV);
  const updateRequirement = useRequirementsStore((state) => state.updateRequirement);

  const frameworks = useFrameworksStore((state) => state.frameworks);
  const getEnabledFrameworks = useFrameworksStore((state) => state.getEnabledFrameworks);
  const markFrameworkImported = useFrameworksStore((state) => state.markFrameworkImported);

  // Controls, artifacts, and findings for the detail panel and table display
  const controls = useControlsStore((state) => state.controls);
  const getControlsByRequirement = useControlsStore((state) => state.getControlsByRequirement);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const getArtifactsByControl = useArtifactStore((state) => state.getArtifactsByControl);
  const findings = useFindingsStore((state) => state.findings);
  const getFindingsByControl = useFindingsStore((state) => state.getFindingsByControl);
  const users = useUserStore((state) => state.users);

  // UI state
  const darkMode = useUIStore((state) => state.darkMode);

  // Helper: Get user name by ID
  const getUserName = useCallback((userId) => {
    if (!userId) return '';
    const user = users.find(u => u.id === userId);
    return user?.name || '';
  }, [users]);

  // Helper: Get control data for a requirement (pulls from linked Controls)
  // This enables display of control-owned fields (owner, implementation, artifacts, findings)
  // while keeping Requirements read-only
  const getControlDataForRequirement = useCallback((requirementId) => {
    const linkedControls = getControlsByRequirement(requirementId);
    if (linkedControls.length === 0) {
      // Fallback: check for control with matching ID (CSF default pattern)
      const matchingControl = controls.find(c => c.controlId === requirementId);
      if (matchingControl) {
        return {
          controlId: matchingControl.controlId,
          implementationDescription: matchingControl.implementationDescription || '',
          controlOwner: getUserName(matchingControl.ownerId),
          stakeholders: (matchingControl.stakeholderIds || []).map(id => getUserName(id)).filter(Boolean).join(', '),
          artifacts: getArtifactsByControl(matchingControl.controlId),
          findings: getFindingsByControl(matchingControl.controlId),
          controlEvaluationBackLink: matchingControl.controlEvaluationBackLink || ''
        };
      }
      return null;
    }
    // Aggregate data from all linked controls
    const implDescriptions = linkedControls.map(c => c.implementationDescription).filter(Boolean);
    const owners = [...new Set(linkedControls.map(c => getUserName(c.ownerId)).filter(Boolean))];
    const stakeholderIds = [...new Set(linkedControls.flatMap(c => c.stakeholderIds || []))];
    const controlIds = linkedControls.map(c => c.controlId);
    const allArtifacts = controlIds.flatMap(cid => getArtifactsByControl(cid));
    const allFindings = controlIds.flatMap(cid => getFindingsByControl(cid));
    const links = linkedControls.map(c => c.controlEvaluationBackLink).filter(Boolean);

    return {
      controlIds,
      implementationDescription: implDescriptions.join(' | '),
      controlOwner: owners.join(', '),
      stakeholders: stakeholderIds.map(id => getUserName(id)).filter(Boolean).join(', '),
      artifacts: allArtifacts,
      findings: allFindings,
      controlEvaluationBackLink: links[0] || ''
    };
  }, [controls, getControlsByRequirement, getArtifactsByControl, getFindingsByControl, getUserName]);

  // Local state
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFramework, setFilterFramework] = useState('');
  const [filterFunction, setFilterFunction] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sort, setSort] = useState({ key: 'id', direction: 'asc' });

  // Dropdown states
  const [frameworkDropdownOpen, setFrameworkDropdownOpen] = useState(false);
  const [functionDropdownOpen, setFunctionDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Refs for dropdowns
  const frameworkTriggerRef = useRef(null);
  const functionTriggerRef = useRef(null);
  const categoryTriggerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load data on mount if empty
  useEffect(() => {
    if (requirements.length === 0) {
      loadInitialData();
    }
  }, [requirements.length, loadInitialData]);

  // Get unique values for filters
  const enabledFrameworks = useMemo(() => getEnabledFrameworks(), [frameworks]);

  const functions = useMemo(() => {
    let reqs = requirements;
    if (filterFramework) {
      reqs = reqs.filter(r => r.frameworkId === filterFramework);
    }
    return [...new Set(reqs.map(r => r.function))].filter(Boolean).sort();
  }, [requirements, filterFramework]);

  const categories = useMemo(() => {
    let reqs = requirements;
    if (filterFramework) {
      reqs = reqs.filter(r => r.frameworkId === filterFramework);
    }
    if (filterFunction) {
      reqs = reqs.filter(r => r.function === filterFunction);
    }
    return [...new Set(reqs.map(r => r.category))].filter(Boolean).sort();
  }, [requirements, filterFramework, filterFunction]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...requirements];

    // Apply filters
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.id?.toLowerCase().includes(search) ||
        r.function?.toLowerCase().includes(search) ||
        r.category?.toLowerCase().includes(search) ||
        r.subcategoryId?.toLowerCase().includes(search) ||
        r.subcategoryDescription?.toLowerCase().includes(search) ||
        r.implementationExample?.toLowerCase().includes(search) ||
        r.controlOwner?.toLowerCase().includes(search) ||
        r.stakeholders?.toLowerCase().includes(search)
      );
    }

    if (filterFramework) {
      result = result.filter(r => r.frameworkId === filterFramework);
    }

    if (filterFunction) {
      result = result.filter(r => r.function === filterFunction);
    }

    if (filterCategory) {
      result = result.filter(r => r.category === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sort.key] || '';
      const bVal = b[sort.key] || '';
      const comparison = String(aVal).localeCompare(String(bVal));
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [requirements, searchTerm, filterFramework, filterFunction, filterCategory, sort]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFramework, filterFunction, filterCategory]);

  // Handlers
  const handleSort = useCallback((key) => {
    setSort(prev => ({
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

    // Prompt for framework selection
    const frameworkId = prompt(
      'Enter framework ID for import (e.g., nist-csf-2.0, soc2-2017, iso27001-2022):',
      'nist-csf-2.0'
    );

    if (!frameworkId) {
      toast.error('Import cancelled - no framework specified');
      return;
    }

    try {
      const text = await file.text();
      const count = await importRequirementsCSV(text, frameworkId);
      markFrameworkImported(frameworkId);
      toast.success(`Imported ${count} requirements for ${frameworkId}`);
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }

    // Reset file input
    e.target.value = '';
  }, [importRequirementsCSV, markFrameworkImported]);

  const handleExport = useCallback(() => {
    exportRequirementsCSV(filterFramework || null);
    toast.success('Requirements exported');
  }, [exportRequirementsCSV, filterFramework]);

  // Handle save requirement - Only inScope can be changed (requirements are read-only)
  const handleSaveRequirement = useCallback((updatedRequirement) => {
    // Only update the inScope field - requirements are read-only framework data
    updateRequirement(updatedRequirement.id, { inScope: updatedRequirement.inScope });
    toast.success('Scope updated');
    // Update selected requirement to reflect changes
    setSelectedRequirement(updatedRequirement);
  }, [updateRequirement]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">Loading requirements...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 p-4 flex flex-wrap items-center gap-4 border-b relative z-50">
        {/* Search */}
        <div className="relative w-40">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-8 pr-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Framework filter */}
        <div className="w-40">
          <div
            ref={frameworkTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setFrameworkDropdownOpen(!frameworkDropdownOpen)}
          >
            <span className="truncate">
              {filterFramework
                ? enabledFrameworks.find(f => f.id === filterFramework)?.shortName || filterFramework
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
                      setFilterFunction('');
                      setFilterCategory('');
                      setFrameworkDropdownOpen(false);
                    }}
                  />
                  <FrameworkBadge frameworkId={fw.id} />
                  <span className="ml-2">{fw.name}</span>
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* CSF Function filter */}
        <div className="w-44">
          <div
            ref={functionTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setFunctionDropdownOpen(!functionDropdownOpen)}
          >
            <span className="truncate">{filterFunction || 'All CSF Functions'}</span>
            <Filter size={16} className="text-gray-500 flex-shrink-0" />
          </div>
          <DropdownPortal
            isOpen={functionDropdownOpen}
            onClose={() => setFunctionDropdownOpen(false)}
            triggerRef={functionTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="radio"
                  className="mr-2"
                  checked={filterFunction === ''}
                  onChange={() => {
                    setFilterFunction('');
                    setFilterCategory('');
                    setFunctionDropdownOpen(false);
                  }}
                />
                <span>All CSF Functions</span>
              </label>
              {functions.map((func) => (
                <label key={func} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={filterFunction === func}
                    onChange={() => {
                      setFilterFunction(func);
                      setFilterCategory('');
                      setFunctionDropdownOpen(false);
                    }}
                  />
                  <span>{func}</span>
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* Category filter */}
        <div className="w-44">
          <div
            ref={categoryTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          >
            <span className="truncate">{filterCategory || 'All Categories'}</span>
            <Filter size={16} className="text-gray-500 flex-shrink-0" />
          </div>
          <DropdownPortal
            isOpen={categoryDropdownOpen}
            onClose={() => setCategoryDropdownOpen(false)}
            triggerRef={categoryTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="radio"
                  className="mr-2"
                  checked={filterCategory === ''}
                  onChange={() => {
                    setFilterCategory('');
                    setCategoryDropdownOpen(false);
                  }}
                />
                <span>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat} className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={filterCategory === cat}
                    onChange={() => {
                      setFilterCategory(cat);
                      setCategoryDropdownOpen(false);
                    }}
                  />
                  <span className="truncate">{cat}</span>
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Import/Export buttons */}
        <div className="flex gap-2">
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
            title="Import requirements from CSV"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            onClick={handleExport}
            title="Export requirements to CSV"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No requirements found</p>
            <p className="text-sm mt-2">Import framework requirements using the Import button</p>
          </div>
        ) : (
          <table className="min-w-full bg-white border-collapse" style={{ borderSpacing: 0 }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-300">
                <SortableHeader label="Requirement ID" sortKey="id" currentSort={sort} onSort={handleSort} className="w-32 border-r border-gray-200" />
                <SortableHeader label="Framework" sortKey="frameworkId" currentSort={sort} onSort={handleSort} className="w-36 border-r border-gray-200" />
                <SortableHeader label="CSF Function" sortKey="function" currentSort={sort} onSort={handleSort} className="w-32 border-r border-gray-200" />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-48">CSF Function Description</th>
                <SortableHeader label="Category Name" sortKey="category" currentSort={sort} onSort={handleSort} className="w-40 border-r border-gray-200" />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-48">Category Description</th>
                <SortableHeader label="Subcategory ID" sortKey="subcategoryId" currentSort={sort} onSort={handleSort} className="w-28 border-r border-gray-200" />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-48">Subcategory Description</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-48">Implementation Example</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-56">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Implementation Description</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case text-blue-500">(from Controls)</span>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Control Owner</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case text-blue-500">(from Controls)</span>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Stakeholders</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case text-blue-500">(from Controls)</span>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Artifacts</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case text-blue-500">(from Controls)</span>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 w-32">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Findings</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case text-blue-500">(from Controls)</span>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Evaluation Link</span>
                  </div>
                  <span className="text-[10px] font-normal normal-case text-blue-500">(from Controls)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((req, index) => (
                <tr
                  key={req.id}
                  onClick={() => setSelectedRequirement(req)}
                  className={`border-b border-gray-200 hover:bg-blue-50/50 transition-colors cursor-pointer ${
                    selectedRequirement?.id === req.id ? 'bg-blue-100 hover:bg-blue-100' : 'bg-white'
                  }`}
                >
                  {/* Requirement ID */}
                  <td className="p-3 text-sm border-r border-gray-200">
                    <SubcategoryBadge subcategoryId={req.id} size="sm" />
                  </td>
                  {/* Framework */}
                  <td className="p-3 text-sm border-r border-gray-200">
                    <FrameworkBadge frameworkId={req.frameworkId} />
                  </td>
                  {/* CSF Function */}
                  <td className="p-3 text-sm border-r border-gray-200">
                    <CSFBadge functionName={req.function} size="sm" />
                  </td>
                  {/* CSF Function Description */}
                  <td className="p-3 text-sm text-gray-600 border-r border-gray-200">
                    <div className="line-clamp-3" title={req.functionDescription}>
                      {req.functionDescription || '-'}
                    </div>
                  </td>
                  {/* Category Name */}
                  <td className="p-3 text-sm text-gray-700 border-r border-gray-200">
                    {req.category || '-'}
                  </td>
                  {/* Category Description */}
                  <td className="p-3 text-sm text-gray-600 border-r border-gray-200">
                    <div className="line-clamp-3" title={req.categoryDescription}>
                      {req.categoryDescription || '-'}
                    </div>
                  </td>
                  {/* Subcategory ID */}
                  <td className="p-3 text-sm border-r border-gray-200">
                    <SubcategoryBadge subcategoryId={req.subcategoryId} size="sm" />
                  </td>
                  {/* Subcategory Description */}
                  <td className="p-3 text-sm text-gray-600 border-r border-gray-200">
                    <div className="line-clamp-3" title={req.subcategoryDescription}>
                      {req.subcategoryDescription || '-'}
                    </div>
                  </td>
                  {/* Implementation Example */}
                  <td className="p-3 text-sm text-gray-600 border-r border-gray-200">
                    <div className="line-clamp-3" title={req.implementationExample}>
                      {req.implementationExample || '-'}
                    </div>
                  </td>
                  {/* Implementation Description (from Controls) */}
                  <td className="p-3 text-sm text-gray-600 border-r border-gray-200 bg-blue-50/30">
                    {(() => {
                      const controlData = getControlDataForRequirement(req.id);
                      // Fallback to deprecated field if no control data (for migration period)
                      const implDesc = controlData?.implementationDescription || req.implementationDescription || '';
                      return (
                        <div className="line-clamp-3" title={implDesc}>
                          {implDesc || '-'}
                        </div>
                      );
                    })()}
                  </td>
                  {/* Control Owner (from Controls) */}
                  <td className="p-3 text-sm border-r border-gray-200 bg-blue-50/30">
                    {(() => {
                      const controlData = getControlDataForRequirement(req.id);
                      // Fallback to deprecated field if no control data
                      const owner = controlData?.controlOwner || req.controlOwner || '';
                      return owner ? (
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: darkMode ? '#2563eb' : '#dbeafe',
                            color: darkMode ? '#ffffff' : '#1e40af'
                          }}
                        >
                          {owner}
                        </span>
                      ) : '-';
                    })()}
                  </td>
                  {/* Stakeholders (from Controls) */}
                  <td className="p-3 text-sm border-r border-gray-200 bg-blue-50/30">
                    {(() => {
                      const controlData = getControlDataForRequirement(req.id);
                      // Fallback to deprecated field if no control data
                      const stakeholders = controlData?.stakeholders || req.stakeholders || '';
                      return stakeholders ? (
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: darkMode ? '#9333ea' : '#f3e8ff',
                            color: darkMode ? '#ffffff' : '#6b21a8'
                          }}
                        >
                          {stakeholders}
                        </span>
                      ) : '-';
                    })()}
                  </td>
                  {/* Artifacts (from Controls) */}
                  <td className="p-3 text-sm border-r border-gray-200 bg-blue-50/30">
                    {(() => {
                      const controlData = getControlDataForRequirement(req.id);
                      // Control artifacts are objects from artifactStore
                      const controlArtifacts = controlData?.artifacts || [];
                      // Fallback: legacy string from requirement
                      const legacyArtifacts = req.artifacts ? req.artifacts.split(',').map(s => s.trim()).filter(Boolean) : [];

                      if (controlArtifacts.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {controlArtifacts.slice(0, 2).map((artifact, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs truncate max-w-[100px]"
                                style={{
                                  backgroundColor: darkMode ? '#16a34a' : '#dcfce7',
                                  color: darkMode ? '#ffffff' : '#166534'
                                }}
                                title={artifact.name}
                              >
                                {artifact.artifactId || artifact.name}
                              </span>
                            ))}
                            {controlArtifacts.length > 2 && (
                              <span className="text-xs text-gray-500">+{controlArtifacts.length - 2}</span>
                            )}
                          </div>
                        );
                      } else if (legacyArtifacts.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {legacyArtifacts.slice(0, 2).map((name, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs truncate max-w-[100px] opacity-70"
                                style={{
                                  backgroundColor: darkMode ? '#16a34a' : '#dcfce7',
                                  color: darkMode ? '#ffffff' : '#166534'
                                }}
                                title={`Legacy: ${name}`}
                              >
                                {name}
                              </span>
                            ))}
                            {legacyArtifacts.length > 2 && (
                              <span className="text-xs text-gray-500">+{legacyArtifacts.length - 2}</span>
                            )}
                          </div>
                        );
                      }
                      return '-';
                    })()}
                  </td>
                  {/* Findings (from Controls) */}
                  <td className="p-3 text-sm border-r border-gray-200 bg-blue-50/30">
                    {(() => {
                      const controlData = getControlDataForRequirement(req.id);
                      // Control findings are objects from findingsStore
                      const controlFindings = controlData?.findings || [];
                      // Fallback: legacy string from requirement
                      const legacyFindings = req.findings ? req.findings.split(',').map(s => s.trim()).filter(Boolean) : [];

                      if (controlFindings.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {controlFindings.slice(0, 2).map((finding, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: darkMode ? '#ea580c' : '#ffedd5',
                                  color: darkMode ? '#ffffff' : '#c2410c'
                                }}
                                title={finding.summary}
                              >
                                {finding.id}
                              </span>
                            ))}
                            {controlFindings.length > 2 && (
                              <span className="text-xs text-gray-500">+{controlFindings.length - 2}</span>
                            )}
                          </div>
                        );
                      } else if (legacyFindings.length > 0) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {legacyFindings.slice(0, 2).map((id, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs opacity-70"
                                style={{
                                  backgroundColor: darkMode ? '#ea580c' : '#ffedd5',
                                  color: darkMode ? '#ffffff' : '#c2410c'
                                }}
                                title={`Legacy: ${id}`}
                              >
                                {id}
                              </span>
                            ))}
                            {legacyFindings.length > 2 && (
                              <span className="text-xs text-gray-500">+{legacyFindings.length - 2}</span>
                            )}
                          </div>
                        );
                      }
                      return '-';
                    })()}
                  </td>
                  {/* Control Evaluation Back Link (from Controls) */}
                  <td className="p-3 text-sm bg-blue-50/30">
                    {(() => {
                      const controlData = getControlDataForRequirement(req.id);
                      const link = controlData?.controlEvaluationBackLink || req.controlEvaluationBackLink || '';
                      return link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs truncate block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link}
                        </a>
                      ) : '-';
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t">
          <div className="flex items-center">
            <p className="text-sm text-gray-700 mr-4">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>{' '}
              of <span className="font-medium">{filteredData.length}</span> requirements
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
                <option value={100}>100</option>
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
            <span className="text-gray-500">of {totalPages}</span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
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

      {/* Requirement Detail Panel */}
      {selectedRequirement && (
        <RequirementDetailPanel
          requirement={selectedRequirement}
          onClose={() => setSelectedRequirement(null)}
          onSave={handleSaveRequirement}
          controls={controls}
          artifacts={artifacts}
          findings={findings}
        />
      )}

    </div>
  );
};

export default Requirements;
