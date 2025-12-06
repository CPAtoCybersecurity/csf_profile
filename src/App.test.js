import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import App from './App';

// Mock fetch for CSV loading
const mockCSVData = `ID,Function,Category,Category ID,Subcategory ID,Subcategory Description,In Scope? ,Current State Score,Desired State Score,Minimum Target,Testing Status,Owner,Auditor,Stakeholder(s),Evidence,Observation,Recommendation,Action Plan,Linked Artifact Name,Linked Artifact URL
GV.OC-01 Ex1,Govern,Organizational Context,GV.OC,GV.OC-01 Ex1,Test Description,Yes,5,7,6,Not Started,,,,,,,,,`;

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();

  // Mock fetch
  global.fetch = jest.fn((url) => {
    if (url.includes('.csv')) {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(mockCSVData)
      });
    }
    return Promise.reject(new Error('Not found'));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('App Component', () => {
  test('renders CSF Profile Assessment header', async () => {
    await act(async () => {
      render(<App />);
    });

    const headerElement = screen.getByText(/CSF Profile Assessment/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('renders navigation links', async () => {
    await act(async () => {
      render(<App />);
    });

    expect(screen.getByText(/Subcategories/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Scoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Artifacts/i)).toBeInTheDocument();
    expect(screen.getByText(/User Management/i)).toBeInTheDocument();
  });
});

describe('User Utilities', () => {
  const { parseUserInfo, findOrCreateUser, formatUserInfo } = require('./utils/userUtils');

  test('parseUserInfo extracts name and email from "Name <email>" format', () => {
    const result = parseUserInfo('John Doe <john@example.com>');
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
  });

  test('parseUserInfo handles plain email', () => {
    const result = parseUserInfo('john@example.com');
    expect(result.name).toBe('john');
    expect(result.email).toBe('john@example.com');
  });

  test('parseUserInfo handles plain name', () => {
    const result = parseUserInfo('John Doe');
    expect(result.name).toBe('John Doe');
    expect(result.email).toBeNull();
  });

  test('parseUserInfo handles null input', () => {
    const result = parseUserInfo(null);
    expect(result.name).toBeNull();
    expect(result.email).toBeNull();
  });

  test('findOrCreateUser finds existing user by email', () => {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];
    const result = findOrCreateUser({ name: 'Johnny', email: 'john@example.com' }, users);
    expect(result).toBe(1);
    expect(users.length).toBe(1); // No new user created
  });

  test('findOrCreateUser creates new user when not found', () => {
    const users = [];
    const result = findOrCreateUser({ name: 'Jane Doe', email: null }, users);
    expect(result).not.toBeNull();
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Jane Doe');
    expect(users[0].email).toBe('jane.doe@almasecurity.com');
  });

  test('formatUserInfo returns formatted string', () => {
    const users = [
      { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];
    const result = formatUserInfo(1, users);
    expect(result).toBe('John Doe <john@example.com>');
  });

  test('formatUserInfo handles missing user', () => {
    const result = formatUserInfo(999, []);
    expect(result).toBe('999');
  });
});

describe('Sanitization Utilities', () => {
  const { sanitizeInput, sanitizeCSVData, validateEmail, validateScore } = require('./utils/sanitize');

  test('sanitizeInput removes HTML tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>Hello');
    expect(result).not.toContain('<script>');
    expect(result).toContain('Hello');
  });

  test('sanitizeInput handles null/undefined', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('sanitizeCSVData sanitizes all string values', () => {
    const data = [
      { name: '<b>Test</b>', value: 123 }
    ];
    const result = sanitizeCSVData(data);
    expect(result[0].name).not.toContain('<b>');
    expect(result[0].value).toBe(123);
  });

  test('validateEmail accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
  });

  test('validateEmail rejects invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });

  test('validateScore accepts valid scores', () => {
    expect(validateScore(0)).toBe(true);
    expect(validateScore(5)).toBe(true);
    expect(validateScore(10)).toBe(true);
    expect(validateScore('5')).toBe(true);
  });

  test('validateScore rejects invalid scores', () => {
    expect(validateScore(-1)).toBe(false);
    expect(validateScore(11)).toBe(false);
    expect(validateScore('invalid')).toBe(false);
  });
});

describe('CSF Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('csfStore initializes with empty data', () => {
    const useCSFStore = require('./stores/csfStore').default;
    const state = useCSFStore.getState();
    expect(state.data).toEqual([]);
    expect(state.loading).toBe(true);
  });

  test('csfStore setData updates data', () => {
    const useCSFStore = require('./stores/csfStore').default;
    const testData = [{ ID: 'test-1', Function: 'Govern' }];

    act(() => {
      useCSFStore.getState().setData(testData);
    });

    expect(useCSFStore.getState().data).toEqual(testData);
    expect(useCSFStore.getState().loading).toBe(false);
  });

  test('csfStore updateItem updates specific item', () => {
    const useCSFStore = require('./stores/csfStore').default;
    const testData = [
      { ID: 'test-1', Function: 'Govern', 'Current State Score': 5 }
    ];

    act(() => {
      useCSFStore.getState().setData(testData);
      useCSFStore.getState().updateItem('test-1', { 'Current State Score': 7 });
    });

    const updatedItem = useCSFStore.getState().data.find(item => item.ID === 'test-1');
    expect(updatedItem['Current State Score']).toBe(7);
  });

  test('csfStore undo/redo works correctly', () => {
    const useCSFStore = require('./stores/csfStore').default;
    const testData = [{ ID: 'test-1', Function: 'Govern' }];

    act(() => {
      useCSFStore.getState().setData(testData);
      useCSFStore.getState().updateItem('test-1', { Function: 'Protect' });
    });

    expect(useCSFStore.getState().data[0].Function).toBe('Protect');

    act(() => {
      useCSFStore.getState().undo();
    });

    expect(useCSFStore.getState().data[0].Function).toBe('Govern');

    act(() => {
      useCSFStore.getState().redo();
    });

    expect(useCSFStore.getState().data[0].Function).toBe('Protect');
  });

  test('csfStore bulk update works correctly', () => {
    const useCSFStore = require('./stores/csfStore').default;
    const testData = [
      { ID: 'test-1', 'Testing Status': 'Not Started' },
      { ID: 'test-2', 'Testing Status': 'Not Started' },
      { ID: 'test-3', 'Testing Status': 'Complete' }
    ];

    act(() => {
      useCSFStore.getState().setData(testData);
      useCSFStore.getState().bulkUpdateItems(['test-1', 'test-2'], { 'Testing Status': 'In Progress' });
    });

    const state = useCSFStore.getState();
    expect(state.data.find(i => i.ID === 'test-1')['Testing Status']).toBe('In Progress');
    expect(state.data.find(i => i.ID === 'test-2')['Testing Status']).toBe('In Progress');
    expect(state.data.find(i => i.ID === 'test-3')['Testing Status']).toBe('Complete');
  });
});

