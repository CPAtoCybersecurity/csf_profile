import React, { useState, useEffect, useRef } from 'react';
import { FileArchive, Edit, Trash2, Save, X, Plus, Link as LinkIcon, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import { extractArtifactsFromProfile, processImportedCSV } from '../updateArtifactLinks';

const Artifacts = ({ data }) => {
  const [artifacts, setArtifacts] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    artifactId: '',
    name: '',
    description: '',
    link: '',
    linkedSubcategoryIds: []
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
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
      console.log("Loaded artifacts from localStorage:", JSON.parse(storedArtifacts));
    } else {
      console.log("First time download or no stored artifacts, loading from profile data");
      // Load from profile data for first-time download
      fetch('/tblProfile_Demo.csv')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(csvText => {
          console.log("Profile CSV text fetched successfully, parsing...");
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              console.log("Profile CSV parsing complete, results:", results.data);
              
              // Extract artifacts from profile data
              const extractedArtifacts = extractArtifactsFromProfile(results.data);
              console.log("Extracted artifacts from profile data:", extractedArtifacts);
              
              // Set flag to indicate data has been downloaded
              localStorage.setItem('hasDownloaded', 'true');
              
              setArtifacts(extractedArtifacts);
              localStorage.setItem('artifacts', JSON.stringify(extractedArtifacts));
            },
            error: (error) => {
              console.error('Error parsing CSV:', error);
              // Fallback to sample artifacts if CSV loading fails
              const sampleArtifacts = [
                { 
                  id: 1,
                  artifactId: 'A1',
                  name: 'SOC-Ticket-1001', 
                  description: 'Phishing Attack', 
                  link: 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/public/Sample_Artifacts/SOC-Ticket-1001.md',
                  linkedSubcategoryIds: ['DE.AE-02 Ex1'] 
                },
                { 
                  id: 2,
                  artifactId: 'A2',
                  name: 'SOC-Ticket-1004', 
                  description: 'Unauthorized BitTorrent Traffic', 
                  link: 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/public/Sample_Artifacts/SOC-Ticket-1004.md',
                  linkedSubcategoryIds: ['DE.AE-08 Ex1'] 
                }
              ];
              setArtifacts(sampleArtifacts);
              localStorage.setItem('artifacts', JSON.stringify(sampleArtifacts));
            }
          });
        })
        .catch(error => {
          console.error('Error fetching CSV:', error);
          // Fallback to sample artifacts if CSV fetch fails
          const sampleArtifacts = [
            { 
              id: 1,
              artifactId: 'A1',
              name: 'SOC-Ticket-1001', 
              description: 'Phishing Attack', 
              link: 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/public/Sample_Artifacts/SOC-Ticket-1001.md',
              linkedSubcategoryIds: ['DE.AE-02 Ex1'] 
            },
            { 
              id: 2,
              artifactId: 'A2',
              name: 'SOC-Ticket-1004', 
              description: 'Unauthorized BitTorrent Traffic', 
              link: 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/public/Sample_Artifacts/SOC-Ticket-1004.md',
              linkedSubcategoryIds: ['DE.AE-08 Ex1'] 
            }
          ];
          setArtifacts(sampleArtifacts);
          localStorage.setItem('artifacts', JSON.stringify(sampleArtifacts));
        });
    }
  }, []);
  
  // Handle CSV import
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("Imported CSV parsing complete, results:", results.data);
          
          // Process imported CSV data
          const updatedArtifacts = processImportedCSV(results.data);
          console.log("Updated artifacts from imported CSV:", updatedArtifacts);
          
          setArtifacts(updatedArtifacts);
        },
        error: (error) => {
          console.error('Error parsing imported CSV:', error);
          alert('Error parsing the imported CSV file. Please check the format and try again.');
        }
      });
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = null;
  };
  
  // Handle CSV export
  const handleExportCSV = () => {
    // Create CSV content
    const csvData = artifacts.map(artifact => ({
      'Artifact ID': artifact.artifactId,
      'Name': artifact.name,
      'Description': artifact.description,
      'Link': artifact.link,
      'Linked Artifact URL': artifact.link,
      'Linked Subcategory IDs': artifact.linkedSubcategoryIds.join(', ')
    }));
    
    // Convert to CSV
    const csv = Papa.unparse(csvData);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'artifacts_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Save artifacts to localStorage whenever they change
  useEffect(() => {
    if (artifacts.length > 0) {
      localStorage.setItem('artifacts', JSON.stringify(artifacts));
    }
  }, [artifacts]);
  
  // Update subcategory linkages in the main data
  const updateSubcategoryLinkages = (artifact, oldLinkedSubcategoryIds = []) => {
    // Get the main data from localStorage
    const storedData = localStorage.getItem('mainData');
    if (!storedData) {
      // If there's no mainData in localStorage, use the data prop
      if (!data) return;
      
      // Store the data prop in localStorage for future use
      localStorage.setItem('mainData', JSON.stringify(data));
    }
    
    try {
      // Get the main data from localStorage or use the data prop
      let mainData = storedData ? JSON.parse(storedData) : [...data];
      
      // For each subcategory ID in the artifact's linkedSubcategoryIds
      artifact.linkedSubcategoryIds.forEach(fullId => {
        // Find the corresponding item in the main data
        const item = mainData.find(item => item.ID === fullId);
        if (item) {
          // If the artifact is not already in the item's linkedArtifacts, add it
          if (!item.linkedArtifacts) {
            item.linkedArtifacts = [];
          }
          
          if (!item.linkedArtifacts.includes(artifact.name)) {
            item.linkedArtifacts.push(artifact.name);
            console.log(`Added artifact ${artifact.name} to item ${item.ID}`);
          }
        } else {
          console.log(`Could not find item with ID ${fullId} in mainData`);
          // Try to find the item by Subcategory ID instead
          const itemBySubcategoryId = mainData.find(item => item["Subcategory ID"] === fullId);
          if (itemBySubcategoryId) {
            console.log(`Found item with Subcategory ID ${fullId}`);
            // If the artifact is not already in the item's linkedArtifacts, add it
            if (!itemBySubcategoryId.linkedArtifacts) {
              itemBySubcategoryId.linkedArtifacts = [];
            }
            
            if (!itemBySubcategoryId.linkedArtifacts.includes(artifact.name)) {
              itemBySubcategoryId.linkedArtifacts.push(artifact.name);
              console.log(`Added artifact ${artifact.name} to item ${itemBySubcategoryId.ID}`);
            }
          } else {
            console.log(`Could not find item with Subcategory ID ${fullId} in mainData`);
          }
        }
      });
      
      // For each subcategory ID that was removed
      oldLinkedSubcategoryIds.forEach(fullId => {
        if (!artifact.linkedSubcategoryIds.includes(fullId)) {
          // Find the corresponding item in the main data
          const item = mainData.find(item => item.ID === fullId);
          if (item && item.linkedArtifacts) {
            // Remove the artifact from the item's linkedArtifacts
            item.linkedArtifacts = item.linkedArtifacts.filter(name => name !== artifact.name);
            console.log(`Removed artifact ${artifact.name} from item ${item.ID}`);
          } else {
            console.log(`Could not find item with ID ${fullId} in mainData for removal`);
            // Try to find the item by Subcategory ID instead
            const itemBySubcategoryId = mainData.find(item => item["Subcategory ID"] === fullId);
            if (itemBySubcategoryId && itemBySubcategoryId.linkedArtifacts) {
              console.log(`Found item with Subcategory ID ${fullId} for removal`);
              // Remove the artifact from the item's linkedArtifacts
              itemBySubcategoryId.linkedArtifacts = itemBySubcategoryId.linkedArtifacts.filter(name => name !== artifact.name);
              console.log(`Removed artifact ${artifact.name} from item ${itemBySubcategoryId.ID}`);
            } else {
              console.log(`Could not find item with Subcategory ID ${fullId} in mainData for removal`);
            }
          }
        }
      });
      
      // Save the updated main data to localStorage
      localStorage.setItem('mainData', JSON.stringify(mainData));
      
      // Dispatch a custom event to notify App.js that the main data has been updated
      const event = new Event('mainDataUpdate');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating subcategory linkages:', error);
    }
  };
  
  // Extract all subcategory IDs from the data
  const subcategoryIds = data ? [...new Set(data.map(item => item.ID))].filter(Boolean).sort() : [];
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.link && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.link)) {
      newErrors.link = 'Link must be a valid URL';
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
    const oldIds = [...updatedIds]; // Save the old IDs for comparison
    
    if (updatedIds.includes(subcategoryId)) {
      // Remove the ID if it's already selected
      const index = updatedIds.indexOf(subcategoryId);
      updatedIds.splice(index, 1);
    } else {
      // Add the ID if it's not already selected
      updatedIds.push(subcategoryId);
    }
    
    // Update the form data
    const updatedFormData = {
      ...formData,
      linkedSubcategoryIds: updatedIds
    };
    
    setFormData(updatedFormData);
    
    // If we're in edit mode, update the subcategory linkages in real-time
    if (editMode && formData.id) {
      // Create a temporary artifact object with the updated linkedSubcategoryIds
      const tempArtifact = {
        ...formData,
        linkedSubcategoryIds: updatedIds
      };
      
      // Update the subcategory linkages
      updateSubcategoryLinkages(tempArtifact, oldIds);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let updatedArtifacts = [];
    let oldLinkedSubcategoryIds = [];
    
    if (editMode) {
      // Get the old linkedSubcategoryIds for the artifact being edited
      const oldArtifact = artifacts.find(a => a.id === formData.id);
      if (oldArtifact) {
        oldLinkedSubcategoryIds = [...oldArtifact.linkedSubcategoryIds];
      }
      
      // Update existing artifact
      updatedArtifacts = artifacts.map(artifact => 
        artifact.id === formData.id ? formData : artifact
      );
    } else {
      // Add new artifact
      const newId = Date.now(); // Simple way to generate unique IDs
      const newArtifact = {
        ...formData,
        id: newId,
        artifactId: formData.artifactId || `A${artifacts.length + 1}` // Set default artifactId if not provided
      };
      updatedArtifacts = [...artifacts, newArtifact];
    }
    
    // Update state and localStorage
    setArtifacts(updatedArtifacts);
    
    // Update subcategory linkages in the main data
    if (editMode) {
      updateSubcategoryLinkages(formData, oldLinkedSubcategoryIds);
    } else if (formData.linkedSubcategoryIds.length > 0) {
      updateSubcategoryLinkages(formData);
    }
    
    // Reset form
    resetForm();
  };
  
  // Handle edit artifact
  const handleEdit = (artifact) => {
    setFormData(artifact);
    setEditMode(true);
    setSelectedArtifact(artifact);
  };
  
  // Handle delete artifact
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this artifact?')) {
      // Get the artifact to be deleted
      const artifactToDelete = artifacts.find(artifact => artifact.id === id);
      
      // Update subcategory linkages in the main data
      if (artifactToDelete) {
        updateSubcategoryLinkages({
          ...artifactToDelete,
          linkedSubcategoryIds: [] // Empty array to remove all linkages
        }, artifactToDelete.linkedSubcategoryIds);
      }
      
      const updatedArtifacts = artifacts.filter(artifact => artifact.id !== id);
      setArtifacts(updatedArtifacts);
      
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
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Audit Artifacts</h1>
      
      <div className="flex flex-col gap-6">
        {/* Artifacts List */}
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Artifacts List</h2>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleImportCSV}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  title="Import artifacts from CSV"
                >
                  <Upload size={16} />
                  Import CSV
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                  title="Export artifacts to CSV"
                >
                  <Download size={16} />
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setSelectedArtifact(null);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  <Plus size={16} />
                  Add New Artifact
                </button>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Subcategories</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artifacts.length > 0 ? (
                  artifacts.map((artifact) => (
                    <tr 
                      key={artifact.id}
                      className={`hover:bg-blue-50 cursor-pointer ${selectedArtifact?.id === artifact.id ? 'bg-blue-100' : ''}`}
                      onClick={() => handleViewDetails(artifact)}
                    >
                      <td className="p-3 text-sm">{artifact.artifactId || `A${artifact.id}`}</td>
                      <td className="p-3 text-sm">{artifact.name}</td>
                      <td className="p-3 text-sm">
                        <div className="line-clamp-2">{artifact.description}</div>
                      </td>
                      <td className="p-3 text-sm">
                        {artifact.link ? (
                          <a 
                            href={artifact.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LinkIcon size={14} />
                            Link
                          </a>
                        ) : (
                          <span className="text-gray-400">No link</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {artifact.linkedSubcategoryIds.map(id => (
                            <span key={id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {id}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(artifact);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(artifact.id);
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-sm text-gray-500">
                      No artifacts found. Add a new artifact to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Artifact Form */}
        <div className="w-full">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">
              {editMode ? 'Edit Artifact' : 'Add New Artifact'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Artifact ID
                  </label>
                  <input
                    type="text"
                    name="artifactId"
                    value={formData.artifactId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter artifact ID (e.g., A1, A2)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter artifact name"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg h-24 ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Enter artifact description"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-xs mt-1">{errors.description}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg ${errors.link ? 'border-red-500' : ''}`}
                    placeholder="Enter artifact link"
                  />
                  {errors.link && (
                    <p className="text-red-600 text-xs mt-1">{errors.link}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Linked Subcategory IDs
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div 
                      className="w-full p-2 border rounded-lg flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer"
                      onClick={() => setDropdownOpen(prevState => !prevState)}
                    >
                      {formData.linkedSubcategoryIds.length > 0 ? (
                        formData.linkedSubcategoryIds.map(id => (
                          <span key={id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">
                            {id}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubcategoryIdChange(id);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">Select subcategory IDs</span>
                      )}
                    </div>
                    
                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {subcategoryIds.length > 0 ? (
                          subcategoryIds.map(id => (
                            <div 
                              key={id} 
                              className={`p-2 hover:bg-gray-100 cursor-pointer ${formData.linkedSubcategoryIds.includes(id) ? 'bg-blue-50' : ''}`}
                              onClick={() => {
                                handleSubcategoryIdChange(id);
                              }}
                            >
                              {id}
                            </div>
                          ))
                        ) : (
                          <p className="p-2 text-gray-500 text-sm">No subcategory IDs available</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  {editMode ? <Save size={16} /> : <Plus size={16} />}
                  {editMode ? 'Save Changes' : 'Add Artifact'}
                </button>
                
                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          
          {/* Artifact Details */}
          {selectedArtifact && !editMode && (
            <div className="bg-white p-4 rounded-lg shadow-sm border mt-4">
              <h2 className="text-lg font-semibold mb-4">Artifact Details</h2>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Artifact ID</h3>
                  <p>{selectedArtifact.artifactId || `A${selectedArtifact.id}`}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{selectedArtifact.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="whitespace-pre-wrap">{selectedArtifact.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Link</h3>
                  {selectedArtifact.link ? (
                    <a 
                      href={selectedArtifact.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <LinkIcon size={14} />
                      {selectedArtifact.link}
                    </a>
                  ) : (
                    <p className="text-gray-400">No link provided</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Linked Subcategory IDs</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedArtifact.linkedSubcategoryIds.length > 0 ? (
                      selectedArtifact.linkedSubcategoryIds.map(id => (
                        <span key={id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {id}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400">No subcategories linked</p>
                    )}
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={() => handleEdit(selectedArtifact)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                  >
                    <Edit size={16} />
                    Edit Artifact
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Artifacts;
