import React, { useState, useEffect } from 'react';
import { Clock, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  getTimeSinceLastExport, 
  getLastExportDate,
  getBackupWarningLevel 
} from '../utils/backupTracking';

/**
 * Last Backup Indicator Component
 * Displays the time since the last data export with visual warning levels
 */
const LastBackupIndicator = ({ onExportClick }) => {
  const [timeSinceExport, setTimeSinceExport] = useState('Never');
  const [warningLevel, setWarningLevel] = useState('danger');

  useEffect(() => {
    // Update immediately
    updateDisplay();

    // Update every minute
    const interval = setInterval(updateDisplay, 60000);

    return () => clearInterval(interval);
  }, []);

  const updateDisplay = () => {
    setTimeSinceExport(getTimeSinceLastExport());
    setWarningLevel(getBackupWarningLevel());
  };

  const getIcon = () => {
    switch (warningLevel) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />;
      case 'danger':
        return <AlertCircle size={16} className="text-red-600 dark:text-red-400" />;
      default:
        return <Clock size={16} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const getColorClasses = () => {
    switch (warningLevel) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700';
    }
  };

  const getTooltip = () => {
    const lastExport = getLastExportDate();
    if (!lastExport) {
      return 'No backup yet - export your data to protect your work';
    }
    return `Last backup: ${lastExport.toLocaleString()}`;
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getColorClasses()}`}
        title={getTooltip()}
      >
        {getIcon()}
        <span className="hidden sm:inline">Last backup:</span>
        <span className="font-semibold">{timeSinceExport}</span>
      </div>
      
      {warningLevel !== 'success' && (
        <button
          onClick={onExportClick}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg 
                   hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
          title="Export data now"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Backup Now</span>
        </button>
      )}
    </div>
  );
};

export default LastBackupIndicator;
