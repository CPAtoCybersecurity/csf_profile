import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './components/ThemeProvider';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import BulkEditToolbar from './components/BulkEditToolbar';
import UndoRedoButtons from './components/UndoRedoButtons';
import DarkModeToggle from './components/DarkModeToggle';

// Pages
import Controls from './pages/Controls';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ScoringLegend from './pages/ScoringLegend';
import Artifacts from './pages/Artifacts';

// Hooks
import { useCSFData } from './hooks/useCSFData';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

// Stores
import useUIStore from './stores/uiStore';
import useUserStore from './stores/userStore';

const AppContent = () => {
  const { loadData, clearAllScope } = useCSFData();
  const darkMode = useUIStore((state) => state.darkMode);
  const fixEmailAddresses = useUserStore((state) => state.fixEmailAddresses);

  // Initialize keyboard navigation
  useKeyboardNavigation();

  // Load data on mount
  useEffect(() => {
    fixEmailAddresses();
    loadData();
  }, [loadData, fixEmailAddresses]);

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Header */}
        <header className="bg-blue-700 dark:bg-blue-900 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img
                src="/SC_SimplyCyberAcademy.png"
                alt="Simply Cyber Academy Logo"
                className="h-16 mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold">CSF Profile Assessment Database v0.2</h1>
                <p className="opacity-80">
                  Manage assessment details, document observations and track progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AutoSaveIndicator />
              <UndoRedoButtons />
              <DarkModeToggle />
              <button
                onClick={clearAllScope}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                title="Set all items as out of scope"
              >
                Clear Scope
              </button>
              <Navigation />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Controls />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scoring" element={<ScoringLegend />} />
            <Route path="/artifacts" element={<Artifacts />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </main>

        {/* Bulk edit toolbar */}
        <BulkEditToolbar />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AppContent />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
