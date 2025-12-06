import React, { useCallback } from 'react';
import {
  Search, Filter, Edit, Save, CheckCircle, XCircle,
  AlertTriangle, Download, Upload, X, ChevronLeft,
  FileText, FileDown
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import UserSelector from '../components/UserSelector';
import ArtifactSelector from '../components/ArtifactSelector';

// Hooks and stores
import { useCSFData } from '../hooks/useCSFData';
import { useFilters } from '../hooks/useFilters';
import useUIStore from '../stores/uiStore';
import useCSFStore from '../stores/csfStore';
import useUserStore from '../stores/userStore';

// Utils
import {
  generateExecutiveSummaryPDF,
  generateRemediationPriorityPDF,
  generateFilteredReportPDF
} from '../utils/pdfExport';

const Controls = () => {
  const { loading, error, importCSV, exportCSV, exportFilteredCSV, toggleInScope, updateItem } = useCSFData();
  const data = useCSFStore((state) => state.data);
  const users = useUserStore((state) => state.users);

  const {
    searchTerm,
    filterFunctions,
    filterCategories,
    filterInScope,
    currentPage,
    itemsPerPage,
    functions,
    categoryIds,
    filteredData,
    currentItems,
    totalPages,
    setSearchTerm,
    setFilterFunctions,
    setFilterCategories,
    setFilterInScope,
    setItemsPerPage,
    goToNextPage,
    goToPrevPage,
    toggleFunction,
    toggleCategory,
  } = useFilters();

  const {
    currentItemId,
    setCurrentItemId,
    editMode,
    setEditMode,
    detailPanelOpen,
    setDetailPanelOpen,
    functionDropdownOpen,
    setFunctionDropdownOpen,
    categoryDropdownOpen,
    setCategoryDropdownOpen,
    inScopeDropdownOpen,
    setInScopeDropdownOpen,
    selectedItemIds,
    toggleItemSelection,
    isItemSelected,
  } = useUIStore();

  // Get current item from data
  const currentItem = data.find(item => item.ID === currentItemId);

  // Handlers
  const handleSelectItem = useCallback((item) => {
    setCurrentItemId(item.ID);
    setEditMode(false);
  }, [setCurrentItemId, setEditMode]);

  const handleFieldChange = useCallback((field, value) => {
    if (currentItemId) {
      updateItem(currentItemId, { [field]: value });
    }
  }, [currentItemId, updateItem]);

  const handleToggleInScope = useCallback((item, e) => {
    e?.stopPropagation();
    toggleInScope(item.ID);
  }, [toggleInScope]);

  const handleRowClick = useCallback((item, e) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      toggleItemSelection(item.ID);
    } else {
      handleSelectItem(item);
    }
  }, [handleSelectItem, toggleItemSelection]);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete':
      case 'Completed':
        return 'text-green-600 dark:text-green-400';
      case 'In Progress':
        return 'text-blue-600 dark:text-blue-400';
      case 'Not Started':
        return 'text-gray-500 dark:text-gray-400';
      case 'Submitted':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  // Score color mapping
  const getScoreColor = (actual, desired) => {
    if (actual === desired) return 'text-green-600 dark:text-green-400';
    if (actual > desired) return 'text-blue-600 dark:text-blue-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold">Loading audit database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 flex flex-wrap items-center gap-4 border-b dark:border-gray-700">
        {/* Search */}
        <div className="relative w-32">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-8 pr-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Function filter */}
        <div className="flex-grow max-w-xs">
          <div className="relative">
            <div
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 cursor-pointer flex items-center justify-between"
              onClick={() => setFunctionDropdownOpen(!functionDropdownOpen)}
            >
              <span className="dark:text-white">
                {filterFunctions.length === 0 ? 'All Functions' : `${filterFunctions.length} selected`}
              </span>
              <Filter size={16} className="text-gray-500" />
            </div>
            {functionDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="p-2">
                  <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filterFunctions.length === 0}
                      onChange={() => setFilterFunctions([])}
                    />
                    <span className="dark:text-white">All Functions</span>
                  </label>
                  {functions.map((func) => (
                    <label key={func} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filterFunctions.includes(func)}
                        onChange={() => toggleFunction(func)}
                      />
                      <span className="dark:text-white">{func}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category ID filter */}
        <div className="flex-grow max-w-xs">
          <div className="relative">
            <div
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 cursor-pointer flex items-center justify-between"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              <span className="dark:text-white">
                {filterCategories.length === 0 ? 'All Category IDs' : `${filterCategories.length} selected`}
              </span>
              <Filter size={16} className="text-gray-500" />
            </div>
            {categoryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="p-2">
                  <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filterCategories.length === 0}
                      onChange={() => setFilterCategories([])}
                    />
                    <span className="dark:text-white">All Category IDs</span>
                  </label>
                  {categoryIds.map((categoryId) => (
                    <label key={categoryId} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filterCategories.includes(categoryId)}
                        onChange={() => toggleCategory(categoryId)}
                      />
                      <span className="dark:text-white">{categoryId}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* In Scope filter */}
        <div className="flex-grow max-w-xs">
          <div className="relative">
            <div
              className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 cursor-pointer flex items-center justify-between"
              onClick={() => setInScopeDropdownOpen(!inScopeDropdownOpen)}
            >
              <span className="dark:text-white">
                {filterInScope === '' ? 'All In Scope' : `In Scope: ${filterInScope}`}
              </span>
              <Filter size={16} className="text-gray-500" />
            </div>
            {inScopeDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg overflow-auto">
                <div className="p-2">
                  {['', 'Yes', 'No'].map((value) => (
                    <label key={value} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                      <input
                        type="radio"
                        className="mr-2"
                        checked={filterInScope === value}
                        onChange={() => setFilterInScope(value)}
                      />
                      <span className="dark:text-white">{value || 'All'}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Import/Export buttons */}
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            onClick={importCSV}
            title="Import CSV to overwrite database"
          >
            <Upload size={16} />
            Import CSV
          </button>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            onClick={exportCSV}
          >
            <Download size={16} />
            Export CSV
          </button>
          <div className="relative group">
            <button
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
            >
              <FileText size={16} />
              PDF Reports
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg hidden group-hover:block z-50">
              <button
                onClick={() => generateExecutiveSummaryPDF(data, users)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm"
              >
                Executive Summary
              </button>
              <button
                onClick={() => generateRemediationPriorityPDF(data, users)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm"
              >
                Remediation Priority
              </button>
              <button
                onClick={() => generateFilteredReportPDF(filteredData, users, `Filtered: ${filteredData.length} items`)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white text-sm"
              >
                Current Filter View
              </button>
            </div>
          </div>
          {filteredData.length !== data.length && (
            <button
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg"
              onClick={() => exportFilteredCSV(filteredData, 'CSF_Profile_Filtered')}
              title={`Export ${filteredData.length} filtered items`}
            >
              <FileDown size={16} />
              Export Filtered ({filteredData.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Data table */}
        <div className={`${detailPanelOpen ? 'w-2/3' : 'w-full'} overflow-auto ${detailPanelOpen ? 'border-r dark:border-gray-700' : ''} transition-all duration-300`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        useUIStore.getState().selectAllItems(currentItems.map(i => i.ID));
                      } else {
                        useUIStore.getState().clearSelection();
                      }
                    }}
                    checked={selectedItemIds.length > 0 && currentItems.every(i => selectedItemIds.includes(i.ID))}
                  />
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Function/Category</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subcategory</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Implementation Example</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Scope</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scores</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {currentItems.map((item) => (
                <tr
                  key={item.ID}
                  className={`hover:bg-blue-50 dark:hover:bg-gray-800 cursor-pointer ${
                    currentItemId === item.ID ? 'bg-blue-100 dark:bg-gray-700' : ''
                  } ${isItemSelected(item.ID) ? 'bg-blue-200 dark:bg-blue-900' : ''}`}
                  onClick={(e) => handleRowClick(item, e)}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isItemSelected(item.ID)}
                      onChange={() => toggleItemSelection(item.ID)}
                    />
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium dark:text-white">{item.Function}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.Category}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium dark:text-white">{item['Subcategory ID']}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{item['Subcategory Description']}</div>
                  </td>
                  <td className="p-3 text-sm dark:text-white">{item.ID}</td>
                  <td className="p-3 text-sm">
                    <div className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{item['Implementation Example']}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <button
                      className={`rounded-full flex items-center justify-center w-6 h-6 ${
                        item['In Scope? '] === 'Yes' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                      onClick={(e) => handleToggleInScope(item, e)}
                    >
                      {item['In Scope? '] === 'Yes' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </button>
                  </td>
                  <td className="p-3 text-sm">
                    <div className={getScoreColor(item['Current State Score'], item['Desired State Score'])}>
                      {item['Current State Score'] ?? 0}/{item['Desired State Score'] ?? 0}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className={getStatusColor(item['Testing Status'])}>
                      {item['Testing Status']}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-3 border-t dark:border-gray-700">
            {!detailPanelOpen && currentItem && (
              <button
                onClick={() => setDetailPanelOpen(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <ChevronLeft size={16} />
                Show Details
              </button>
            )}
            <div className="flex items-center">
              <p className="text-sm text-gray-700 dark:text-gray-300 mr-4">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>{' '}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>

              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value === 'All' ? filteredData.length : Number(e.target.value))}
                  className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-1 text-sm"
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
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Previous
              </button>

              <span className="px-3 py-1 bg-blue-600 text-white rounded-md">{currentPage}</span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {detailPanelOpen && (
          <div className="w-1/3 overflow-auto p-4 bg-gray-50 dark:bg-gray-800 relative">
            <button
              onClick={() => setDetailPanelOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              title="Close details panel"
            >
              <X size={18} />
            </button>
            {currentItem ? (
              <div className="space-y-6 mt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold dark:text-white">{currentItem.ID}</h2>
                  {editMode ? (
                    <button
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md"
                      onClick={() => {
                        setEditMode(false);
                        toast.success('Changes saved');
                      }}
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

                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border dark:border-gray-600">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Control Information</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Function:</span>
                      <p className="dark:text-white">{currentItem.Function} - {currentItem['Function Description']}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</span>
                      <p className="dark:text-white">{currentItem.Category} - {currentItem['Category Description']}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Subcategory:</span>
                      <p className="dark:text-white">{currentItem['Subcategory ID']} - {currentItem['Subcategory Description']}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Implementation Examples:</span>
                      <p className="dark:text-white">{currentItem['Implementation Example']}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border dark:border-gray-600">
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Audit Information</h3>
                  <div className="mt-2 space-y-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-32">In Scope:</span>
                      {editMode ? (
                        <select
                          value={currentItem['In Scope? ']}
                          onChange={(e) => handleFieldChange('In Scope? ', e.target.value)}
                          className="ml-2 p-1 border dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            currentItem['In Scope? '] === 'Yes'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {currentItem['In Scope? ']}
                        </span>
                      )}
                    </div>

                    <UserSelector
                      label="Owner"
                      selectedUsers={currentItem.ownerId}
                      onChange={(userId) => handleFieldChange('ownerId', userId)}
                      disabled={!editMode}
                    />

                    <UserSelector
                      label="Stakeholder(s)"
                      selectedUsers={currentItem.stakeholderIds || []}
                      onChange={(userIds) => handleFieldChange('stakeholderIds', userIds)}
                      multiple={true}
                      disabled={!editMode}
                    />

                    <UserSelector
                      label="Auditor"
                      selectedUsers={currentItem.auditorId}
                      onChange={(userId) => handleFieldChange('auditorId', userId)}
                      disabled={!editMode}
                    />

                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Testing Status:</span>
                      {editMode ? (
                        <select
                          value={currentItem['Testing Status']}
                          onChange={(e) => handleFieldChange('Testing Status', e.target.value)}
                          className="mt-1 w-full p-2 border dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Complete">Complete</option>
                        </select>
                      ) : (
                        <div className={`mt-1 px-2 py-1 inline-block rounded ${getStatusColor(currentItem['Testing Status'])}`}>
                          {currentItem['Testing Status']}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Observation Date:</span>
                      {editMode ? (
                        <input
                          type="date"
                          value={currentItem['Observation Date'] || ''}
                          onChange={(e) => handleFieldChange('Observation Date', e.target.value)}
                          className="mt-1 w-full p-2 border dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded"
                        />
                      ) : (
                        <p className="mt-1 dark:text-white">{currentItem['Observation Date'] || 'No date recorded'}</p>
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Observations:</span>
                      {editMode ? (
                        <textarea
                          value={currentItem['Observations'] || ''}
                          onChange={(e) => handleFieldChange('Observations', e.target.value)}
                          className="mt-1 w-full p-2 border dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded h-32"
                          placeholder="Document audit observations here..."
                        />
                      ) : (
                        <p className="mt-1 whitespace-pre-wrap dark:text-white">
                          {currentItem['Observations'] || 'No observations documented'}
                        </p>
                      )}
                    </div>

                    <ArtifactSelector
                      label="Linked Artifacts"
                      selectedArtifacts={currentItem.linkedArtifacts || []}
                      onChange={(artifactNames) => handleFieldChange('linkedArtifacts', artifactNames)}
                      disabled={!editMode}
                    />

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Score:</span>
                        {editMode ? (
                          <select
                            value={currentItem['Current State Score'] || 0}
                            onChange={(e) => handleFieldChange('Current State Score', Number(e.target.value))}
                            className="mt-1 w-full p-2 border dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded text-sm"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <option key={score} value={score}>{score}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="mt-1 text-lg font-bold dark:text-white">
                            {currentItem['Current State Score'] || 0}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Desired Score:</span>
                        {editMode ? (
                          <select
                            value={currentItem['Desired State Score'] || 0}
                            onChange={(e) => handleFieldChange('Desired State Score', Number(e.target.value))}
                            className="mt-1 w-full p-2 border dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded text-sm"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <option key={score} value={score}>{score}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="mt-1 text-lg font-bold dark:text-white">
                            {currentItem['Desired State Score'] || 0}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Action Plan:</span>
                      {editMode ? (
                        <textarea
                          value={currentItem['Action Plan'] || ''}
                          onChange={(e) => handleFieldChange('Action Plan', e.target.value)}
                          className="mt-1 w-full p-2 border dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded h-32"
                          placeholder="Document action plan details here..."
                        />
                      ) : (
                        <p className="mt-1 whitespace-pre-wrap dark:text-white">
                          {currentItem['Action Plan'] || 'No action plan documented'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <AlertTriangle size={48} className="mb-4" />
                <p>Select a control to view and edit details</p>
                <p className="text-sm mt-2">Use arrow keys to navigate</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
