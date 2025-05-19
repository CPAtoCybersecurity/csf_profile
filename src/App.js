import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Download, Upload } from 'lucide-react';
import Papa from 'papaparse';

// Import components
import Navigation from './components/Navigation';
import Controls from './pages/Controls';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ScoringLegend from './pages/ScoringLegend';
import Artifacts from './pages/Artifacts';

const App = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunctions, setFilterFunctions] = useState([]);
  const [filterCategories, setFilterCategories] = useState([]);
  const [filterInScope, setFilterInScope] = useState('');
  const [functionDropdownOpen, setFunctionDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [inScopeDropdownOpen, setInScopeDropdownOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if data is already in localStorage
        const storedData = localStorage.getItem('mainData');
        
        if (storedData) {
          // Use the data from localStorage
          setData(JSON.parse(storedData));
          setLoading(false);
        } else {
          // Load data from CSV file
          const response = await fetch('/csf2normalizedcsv.csv');
          const csvText = await response.text();
          
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
              // Ensure every row has the expected fields
              const processedData = results.data.map(row => {
                // Extract Category ID from Category field if available
                const categoryIdMatch = row.Category && row.Category.match(/\(([^)]+)\)/);
                const categoryId = categoryIdMatch ? categoryIdMatch[1] : "";
                
                // Handle renamed fields
                const actualScore = row["Actual Score"] !== null ? row["Actual Score"] : 
                                   (row["Current State Score"] !== null ? row["Current State Score"] : 0);
                
                const desiredTarget = row["Desired Target"] !== null ? row["Desired Target"] : 
                                     (row["Desired State Score"] !== null ? row["Desired State Score"] : 0);
                
                const controlRef = row["NIST 800-53 Control Ref"] || row["Control Implementation Description"] || "";
                
                // Handle new fields
                const minimumTarget = row["Minimum Target"] !== null ? row["Minimum Target"] : 0;
                const gapToMinimum = minimumTarget - actualScore;
                
                return {
                  ...row,
                  "In Scope? ": row["In Scope? "] || "No",
                  "Observations": row["Observations"] || "",
                  "Current State Score": actualScore,
                  "Actual Score": actualScore,
                  "Minimum Target": minimumTarget,
                  "Desired State Score": desiredTarget,
                  "Desired Target": desiredTarget,
                  "Gap to Minimum Target": gapToMinimum,
                  "Testing Status": row["Testing Status"] || "Not Started",
                  "Category ID": categoryId,
                  // Initialize user-related fields
                  "ownerId": row["ownerId"] || null,
                  "stakeholderIds": row["stakeholderIds"] || [],
                  "auditorId": row["auditorId"] || null,
                  "Control Implementation Description": controlRef,
                  "NIST 800-53 Control Ref": controlRef,
                  // Initialize linked artifacts
                  "linkedArtifacts": row["linkedArtifacts"] || []
                };
              });
              
              setData(processedData);
              
              // Save the processed data to localStorage
              localStorage.setItem('mainData', JSON.stringify(processedData));
              
              setLoading(false);
            },
            error: (error) => {
              setError(`Error parsing CSV: ${error.message}`);
              setLoading(false);
            }
          });
        }
      } catch (err) {
        setError(`Error loading file: ${err.message}`);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem('mainData', JSON.stringify(data));
    }
  }, [data]);
  
  // Listen for mainDataUpdate event from Artifacts.js
  useEffect(() => {
    const handleMainDataUpdate = () => {
      // Load the updated data from localStorage
      const storedData = localStorage.getItem('mainData');
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    };
    
    // Add event listener
    window.addEventListener('mainDataUpdate', handleMainDataUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('mainDataUpdate', handleMainDataUpdate);
    };
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
      
      const matchesFunction = filterFunctions.length === 0 || filterFunctions.includes(item.Function);
      
      // Extract category ID for matching
      const categoryId = item.Category && item.Category.match(/\(([^)]+)\)/) ? 
        item.Category.match(/\(([^)]+)\)/)[1] : 
        item.Category;
      const matchesCategory = filterCategories.length === 0 || filterCategories.includes(categoryId);
      
      // Filter by In Scope
      const matchesInScope = filterInScope === '' || item["In Scope? "] === filterInScope;
      
      return matchesSearch && matchesFunction && matchesCategory && matchesInScope;
    });
  }, [data, searchTerm, filterFunctions, filterCategories, filterInScope]);
  
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

    // If the field is linkedArtifacts, update the artifacts in localStorage
    if (field === "linkedArtifacts") {
      const storedArtifacts = localStorage.getItem('artifacts');
      if (storedArtifacts) {
        const artifacts = JSON.parse(storedArtifacts);
        
        // For each artifact, check if it's in the new linkedArtifacts array
        const updatedArtifacts = artifacts.map(artifact => {
          // If the artifact is in the linkedArtifacts array, make sure the full ID is in its linkedSubcategoryIds
          if (value.includes(artifact.name)) {
            // If the full ID is not already in the linkedSubcategoryIds array, add it
            if (!artifact.linkedSubcategoryIds.includes(currentItem.ID)) {
              return {
                ...artifact,
                linkedSubcategoryIds: [...artifact.linkedSubcategoryIds, currentItem.ID]
              };
            }
          } else {
            // If the artifact is not in the linkedArtifacts array, remove the full ID from its linkedSubcategoryIds
            if (artifact.linkedSubcategoryIds.includes(currentItem.ID)) {
              return {
                ...artifact,
                linkedSubcategoryIds: artifact.linkedSubcategoryIds.filter(id => id !== currentItem.ID)
              };
            }
          }
          return artifact;
        });
        
        // Save the updated artifacts to localStorage
        localStorage.setItem('artifacts', JSON.stringify(updatedArtifacts));
      }
    }
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
  
  // Handle clear all scope
  const handleClearAllScope = () => {
    const updatedData = data.map(item => ({
      ...item,
      "In Scope? ": "No"
    }));
    
    setData(updatedData);
    
    // Update current item if one is selected
    if (currentItem) {
      setCurrentItem({
        ...currentItem,
        "In Scope? ": "No"
      });
    }
  };
  
