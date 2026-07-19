/**
 * Assessment year + user scope (issues #291/#290).
 *
 * #291: every assessment carries the calendar year its Q1–Q4 scores cover.
 * #290: the wizard's Users step records who is in scope as { userId, role }
 * pairs (role: auditor | control owner | stakeholder). PII (names/emails)
 * lives only in the user directory — never embedded on the assessment — so
 * these fields are safe to ride share exports alongside the existing
 * observation auditorId references.
 */
import {
  normalizeAssessmentYear,
  normalizeAssessmentUsers,
  ASSESSMENT_USER_ROLES
} from './assessmentsStore';
import useAssessmentsStore from './assessmentsStore';
import useUserStore from './userStore';
import { exportAllDataJSON, buildShareableExport } from '../utils/dataExport';

const THIS_YEAR = new Date().getFullYear();

describe('normalizeAssessmentYear (issue #291)', () => {
  test('keeps a valid integer year', () => {
    expect(normalizeAssessmentYear(2024)).toBe(2024);
    expect(normalizeAssessmentYear('2024')).toBe(2024);
  });

  test('defaults to the current year for missing or junk values', () => {
    expect(normalizeAssessmentYear(undefined)).toBe(THIS_YEAR);
    expect(normalizeAssessmentYear(null)).toBe(THIS_YEAR);
    expect(normalizeAssessmentYear('')).toBe(THIS_YEAR);
    expect(normalizeAssessmentYear('twenty')).toBe(THIS_YEAR);
    expect(normalizeAssessmentYear(2024.5)).toBe(THIS_YEAR);
  });

  test('rejects years outside the sane calendar window', () => {
    expect(normalizeAssessmentYear(1969)).toBe(THIS_YEAR);
    expect(normalizeAssessmentYear(2101)).toBe(THIS_YEAR);
    expect(normalizeAssessmentYear(1970)).toBe(1970);
    expect(normalizeAssessmentYear(2100)).toBe(2100);
  });

  test('honors an explicit fallback (the migration passes createdDate vintage)', () => {
    expect(normalizeAssessmentYear(undefined, 2022)).toBe(2022);
  });
});

describe('normalizeAssessmentUsers (issue #290)', () => {
  test('the role enum is exactly auditor / control owner / stakeholder', () => {
    expect(ASSESSMENT_USER_ROLES).toEqual(['auditor', 'control owner', 'stakeholder']);
  });

  test('keeps well-formed pairs and normalizes role case/whitespace', () => {
    expect(normalizeAssessmentUsers([
      { userId: 1, role: 'auditor' },
      { userId: 'u-2', role: ' Control Owner ' },
      { userId: 3, role: 'STAKEHOLDER' }
    ])).toEqual([
      { userId: 1, role: 'auditor' },
      { userId: 'u-2', role: 'control owner' },
      { userId: 3, role: 'stakeholder' }
    ]);
  });

  test('drops unknown roles, missing userIds, non-objects, and non-arrays', () => {
    expect(normalizeAssessmentUsers([
      { userId: 1, role: 'admin' },
      { role: 'auditor' },
      { userId: '', role: 'auditor' },
      'garbage',
      null,
      42
    ])).toEqual([]);
    expect(normalizeAssessmentUsers(undefined)).toEqual([]);
    expect(normalizeAssessmentUsers('not-an-array')).toEqual([]);
  });

  test('dedupes by userId — first entry wins', () => {
    expect(normalizeAssessmentUsers([
      { userId: 1, role: 'auditor' },
      { userId: 1, role: 'stakeholder' }
    ])).toEqual([{ userId: 1, role: 'auditor' }]);
  });

  test('Anti: PII and foreign fields cannot ride through — output is userId+role only', () => {
    const result = normalizeAssessmentUsers([
      { userId: 1, role: 'auditor', name: 'Jane Real', email: 'jane.real@corp.example', notes: 'x' }
    ]);
    expect(result).toEqual([{ userId: 1, role: 'auditor' }]);
    expect(Object.keys(result[0]).sort()).toEqual(['role', 'userId']);
  });
});

