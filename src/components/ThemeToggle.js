import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import useUIStore from '../stores/uiStore';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useUIStore();

  // Apply dark class to document root when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white transition-colors"
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" style={{ color: '#000000' }} />}
    </button>
  );
};

export default ThemeToggle;
