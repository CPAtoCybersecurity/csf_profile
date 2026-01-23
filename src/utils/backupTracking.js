/**
 * Utility functions for tracking data backups and managing persistence warnings
 */

const STORAGE_KEYS = {
  LAST_EXPORT: 'csf_last_export_date',
  FIRST_VISIT: 'csf_first_visit_acknowledged',
  BACKUP_REMINDER_FREQUENCY: 'csf_backup_reminder_frequency',
  LAST_REMINDER: 'csf_last_reminder_shown',
};

/**
 * Get the last export date
 * @returns {Date|null} The last export date or null if never exported
 */
export const getLastExportDate = () => {
  const lastExport = localStorage.getItem(STORAGE_KEYS.LAST_EXPORT);
  return lastExport ? new Date(lastExport) : null;
};

/**
 * Update the last export date to now
 */
export const updateLastExportDate = () => {
  localStorage.setItem(STORAGE_KEYS.LAST_EXPORT, new Date().toISOString());
  // Dispatch custom event to notify components of export
  window.dispatchEvent(new CustomEvent('csfExportCompleted'));
};

/**
 * Check if this is the user's first visit (not yet acknowledged)
 * @returns {boolean} True if first visit warning hasn't been shown
 */
export const isFirstVisit = () => {
  return !localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
};

/**
 * Mark first visit as acknowledged
 */
export const acknowledgeFirstVisit = () => {
  localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
};

/**
 * Get backup reminder frequency in days
 * @returns {number} Number of days between reminders (default: 7)
 */
export const getBackupReminderFrequency = () => {
  const frequency = localStorage.getItem(STORAGE_KEYS.BACKUP_REMINDER_FREQUENCY);
  return frequency ? parseInt(frequency, 10) : 7; // Default 7 days
};

/**
 * Set backup reminder frequency
 * @param {number} days Number of days between reminders
 */
export const setBackupReminderFrequency = (days) => {
  localStorage.setItem(STORAGE_KEYS.BACKUP_REMINDER_FREQUENCY, days.toString());
};

/**
 * Get the last reminder date
 * @returns {Date|null} The last reminder date or null if never shown
 */
export const getLastReminderDate = () => {
  const lastReminder = localStorage.getItem(STORAGE_KEYS.LAST_REMINDER);
  return lastReminder ? new Date(lastReminder) : null;
};

/**
 * Update the last reminder date to now
 */
export const updateLastReminderDate = () => {
  localStorage.setItem(STORAGE_KEYS.LAST_REMINDER, new Date().toISOString());
};

/**
 * Check if a backup reminder should be shown
 * @returns {boolean} True if reminder should be shown
 */
export const shouldShowBackupReminder = () => {
  const frequency = getBackupReminderFrequency();
  const lastReminder = getLastReminderDate();
  const lastExport = getLastExportDate();

  // If never reminded, check if enough time has passed since last export or app start
  if (!lastReminder) {
    if (!lastExport) {
      // Never exported, show reminder after frequency days of first use
      return true;
    }
    // Use last export as reference
    const daysSinceExport = (Date.now() - lastExport.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceExport >= frequency;
  }

  // Check if enough time has passed since last reminder
  const daysSinceReminder = (Date.now() - lastReminder.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceReminder >= frequency;
};

/**
 * Get formatted time since last export
 * @returns {string} Human-readable time since last export
 */
export const getTimeSinceLastExport = () => {
  const lastExport = getLastExportDate();
  
  if (!lastExport) {
    return 'Never';
  }

  const now = Date.now();
  const diff = now - lastExport.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Get warning level based on time since last export
 * @returns {'success'|'warning'|'danger'} Warning level
 */
export const getBackupWarningLevel = () => {
  const lastExport = getLastExportDate();
  
  if (!lastExport) {
    return 'danger';
  }

  const daysSinceExport = (Date.now() - lastExport.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceExport < 7) {
    return 'success';
  } else if (daysSinceExport < 30) {
    return 'warning';
  } else {
    return 'danger';
  }
};
