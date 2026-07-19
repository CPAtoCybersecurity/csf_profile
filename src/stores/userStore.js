import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { DEMO_SEED_SOURCE } from '../utils/assessmentScope';

// Default users for new installations — the demo (Alma Security) staff.
// seedSource marks them as shipped example data (issue #297) so the directory
// can badge them and future migrations can identify them exactly.
export const DEFAULT_USERS = [
  { id: 1, name: 'Gerry.Callahan', title: 'CISO', email: 'gerry.callahan@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
  { id: 2, name: 'Steve.Mercer', title: 'Director, Internal Audit', email: 'steve.mercer@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
  { id: 3, name: 'Jane.Alvarez', title: 'Product Engineer', email: 'jane.alvarez@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
  { id: 4, name: 'John.Tran', title: 'Financial Systems Analyst', email: 'john.tran@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
  { id: 5, name: 'Chris.Magann', title: 'Vulnerability Management Lead', email: 'chris.magann@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
  { id: 6, name: 'Nadia.Khan', title: 'Detection & Response Lead', email: 'nadia.khan@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
  { id: 7, name: 'Tigan.Wang', title: 'Vulnerability Management Engineer', email: 'tigan.wang@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
  { id: 8, name: 'Omar.Garza', title: 'Senior IT Auditor', email: 'omar.garza@almasecurity.com', seedSource: DEMO_SEED_SOURCE },
];

/**
 * Full persisted-state migration for csf-users-storage. Exported so tests
 * exercise the EXACT production path.
 */
export const migrateUsersState = (persistedState, version) => {
  let state = persistedState;
  // Version 2: Ensure default users have stable IDs
  // This fixes issues where users were created with random IDs during CSV import
  if (version < 2 && state?.users) {
    const defaultUsersByEmail = new Map(
      DEFAULT_USERS.map(u => [u.email.toLowerCase(), u])
    );

    // Update existing users to have correct IDs if they match default users
    const updatedUsers = state.users.map(user => {
      const defaultUser = defaultUsersByEmail.get(user.email?.toLowerCase());
      if (defaultUser && user.id !== defaultUser.id) {
        // Found a default user with wrong ID - keep the default ID
        return { ...user, id: defaultUser.id };
      }
      return user;
    });

    // Add any missing default users
    const existingEmails = new Set(updatedUsers.map(u => u.email?.toLowerCase()));
    DEFAULT_USERS.forEach(defaultUser => {
      if (!existingEmails.has(defaultUser.email.toLowerCase())) {
        updatedUsers.push(defaultUser);
      }
    });

    state = { users: updatedUsers };
  }
  state = state || { users: DEFAULT_USERS };
  // Version 3 (issue #297): stamp seed provenance on the shipped demo users
  // (see stampSeededDemoUsers).
  if (version < 3) {
    state = stampSeededDemoUsers(state);
  }
  return state;
};

/**
 * Issue #297: stamp seed provenance on the shipped demo users. Guard is exact
 * id + email match against the seeded set, so a user-created record can never
 * be marked demo. Only seedSource is added; edits (title, name) survive.
 * Idempotent — also run unconditionally by the restore path (dataImport.js),
 * whose bulk setters bypass this store's migrate.
 */
export function stampSeededDemoUsers(state) {
  if (!Array.isArray(state?.users)) return state;
  const demoEmailById = new Map(DEFAULT_USERS.map(u => [u.id, u.email.toLowerCase()]));
  let changed = false;
  const users = state.users.map(user => {
    // The match must be POSITIVE on both sides — a record with an unknown id
    // and no email must not match via undefined === undefined.
    const demoEmail = demoEmailById.get(user.id);
    if (user.seedSource || !demoEmail || demoEmail !== user.email?.toLowerCase()) return user;
    changed = true;
    return { ...user, seedSource: DEMO_SEED_SOURCE };
  });
  return changed ? { ...state, users } : state;
}

const useUserStore = create(
  persist(
    (set, get) => ({
      users: DEFAULT_USERS,

      // Add a single user
      addUser: (user) => {
        const newUser = {
          ...user,
          id: user.id || uuidv4(),
        };
        set((state) => ({
          users: [...state.users, newUser]
        }));
        return newUser.id;
      },

      // Update a user
      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map(user =>
            user.id === id ? { ...user, ...updates } : user
          )
        }));
      },

      // Delete a user
      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter(user => user.id !== id)
        }));
      },

      // Get user by ID
      getUserById: (id) => {
        return get().users.find(user => user.id === id);
      },

      // Get user by email
      getUserByEmail: (email) => {
        return get().users.find(user =>
          user.email?.toLowerCase() === email?.toLowerCase()
        );
      },

      // Get user by name
      getUserByName: (name) => {
        return get().users.find(user =>
          user.name?.toLowerCase() === name?.toLowerCase()
        );
      },

      // Find or create user
      findOrCreateUser: (userInfo) => {
        if (!userInfo.name) return null;

        const state = get();

        // Try to find by email first
        if (userInfo.email) {
          const existingUser = state.getUserByEmail(userInfo.email);
          if (existingUser) return existingUser.id;
        }

        // Try to find by name
        const existingUser = state.getUserByName(userInfo.name);
        if (existingUser) return existingUser.id;

        // Create new user
        let email = userInfo.email;
        if (!email) {
          email = `${userInfo.name.replace(/\s+/g, '.').toLowerCase()}@almasecurity.com`;
        }

        return get().addUser({
          name: userInfo.name,
          title: userInfo.title || 'Imported User',
          email: email,
        });
      },

      // Email-authoritative resolver (issue #290 wizard). Unlike
      // findOrCreateUser, there is NO name fallback: distinct emails always
      // yield distinct users, and a typed email is never silently discarded
      // by a name match against an existing user. findOrCreateUser keeps its
      // name fallback for the CSV/import lanes that may lack emails.
      findOrCreateUserByEmail: ({ name, email, title }) => {
        const cleanEmail = typeof email === 'string' ? email.trim() : '';
        if (!cleanEmail) return null;
        const existing = get().getUserByEmail(cleanEmail);
        if (existing) return existing.id;
        return get().addUser({
          name: name || cleanEmail,
          title: title || 'Imported User',
          email: cleanEmail
        });
      },

      // Format user for display
      formatUser: (userId) => {
        if (!userId) return '';
        const user = get().getUserById(userId);
        if (!user) return String(userId);
        return user.email ? `${user.name} <${user.email}>` : user.name;
      },

      // Format multiple users
      formatUsers: (userIds) => {
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) return '';
        return userIds.map(id => get().formatUser(id)).filter(Boolean).join('; ');
      },

      // Set all users (for import)
      setUsers: (users) => {
        set({ users });
      },

      // Fix duplicate email domains
      fixEmailAddresses: () => {
        set((state) => ({
          users: state.users.map(user => {
            if (user.email && user.email.includes('@')) {
              const parts = user.email.split('@');
              if (parts.length > 2) {
                return {
                  ...user,
                  email: parts[0] + '@' + parts[parts.length - 1]
                };
              }
            }
            return user;
          })
        }));
      },
    }),
    {
      name: 'csf-users-storage',
      version: 3,
      migrate: (persistedState, version) => migrateUsersState(persistedState, version),
    }
  )
);

export default useUserStore;
