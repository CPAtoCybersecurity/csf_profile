import React, { useState, useEffect } from 'react';
import { UserPlus, X, Users } from 'lucide-react';

const UserSelector = ({ 
  label, 
  selectedUsers, 
  onChange, 
  multiple = false,
  disabled = false
}) => {
  const [users, setUsers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Load users from localStorage
  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    };
    
    // Load users initially
    loadUsers();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', loadUsers);
    
    // Custom event for user updates
    const handleUserUpdate = () => loadUsers();
    window.addEventListener('userUpdate', handleUserUpdate);
    
    return () => {
      window.removeEventListener('storage', loadUsers);
      window.removeEventListener('userUpdate', handleUserUpdate);
    };
  }, []);
  
  // Handle selecting a user
  const handleSelectUser = (user) => {
    if (multiple) {
      // For multiple selection (like Stakeholder(s))
      if (selectedUsers && selectedUsers.includes(user.id)) {
        // Remove user if already selected
        onChange(selectedUsers.filter(id => id !== user.id));
      } else {
        // Add user to selection
        onChange([...(selectedUsers || []), user.id]);
      }
    } else {
      // For single selection (like Owner or Auditor)
      onChange(user.id === selectedUsers ? null : user.id);
    }
  };
  
  // Get user display info by ID (email only)
  const getUserDisplayInfo = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return "Not assigned";
    
    // Fix email if it has duplicate domains
    let email = user.email;
    if (email && email.includes('@')) {
      const parts = email.split('@');
      if (parts.length > 2) {
        // Keep only the first part and the last domain
        email = parts[0] + '@' + parts[parts.length - 1];
      }
    }
    
    // Just return the email if it exists, otherwise just name
    return email || user.name;
  };
  
  // Get user names for multiple selection
  const getSelectedUserDisplayInfo = () => {
    if (!selectedUsers || selectedUsers.length === 0) {
      return "None";
    }
    
    return selectedUsers
      .map(id => getUserDisplayInfo(id))
      .join(", ");
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-selector')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  return (
    <div className="flex items-center user-selector">
      <span className="text-sm font-medium text-gray-500 min-w-32">{label}:</span>
      
      {disabled ? (
        <span className="ml-2">
          {multiple ? getSelectedUserDisplayInfo() : getUserDisplayInfo(selectedUsers)}
        </span>
      ) : (
        <div className="relative ml-2">
          <div
            className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer bg-white hover:bg-gray-50"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Users size={16} className="text-gray-500" />
            <span className="text-sm">
              {multiple 
                ? (selectedUsers && selectedUsers.length > 0 
                    ? `${selectedUsers.length} selected` 
                    : "Select users")
                : (selectedUsers 
                    ? getUserDisplayInfo(selectedUsers) 
                    : "Select user")}
            </span>
          </div>
          
          {dropdownOpen && (
            <div className="absolute z-[9999] mt-1 w-64 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              <div className="p-2">
                {users.length > 0 ? (
                  <>
                    {multiple && (
                      <button
                        className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                        onClick={() => onChange([])}
                      >
                        <span>Clear selection</span>
                        <X size={16} className="text-gray-500" />
                      </button>
                    )}
                    
                    {!multiple && (
                      <button
                        className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                        onClick={() => onChange(null)}
                      >
                        <span>None</span>
                        <X size={16} className="text-gray-500" />
                      </button>
                    )}
                    
                    <div className="my-1 border-t border-gray-200"></div>
                    
                    {users.map(user => (
                      <button
                        key={user.id}
                        className="w-full p-2 text-left text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div>
                          <div>{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {user.email && (
                              <span className="text-blue-600">{user.email}</span>
                            )}
                            {user.email && user.title && <span className="mx-1">•</span>}
                            {user.title && <span>{user.title}</span>}
                          </div>
                        </div>
                        
                        {multiple && selectedUsers && selectedUsers.includes(user.id) && (
                          <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                        )}
                        
                        {!multiple && selectedUsers === user.id && (
                          <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-2 text-sm text-gray-500">
                    No users available. Add users in the User Management page.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelector;
