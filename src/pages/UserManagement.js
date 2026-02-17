import React, { useState, useRef } from 'react';
import { UserPlus, Edit, Trash2, Save, X, Upload, Download } from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import useUserStore from '../stores/userStore';
import { escapeCSVValue } from '../utils/sanitize';

const UserManagement = () => {
  const users = useUserStore((state) => state.users);
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const importUsers = useUserStore((state) => state.importUsers);

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
          // Transform CSV data to user format
          const importedUsers = results.data
            .filter(row => row["User"] || row["Name"] || row["name"])
            .map(row => ({
              name: row["User"] || row["Name"] || row["name"],
              title: row["Title"] || row["title"] || "Employee",
              email: row["Email"] || row["email"] || createEmail(row["User"] || row["Name"] || row["name"])
            }));

          if (importedUsers.length > 0) {
            importUsers(importedUsers);
            toast.success(`Imported ${importedUsers.length} users`);
          } else {
            toast.error('No valid users found in CSV');
          }
        },
        error: (error) => {
          console.error('Error parsing imported CSV:', error);
          toast.error('Error parsing the imported CSV file');
        }
      });
    };
    reader.readAsText(file);

    // Reset the file input
    event.target.value = null;
  };

  // Helper function to create email addresses
  const createEmail = (name) => {
    if (!name) return '';
    const formattedName = name.toLowerCase().replace(/\s+/g, '.');
    return `${formattedName}@almasecurity.com`;
  };

  // Handle CSV export
  const handleExportCSV = () => {
    const csvData = users.map(user => ({
      'User': escapeCSVValue(user.name),
      'Title': escapeCSVValue(user.title),
      'Email': escapeCSVValue(user.email)
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Users exported to CSV');
  };

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

    if (editMode) {
      updateUser(formData.id, formData);
      toast.success('User updated');
    } else {
      addUser({
        name: formData.name,
        title: formData.title,
        email: formData.email
      });
      toast.success('User added');
    }

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
      deleteUser(id);
      toast.success('User deleted');
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
    <div className="p-4 bg-white min-h-full">
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
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300:bg-gray-500 text-gray-700 py-2 px-4 rounded-lg"
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
                <tr key={user.id} className="hover:bg-gray-50:bg-gray-700">
                  <td className="p-3 text-sm">{user.name}</td>
                  <td className="p-3 text-sm">{user.title}</td>
                  <td className="p-3 text-sm">{user.email}</td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-blue-600 hover:text-blue-800:text-blue-300"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1 text-red-600 hover:text-red-800:text-red-300"
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