describe('User Store', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  test('userStore initializes with empty users', () => {
    const useUserStore = require('./stores/userStore').default;
    const state = useUserStore.getState();
    expect(state.users).toEqual([]);
  });

  test('userStore addUser adds a new user', () => {
    const useUserStore = require('./stores/userStore').default;

    act(() => {
      useUserStore.getState().addUser({
        name: 'Test User',
        title: 'Analyst',
        email: 'test@example.com'
      });
    });

    const users = useUserStore.getState().users;
    expect(users.length).toBe(1);
    expect(users[0].name).toBe('Test User');
    expect(users[0].id).toBeDefined();
  });

  test('userStore deleteUser removes user', () => {
    const useUserStore = require('./stores/userStore').default;

    act(() => {
      useUserStore.getState().addUser({
        name: 'Test User',
        title: 'Analyst',
        email: 'test@example.com'
      });
    });

    const userId = useUserStore.getState().users[0].id;

    act(() => {
      useUserStore.getState().deleteUser(userId);
    });

    expect(useUserStore.getState().users.length).toBe(0);
  });
});

describe('UI Store', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
  });

  test('uiStore dark mode toggle works', () => {
    const useUIStore = require('./stores/uiStore').default;

    expect(useUIStore.getState().darkMode).toBe(false);

    act(() => {
      useUIStore.getState().toggleDarkMode();
    });

    expect(useUIStore.getState().darkMode).toBe(true);

    act(() => {
      useUIStore.getState().toggleDarkMode();
    });

    expect(useUIStore.getState().darkMode).toBe(false);
  });

  test('uiStore selection management works', () => {
    const useUIStore = require('./stores/uiStore').default;

    act(() => {
      useUIStore.getState().toggleItemSelection('item-1');
      useUIStore.getState().toggleItemSelection('item-2');
    });

    expect(useUIStore.getState().selectedItemIds).toContain('item-1');
    expect(useUIStore.getState().selectedItemIds).toContain('item-2');

    act(() => {
      useUIStore.getState().toggleItemSelection('item-1');
    });

    expect(useUIStore.getState().selectedItemIds).not.toContain('item-1');
    expect(useUIStore.getState().selectedItemIds).toContain('item-2');

    act(() => {
      useUIStore.getState().clearSelection();
    });

    expect(useUIStore.getState().selectedItemIds.length).toBe(0);
  });

  test('uiStore filters work correctly', () => {
    const useUIStore = require('./stores/uiStore').default;

    act(() => {
      useUIStore.getState().setFilter('function', 'Govern');
      useUIStore.getState().setFilter('inScope', 'Yes');
    });

    const filters = useUIStore.getState().filters;
    expect(filters.function).toBe('Govern');
    expect(filters.inScope).toBe('Yes');

    act(() => {
      useUIStore.getState().clearFilters();
    });

    const clearedFilters = useUIStore.getState().filters;
    expect(clearedFilters.function).toBe('');
    expect(clearedFilters.inScope).toBe('');
  });
});