// Utility function to parse user information from strings like "John Doe <john@email.com>"
const parseUserInfo = (userString) => {
  if (!userString) return { name: null, email: null };
  
  // Check if the string has the format "Name <email>"
  const emailMatch = userString.match(/([^<]+)<([^>]+)>/);
  if (emailMatch) {
    return {
      name: emailMatch[1].trim(),
      email: emailMatch[2].trim()
    };
  }
  
  // If no email format is found, just return the string as the name
  return {
    name: userString.trim(),
    email: null
  };
};

// Function to find or create a user
const findOrCreateUser = (userInfo, existingUsers) => {
  if (!userInfo.name) return null;
  
  // If we have an email, try to find a user with that email
  if (userInfo.email) {
    const existingUser = existingUsers.find(user => 
      user.email.toLowerCase() === userInfo.email.toLowerCase()
    );
    
    if (existingUser) {
      return existingUser.id;
    }
  }
  
  // If no email or no user found with that email, try to find by name
  const existingUser = existingUsers.find(user => 
    user.name.toLowerCase() === userInfo.name.toLowerCase()
  );
  
  if (existingUser) {
    return existingUser.id;
  }
  
  // If no user found, create a new one
  const newUser = {
    id: Date.now() + Math.floor(Math.random() * 1000), // Generate a unique ID
    name: userInfo.name,
    title: "Imported User", // Default title
    email: userInfo.email || `${userInfo.name.replace(/\s+/g, '.').toLowerCase()}@example.com` // Default email if none provided
  };
  
  // Add the new user to the existing users
  existingUsers.push(newUser);
  
  return newUser.id;
};

