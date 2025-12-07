import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Default users for new installations
const DEFAULT_USERS = [
  { id: 1, name: 'Gerry', title: 'CISO', email: 'gerry@almasecurity.com' },
  { id: 2, name: 'Steve', title: 'GRC Manager', email: 'steve@almasecurity.com' },
  { id: 3, name: 'Jane', title: 'Product Engineer', email: 'jane@almasecurity.com' },
  { id: 4, name: 'John', title: 'Financial Systems Analyst', email: 'john@almasecurity.com' },
  { id: 5, name: 'Chris.Magann', title: 'Security Engineer', email: 'chris.magann@almasecurity.com' },
  { id: 6, name: 'Nadia.Khan', title: 'Site Reliability Engineer', email: 'nadia.khan@almasecurity.com' },
  { id: 7, name: 'Tigan.Wang', title: 'Vulnerability Manager', email: 'tigan.wang@almasecurity.com' },
];

const useUserStore = create(
  persist(
    (set, get) => ({
      users: DEFAULT_USERS,

      // Add a single user
      addUser: (user) => {
        const newUser = {
          ...user,
          id: user.id || Date.now() + Math.floor(Math.random() * 1000),
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
          title: 'Imported User',
          email: email,
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
    }
  )
);

export default useUserStore;
