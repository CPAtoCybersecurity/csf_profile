import toast from 'react-hot-toast';
import { quotaSafeLocalStorage, __resetQuotaWarningForTests } from './safeStorage';

// jest.mock is hoisted above the imports at runtime
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { error: jest.fn() }
}));

describe('quotaSafeLocalStorage', () => {
  beforeEach(() => {
    __resetQuotaWarningForTests();
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  test('round-trips values through localStorage', () => {
    quotaSafeLocalStorage.setItem('k', 'v');
    expect(quotaSafeLocalStorage.getItem('k')).toBe('v');
    quotaSafeLocalStorage.removeItem('k');
    expect(quotaSafeLocalStorage.getItem('k')).toBeNull();
  });

  test('a quota failure is surfaced (toast + console), never thrown or silent', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const setSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(() => quotaSafeLocalStorage.setItem('big', 'x')).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);

    // Repeated failures keep logging but do not toast-spam
    quotaSafeLocalStorage.setItem('big', 'y');
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledTimes(2);

    setSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
