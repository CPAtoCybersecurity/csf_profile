/**
 * Tests for backup tracking utilities
 */
import {
  getLastExportDate,
  updateLastExportDate,
  isFirstVisit,
  acknowledgeFirstVisit,
  getBackupReminderFrequency,
  setBackupReminderFrequency,
  getLastReminderDate,
  updateLastReminderDate,
  shouldShowBackupReminder,
  getTimeSinceLastExport,
  getBackupWarningLevel
} from './backupTracking';

describe('Backup Tracking Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Export Date Tracking', () => {
    test('getLastExportDate returns null when no export has been made', () => {
      expect(getLastExportDate()).toBeNull();
    });

    test('updateLastExportDate stores current date', () => {
      const beforeUpdate = Date.now();
      updateLastExportDate();
      const afterUpdate = Date.now();
      
      const storedDate = getLastExportDate();
      expect(storedDate).not.toBeNull();
      expect(storedDate.getTime()).toBeGreaterThanOrEqual(beforeUpdate);
      expect(storedDate.getTime()).toBeLessThanOrEqual(afterUpdate);
    });

    test('getLastExportDate retrieves stored date correctly', () => {
      const testDate = new Date('2026-01-01T12:00:00Z');
      localStorage.setItem('csf_last_export_date', testDate.toISOString());
      
      const retrievedDate = getLastExportDate();
      expect(retrievedDate).toEqual(testDate);
    });
  });

  describe('First Visit Tracking', () => {
    test('isFirstVisit returns true when user has not acknowledged', () => {
      expect(isFirstVisit()).toBe(true);
    });

    test('isFirstVisit returns false after acknowledgment', () => {
      acknowledgeFirstVisit();
      expect(isFirstVisit()).toBe(false);
    });

    test('acknowledgeFirstVisit stores acknowledgment in localStorage', () => {
      acknowledgeFirstVisit();
      expect(localStorage.getItem('csf_first_visit_acknowledged')).toBe('true');
    });
  });

  describe('Backup Reminder Frequency', () => {
    test('getBackupReminderFrequency returns default of 7 days', () => {
      expect(getBackupReminderFrequency()).toBe(7);
    });

    test('setBackupReminderFrequency stores custom frequency', () => {
      setBackupReminderFrequency(30);
      expect(getBackupReminderFrequency()).toBe(30);
    });

    test('getBackupReminderFrequency retrieves stored frequency', () => {
      localStorage.setItem('csf_backup_reminder_frequency', '14');
      expect(getBackupReminderFrequency()).toBe(14);
    });
  });

  describe('Reminder Date Tracking', () => {
    test('getLastReminderDate returns null when no reminder shown', () => {
      expect(getLastReminderDate()).toBeNull();
    });

    test('updateLastReminderDate stores current date', () => {
      const beforeUpdate = Date.now();
      updateLastReminderDate();
      const afterUpdate = Date.now();
      
      const storedDate = getLastReminderDate();
      expect(storedDate).not.toBeNull();
      expect(storedDate.getTime()).toBeGreaterThanOrEqual(beforeUpdate);
      expect(storedDate.getTime()).toBeLessThanOrEqual(afterUpdate);
    });
  });

  describe('shouldShowBackupReminder', () => {
    test('returns true when never reminded and never exported', () => {
      expect(shouldShowBackupReminder()).toBe(true);
    });

    test('returns false when recently reminded', () => {
      updateLastReminderDate();
      expect(shouldShowBackupReminder()).toBe(false);
    });

    test('returns true when frequency days have passed since last reminder', () => {
      // Set last reminder to 8 days ago (default frequency is 7 days)
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 8);
      localStorage.setItem('csf_last_reminder_shown', pastDate.toISOString());
      
      expect(shouldShowBackupReminder()).toBe(true);
    });

    test('returns false when export is recent', () => {
      // Set last export to today
      updateLastExportDate();
      // Clear reminder date
      localStorage.removeItem('csf_last_reminder_shown');
      
      expect(shouldShowBackupReminder()).toBe(false);
    });
  });

  describe('getTimeSinceLastExport', () => {
    test('returns "Never" when no export has been made', () => {
      expect(getTimeSinceLastExport()).toBe('Never');
    });

    test('returns "Just now" for very recent export', () => {
      updateLastExportDate();
      expect(getTimeSinceLastExport()).toBe('Just now');
    });

    test('returns minutes for recent export', () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 5);
      localStorage.setItem('csf_last_export_date', pastDate.toISOString());
      
      const result = getTimeSinceLastExport();
      expect(result).toMatch(/5 minutes? ago/);
    });

    test('returns hours for export within 24 hours', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 3);
      localStorage.setItem('csf_last_export_date', pastDate.toISOString());
      
      const result = getTimeSinceLastExport();
      expect(result).toMatch(/3 hours? ago/);
    });

    test('returns days for export within 30 days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      localStorage.setItem('csf_last_export_date', pastDate.toISOString());
      
      const result = getTimeSinceLastExport();
      expect(result).toMatch(/5 days? ago/);
    });

    test('returns months for old export', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 60);
      localStorage.setItem('csf_last_export_date', pastDate.toISOString());
      
      const result = getTimeSinceLastExport();
      expect(result).toMatch(/2 months? ago/);
    });
  });

  describe('getBackupWarningLevel', () => {
    test('returns "danger" when never exported', () => {
      expect(getBackupWarningLevel()).toBe('danger');
    });

    test('returns "success" for export within 7 days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      localStorage.setItem('csf_last_export_date', pastDate.toISOString());
      
      expect(getBackupWarningLevel()).toBe('success');
    });

    test('returns "warning" for export between 7 and 30 days', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 15);
      localStorage.setItem('csf_last_export_date', pastDate.toISOString());
      
      expect(getBackupWarningLevel()).toBe('warning');
    });

    test('returns "danger" for export over 30 days ago', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 45);
      localStorage.setItem('csf_last_export_date', pastDate.toISOString());
      
      expect(getBackupWarningLevel()).toBe('danger');
    });
  });
});
