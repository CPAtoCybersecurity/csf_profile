import React, { useCallback, useRef } from 'react';
import {
  Search, Filter, Edit, Save, CheckCircle, XCircle,
  AlertTriangle, Download, Upload, X, ChevronLeft,
  FileDown, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// Components
import UserSelector from '../components/UserSelector';
import ArtifactSelector from '../components/ArtifactSelector';
import DropdownPortal from '../components/DropdownPortal';
import SortableHeader from '../components/SortableHeader';

// Hooks and stores
import { useCSFData } from '../hooks/useCSFData';
import { useFilters } from '../hooks/useFilters';
import useUIStore from '../stores/uiStore';
import useCSFStore from '../stores/csfStore';
import useUserStore from '../stores/userStore';

const Controls = () => {
  const { loading, error, importCSV, exportCSV, exportFilteredCSV, toggleInScope, updateItem } = useCSFData();
  const data = useCSFStore((state) => state.data);

  const {
    searchTerm,
    filterFunctions,
    filterCategories,
    filterInScope,
    currentPage,
    itemsPerPage,
    sort,
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
    handleSort,
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
    selectedQuarter,
    setSelectedQuarter,
  } = useUIStore();

  const getQuarterData = useCSFStore((state) => state.getQuarterData);
  const updateQuarterData = useCSFStore((state) => state.updateQuarterData);

  // Refs for dropdown triggers (needed for portal positioning)
  const functionTriggerRef = useRef(null);
  const categoryTriggerRef = useRef(null);
  const inScopeTriggerRef = useRef(null);

  // Get current item from data
  const currentItem = data.find(item => item.ID === currentItemId);

  // Handlers
  const handleSelectItem = useCallback((item) => {
    setCurrentItemId(item.ID);
    setDetailPanelOpen(true);  // Explicitly open detail panel (fixes Safari)
    setEditMode(false);
  }, [setCurrentItemId, setDetailPanelOpen, setEditMode]);

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
        return 'text-green-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Not Started':
        return 'text-gray-500';
      case 'Submitted':
        return 'text-orange-600';
      default:
        return 'text-gray-500';
    }
  };

  // Score color mapping
  const getScoreColor = (actual, desired) => {
    if (actual === desired) return 'text-green-600';
    if (actual > desired) return 'text-blue-600';
    return 'text-red-600';
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
      <div className="bg-gray-100 p-4 flex flex-wrap items-center gap-4 border-b relative z-50">
        {/* Search */}
        <div className="relative w-32">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-8 pr-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Function filter */}
        <div className="flex-grow max-w-xs">
          <div
            ref={functionTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setFunctionDropdownOpen(!functionDropdownOpen)}
          >
            <span className="">
              {filterFunctions.length === 0 ? 'All Functions' : `${filterFunctions.length} selected`}
            </span>
            <Filter size={16} className="text-gray-500" />
          </div>
          <DropdownPortal
            isOpen={functionDropdownOpen}
            onClose={() => setFunctionDropdownOpen(false)}
            triggerRef={functionTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100:bg-gray-600 rounded">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filterFunctions.length === 0}
                  onChange={() => setFilterFunctions([])}
                />
                <span className="">All Functions</span>
              </label>
              {functions.map((func) => (
                <label key={func} className="flex items-center p-2 hover:bg-gray-100:bg-gray-600 rounded">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={filterFunctions.includes(func)}
                    onChange={() => toggleFunction(func)}
                  />
                  <span className="">{func}</span>
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* Category ID filter */}
        <div className="flex-grow max-w-xs">
          <div
            ref={categoryTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
          >
            <span className="">
              {filterCategories.length === 0 ? 'All Category IDs' : `${filterCategories.length} selected`}
            </span>
            <Filter size={16} className="text-gray-500" />
          </div>
          <DropdownPortal
            isOpen={categoryDropdownOpen}
            onClose={() => setCategoryDropdownOpen(false)}
            triggerRef={categoryTriggerRef}
            className="max-h-60 overflow-auto"
          >
            <div className="p-2">
              <label className="flex items-center p-2 hover:bg-gray-100:bg-gray-600 rounded">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filterCategories.length === 0}
                  onChange={() => setFilterCategories([])}
                />
                <span className="">All Category IDs</span>
              </label>
              {categoryIds.map((categoryId) => (
                <label key={categoryId} className="flex items-center p-2 hover:bg-gray-100:bg-gray-600 rounded">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={filterCategories.includes(categoryId)}
                    onChange={() => toggleCategory(categoryId)}
                  />
                  <span className="">{categoryId}</span>
                </label>
              ))}
            </div>
          </DropdownPortal>
        </div>

        {/* In Scope filter */}
        <div className="flex-grow max-w-xs">
          <div
            ref={inScopeTriggerRef}
            className="w-full p-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between"
            onClick={() => setInScopeDropdownOpen(!inScopeDropdownOpen)}
          >
            <span className="">
              {filterInScope === '' ? 'All In Scope' : `In Scope: ${filterInScope}`}
            </span>
            <Filter size={16} className="text-gray-500" />
          </div>
          <DropdownPortal
            isOpen={inScopeDropdownOpen}
            onClose={() => setInScopeDropdownOpen(false)}
            triggerRef={inScopeTriggerRef}
          >
            <div className="p-2">
              {['', 'Yes', 'No'].map((value) => (
                <label key={value} className="flex items-center p-2 hover:bg-gray-100:bg-gray-600 rounded">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={filterInScope === value}
                    onChange={() => setFilterInScope(value)}
                  />
                  <span className="">{value || 'All'}</span>
                </label>
              ))}
            </div>
          </DropdownPortal>
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
          {filteredData.length !== data.length && (
            <button
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-black py-2 px-4 rounded-lg"
              onClick={() => exportFilteredCSV(filteredData, 'CSF_Profile_Filtered')}
              title={`Export ${filteredData.length} filtered items`}
            >
              <FileDown size={16} />
              Export Filtered ({filteredData.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative z-0">
        {/* Data table */}
        <div className={`${detailPanelOpen ? 'w-2/3' : 'w-full'} overflow-auto ${detailPanelOpen ? 'border-r' : ''} transition-all duration-300`}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
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
                <SortableHeader label="Function/Category" sortKey="Function" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="Subcategory" sortKey="Subcategory ID" currentSort={sort} onSort={handleSort} />
                <SortableHeader label="ID" sortKey="ID" currentSort={sort} onSort={handleSort} />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Implementation Example</th>
                <SortableHeader label="In Scope" sortKey="In Scope? " currentSort={sort} onSort={handleSort} />
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score <span className="text-blue-600">(Q{selectedQuarter})</span>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status <span className="text-blue-600">(Q{selectedQuarter})</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr
                  key={item.ID}
                  className={`hover:bg-blue-50:bg-gray-800 cursor-pointer ${
                    currentItemId === item.ID ? 'bg-blue-100' : ''
                  } ${isItemSelected(item.ID) ? 'bg-blue-200' : ''}`}
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
                    <div className="font-medium">{item.Function}</div>
                    <div className="text-xs text-gray-500">{item.Category}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium">{item['Subcategory ID']}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{item['Subcategory Description']}</div>
                  </td>
                  <td className="p-3 text-sm">{item.ID}</td>
                  <td className="p-3 text-sm">
                    <div className="text-xs text-gray-700 line-clamp-2">{item['Implementation Example']}</div>
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
                    {(() => {
                      const qData = getQuarterData(item.ID, selectedQuarter) || { actualScore: 0, targetScore: 0 };
                      return (
                        <div className={getScoreColor(qData.actualScore, qData.targetScore)}>
                          {qData.actualScore ?? 0}/{qData.targetScore ?? 0}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-3 text-sm">
                    {(() => {
                      const qData = getQuarterData(item.ID, selectedQuarter) || { testingStatus: 'Not Started' };
                      return (
                        <div className={getStatusColor(qData.testingStatus)}>
                          {qData.testingStatus || 'Not Started'}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t">
            {!detailPanelOpen && currentItem && (
              <button
                onClick={() => setDetailPanelOpen(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <ChevronLeft size={16} />
                Show Details
              </button>
            )}
            <div className="flex items-center">
              <p className="text-sm text-gray-700 mr-4">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>{' '}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>

              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value === 'All' ? filteredData.length : Number(e.target.value))}
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
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300:bg-gray-500'
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
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300:bg-gray-500'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {detailPanelOpen && (
          <div className="w-1/3 overflow-auto p-4 bg-gray-50">
            {currentItem ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold flex-1">{currentItem.ID}</h2>
                  <button
                    onClick={() => setDetailPanelOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-200:bg-gray-700 text-gray-500 hover:text-gray-700 flex-shrink-0"
                    title="Close details panel"
                  >
                    <X size={18} />
                  </button>
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

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="font-medium text-gray-700">Requirements</h3>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Function:</span>
                      <p className="">{currentItem.Function} - {currentItem['Function Description']}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <p className="">{currentItem.Category} - {currentItem['Category Description']}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subcategory:</span>
                      <p className="">{currentItem['Subcategory ID']} - {currentItem['Subcategory Description']}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Implementation Example:</span>
                      <p className="">{currentItem['Implementation Example']}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Implementation Description:</span>
                      {editMode ? (
                        <textarea
                          value={currentItem['Implementation Description'] || ''}
                          onChange={(e) => handleFieldChange('Implementation Description', e.target.value)}
                          className="mt-1 w-full p-2 border rounded h-24"
                          placeholder="Describe how this control is implemented..."
                        />
                      ) : (
                        <div className="mt-1 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {currentItem['Implementation Description'] || 'No implementation description'}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-700">Assessment Observations</h3>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      <div className="flex rounded-md overflow-hidden border">
                        {[1, 2, 3, 4].map((quarterNum) => (
                          <button
                            key={quarterNum}
                            onClick={() => setSelectedQuarter(quarterNum)}
                            className={`px-3 py-1 text-xs font-medium transition-colors ${
                              selectedQuarter === quarterNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            } ${quarterNum > 1 ? 'border-l' : ''}`}
                          >
                            Q{quarterNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 space-y-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 min-w-32">In Scope:</span>
                      {editMode ? (
                        <select
                          value={currentItem['In Scope? ']}
                          onChange={(e) => handleFieldChange('In Scope? ', e.target.value)}
                          className="ml-2 p-1 border rounded"
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
                      <span className="text-sm font-medium text-gray-500">Testing Status:</span>
                      {editMode ? (
                        <select
                          value={getQuarterData(currentItem.ID, selectedQuarter)?.testingStatus || 'Not Started'}
                          onChange={(e) => updateQuarterData(currentItem.ID, selectedQuarter, { testingStatus: e.target.value })}
                          className="mt-1 w-full p-2 border rounded"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Complete">Complete</option>
                        </select>
                      ) : (
                        <div className={`mt-1 px-2 py-1 inline-block rounded ${getStatusColor(
                          getQuarterData(currentItem.ID, selectedQuarter)?.testingStatus || 'Not Started'
                        )}`}>
                          {getQuarterData(currentItem.ID, selectedQuarter)?.testingStatus || 'Not Started'}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Observation Date:</span>
                      {editMode ? (
                        <input
                          type="date"
                          value={getQuarterData(currentItem.ID, selectedQuarter)?.observationDate || ''}
                          onChange={(e) => updateQuarterData(currentItem.ID, selectedQuarter, { observationDate: e.target.value })}
                          className="mt-1 w-full p-2 border rounded"
                        />
                      ) : (
                        <p className="mt-1">
                          {getQuarterData(currentItem.ID, selectedQuarter)?.observationDate || 'No date recorded'}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Assessment Method(s):</span>
                      <div className="mt-1 flex gap-4">
                        {['Examine', 'Interview', 'Test'].map((method) => {
                          const quarterData = getQuarterData(currentItem.ID, selectedQuarter) || {};
                          const methodKey = method.toLowerCase();
                          const isChecked = quarterData[methodKey] === true;
                          return (
                            <label key={method} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  updateQuarterData(currentItem.ID, selectedQuarter, {
                                    [methodKey]: e.target.checked
                                  });
                                }}
                                disabled={!editMode}
                                className="rounded"
                              />
                              <span className="text-sm">{method}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Observations:</span>
                      {editMode ? (
                        <textarea
                          value={getQuarterData(currentItem.ID, selectedQuarter)?.observations || ''}
                          onChange={(e) => updateQuarterData(currentItem.ID, selectedQuarter, { observations: e.target.value })}
                          className="mt-1 w-full p-2 border rounded h-32"
                          placeholder="Document audit observations here..."
                        />
                      ) : (
                        <div className="mt-1 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {getQuarterData(currentItem.ID, selectedQuarter)?.observations || 'No observations documented'}
                          </ReactMarkdown>
                        </div>
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
                        <span className="text-sm font-medium text-gray-500">Actual Score:</span>
                        {editMode ? (
                          <select
                            value={getQuarterData(currentItem.ID, selectedQuarter)?.actualScore || 0}
                            onChange={(e) => updateQuarterData(currentItem.ID, selectedQuarter, { actualScore: Number(e.target.value) })}
                            className="mt-1 w-full p-2 border rounded text-sm"
                          >
                            {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((score) => (
                              <option key={score} value={score}>{score}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="mt-1 text-lg font-bold">
                            {getQuarterData(currentItem.ID, selectedQuarter)?.actualScore ?? 0}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-500">Target Score:</span>
                        {editMode ? (
                          <select
                            value={getQuarterData(currentItem.ID, selectedQuarter)?.targetScore || 0}
                            onChange={(e) => updateQuarterData(currentItem.ID, selectedQuarter, { targetScore: Number(e.target.value) })}
                            className="mt-1 w-full p-2 border rounded text-sm"
                          >
                            {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map((score) => (
                              <option key={score} value={score}>{score}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="mt-1 text-lg font-bold">
                            {getQuarterData(currentItem.ID, selectedQuarter)?.targetScore ?? 0}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <h3 className="font-medium text-gray-700">Remediation Plan</h3>
                  <div className="mt-2 space-y-4">
                    <UserSelector
                      label="Owner"
                      selectedUsers={currentItem.remediationOwnerId}
                      onChange={(userId) => handleFieldChange('remediationOwnerId', userId)}
                      disabled={!editMode}
                    />

                    <div>
                      <span className="text-sm font-medium text-gray-500">Action Plan:</span>
                      {editMode ? (
                        <textarea
                          value={currentItem['Action Plan'] || ''}
                          onChange={(e) => handleFieldChange('Action Plan', e.target.value)}
                          className="mt-1 w-full p-2 border rounded h-32"
                          placeholder="Document action plan details here..."
                        />
                      ) : (
                        <div className="mt-1 prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {currentItem['Action Plan'] || 'No action plan documented'}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Due Date:</span>
                      {editMode ? (
                        <input
                          type="date"
                          value={currentItem['Remediation Due Date'] || ''}
                          onChange={(e) => handleFieldChange('Remediation Due Date', e.target.value)}
                          className="mt-1 w-full p-2 border rounded"
                        />
                      ) : (
                        <p className="mt-1">{currentItem['Remediation Due Date'] || 'No due date set'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
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
