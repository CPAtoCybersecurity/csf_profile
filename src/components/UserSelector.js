import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import useUserStore from '../stores/userStore';

// Generate a consistent color based on user name
const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
    'bg-cyan-500', 'bg-emerald-500'
  ];
  if (!name) return colors[0];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Avatar circle component
const UserAvatar = ({ user, size = 'md', showRemove = false, onRemove, onClick }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div className="relative group" title={`${user.name}${user.email ? ` (${user.email})` : ''}`}>
      <div
        className={`${sizeClasses[size]} ${getAvatarColor(user.name)} rounded-full flex items-center justify-center text-white font-medium cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 transition-all`}
        onClick={onClick}
      >
        {getInitials(user.name)}
      </div>
      {showRemove && (
        <button
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
};

const UserSelector = ({
  label,
  selectedUsers,
  onChange,
  multiple = false,
  disabled = false
}) => {
  const users = useUserStore((state) => state.users);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Get selected user objects
  const getSelectedUserObjects = () => {
    if (multiple) {
      return (selectedUsers || [])
        .map(id => users.find(u => u.id === id))
        .filter(Boolean);
    }
    if (selectedUsers) {
      const user = users.find(u => u.id === selectedUsers);
      return user ? [user] : [];
    }
    return [];
  };

  const selectedUserObjects = getSelectedUserObjects();

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.title?.toLowerCase().includes(searchLower)
    );
  });

  // Handle selecting a user
  const handleSelectUser = (user) => {
    if (multiple) {
      if (selectedUsers && selectedUsers.includes(user.id)) {
        onChange(selectedUsers.filter(id => id !== user.id));
      } else {
        onChange([...(selectedUsers || []), user.id]);
      }
    } else {
      onChange(user.id);
      setDropdownOpen(false);
    }
    setSearchTerm('');
  };

  // Handle removing a user
  const handleRemoveUser = (userId) => {
    if (multiple) {
      onChange((selectedUsers || []).filter(id => id !== userId));
    } else {
      onChange(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Check if user is selected
  const isUserSelected = (userId) => {
    if (multiple) {
      return selectedUsers && selectedUsers.includes(userId);
    }
    return selectedUsers === userId;
  };

  return (
    <div className="user-selector">
      <span className="text-sm font-medium text-gray-500 block mb-1">{label}:</span>

      <div className="flex items-center gap-1 flex-wrap">
        {/* Show selected user avatars */}
        {selectedUserObjects.map(user => (
          <UserAvatar
            key={user.id}
            user={user}
            size="md"
            showRemove={!disabled}
            onRemove={() => handleRemoveUser(user.id)}
          />
        ))}

        {/* Add button */}
        {!disabled && (
          <div className="relative" ref={triggerRef}>
            <button
              className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={multiple ? "Add user" : (selectedUserObjects.length > 0 ? "Change user" : "Select user")}
            >
              <Plus size={16} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute z-[9999] mt-2 left-0 w-72 bg-white border rounded-lg shadow-xl"
              >
                {/* Search input */}
                <div className="p-2 border-b">
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* User list */}
                <div className="max-h-60 overflow-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => {
                      const selected = isUserSelected(user.id);
                      return (
                        <button
                          key={user.id}
                          className={`w-full p-2 text-left hover:bg-gray-50 flex items-center gap-3 ${
                            selected ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleSelectUser(user)}
                        >
                          <UserAvatar user={user} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{user.name}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.email && <span className="text-blue-600">{user.email}</span>}
                              {user.email && user.title && <span className="mx-1">•</span>}
                              {user.title && <span>{user.title}</span>}
                            </div>
                          </div>
                          {selected && (
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      {searchTerm ? 'No matching users' : 'No users available'}
                    </div>
                  )}
                </div>

                {/* Footer with clear option */}
                {selectedUserObjects.length > 0 && (
                  <div className="p-2 border-t bg-gray-50">
                    <button
                      className="w-full px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      onClick={() => {
                        onChange(multiple ? [] : null);
                        setDropdownOpen(false);
                      }}
                    >
                      Clear {multiple ? 'all' : 'selection'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state when disabled and no selection */}
        {disabled && selectedUserObjects.length === 0 && (
          <span className="text-sm text-gray-400">Not assigned</span>
        )}
      </div>
    </div>
  );
};

export default UserSelector;