// Import from CSV
const handleImport = () => {
  // Create a file input element
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  
  // Set up event listener for when a file is selected
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      
      // Get existing users from localStorage
      let existingUsers = [];
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        existingUsers = JSON.parse(storedUsers);
      }
      
      // Track new users created during import
      const newUsers = [];
      
      // Parse the CSV data
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          // Process the data to match the application's internal structure
          const importedData = results.data.map(row => {
            // Process Owner field
            let ownerId = null;
            if (row.Owner) {
              const ownerInfo = parseUserInfo(row.Owner);
              ownerId = findOrCreateUser(ownerInfo, existingUsers);
            }
            
            // Process Auditor field
            let auditorId = null;
            if (row.Auditor) {
              const auditorInfo = parseUserInfo(row.Auditor);
              auditorId = findOrCreateUser(auditorInfo, existingUsers);
            }
            
            // Process Stakeholders field
            let stakeholderIds = [];
            if (row.Stakeholders) {
              // Split by commas, but be careful not to split email addresses that might contain commas
              const stakeholderStrings = row.Stakeholders.split(/,(?![^<]*>)/).map(s => s.trim()).filter(Boolean);
              
              stakeholderIds = stakeholderStrings.map(stakeholderString => {
                const stakeholderInfo = parseUserInfo(stakeholderString);
                return findOrCreateUser(stakeholderInfo, existingUsers);
              }).filter(Boolean); // Remove null values
            } else if (row.stakeholderIds) {
              // If stakeholderIds is already an array, use it
              if (Array.isArray(row.stakeholderIds)) {
                stakeholderIds = row.stakeholderIds;
              } else if (typeof row.stakeholderIds === 'string') {
                // If it's a string, split it
                stakeholderIds = row.stakeholderIds.split(',').map(s => s.trim()).filter(Boolean);
              }
            }
            
            // Handle renamed fields
            const actualScore = row["Actual Score"] !== null ? row["Actual Score"] : 
                               (row["Current State Score"] !== null ? row["Current State Score"] : 0);
            
            const desiredTarget = row["Desired Target"] !== null ? row["Desired Target"] : 
                                 (row["Desired State Score"] !== null ? row["Desired State Score"] : 0);
            
            const controlRef = row["NIST 800-53 Control Ref"] || row["Control Implementation Description"] || "";
            
            // Handle new fields
            const minimumTarget = row["Minimum Target"] !== null ? row["Minimum Target"] : 0;
            
            return {
              ...row,
              "In Scope? ": row["In Scope? "] || "No",
              "Observations": row["Observations"] || "",
              "Current State Score": actualScore,
              "Actual Score": actualScore,
              "Minimum Target": minimumTarget,
              "Desired State Score": desiredTarget,
              "Desired Target": desiredTarget,
              "Gap to Minimum Target": minimumTarget - actualScore,
              "Testing Status": row["Testing Status"] || "Not Started",
              // Map external field names to internal field names
              "ownerId": ownerId || row.ownerId || null,
              "stakeholderIds": stakeholderIds,
              "auditorId": auditorId || row.auditorId || null,
              "Control Implementation Description": controlRef,
              "NIST 800-53 Control Ref": controlRef,
              "Observation Date": row["Observation Date"] || "",
              "Action Plan": row["Action Plan"] || "",
              // Initialize linked artifacts
              "linkedArtifacts": row["linkedArtifacts"] || []
            };
          });
          
          // Save updated users to localStorage
          localStorage.setItem('users', JSON.stringify(existingUsers));
          
          // Dispatch custom event to notify other components about user updates
          window.dispatchEvent(new Event('userUpdate'));
          
          // Update the data state with the imported data
          setData(importedData);
          
          // Reset current item and page
          setCurrentItem(null);
          setCurrentPage(1);
          
          // Show success message
          alert('CSV data imported successfully!');
        },
        error: (error) => {
          alert(`Error parsing CSV: ${error.message}`);
        }
      });
    };
    
    reader.readAsText(file);
  });
  
  // Trigger the file input click
  fileInput.click();
};

// Utility function to format user information
const formatUserInfo = (userId, users) => {
  if (!userId) return "";
  
  const user = users.find(u => u.id === userId);
  if (!user) return userId; // Return the ID if user not found
  
  // Format as "Name <email>"
  return user.email ? `${user.name} <${user.email}>` : user.name;
};