describe('CSV Import/Export', () => {
  test('CSV data can be parsed and sanitized', () => {
    const { sanitizeCSVData } = require('./utils/sanitize');

    const rawData = [
      {
        ID: 'GV.OC-01',
        Function: 'Govern',
        'Current State Score': '5',
        'Subcategory Description': '<script>alert("xss")</script>Test'
      }
    ];

    const sanitized = sanitizeCSVData(rawData);
    expect(sanitized[0]['Subcategory Description']).not.toContain('<script>');
    expect(sanitized[0]['Current State Score']).toBe('5');
  });
});

describe('Scoring Logic', () => {
  test('score gap calculation is correct', () => {
    const calculateGap = (current, desired) => {
      return (desired || 0) - (current || 0);
    };

    expect(calculateGap(5, 8)).toBe(3);
    expect(calculateGap(7, 7)).toBe(0);
    expect(calculateGap(null, 5)).toBe(5);
    expect(calculateGap(3, null)).toBe(-3);
  });

  test('average score calculation is correct', () => {
    const calculateAverage = (items, field) => {
      if (!items || items.length === 0) return 0;
      const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
      return sum / items.length;
    };

    const testItems = [
      { 'Current State Score': 5 },
      { 'Current State Score': 7 },
      { 'Current State Score': 3 }
    ];

    expect(calculateAverage(testItems, 'Current State Score')).toBe(5);
    expect(calculateAverage([], 'Current State Score')).toBe(0);
  });

  test('completion rate calculation is correct', () => {
    const calculateCompletionRate = (items) => {
      if (!items || items.length === 0) return 0;
      const completed = items.filter(item =>
        item['Testing Status'] === 'Complete' || item['Testing Status'] === 'Completed'
      ).length;
      return (completed / items.length * 100);
    };

    const testItems = [
      { 'Testing Status': 'Complete' },
      { 'Testing Status': 'In Progress' },
      { 'Testing Status': 'Complete' },
      { 'Testing Status': 'Not Started' }
    ];

    expect(calculateCompletionRate(testItems)).toBe(50);
    expect(calculateCompletionRate([])).toBe(0);
  });
});
