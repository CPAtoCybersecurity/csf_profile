import React from 'react';
import { Search, Filter, Edit, Save, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';

const Controls = ({ 
  data, 
  loading, 
  error, 
  searchTerm, 
  setSearchTerm, 
  filterFunctions, 
  setFilterFunctions, 
  filterCategories, 
  setFilterCategories, 
  filterInScope, 
  setFilterInScope, 
  functionDropdownOpen, 
  setFunctionDropdownOpen, 
  categoryDropdownOpen, 
  setCategoryDropdownOpen, 
  inScopeDropdownOpen, 
  setInScopeDropdownOpen, 
  currentItem, 
  setCurrentItem, 
  editMode, 
  setEditMode, 
  saving, 
  setSaving, 
  currentPage, 
  setCurrentPage, 
  itemsPerPage, 
  filteredData, 
  currentItems, 
  totalPages, 
  functions, 
  categoryIds, 
  handleSelectItem, 
  handleEdit, 
  handleSave, 
  handleFieldChange, 
  handleToggleInScope, 
  handleExport, 
  getStatusColor, 
  getScoreColor 
}) => {
  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-xl font-semibold">Loading audit database...</div>
    </div>;
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-xl font-semibold text-red-600">{error}</div>
    </div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-100 p-4 flex flex-wrap items-center gap-4 border-b">
        {/* Search */}
        <div className="relative w-24">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-20 pl-8 pr-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Function filter */}
        <div className="flex-grow max-w-xs">
          <div className="relative">
            <div 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setFunctionDropdownOpen(!functionDropdownOpen)}
            >
              <span>{filterFunctions.length === 0 ? "All Functions" : `${filterFunctions.length} selected`}</span>
              <Filter size={16} className="text-gray-500" />
            </div>
            {functionDropdownOpen && (
              <div className="absolute z-[9999] mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="p-2">
                  <label className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filterFunctions.length === 0}
                      onChange={() => setFilterFunctions([])}
                    />
                    <span>All Functions</span>
                  </label>
                  {functions.map(func => (
                    <label key={func} className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filterFunctions.includes(func)}
                        onChange={() => {
                          if (filterFunctions.includes(func)) {
                            setFilterFunctions(filterFunctions.filter(f => f !== func));
                          } else {
                            setFilterFunctions([...filterFunctions, func]);
                          }
                        }}
                      />
                      <span>{func}</span>
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            >
              <span>{filterCategories.length === 0 ? "All Category IDs" : `${filterCategories.length} selected`}</span>
              <Filter size={16} className="text-gray-500" />
            </div>
            {categoryDropdownOpen && (
              <div className="absolute z-[9999] mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="p-2">
                  <label className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filterCategories.length === 0}
                      onChange={() => setFilterCategories([])}
                    />
                    <span>All Category IDs</span>
                  </label>
                  {categoryIds.map(categoryId => (
                    <label key={categoryId} className="flex items-center p-2 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filterCategories.includes(categoryId)}
                        onChange={() => {
                          if (filterCategories.includes(categoryId)) {
                            setFilterCategories(filterCategories.filter(c => c !== categoryId));
                          } else {
                            setFilterCategories([...filterCategories, categoryId]);
                          }
                        }}
                      />
                      <span>{categoryId}</span>
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
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setInScopeDropdownOpen(!inScopeDropdownOpen)}
            >
              <span>{filterInScope === '' ? "All In Scope" : `In Scope: ${filterInScope}`}</span>
              <Filter size={16} className="text-gray-500" />
            </div>
            {inScopeDropdownOpen && (
              <div className="absolute z-[9999] mt-1 w-full bg-white border rounded-lg shadow-lg overflow-auto">
                <div className="p-2">
                  <label className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <input
                      type="radio"
                      className="mr-2"
                      checked={filterInScope === ''}
                      onChange={() => setFilterInScope('')}
                    />
                    <span>All</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <input
                      type="radio"
                      className="mr-2"
                      checked={filterInScope === 'Yes'}
                      onChange={() => setFilterInScope('Yes')}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-gray-100 rounded">
                    <input
                      type="radio"
                      className="mr-2"
                      checked={filterInScope === 'No'}
                      onChange={() => setFilterInScope('No')}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Export button */}
        <button 
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
          onClick={handleExport}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Data table */}
        <div className="w-2/3 overflow-auto border-r">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0" style={{ zIndex: -1 }}>
              <tr>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Function/Category</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Scope</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scores</th>
                <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((item) => (
                <tr 
                  key={item.ID} 
                  className={`hover:bg-blue-50 cursor-pointer ${currentItem?.ID === item.ID ? 'bg-blue-100' : ''}`}
                  onClick={() => handleSelectItem(item)}
                >
                  <td className="p-3 text-sm">{item.ID}</td>
                  <td className="p-3 text-sm">
                    <div className="font-medium">{item.Function}</div>
                    <div className="text-xs text-gray-500">{item.Category}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="font-medium">{item["Subcategory ID"]}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{item["Subcategory Description"]}</div>
                  </td>
                  <td className="p-3 text-sm">
                    <button
                      className={`rounded-full flex items-center justify-center w-6 h-6 ${
                        item["In Scope? "] === "Yes" ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleInScope(item);
                      }}
                    >
                      {item["In Scope? "] === "Yes" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </button>
                  </td>
                  <td className="p-3 text-sm">
                    <div className={getScoreColor(item["Current State Score"], item["Desired State Score"])}>
                      {item["Current State Score"] ?? 0}/{item["Desired State Score"] ?? 0}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className={getStatusColor(item["Testing Status"])}>
                      {item["Testing Status"]}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              <span className="px-3 py-1 bg-blue-600 text-white rounded-md">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
        </div>
        
        {/* Detail panel */}
        <div className="w-1/3 overflow-auto p-4 bg-gray-50">
          {currentItem ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{currentItem.ID}</h2>
                {editMode ? (
                  <button
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md"
                    onClick={handleEdit}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-medium text-gray-700">Control Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Function:</span>
                    <p>{currentItem.Function} - {currentItem["Function Description"]}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <p>{currentItem.Category} - {currentItem["Category Description"]}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Subcategory:</span>
                    <p>{currentItem["Subcategory ID"]} - {currentItem["Subcategory Description"]}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Implementation Examples:</span>
                    <p>
                      {currentItem["Implementation Example"]}
                      <br />
                      <span className="text-sm text-gray-600">{currentItem["Implementation Examples"]}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h3 className="font-medium text-gray-700">Audit Information</h3>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 min-w-32">In Scope:</span>
                    {editMode ? (
                      <select
                        value={currentItem["In Scope? "]}
                        onChange={(e) => handleFieldChange("In Scope? ", e.target.value)}
                        className="ml-2 p-1 border rounded"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    ) : (
                      <span 
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          currentItem["In Scope? "] === "Yes" 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {currentItem["In Scope? "]}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 min-w-32">Owner:</span>
                    <span className="ml-2">{currentItem.Owner || "Not assigned"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 min-w-32">Stakeholders:</span>
                    <span className="ml-2">{currentItem.Stakeholders || "None"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 min-w-32">Auditor:</span>
                    <span className="ml-2">{currentItem.Auditor || "Not assigned"}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Testing Status:</span>
                    {editMode ? (
                      <select
                        value={currentItem["Testing Status"]}
                        onChange={(e) => handleFieldChange("Testing Status", e.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Issues Found">Issues Found</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <div className={`mt-1 px-2 py-1 inline-block rounded ${getStatusColor(currentItem["Testing Status"])}`}>
                        {currentItem["Testing Status"]}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Test Procedure(s):</span>
                    {editMode ? (
                      <textarea
                        value={currentItem["Test Procedure(s)"] || ""}
                        onChange={(e) => handleFieldChange("Test Procedure(s)", e.target.value)}
                        className="mt-1 w-full p-2 border rounded h-24"
                        placeholder="Document test procedures here..."
                      />
                    ) : (
                      <p className="mt-1 whitespace-pre-wrap">
                        {currentItem["Test Procedure(s)"] || "No test procedures documented"}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Observations:</span>
                    {editMode ? (
                      <textarea
                        value={currentItem["Observations"] || ""}
                        onChange={(e) => handleFieldChange("Observations", e.target.value)}
                        className="mt-1 w-full p-2 border rounded h-32"
                        placeholder="Document audit observations here..."
                      />
                    ) : (
                      <p className="mt-1 whitespace-pre-wrap">
                        {currentItem["Observations"] || "No observations documented"}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Current State Score:</span>
                      {editMode ? (
                        <select
                          value={currentItem["Current State Score"] || 0}
                          onChange={(e) => handleFieldChange("Current State Score", Number(e.target.value))}
                          className="mt-1 w-full p-2 border rounded"
                        >
                          <option value={0}>0 - Not Implemented</option>
                          <option value={1}>1 - Partially Implemented</option>
                          <option value={2}>2 - Risk Informed</option>
                          <option value={3}>3 - Repeatable</option>
                          <option value={4}>4 - Adaptive</option>
                        </select>
                      ) : (
                        <div className="mt-1 text-lg font-bold">
                          {currentItem["Current State Score"] || 0}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-500">Desired State Score:</span>
                      {editMode ? (
                        <select
                          value={currentItem["Desired State Score"] || 0}
                          onChange={(e) => handleFieldChange("Desired State Score", Number(e.target.value))}
                          className="mt-1 w-full p-2 border rounded"
                        >
                          <option value={0}>0 - Not Implemented</option>
                          <option value={1}>1 - Partially Implemented</option>
                          <option value={2}>2 - Risk Informed</option>
                          <option value={3}>3 - Repeatable</option>
                          <option value={4}>4 - Adaptive</option>
                        </select>
                      ) : (
                        <div className="mt-1 text-lg font-bold">
                          {currentItem["Desired State Score"] || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AlertTriangle size={48} className="mb-4" />
              <p>Select a control to view and edit details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Controls;