// Export to CSV
const handleExport = () => {
  // Create date stamp in format yyyy-mm-dd
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStamp = `${year}-${month}-${day}`;
  
  // Get users from localStorage
  let users = [];
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }
  
  // Map the data to match the expected CSV format
  const exportData = data.map(item => {
    // Extract Category ID from Category field if available
    const categoryIdMatch = item.Category && item.Category.match(/\(([^)]+)\)/);
    const categoryId = categoryIdMatch ? categoryIdMatch[1] : "";
    
    // Calculate Gap to Minimum Target
    const actualScore = item["Current State Score"] || item["Actual Score"] || 0;
    const minimumTarget = item["Minimum Target"] || 0;
    const gapToMinimum = minimumTarget - actualScore;
    
    // Format Owner information
    const ownerFormatted = formatUserInfo(item.ownerId, users);
    
    // Format Stakeholders information
    let stakeholdersFormatted = "";
    if (item.stakeholderIds && Array.isArray(item.stakeholderIds) && item.stakeholderIds.length > 0) {
      stakeholdersFormatted = item.stakeholderIds
        .map(id => formatUserInfo(id, users))
        .filter(Boolean)
        .join(", ");
    }
    
    // Format Auditor information
    const auditorFormatted = formatUserInfo(item.auditorId, users);
    
    return {
      "ID": item.ID,
      "Function": item.Function,
      "Function Description": item["Function Description"],
      "Category ID": categoryId,
      "Category": item.Category,
      "Category Description": item["Category Description"],
      "Subcategory ID": item["Subcategory ID"],
      "Subcategory Description": item["Subcategory Description"],
      "Implementation Example": item["Implementation Example"],
      "In Scope? ": item["In Scope? "],
      "Owner": ownerFormatted,
      "Stakeholders": stakeholdersFormatted,
      "Auditor": auditorFormatted,
      "NIST 800-53 Control Ref": item["Control Implementation Description"] || item["NIST 800-53 Control Ref"] || "",
      "Test Procedure(s)": item["Test Procedure(s)"] || "",
      "Observation Date": item["Observation Date"] || "",
      "Observations": item["Observations"] || "",
      "Actual Score": item["Current State Score"] || item["Actual Score"] || 0,
      "Minimum Target": item["Minimum Target"] || 0,
      "Desired Target": item["Desired State Score"] || item["Desired Target"] || 0,
      "Gap to Minimum Target": gapToMinimum,
      "Testing Status": item["Testing Status"] || "",
      "Action Plan": item["Action Plan"] || "",
      "Linked Artifacts": item.linkedArtifacts ? (Array.isArray(item.linkedArtifacts) ? item.linkedArtifacts.join(", ") : item.linkedArtifacts) : ""
    };
  });
  
  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${dateStamp}_CSF_Profile.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Complete':
        return 'text-green-600';
      case 'Completed': // For backward compatibility
        return 'text-green-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Not Started':
        return 'text-gray-500';
      case 'Submitted':
        return 'text-orange-600';
      case 'Issues Found': // For backward compatibility
        return 'text-red-600';
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
  
  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  };
  
  return (
    <Router>
      <div className="flex flex-col h-full">
        <header className="bg-blue-700 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/SC_SimplyCyberAcademy.png" 
                alt="Simply Cyber Academy Logo" 
                className="h-16 mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold">CSF Profile Assessment Database</h1>
                <p className="opacity-80">Manage assessment details, document observations and track progress</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleClearAllScope}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-black transition-colors"
                title="Set all items as out of scope"
              >
                Clear Scope
              </button>
              <Navigation />
            </div>
          </div>
        </header>
        
        <Routes>
          <Route 
            path="/" 
            element={
              <Controls 
                data={data}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterFunctions={filterFunctions}
                setFilterFunctions={setFilterFunctions}
                filterCategories={filterCategories}
                setFilterCategories={setFilterCategories}
                filterInScope={filterInScope}
                setFilterInScope={setFilterInScope}
                functionDropdownOpen={functionDropdownOpen}
                setFunctionDropdownOpen={setFunctionDropdownOpen}
                categoryDropdownOpen={categoryDropdownOpen}
                setCategoryDropdownOpen={setCategoryDropdownOpen}
                inScopeDropdownOpen={inScopeDropdownOpen}
                setInScopeDropdownOpen={setInScopeDropdownOpen}
                currentItem={currentItem}
                setCurrentItem={setCurrentItem}
                editMode={editMode}
                setEditMode={setEditMode}
                saving={saving}
                setSaving={setSaving}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={handleItemsPerPageChange}
                filteredData={filteredData}
                currentItems={currentItems}
                totalPages={totalPages}
                functions={functions}
                categoryIds={categoryIds}
                handleSelectItem={handleSelectItem}
                handleEdit={handleEdit}
                handleSave={handleSave}
                handleFieldChange={handleFieldChange}
                handleToggleInScope={handleToggleInScope}
                handleClearAllScope={handleClearAllScope}
                handleExport={handleExport}
                handleImport={handleImport}
                getStatusColor={getStatusColor}
                getScoreColor={getScoreColor}
              />
            } 
          />
          <Route path="/dashboard" element={<Dashboard data={data} />} />
          <Route path="/scoring" element={<ScoringLegend />} />
          <Route path="/artifacts" element={<Artifacts data={data} />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
