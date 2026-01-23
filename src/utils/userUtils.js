/**
 * Parse user information from strings like "John Doe <john@email.com>"
 * @param {string} userString - The string to parse
 * @returns {Object} - { name: string|null, email: string|null }
 */
export function parseUserInfo(userString) {
  if (!userString) return { name: null, email: null };

  // Check if the string has the format "Name <email>"
  const emailMatch = userString.match(/([^<]+)<([^>]+)>/);
  if (emailMatch) {
    return {
      name: emailMatch[1].trim(),
      email: emailMatch[2].trim(),
    };
  }

  // Check if the string itself is an email address
  if (userString.includes('@')) {
    return {
      name: userString.split('@')[0].trim(),
      email: userString.trim(),
    };
  }

  // If no email format is found, just return the string as the name
  return {
    name: userString.trim(),
    email: null,
  };
}

/**
 * Find an existing user or create a new one
 * @param {Object} userInfo - { name: string, email: string|null }
 * @param {Array} existingUsers - Array of existing users (will be mutated)
 * @returns {number|null} - The user ID
 */
export function findOrCreateUser(userInfo, existingUsers) {
  if (!userInfo.name) return null;

  // If we have an email, try to find a user with that email
  if (userInfo.email) {
    const existingUser = existingUsers.find(user =>
      user.email?.toLowerCase() === userInfo.email.toLowerCase()
    );

    if (existingUser) {
      return existingUser.id;
    }
  }

  // If no email or no user found with that email, try to find by name
  const existingUser = existingUsers.find(user =>
    user.name?.toLowerCase() === userInfo.name.toLowerCase()
  );

  if (existingUser) {
    return existingUser.id;
  }

  // If no user found, create a new one
  let email = userInfo.email;
  if (!email) {
    email = `${userInfo.name.replace(/\s+/g, '.').toLowerCase()}@almasecurity.com`;
  }

  const newUser = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: userInfo.name,
    title: 'Imported User',
    email: email,
  };

  // Add the new user to the existing users array
  existingUsers.push(newUser);

  return newUser.id;
}

/**
 * Format user information for display or export
 * @param {number} userId - The user ID
 * @param {Array} users - Array of users
 * @returns {string} - Formatted user string "Name <email>"
 */
export function formatUserInfo(userId, users) {
  if (!userId) return '';

  const user = users.find(u => u.id === userId);
  if (!user) return String(userId);

  return user.email ? `${user.name} <${user.email}>` : user.name;
}

/**
 * Format multiple user IDs for display or export
 * @param {Array} userIds - Array of user IDs
 * @param {Array} users - Array of users
 * @returns {string} - Semicolon-separated formatted users
 */
export function formatMultipleUsers(userIds, users) {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) return '';

  return userIds
    .map(id => formatUserInfo(id, users))
    .filter(Boolean)
    .join('; ');
}
