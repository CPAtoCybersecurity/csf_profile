import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Edit, Save, CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import Papa from 'papaparse';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunction, setFilterFunction] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/csf2normalizedcsv.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          complete: (results) => {
            // Ensure every row has the expected fields
            const processedData = results.data.map(row => ({
              ...row,
              "In Scope? ": row["In Scope? "] || "No",
              "Observations": row["Observations"] || "",
              "Current State Score": row["Current State Score"] !== null ? row["Current State Score"] : 0,
              "Desired State Score": row["Desired State Score"] !== null ? row["Desired State Score"] : 0,
              "Testing Status": row["Testing Status"] || "Not Started"
            }));
            
            setData(processedData);
            setLoading(false);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setLoading(false);
          }
        });
      } catch (err) {
        setError(`Error loading file: ${err.message}`);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Unique values for filters
  const functions = useMemo(() => {
    return [...new Set(data.map(item => item.Function))].filter(Boolean).sort();
  }, [data]);
  
  const categoryIds = useMemo(() => {
    return [...new Set(data.map(item => {
      // Extract the category ID from the Category field
      // Assuming format is like "Organizational Context (GV.OC)"
      const match = item.Category && item.Category.match(/\(([^)]+)\)/);
      return match ? match[1] : item.Category;
    }))].filter(Boolean).sort();
  }, [data]);
  
  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        searchTerm === '' || 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesFunction = filterFunction === '' || item.Function === filterFunction;
      
      // Extract category ID for matching
      const categoryId = item.Category && item.Category.match(/\(([^)]+)\)/) ? 
        item.Category.match(/\(([^)]+)\)/)[1] : 
        item.Category;
      const matchesCategory = filterCategory === '' || categoryId === filterCategory;
      
      return matchesSearch && matchesFunction && matchesCategory;
    });
  }, [data, searchTerm, filterFunction, filterCategory]);
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle item selection
  const handleSelectItem = (item) => {
    setCurrentItem(item);
    setEditMode(false);
  };
  
  // Handle edit
  const handleEdit = () => {
    setEditMode(true);
  };
  
  // Handle save
  const handleSave = () => {
    setSaving(true);
    
    // Update the data array with the edited item
    const updatedData = data.map(item => 
      item.ID === currentItem.ID ? currentItem : item
    );
    
    setData(updatedData);
    setEditMode(false);
    setSaving(false);
  };
  
  // Handle field change
  const handleFieldChange = (field, value) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };
  
  // Handle toggle in scope
  const handleToggleInScope = (item) => {
    const updatedItem = {
      ...item,
      "In Scope? ": item["In Scope? "] === "Yes" ? "No" : "Yes"
    };
    
    const updatedData = data.map(dataItem => 
      dataItem.ID === item.ID ? updatedItem : dataItem
    );
    
    setData(updatedData);
    
    if (currentItem && currentItem.ID === item.ID) {
      setCurrentItem(updatedItem);
    }
  };
  
  // Export to CSV
  const handleExport = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'csf_audit_updated.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'text-green-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Not Started':
        return 'text-gray-500';
      case 'Issues Found':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };
  
  // Score color mapping
  const getScoreColor = (current, desired) => {
    if (current === desired) return 'text-green-600';
    if (current > desired) return 'text-blue-600';
    return 'text-red-600';
  };
  
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
      <div className="bg-blue-700 text-white p-4">
        <h1 className="text-2xl font-bold">CSF Audit Database</h1>
        <p className="opacity-80">Manage controls, document observations, and track audit progress</p>
      </div>
      
      {/* Toolbar */}
      <div className="bg-gray-100 p-4 flex flex-wrap items-center gap-4 border-b">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search controls, owners, auditors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Function filter */}
        <div className="flex-grow max-w-xs">
          <select
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterFunction}
            onChange={(e) => setFilterFunction(e.target.value)}
          >
            <option value="">All Functions</option>
            {functions.map(func => (
              <option key={func} value={func}>{func}</option>
            ))}
          </select>
        </div>
        
        {/* Category ID filter */}
        <div className="flex-grow max-w-xs">
          <select
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Category IDs</option>
            {categoryIds.map(categoryId => (
              <option key={categoryId} value={categoryId}>{categoryId}</option>
            ))}
          </select>
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
            <thead className="bg-gray-50 sticky top-0">
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
                    <p>{currentItem["Implementation Examples"]}</p>
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

export default App;
