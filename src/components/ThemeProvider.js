import React, { useEffect } from 'react';
import useUIStore from '../stores/uiStore';

export function ThemeProvider({ children }) {
  const darkMode = useUIStore((state) => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
}

export default ThemeProvider;
