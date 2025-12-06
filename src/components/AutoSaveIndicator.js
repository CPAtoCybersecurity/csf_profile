import React from 'react';
import { Cloud, CloudOff, Loader } from 'lucide-react';
import useCSFStore from '../stores/csfStore';

export function AutoSaveIndicator() {
  const { hasUnsavedChanges, isSaving, lastSaved } = useCSFStore((state) => ({
    hasUnsavedChanges: state.hasUnsavedChanges,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
  }));

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
        <Loader size={14} className="animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
        <CloudOff size={14} />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
        <Cloud size={14} />
        <span>Saved at {formatTime(lastSaved)}</span>
      </div>
    );
  }

  return null;
}

export default AutoSaveIndicator;
