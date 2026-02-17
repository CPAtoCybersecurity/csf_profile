import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Search, Filter, Upload, Download, Link2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import FrameworkBadge from '../components/FrameworkBadge';
import CSFBadge, { SubcategoryBadge } from '../components/CSFBadge';
import DropdownPortal from '../components/DropdownPortal';
import SortableHeader from '../components/SortableHeader';
import RequirementDetailPanel from '../components/RequirementDetailPanel';
import { SkeletonTable } from '../components/SkeletonLoader';
import { EmptySearchResults, EmptyTableState } from '../components/EmptyState';
import { UserAvatar } from '../components/UserAvatar';
import { ArtifactBadge, FindingBadge, BadgeGroup } from '../components/BadgeSystem';
import { RowCheckbox, RowNumber, HeaderCheckbox } from '../components/RowHoverActions';
import { FilterChip } from '../components/FilterBar';

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
  const selectedItemIds = useUIStore((state) => state.selectedItemIds);
  const toggleItemSelection = useUIStore((state) => state.toggleItemSelection);
  const selectAllItems = useUIStore((state) => state.selectAllItems);
  const clearSelection = useUIStore((state) => state.clearSelection);

  // Helper: Get user name by ID
  const getUserName = useCallback((userId) => {
    if (!userId) return '';
    const user = users.find(u => u.id === userId);
    return user?.name || '';
  }, [users]);

  // Helper: Get control data for a requirement (pulls from linked Controls)
  const getControlDataForRequirement = useCallback((requirementId) => {
    const linkedControls = getControlsByRequirement(requirementId);
    if (linkedControls.length === 0) {
      const matchingControl = controls.find(c => c.controlId === requirementId);
      if (matchingControl) {
        return {
          controlId: matchingControl.controlId,
          implementationDescription: matchingControl.implementationDescription || '',
          controlOwner: getUserName(matchingControl.ownerId),
          ownerId: matchingControl.ownerId,
          stakeholders: (matchingControl.stakeholderIds || []).map(id => getUserName(id)).filter(Boolean).join(', '),
          artifacts: getArtifactsByControl(matchingControl.controlId),
          findings: getFindingsByControl(matchingControl.controlId),
          controlEvaluationBackLink: matchingControl.controlEvaluationBackLink || ''
        };
      }
      return null;
    }
    const implDescriptions = linkedControls.map(c => c.implementationDescription).filter(Boolean);
    const owners = [...new Set(linkedControls.map(c => getUserName(c.ownerId)).filter(Boolean))];
    const ownerIds = [...new Set(linkedControls.map(c => c.ownerId).filter(Boolean))];
    const stakeholderIds = [...new Set(linkedControls.flatMap(c => c.stakeholderIds || []))];
    const controlIds = linkedControls.map(c => c.controlId);
    const allArtifacts = controlIds.flatMap(cid => getArtifactsByControl(cid));
    const allFindings = controlIds.flatMap(cid => getFindingsByControl(cid));
    const links = linkedControls.map(c => c.controlEvaluationBackLink).filter(Boolean);

    return {
      controlIds,
      implementationDescription: implDescriptions.join(' | '),
      controlOwner: owners.join(', '),
      ownerId: ownerIds[0],
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
  const [showRowNumbers, setShowRowNumbers] = useState(true);
  const [showCheckboxes, setShowCheckboxes] = useState(true);

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

  // Selection state
  const allCurrentItemsSelected = currentItems.length > 0 && currentItems.every(item => selectedItemIds.includes(item.id));
  const someCurrentItemsSelected = currentItems.some(item => selectedItemIds.includes(item.id));

  // Handlers
  const handleSort = useCallback((key) => {
    setSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allCurrentItemsSelected) {
      clearSelection();
    } else {
      selectAllItems(currentItems.map(item => item.id));
    }
  }, [allCurrentItemsSelected, currentItems, selectAllItems, clearSelection]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    e.target.value = '';
  }, [importRequirementsCSV, markFrameworkImported]);

  const handleExport = useCallback(() => {
    exportRequirementsCSV(filterFramework || null);
    toast.success('Requirements exported');
  }, [exportRequirementsCSV, filterFramework]);

  const handleSaveRequirement = useCallback((updatedRequirement) => {
    updateRequirement(updatedRequirement.id, { inScope: updatedRequirement.inScope });
    toast.success('Scope updated');
    setSelectedRequirement(updatedRequirement);
  }, [updateRequirement]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterFramework('');
    setFilterFunction('');
    setFilterCategory('');
  }, []);

  const handleRemoveFilter = useCallback((filterKey) => {
    switch (filterKey) {
      case 'framework':
        setFilterFramework('');
        setFilterFunction('');
        setFilterCategory('');
        break;
      case 'function':
        setFilterFunction('');
        setFilterCategory('');
        break;
      case 'category':
        setFilterCategory('');
        break;
      default:
        break;
    }
  }, []);

  // Active filters for chips
  const activeFilters = useMemo(() => {
    const filters = [];
    if (filterFramework) {
      const fw = enabledFrameworks.find(f => f.id === filterFramework);
      filters.push({
        key: 'framework',
        label: 'Framework',
        value: filterFramework,
        displayValue: fw?.shortName || filterFramework,
        color: 'blue'
      });
    }
    if (filterFunction) {
      filters.push({
        key: 'function',
        label: 'Function',
        value: filterFunction,
        displayValue: filterFunction,
        color: 'purple'
      });
    }
    if (filterCategory) {
      filters.push({
        key: 'category',
        label: 'Category',
        value: filterCategory,
        displayValue: filterCategory,
        color: 'orange'
      });
    }
    return filters;
  }, [filterFramework, filterFunction, filterCategory, enabledFrameworks]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 flex items-center gap-4 border-b">
          <div className="w-40 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-40 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-44 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex-grow" />
          <div className="w-24 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="w-24 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 overflow-auto">
          <SkeletonTable rows={10} columns={8} hasCheckbox={showCheckboxes} hasRowNumber={showRowNumbers} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-800 p-3 flex flex-wrap items-center gap-3 border-b border-gray-200 dark:border-gray-700 relative z-50">
        {/* Search */}
        <div className="relative w-40">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={14} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Framework filter */}
        <div className="w-40">
          <div
            ref={frameworkTriggerRef}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer flex items-center justify-between text-sm"
            onClick={() => setFrameworkDropdownOpen(!frameworkDropdownOpen)}
          >
            <span className="truncate">
              {filterFramework
                ? enabledFrameworks.find(f => f.id === filterFramework)?.shortName || filterFramework
                : 'All Frameworks'}
            </span>
            <Filter size={14} className="text-gray-400 flex-shrink-0" />
          </div>
          <DropdownPortal
            isOpen={frameworkDropdownOpen}
            onClose={() => setFrameworkDropdownOpen(false)}
            triggerRef={frameworkTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
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
                <label key={fw.id} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
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
        <div className="w-40">
          <div
            ref={functionTriggerRef}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer flex items-center justify-between text-sm"
            onClick={() => setFunctionDropdownOpen(!functionDropdownOpen)}
          >
            <span className="truncate">{filterFunction || 'All Functions'}</span>
            <Filter size={14} className="text-gray-400 flex-shrink-0" />
          </div>
          <DropdownPortal
            isOpen={functionDropdownOpen}
            onClose={() => setFunctionDropdownOpen(false)}
            triggerRef={functionTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
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
                <span>All Functions</span>
              </label>
              {functions.map((func) => (
                <label key={func} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
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
                  <CSFBadge functionName={func} size="xs" />
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* Category filter */}
        <div className="w-40">
          <div
            ref={categoryTriggerRef}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer flex items-center justify-between text-sm"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          >
            <span className="truncate">{filterCategory || 'All Categories'}</span>
            <Filter size={14} className="text-gray-400 flex-shrink-0" />
          </div>
          <DropdownPortal
            isOpen={categoryDropdownOpen}
            onClose={() => setCategoryDropdownOpen(false)}
            triggerRef={categoryTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
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
                <label key={cat} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
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

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <span className="text-xs text-gray-500 dark:text-gray-400">Active:</span>
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                value={filter.displayValue}
                onRemove={() => handleRemoveFilter(filter.key)}
                color={filter.color}
              />
            ))}
            {activeFilters.length > 1 && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
              </button>
            )}
          </div>
        )}

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
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
            onClick={handleImportClick}
            title="Import requirements from CSV"
          >
            <Upload size={14} />
            Import
          </button>
          <button
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg text-sm font-medium transition-colors"
            onClick={handleExport}
            title="Export requirements to CSV"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Selection info bar */}
      {selectedItemIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 flex items-center gap-4 border-b border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={clearSelection}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredData.length === 0 ? (
          requirements.length === 0 ? (
            <EmptyTableState
              entityName="requirements"
              onImport={handleImportClick}
            />
          ) : (
            <EmptySearchResults
              onClearFilters={handleClearFilters}
              searchTerm={searchTerm}
            />
          )
        ) : (
          <table className="min-w-full bg-white dark:bg-gray-900 border-collapse" style={{ borderSpacing: 0 }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                {/* Checkbox column */}
                {showCheckboxes && (
                  <th className="p-3 w-10 border-r border-gray-200 dark:border-gray-700">
                    <HeaderCheckbox
                      checked={allCurrentItemsSelected}
                      indeterminate={someCurrentItemsSelected && !allCurrentItemsSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {/* Row number column */}
                {showRowNumbers && (
                  <th className="p-3 w-12 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                    #
                  </th>
                )}
                <SortableHeader label="Requirement ID" sortKey="id" currentSort={sort} onSort={handleSort} className="w-28 border-r border-gray-200 dark:border-gray-700" />
                <SortableHeader label="Framework" sortKey="frameworkId" currentSort={sort} onSort={handleSort} className="w-28 border-r border-gray-200 dark:border-gray-700" />
                <SortableHeader label="CSF Function" sortKey="function" currentSort={sort} onSort={handleSort} className="w-28 border-r border-gray-200 dark:border-gray-700" />
                <SortableHeader label="Category" sortKey="category" currentSort={sort} onSort={handleSort} className="w-36 border-r border-gray-200 dark:border-gray-700" />
                <SortableHeader label="Subcategory" sortKey="subcategoryId" currentSort={sort} onSort={handleSort} className="w-28 border-r border-gray-200 dark:border-gray-700" />
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-48">Description</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-44 bg-blue-50/50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Control Owner</span>
                  </div>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-32 bg-blue-50/50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Artifacts</span>
                  </div>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32 bg-blue-50/50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} className="text-blue-500" />
                    <span>Findings</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((req, index) => {
                const controlData = getControlDataForRequirement(req.id);
                const isSelected = selectedItemIds.includes(req.id);
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequirement(req)}
                    className={`
                      border-b border-gray-200 dark:border-gray-700
                      transition-colors cursor-pointer
                      ${isSelected ? 'table-row-selected' : ''}
                      ${selectedRequirement?.id === req.id ? 'bg-blue-100 dark:bg-blue-900/40' : 'table-row-hover'}
                    `}
                  >
                    {/* Checkbox */}
                    {showCheckboxes && (
                      <td className="p-3 checkbox-cell border-r border-gray-200 dark:border-gray-700">
                        <RowCheckbox
                          checked={isSelected}
                          onChange={() => toggleItemSelection(req.id)}
                        />
                      </td>
                    )}
                    {/* Row number */}
                    {showRowNumbers && (
                      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
                        <RowNumber number={rowNumber} />
                      </td>
                    )}
                    {/* Requirement ID */}
                    <td className="p-3 text-sm border-r border-gray-200 dark:border-gray-700">
                      <SubcategoryBadge subcategoryId={req.id} size="sm" />
                    </td>
                    {/* Framework */}
                    <td className="p-3 text-sm border-r border-gray-200 dark:border-gray-700">
                      <FrameworkBadge frameworkId={req.frameworkId} size="xs" />
                    </td>
                    {/* CSF Function */}
                    <td className="p-3 text-sm border-r border-gray-200 dark:border-gray-700">
                      <CSFBadge functionName={req.function} size="xs" />
                    </td>
                    {/* Category Name */}
                    <td className="p-3 text-sm text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700">
                      <div className="line-clamp-2" title={req.category}>
                        {req.category || <span className="empty-value">Empty</span>}
                      </div>
                    </td>
                    {/* Subcategory ID */}
                    <td className="p-3 text-sm border-r border-gray-200 dark:border-gray-700">
                      <SubcategoryBadge subcategoryId={req.subcategoryId} size="xs" />
                    </td>
                    {/* Subcategory Description */}
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      <div className="line-clamp-2" title={req.subcategoryDescription}>
                        {req.subcategoryDescription || <span className="empty-value">Empty</span>}
                      </div>
                    </td>
                    {/* Control Owner (from Controls) */}
                    <td className="p-3 text-sm border-r border-gray-200 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/10">
                      {controlData?.controlOwner ? (
                        <UserAvatar name={controlData.controlOwner} size="sm" showName={true} />
                      ) : (
                        <span className="empty-value">Unassigned</span>
                      )}
                    </td>
                    {/* Artifacts (from Controls) */}
                    <td className="p-3 text-sm border-r border-gray-200 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/10">
                      {controlData?.artifacts && controlData.artifacts.length > 0 ? (
                        <BadgeGroup
                          badges={controlData.artifacts}
                          maxVisible={2}
                          renderBadge={(artifact, idx) => (
                            <ArtifactBadge
                              key={idx}
                              name={artifact.name}
                              artifactId={artifact.artifactId}
                              size="xs"
                            />
                          )}
                        />
                      ) : (
                        <span className="empty-value">None</span>
                      )}
                    </td>
                    {/* Findings (from Controls) */}
                    <td className="p-3 text-sm bg-blue-50/30 dark:bg-blue-900/10">
                      {controlData?.findings && controlData.findings.length > 0 ? (
                        <BadgeGroup
                          badges={controlData.findings}
                          maxVisible={2}
                          renderBadge={(finding, idx) => (
                            <FindingBadge
                              key={idx}
                              id={finding.id}
                              summary={finding.summary}
                              size="xs"
                            />
                          )}
                        />
                      ) : (
                        <span className="empty-value">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>{' '}
              of <span className="font-medium">{filteredData.length}</span>
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(e.target.value === 'All' ? filteredData.length : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 dark:border-gray-600 rounded p-1 text-sm bg-white dark:bg-gray-800"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Previous
            </button>

            <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">{currentPage}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">of {totalPages}</span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === totalPages
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
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
