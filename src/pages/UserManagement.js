import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Edit, Trash2, Save, X, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';

// Helper function to create email addresses
const createEmail = (name) => {
  if (!name) return '';
  
  // Convert name to lowercase and replace spaces with dots
  const formattedName = name.toLowerCase().replace(/\s+/g, '.');
  
  // Return the email with the almasecurity.com domain
  return `${formattedName}@almasecurity.com`;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    title: '',
    email: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  
  // File input ref for CSV import
  const fileInputRef = useRef(null);
  
  // Load users from localStorage or profile data on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    const isFirstTimeDownload = !localStorage.getItem('hasDownloaded');
    
    if (storedUsers && !isFirstTimeDownload) {
      setUsers(JSON.parse(storedUsers));
    } else {
      console.log("First time download or no stored users, loading from profile data");
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
              
              // Extract unique users from profile data
              const userMap = new Map();
              
              results.data.forEach(row => {
                if (row["User"] && !userMap.has(row["User"])) {
                  const user = {
                    id: Date.now() + Math.floor(Math.random() * 1000) + userMap.size,
                    name: row["User"],
                    title: row["Title"] || "Employee",
                    email: createEmail(row["User"])
                  };
                  userMap.set(row["User"], user);
                }
              });
              
              const extractedUsers = Array.from(userMap.values());
              console.log("Extracted users from profile data:", extractedUsers);
              
              // If no users were found in the profile data, use sample users
              if (extractedUsers.length === 0) {
                const sampleUsers = [
                  { id: 1, name: 'John Doe', title: 'Accountant', email: 'john.doe@almasecurity.com' },
                  { id: 2, name: 'Jane Smith', title: 'IT Director', email: 'jane.smith@almasecurity.com' },
                  { id: 3, name: 'Steve', title: 'GRC Analyst', email: 'steve@almasecurity.com' }
                ];
                setUsers(sampleUsers);
                localStorage.setItem('users', JSON.stringify(sampleUsers));
              } else {
                setUsers(extractedUsers);
                localStorage.setItem('users', JSON.stringify(extractedUsers));
              }
              
              // Set flag to indicate data has been downloaded
              localStorage.setItem('hasDownloaded', 'true');
            },
            error: (error) => {
              console.error('Error parsing CSV:', error);
              // Fallback to sample users if CSV loading fails
              const sampleUsers = [
                { id: 1, name: 'John Doe', title: 'Accountant', email: 'john.doe@almasecurity.com' },
                { id: 2, name: 'Jane Smith', title: 'IT Director', email: 'jane.smith@almasecurity.com' },
                { id: 3, name: 'Steve', title: 'GRC Analyst', email: 'steve@almasecurity.com' }
              ];
              setUsers(sampleUsers);
              localStorage.setItem('users', JSON.stringify(sampleUsers));
            }
          });
        })
        .catch(error => {
          console.error('Error fetching CSV:', error);
          // Fallback to sample users if CSV fetch fails
          const sampleUsers = [
            { id: 1, name: 'John Doe', title: 'Accountant', email: 'john.doe@almasecurity.com' },
            { id: 2, name: 'Jane Smith', title: 'IT Director', email: 'jane.smith@almasecurity.com' },
            { id: 3, name: 'Steve', title: 'GRC Analyst', email: 'steve@almasecurity.com' }
          ];
          setUsers(sampleUsers);
          localStorage.setItem('users', JSON.stringify(sampleUsers));
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
          const userMap = new Map();
          
          // First add existing users to the map
          users.forEach(user => {
            userMap.set(user.name, user);
          });
          
          // Then add or update users from the CSV
          results.data.forEach(row => {
            if (row["User"] && !userMap.has(row["User"])) {
              const user = {
                id: Date.now() + Math.floor(Math.random() * 1000) + userMap.size,
                name: row["User"],
                title: row["Title"] || "Employee",
                email: row["Email"] || createEmail(row["User"])
              };
              userMap.set(row["User"], user);
            }
          });
          
          const updatedUsers = Array.from(userMap.values());
          console.log("Updated users from imported CSV:", updatedUsers);
          
          setUsers(updatedUsers);
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new Event('userUpdate'));
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
    const csvData = users.map(user => ({
      'User': user.name,
      'Title': user.title,
      'Email': user.email
    }));
    
    // Convert to CSV
    const csv = Papa.unparse(csvData);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users]);
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let updatedUsers = [];
    
    if (editMode) {
      // Update existing user
      updatedUsers = users.map(user => 
        user.id === formData.id ? formData : user
      );
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: Date.now() // Simple way to generate unique IDs
      };
      updatedUsers = [...users, newUser];
    }
    
    // Update state and localStorage
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userUpdate'));
    
    // Reset form
    resetForm();
  };
  
  // Handle edit user
  const handleEdit = (user) => {
    setFormData(user);
    setEditMode(true);
  };
  
  // Handle delete user
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== id);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('userUpdate'));
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      title: '',
      email: ''
    });
    setEditMode(false);
    setErrors({});
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      {/* User Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editMode ? 'Edit User' : 'Add New User'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter job title"
              />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              {editMode ? <Save size={16} /> : <UserPlus size={16} />}
              {editMode ? 'Save Changes' : 'Add User'}
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
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Users List</h2>
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
              title="Import users from CSV"
            >
              <Upload size={16} />
              Import CSV
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
              title="Export users to CSV"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 text-sm">{user.name}</td>
                  <td className="p-3 text-sm">{user.title}</td>
                  <td className="p-3 text-sm">{user.email}</td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
                <td colSpan="4" className="p-3 text-center text-sm text-gray-500">
                  No users found. Add a new user to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