describe('assessment records carry year + users (issues #291/#290)', () => {
  let assessmentId;

  afterEach(() => {
    if (assessmentId) {
      useAssessmentsStore.getState().deleteAssessment(assessmentId);
      assessmentId = null;
    }
  });

  test('createAssessment defaults year to the current year and users to empty', () => {
    const created = useAssessmentsStore.getState().createAssessment({ name: 'Year default test' });
    assessmentId = created.id;
    expect(created.year).toBe(THIS_YEAR);
    expect(created.users).toEqual([]);
  });

  test('createAssessment persists the wizard year and normalized user scope', () => {
    const created = useAssessmentsStore.getState().createAssessment({
      name: 'Year+users test',
      year: 2027,
      users: [
        { userId: 9, role: 'auditor', email: 'smuggled@example.com' },
        { userId: 9, role: 'stakeholder' },
        { userId: 10, role: 'bogus' }
      ]
    });
    assessmentId = created.id;
    const stored = useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId);
    expect(stored.year).toBe(2027);
    expect(stored.users).toEqual([{ userId: 9, role: 'auditor' }]);
  });

  test('updateAssessment guards year and users at the producer', () => {
    const created = useAssessmentsStore.getState().createAssessment({ name: 'Producer guard test' });
    assessmentId = created.id;
    useAssessmentsStore.getState().updateAssessment(assessmentId, {
      year: 'junk',
      users: [{ userId: 4, role: 'Control Owner', email: 'smuggled@example.com' }, 'garbage']
    });
    const stored = useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId);
    expect(stored.year).toBe(THIS_YEAR);
    expect(stored.users).toEqual([{ userId: 4, role: 'control owner' }]);
  });

  test('year and users survive both complete backups and default share exports', () => {
    const created = useAssessmentsStore.getState().createAssessment({
      name: 'Export ride test',
      year: 2028,
      users: [{ userId: 5, role: 'stakeholder' }]
    });
    assessmentId = created.id;
    const storeMap = { assessmentsStore: useAssessmentsStore };

    const backup = exportAllDataJSON(storeMap);
    const backupRecord = backup.data.assessments.find(a => a.id === assessmentId);
    expect(backupRecord.year).toBe(2028);
    expect(backupRecord.users).toEqual([{ userId: 5, role: 'stakeholder' }]);

    const share = buildShareableExport(storeMap);
    const shareRecord = share.data.assessments.find(a => a.id === assessmentId);
    expect(shareRecord.year).toBe(2028);
    expect(shareRecord.users).toEqual([{ userId: 5, role: 'stakeholder' }]);
  });
});

describe('user directory PII vs share export (issue #290)', () => {
  const REAL_NAME = 'Directory Canary Person';
  const REAL_EMAIL = 'directory.canary@real-corp.example';
  let canaryUserId;

  beforeEach(() => {
    canaryUserId = useUserStore.getState().addUser({
      name: REAL_NAME,
      title: 'Auditor',
      email: REAL_EMAIL
    });
  });

  afterEach(() => {
    useUserStore.getState().deleteUser(canaryUserId);
  });

  test('complete backups keep the full user directory — that is their job', () => {
    const backup = exportAllDataJSON({ userStore: useUserStore });
    const serialized = JSON.stringify(backup);
    expect(serialized).toContain(REAL_NAME);
    expect(serialized).toContain(REAL_EMAIL);
    expect(backup.metadata.userCount).toBeGreaterThan(0);
  });

  test('Anti: the default share export carries NO user names or emails — payload-wide sweep', () => {
    const share = buildShareableExport({ userStore: useUserStore, assessmentsStore: useAssessmentsStore });
    const serialized = JSON.stringify(share);
    // The users KEY must be absent (not an empty list): restore applies every
    // section present in a file, so [] would wipe the receiving install's own
    // directory, while an absent section is left untouched (pinned by the
    // dataImport 'sections absent from the file are left untouched' test).
    expect(share.data.users).toBeUndefined();
    expect(share.metadata.userCount).toBe(0);
    expect(serialized).not.toContain(REAL_NAME);
    expect(serialized).not.toContain(REAL_EMAIL);
  });

  test('the include-private opt-in keeps the directory', () => {
    const share = buildShareableExport(
      { userStore: useUserStore, assessmentsStore: useAssessmentsStore },
      { includePrivate: true }
    );
    const serialized = JSON.stringify(share);
    expect(serialized).toContain(REAL_NAME);
    expect(serialized).toContain(REAL_EMAIL);
  });
});

