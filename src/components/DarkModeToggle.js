import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useUIStore from '../stores/uiStore';

export function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-gray-600" />
      )}
    </button>
  );
}

export default DarkModeToggle;
