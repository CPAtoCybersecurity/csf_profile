import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, X, Download } from 'lucide-react';

/**
 * Backup Reminder Notification
 * Shows periodic reminders to export/backup data
 */
const BackupReminder = ({ onClose, onExport }) => {
  const reminderContent = (
    <div 
      className="fixed bottom-4 right-4 max-w-md" 
      style={{ 
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 9998 
      }}
    >
      <div className="bg-white dark:bg-gray-900 shadow-xl border border-gray-300 dark:border-gray-700 border-l-4 border-orange-400 dark:border-orange-500 overflow-hidden font-mono">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" size={24} />
            <div className="flex-1">
              <h3 className="font-semibold uppercase tracking-wide text-gray-900 dark:text-gray-100 mb-1">
                Time to Back Up Your Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                It's been a while since your last export. Protect your assessment work by
                creating a backup now.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onExport}
                  className="btn-terminal"
                >
                  <Download size={16} />
                  Export Now
                </button>
                <button
                  onClick={onClose}
                  className="btn-terminal"
                >
                  Remind Later
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close reminder"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render using portal to ensure proper positioning
  return createPortal(reminderContent, document.body);
};

export default BackupReminder;
