import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import useUserStore from '../stores/userStore';

// Dropdown geometry. WIDTH must stay in sync with the `w-72` class on the
// panel — the position math needs the width before the panel is measurable.
const DROPDOWN_WIDTH = 288; // .w-72 = 18rem
const VIEWPORT_MARGIN = 8;

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
  disabled = false,
  // Assessment scoping (issue #297). When scopeUserIds is an array, the
  // dropdown lists ONLY those users (the assessment's roster) by default —
  // the rest of the directory stays behind an explicit "Browse directory"
  // expansion (or a typed search). Picking a directory user calls
  // onAddToScope(userId) so the caller can link them onto the roster —
  // without that, a rosterless assessment would be a dead end.
  scopeUserIds,
  onAddToScope
}) => {
  const users = useUserStore((state) => state.users);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [browseDirectory, setBrowseDirectory] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const scoped = Array.isArray(scopeUserIds);
  const scopeSet = scoped ? new Set(scopeUserIds) : null;

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
  const matchesSearch = (user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.title?.toLowerCase().includes(searchLower)
    );
  };
  const filteredUsers = (scoped ? users.filter(u => scopeSet.has(u.id)) : users).filter(matchesSearch);
  const directoryUsers = scoped ? users.filter(u => !scopeSet.has(u.id)).filter(matchesSearch) : [];
  const showDirectory = scoped && (browseDirectory || searchTerm.trim() !== '');

  // Handle selecting a user
  const handleSelectUser = (user) => {
    if (scoped && !scopeSet.has(user.id) && onAddToScope) {
      onAddToScope(user.id);
    }
    if (multiple) {
      if (selectedUsers && selectedUsers.includes(user.id)) {
        onChange(selectedUsers.filter(id => id !== user.id));
      } else {
        onChange([...(selectedUsers || []), user.id]);
      }
    } else {
      onChange(user.id);
      setDropdownOpen(false);
      setBrowseDirectory(false);
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

  // Anchor the dropdown to the trigger in viewport coordinates.
  //
  // The panel is portalled to <body> and positioned `fixed` rather than
  // absolutely inside the trigger: the Assessments Details pane is an
  // `overflow-auto` column, so an absolutely-positioned panel is clipped by
  // that pane instead of overflowing it — the panel scrolls out of sight
  // rather than being visible on top (issue: auditor list appeared off-screen).
  // Clamping keeps the panel fully on screen when the trigger sits near an
  // edge, which is the normal case here — the Auditor trigger is right-aligned.
  const updateDropdownPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const t = trigger.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const panelH = dropdownRef.current?.offsetHeight || 0;

    // Prefer left-aligned with the trigger; pull it back when the panel would
    // run past the right edge, and never push it past the left edge.
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(t.left, vw - DROPDOWN_WIDTH - VIEWPORT_MARGIN)
    );

    // Below the trigger, flipping above when there isn't room underneath.
    let top = t.bottom + VIEWPORT_MARGIN;
    if (panelH && top + panelH > vh - VIEWPORT_MARGIN) {
      const above = t.top - panelH - VIEWPORT_MARGIN;
      top = above >= VIEWPORT_MARGIN
        ? above
        : Math.max(VIEWPORT_MARGIN, vh - panelH - VIEWPORT_MARGIN);
    }

    setDropdownPos((prev) =>
      prev && prev.top === top && prev.left === left ? prev : { top, left }
    );
  }, []);

  // Measure before paint so the panel never flashes at the wrong spot. Track
  // scroll in the capture phase — the pane that scrolls is an ancestor div,
  // not window, so a bubbling listener would never fire.
  useLayoutEffect(() => {
    if (!dropdownOpen) {
      setDropdownPos(null);
      return undefined;
    }
    updateDropdownPosition();

    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
    // Search/browse change the panel's height, which changes the flip decision.
  }, [dropdownOpen, searchTerm, browseDirectory, updateDropdownPosition]);

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
        setBrowseDirectory(false);
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

  // One dropdown row — shared by the main (roster) list and the directory section
  const renderUserRow = (user) => {
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

            {/* Dropdown — portalled to <body> so the Details pane's
                `overflow-auto` can't clip it; see updateDropdownPosition. */}
            {dropdownOpen && createPortal(
              <div
                ref={dropdownRef}
                className="w-72 bg-white border rounded-lg shadow-xl"
                style={{
                  position: 'fixed',
                  top: dropdownPos ? dropdownPos.top : 0,
                  left: dropdownPos ? dropdownPos.left : 0,
                  // z-[9999] was a no-op — this stylesheet defines no z-50+
                  // utilities and no arbitrary-value classes.
                  zIndex: 9999,
                  visibility: dropdownPos ? 'visible' : 'hidden',
                }}
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
                    filteredUsers.map(user => renderUserRow(user))
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      {searchTerm
                        ? 'No matching users'
                        : (scoped ? 'No users on this assessment yet' : 'No users available')}
                    </div>
                  )}

                  {/* Directory expansion (scoped mode): the rest of the user
                      directory, behind an explicit browse/search step so demo
                      or unrelated users never crowd the assessment's own list */}
                  {scoped && !showDirectory && (
                    <div className="p-2 border-t">
                      <button
                        className="w-full px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        onClick={() => setBrowseDirectory(true)}
                      >
                        Browse directory…
                      </button>
                    </div>
                  )}
                  {scoped && showDirectory && (
                    <div className="border-t">
                      <div className="p-2 text-xs text-gray-500">
                        Directory — selecting adds the user to this assessment
                      </div>
                      {directoryUsers.length > 0 ? (
                        directoryUsers.map(user => renderUserRow(user))
                      ) : (
                        <div className="p-4 text-sm text-gray-500 text-center">
                          {searchTerm ? 'No matching directory users' : 'No other users in the directory'}
                        </div>
                      )}
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
              </div>,
              document.body
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
