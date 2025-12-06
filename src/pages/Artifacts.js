import React, { useState, useEffect, useRef } from 'react';
import { Edit, Trash2, Save, X, Plus, Link as LinkIcon, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import useCSFStore from '../stores/csfStore';
import useArtifactStore from '../stores/artifactStore';
import { extractArtifactsFromProfile, processImportedCSV } from '../updateArtifactLinks';

const Artifacts = () => {
  const data = useCSFStore((state) => state.data);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const setArtifacts = useArtifactStore((state) => state.setArtifacts);
  const addArtifact = useArtifactStore((state) => state.addArtifact);
  const updateArtifact = useArtifactStore((state) => state.updateArtifact);
  const deleteArtifact = useArtifactStore((state) => state.deleteArtifact);

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
    } else if (data && data.length > 0) {
      // Extract artifacts from profile data
      const extractedArtifacts = extractArtifactsFromProfile(data);
      if (extractedArtifacts.length > 0) {
        setArtifacts(extractedArtifacts);
      }
    }
  }, [data, setArtifacts]);

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
          const updatedArtifacts = processImportedCSV(results.data);
          setArtifacts(updatedArtifacts);
          toast.success(`Imported ${updatedArtifacts.length} artifacts`);
        },
        error: (error) => {
          console.error('Error parsing imported CSV:', error);
          toast.error('Error parsing the imported CSV file');
        }
      });
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  // Handle CSV export
  const handleExportCSV = () => {
    const csvData = artifacts.map(artifact => ({
      'Artifact ID': artifact.artifactId,
      'Name': artifact.name,
      'Description': artifact.description,
      'Link': artifact.link,
      'Linked Subcategory IDs': artifact.linkedSubcategoryIds.join(', ')
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'artifacts_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Artifacts exported to CSV');
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
      toast.success('Artifact updated');
    } else {
      addArtifact({
        ...formData,
        artifactId: formData.artifactId || `A${artifacts.length + 1}`
      });
      toast.success('Artifact added');
    }

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
    <div className="p-4 bg-white dark:bg-gray-900 min-h-full">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Audit Artifacts</h1>

      <div className="flex flex-col gap-6">
        {/* Artifacts List */}
        <div className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-white">Artifacts List</h2>
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

            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Link</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Linked Subcategories</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {artifacts.length > 0 ? (
                  artifacts.map((artifact) => (
                    <tr
                      key={artifact.id}
                      className={`hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer ${selectedArtifact?.id === artifact.id ? 'bg-blue-100 dark:bg-gray-600' : ''}`}
                      onClick={() => handleViewDetails(artifact)}
                    >
                      <td className="p-3 text-sm dark:text-white">{artifact.artifactId || `A${artifact.id}`}</td>
                      <td className="p-3 text-sm dark:text-white">{artifact.name}</td>
                      <td className="p-3 text-sm dark:text-white">
                        <div className="line-clamp-2">{artifact.description}</div>
                      </td>
                      <td className="p-3 text-sm">
                        {artifact.link ? (
                          <a
                            href={artifact.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LinkIcon size={14} />
                            Link
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">No link</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {artifact.linkedSubcategoryIds.map(id => (
                            <span key={id} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
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
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(artifact.id);
                            }}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                    <td colSpan="6" className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
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
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">
              {editMode ? 'Edit Artifact' : 'Add New Artifact'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Artifact ID
                  </label>
                  <input
                    type="text"
                    name="artifactId"
                    value={formData.artifactId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter artifact ID (e.g., A1, A2)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter artifact name"
                  />
                  {errors.name && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg h-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Enter artifact description"
                  />
                  {errors.description && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.link ? 'border-red-500' : ''}`}
                    placeholder="Enter artifact link"
                  />
                  {errors.link && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.link}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Linked Subcategory IDs
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div
                      className="w-full p-2 border rounded-lg flex items-center flex-wrap gap-1 min-h-[42px] cursor-pointer dark:bg-gray-700 dark:border-gray-600"
                      onClick={() => setDropdownOpen(prevState => !prevState)}
                    >
                      {formData.linkedSubcategoryIds.length > 0 ? (
                        formData.linkedSubcategoryIds.map(id => (
                          <span key={id} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs flex items-center gap-1">
                            {id}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubcategoryIdChange(id);
                              }}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">Select subcategory IDs</span>
                      )}
                    </div>

                    {dropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {subcategoryIds.length > 0 ? (
                          subcategoryIds.map(id => (
                            <div
                              key={id}
                              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer dark:text-white ${formData.linkedSubcategoryIds.includes(id) ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`}
                              onClick={() => {
                                handleSubcategoryIdChange(id);
                              }}
                            >
                              {id}
                            </div>
                          ))
                        ) : (
                          <p className="p-2 text-gray-500 dark:text-gray-400 text-sm">No subcategory IDs available</p>
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
                    className="flex items-center gap-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-white py-2 px-4 rounded-lg"
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
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 mt-4">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Artifact Details</h2>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Artifact ID</h3>
                  <p className="dark:text-white">{selectedArtifact.artifactId || `A${selectedArtifact.id}`}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                  <p className="dark:text-white">{selectedArtifact.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="whitespace-pre-wrap dark:text-white">{selectedArtifact.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Link</h3>
                  {selectedArtifact.link ? (
                    <a
                      href={selectedArtifact.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <LinkIcon size={14} />
                      {selectedArtifact.link}
                    </a>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500">No link provided</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Linked Subcategory IDs</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedArtifact.linkedSubcategoryIds.length > 0 ? (
                      selectedArtifact.linkedSubcategoryIds.map(id => (
                        <span key={id} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                          {id}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500">No subcategories linked</p>
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
