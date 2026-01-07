import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import App from './App';

// Mock react-markdown to avoid ES module issues in Jest
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }) {
    return <div>{children}</div>;
  };
});

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

    // Requirements appears multiple times, so we check it exists at least once
    expect(screen.getAllByText(/Requirements/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Reference/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence/i)).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText(/Controls/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessments/i)).toBeInTheDocument();
    // Settings appears in multiple places (navigation + modal)
    expect(screen.getAllByText(/Settings/i).length).toBeGreaterThan(0);
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
    expect(sanitizeInput(null)).toBe(null);
    expect(sanitizeInput(undefined)).toBe(undefined);
  });

  test('validateCSVImport sanitizes and validates data', () => {
    const { validateCSVImport } = require('./utils/sanitize');
    const data = [
      { ID: 'test-1', Observations: '<b>Test</b>', 'Current State Score': 5 }
    ];
    const result = validateCSVImport(data);
    expect(result.valid).toBe(true);
    expect(result.data[0].Observations).not.toContain('<b>');
    expect(result.data[0].ID).toBe('test-1');
  });

  test('isValidEmail accepts valid emails', () => {
    const { isValidEmail } = require('./utils/sanitize');
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
  });

  test('isValidEmail rejects invalid emails', () => {
    const { isValidEmail } = require('./utils/sanitize');
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
  });

  test('isValidScore accepts valid scores', () => {
    const { isValidScore } = require('./utils/sanitize');
    expect(isValidScore(0)).toBe(true);
    expect(isValidScore(5)).toBe(true);
    expect(isValidScore(10)).toBe(true);
    expect(isValidScore('5')).toBe(true);
  });

  test('isValidScore rejects invalid scores', () => {
    const { isValidScore } = require('./utils/sanitize');
    expect(isValidScore(-1)).toBe(false);
    expect(isValidScore(11)).toBe(false);
    expect(isValidScore('invalid')).toBe(false);
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

    const state = useCSFStore.getState();
    expect(state.data[0].ID).toBe('test-1');
    expect(state.data[0].Function).toBe('Govern');
    expect(state.loading).toBe(true); // loading remains unchanged by setData
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
    
    // Start fresh
    act(() => {
      useCSFStore.setState({
        data: [{ ID: 'test-1', Function: 'Govern' }],
        history: [[{ ID: 'test-1', Function: 'Initial' }], [{ ID: 'test-1', Function: 'Govern' }]],
        historyIndex: 1,
        loading: false,
      });
    });

    // Verify we start at Govern
    expect(useCSFStore.getState().data[0].Function).toBe('Govern');
    expect(useCSFStore.getState().canUndo()).toBe(true);

    // Update to Protect
    act(() => {
      useCSFStore.getState().updateItem('test-1', { Function: 'Protect' });
    });

    expect(useCSFStore.getState().data[0].Function).toBe('Protect');

    // Undo - should go back one step in history
    act(() => {
      useCSFStore.getState().undo();
    });

    const afterUndo = useCSFStore.getState();
    expect(afterUndo.canRedo()).toBe(true);
    // After undo, we're at previous history index
    expect(afterUndo.historyIndex).toBeLessThan(2);

    // Redo - should go forward one step
    act(() => {
      useCSFStore.getState().redo();
    });

    const afterRedo = useCSFStore.getState();
    // After redo, we moved forward in history
    expect(afterRedo.historyIndex).toBeGreaterThan(afterUndo.historyIndex);
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

  test('userStore initializes with demo users', () => {
    const useUserStore = require('./stores/userStore').default;
    const state = useUserStore.getState();
    expect(state.users.length).toBeGreaterThan(0);
    expect(state.users[0]).toHaveProperty('id');
    expect(state.users[0]).toHaveProperty('name');
    expect(state.users[0]).toHaveProperty('email');
  });

  test('userStore addUser adds a new user', () => {
    const useUserStore = require('./stores/userStore').default;
    const initialCount = useUserStore.getState().users.length;

    act(() => {
      useUserStore.getState().addUser({
        name: 'Test User',
        title: 'Analyst',
        email: 'test@example.com'
      });
    });

    const users = useUserStore.getState().users;
    expect(users.length).toBe(initialCount + 1);
    const newUser = users.find(u => u.email === 'test@example.com');
    expect(newUser.name).toBe('Test User');
    expect(newUser.id).toBeDefined();
  });

  test('userStore deleteUser removes user', () => {
    const useUserStore = require('./stores/userStore').default;
    const initialCount = useUserStore.getState().users.length;

    act(() => {
      useUserStore.getState().addUser({
        name: 'Test User',
        title: 'Analyst',
        email: 'test@example.com'
      });
    });

    const newUser = useUserStore.getState().users.find(u => u.email === 'test@example.com');
    const userId = newUser.id;

    act(() => {
      useUserStore.getState().deleteUser(userId);
    });

    expect(useUserStore.getState().users.length).toBe(initialCount);
    expect(useUserStore.getState().users.find(u => u.id === userId)).toBeUndefined();
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
      useUIStore.getState().setFilterFunctions(['Govern']);
      useUIStore.getState().setFilterInScope('Yes');
    });

    const state = useUIStore.getState();
    expect(state.filterFunctions).toContain('Govern');
    expect(state.filterInScope).toBe('Yes');

    act(() => {
      useUIStore.getState().resetFilters();
    });

    const clearedState = useUIStore.getState();
    expect(clearedState.filterFunctions).toEqual([]);
    expect(clearedState.filterInScope).toBe('');
  });
});

describe('CSV Import/Export', () => {
  test('CSV data can be parsed and sanitized', () => {
    const { validateCSVImport } = require('./utils/sanitize');

    const rawData = [
      {
        ID: 'GV.OC-01',
        Function: 'Govern',
        'Current State Score': '5',
        Observations: '<script>alert("xss")</script>Test'
      }
    ];

    const result = validateCSVImport(rawData);
    expect(result.valid).toBe(true);
    expect(result.data[0].Observations).not.toContain('<script>');
    expect(result.data[0]['Current State Score']).toBe('5');
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
