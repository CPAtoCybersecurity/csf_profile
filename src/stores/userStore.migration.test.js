import { migrateUsersState, DEFAULT_USERS } from './userStore';
import { DEMO_SEED_SOURCE } from '../utils/assessmentScope';

describe('migrateUsersState v3: demo-user provenance stamp (issue #297)', () => {
  const legacyDemoUser = () => {
    const { seedSource, ...rest } = DEFAULT_USERS[0];
    return rest;
  };

  test('stamps a persisted demo user matched by exact id + email', () => {
    const result = migrateUsersState({ users: [legacyDemoUser()] }, 2);
    expect(result.users[0].seedSource).toBe(DEMO_SEED_SOURCE);
  });

  test('a user-created record is never marked demo — same id, different email', () => {
    const mine = { id: 1, name: 'My Colleague', email: 'colleague@example.com' };
    const result = migrateUsersState({ users: [mine] }, 2);
    expect(result.users[0].seedSource).toBeUndefined();
  });

  test('a record with an unknown id and NO email is never marked demo (undefined must not match undefined)', () => {
    const mine = { id: 'u-mine', name: 'No Email User' };
    const result = migrateUsersState({ users: [mine] }, 2);
    expect(result.users[0].seedSource).toBeUndefined();
  });

  test('preserves user edits on a stamped record (only seedSource is added)', () => {
    const edited = { ...legacyDemoUser(), title: 'Retitled by the user' };
    const result = migrateUsersState({ users: [edited] }, 2);
    expect(result.users[0]).toEqual({ ...edited, seedSource: DEMO_SEED_SOURCE });
  });

  test('a v0 client falls through the id-repair AND picks up the stamp', () => {
    // v1 shape: demo user present under a wrong (import-era) id
    const wrongId = { ...legacyDemoUser(), id: 'random-uuid' };
    const result = migrateUsersState({ users: [wrongId] }, 1);
    const repaired = result.users.find(u => u.email === DEFAULT_USERS[0].email);
    expect(repaired.id).toBe(DEFAULT_USERS[0].id);
    expect(repaired.seedSource).toBe(DEMO_SEED_SOURCE);
  });

  test('an empty persisted state seeds the (stamped) defaults', () => {
    const result = migrateUsersState(undefined, 0);
    expect(result.users).toEqual(DEFAULT_USERS);
  });

  test('never deletes a record — counts equal before and after', () => {
    const users = [legacyDemoUser(), { id: 'u-mine', name: 'Me', email: 'me@example.com' }];
    expect(migrateUsersState({ users }, 2).users).toHaveLength(2);
  });
});
