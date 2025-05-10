import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Save, X } from 'lucide-react';

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
  
  // Load users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Set some sample users if none exist
      const sampleUsers = [
        { id: 1, name: 'John Doe', title: 'Security Analyst', email: 'john.doe@example.com' },
        { id: 2, name: 'Jane Smith', title: 'Compliance Officer', email: 'jane.smith@example.com' },
        { id: 3, name: 'Robert Johnson', title: 'IT Auditor', email: 'robert.johnson@example.com' }
      ];
      setUsers(sampleUsers);
      localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
  }, []);
  
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
