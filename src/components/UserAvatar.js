import React from 'react';

/**
 * UserAvatar Component
 * Displays user avatar with initials and name
 */

// Color palette for consistent avatar colors based on name
const AVATAR_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-red-500', text: 'text-white' },
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
];

// Get consistent color based on name hash
const getColorForName = (name) => {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Extract initials from name
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/**
 * UserAvatar - Circular avatar with initials
 */
export const UserAvatar = ({
  name,
  size = 'md',
  showName = false,
  className = '',
  onClick,
}) => {
  const color = getColorForName(name);
  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  const avatarElement = (
    <div
      className={`
        ${sizeClasses[size]}
        ${color.bg}
        ${color.text}
        rounded-full
        flex items-center justify-center
        font-medium
        flex-shrink-0
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      title={name}
      onClick={onClick}
    >
      {initials}
    </div>
  );

  if (showName) {
    return (
      <div className="inline-flex items-center gap-2" title={name}>
        {avatarElement}
        <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
          {name}
        </span>
      </div>
    );
  }

  return avatarElement;
};

/**
 * UserAvatarGroup - Stack of avatars with overflow
 */
export const UserAvatarGroup = ({
  users,
  maxVisible = 3,
  size = 'sm',
  onViewAll,
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, idx) => (
          <UserAvatar
            key={user.id || idx}
            name={user.name || user}
            size={size}
            className="ring-2 ring-white dark:ring-gray-900"
          />
        ))}
        {remainingCount > 0 && (
          <button
            onClick={onViewAll}
            className={`
              ${size === 'xs' ? 'w-5 h-5 text-[9px]' : ''}
              ${size === 'sm' ? 'w-6 h-6 text-[10px]' : ''}
              ${size === 'md' ? 'w-8 h-8 text-xs' : ''}
              ${size === 'lg' ? 'w-10 h-10 text-sm' : ''}
              rounded-full
              bg-gray-200 dark:bg-gray-600
              text-gray-600 dark:text-gray-200
              flex items-center justify-center
              font-medium
              ring-2 ring-white dark:ring-gray-900
              hover:bg-gray-300 dark:hover:bg-gray-500
              transition-colors
            `}
            title={`+${remainingCount} more`}
          >
            +{remainingCount}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * UserSelector Display - Shows selected user(s) with avatar
 */
export const UserDisplay = ({
  user,
  users,
  size = 'sm',
  placeholder = 'Unassigned',
  onClick,
}) => {
  // Handle multiple users
  if (users && users.length > 0) {
    if (users.length === 1) {
      return (
        <UserAvatar
          name={users[0].name || users[0]}
          size={size}
          showName={true}
          onClick={onClick}
          className={onClick ? 'cursor-pointer' : ''}
        />
      );
    }
    return (
      <UserAvatarGroup
        users={users}
        maxVisible={3}
        size={size}
        onViewAll={onClick}
      />
    );
  }

  // Handle single user
  if (user) {
    return (
      <UserAvatar
        name={typeof user === 'string' ? user : user.name}
        size={size}
        showName={true}
        onClick={onClick}
        className={onClick ? 'cursor-pointer' : ''}
      />
    );
  }

  // Empty state
  return (
    <div
      className={`
        inline-flex items-center gap-2
        ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-1 -mx-1' : ''}
      `}
      onClick={onClick}
    >
      <div
        className={`
          ${size === 'xs' ? 'w-5 h-5' : ''}
          ${size === 'sm' ? 'w-6 h-6' : ''}
          ${size === 'md' ? 'w-8 h-8' : ''}
          ${size === 'lg' ? 'w-10 h-10' : ''}
          rounded-full
          bg-gray-100 dark:bg-gray-700
          border-2 border-dashed border-gray-300 dark:border-gray-600
          flex items-center justify-center
        `}
      >
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <span className="text-sm text-gray-400 dark:text-gray-500 italic">
        {placeholder}
      </span>
    </div>
  );
};

export default UserAvatar;