describe('findOrCreateUserByEmail — email-authoritative wizard resolver (issue #290)', () => {
  const created = [];
  const track = (id) => { created.push(id); return id; };

  afterEach(() => {
    created.splice(0).forEach(id => useUserStore.getState().deleteUser(id));
  });

  test('two people sharing a name but not an email stay two distinct users', () => {
    const a = track(useUserStore.getState().findOrCreateUserByEmail({
      name: 'John Smith', email: 'john.smith@corp-a.example', title: 'Auditor'
    }));
    const b = track(useUserStore.getState().findOrCreateUserByEmail({
      name: 'John Smith', email: 'john.smith@corp-b.example', title: 'Stakeholder'
    }));
    expect(a).not.toBe(b);
    expect(useUserStore.getState().getUserById(a).email).toBe('john.smith@corp-a.example');
    expect(useUserStore.getState().getUserById(b).email).toBe('john.smith@corp-b.example');
  });

  test('an existing email binds to the existing user without clobbering their record', () => {
    const first = track(useUserStore.getState().findOrCreateUserByEmail({
      name: 'Original Name', email: 'stable@corp.example', title: 'Control Owner'
    }));
    const again = useUserStore.getState().findOrCreateUserByEmail({
      name: 'Different Typed Name', email: 'STABLE@corp.example', title: 'Auditor'
    });
    expect(again).toBe(first);
    const user = useUserStore.getState().getUserById(first);
    expect(user.name).toBe('Original Name');
    expect(user.title).toBe('Control Owner');
  });

  test('a missing email returns null (the wizard validates email before this runs)', () => {
    expect(useUserStore.getState().findOrCreateUserByEmail({ name: 'No Email' })).toBeNull();
  });
});

describe('assessment user roster actions (issue #297)', () => {
  const rosterOf = (id) =>
    useAssessmentsStore.getState().assessments.find(a => a.id === id).users;

  const makeAssessment = (users = []) =>
    useAssessmentsStore.getState().createAssessment({ name: 'Roster test', users }).id;

  test('addAssessmentUser appends a normalized pair with the given role', () => {
    const id = makeAssessment();
    useAssessmentsStore.getState().addAssessmentUser(id, 42, 'auditor');
    expect(rosterOf(id)).toEqual([{ userId: 42, role: 'auditor' }]);
  });

  test('adding the same user twice dedupes (first role wins)', () => {
    const id = makeAssessment();
    useAssessmentsStore.getState().addAssessmentUser(id, 42, 'auditor');
    useAssessmentsStore.getState().addAssessmentUser(id, 42, 'stakeholder');
    expect(rosterOf(id)).toEqual([{ userId: 42, role: 'auditor' }]);
  });

  test('an unknown role is coerced to stakeholder, not dropped', () => {
    const id = makeAssessment();
    useAssessmentsStore.getState().addAssessmentUser(id, 42, 'Supreme Leader');
    expect(rosterOf(id)).toEqual([{ userId: 42, role: 'stakeholder' }]);
  });

  test('removeAssessmentUser removes exactly that user', () => {
    const id = makeAssessment([{ userId: 1, role: 'auditor' }, { userId: 2, role: 'stakeholder' }]);
    useAssessmentsStore.getState().removeAssessmentUser(id, 1);
    expect(rosterOf(id)).toEqual([{ userId: 2, role: 'stakeholder' }]);
  });

  test('setAssessmentUserRole changes the role; an invalid role is refused (pair kept)', () => {
    const id = makeAssessment([{ userId: 1, role: 'auditor' }]);
    useAssessmentsStore.getState().setAssessmentUserRole(id, 1, 'control owner');
    expect(rosterOf(id)).toEqual([{ userId: 1, role: 'control owner' }]);
    useAssessmentsStore.getState().setAssessmentUserRole(id, 1, 'nonsense');
    expect(rosterOf(id)).toEqual([{ userId: 1, role: 'control owner' }]);
  });

  test('the shipped demo roster is a valid, already-normalized user scope', () => {
    // The seed must survive normalizeAssessmentUsers unchanged — otherwise
    // the demo assessment would install with a roster the producer gate
    // silently prunes.
    const { DEMO_ASSESSMENT_USERS } = require('./assessmentsStore');
    expect(normalizeAssessmentUsers(DEMO_ASSESSMENT_USERS)).toEqual(DEMO_ASSESSMENT_USERS);
    expect(DEMO_ASSESSMENT_USERS).toHaveLength(8);
  });
});
