import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { isFirstVisit, acknowledgeFirstVisit } from '../utils/backupTracking';

/**
 * First Visit Warning Modal
 * Shows important information about IndexedDB data persistence on first use
 */
const FirstVisitWarning = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    if (isFirstVisit()) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    acknowledgeFirstVisit();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-200 dark:border-yellow-700 p-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Data Storage Warning
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Read before using the application
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Main Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span>⚠️</span> Local Browser Storage Only
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              All data is stored in your browser's IndexedDB and can be lost if you:
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li className="list-disc">Clear browser cache or site data</li>
              <li className="list-disc">Uninstall or reset your browser</li>
              <li className="list-disc">Reach storage limits</li>
            </ul>
          </div>

          {/* Protection Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span>✓</span> Protect Your Work
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li className="list-disc">Export data regularly as CSV backups</li>
              <li className="list-disc">Store backups in multiple locations</li>
              <li className="list-disc">Enable backup reminders in Settings</li>
            </ul>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded p-3">
            💡 <strong>Tip:</strong> Export your data at the end of each session. 
            You can review this information anytime in Settings.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 p-4 flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 
                     transition-colors font-medium shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it's at the top level
  return createPortal(modalContent, document.body);
};

export default FirstVisitWarning;
