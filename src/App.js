import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import UndoRedoButtons from './components/UndoRedoButtons';
import ThemeToggle from './components/ThemeToggle';
import FirstVisitWarning from './components/FirstVisitWarning';
import BackupReminder from './components/BackupReminder';
import LastBackupIndicator from './components/LastBackupIndicator';

// Pages - New Architecture
import Requirements from './pages/Requirements';
import UserControls from './pages/UserControls';
import Assessments from './pages/Assessments';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ScoringLegend from './pages/ScoringLegend';
import Artifacts from './pages/Artifacts';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import Findings from './pages/Findings';

// Hooks
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

// Stores
import useUserStore from './stores/userStore';
import useRequirementsStore from './stores/requirementsStore';
import useAssessmentsStore from './stores/assessmentsStore';

// Utils
import { shouldShowBackupReminder, updateLastReminderDate } from './utils/backupTracking';
import { checkEnvironmentVariables } from './utils/envValidation';

const AppContent = () => {
  const loadRequirements = useRequirementsStore((state) => state.loadInitialData);
  const loadAssessments = useAssessmentsStore((state) => state.loadInitialData);
  const exportRequirementsCSV = useRequirementsStore((state) => state.exportRequirementsCSV);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [lastBackupTrigger, setLastBackupTrigger] = useState(0);

  // Initialize keyboard navigation
  useKeyboardNavigation();

  // Load data on mount - run once
  useEffect(() => {
    // Validate environment variables for JIRA/Confluence integration
    checkEnvironmentVariables();
    // Fix email addresses using store directly
    useUserStore.getState().fixEmailAddresses();
    // Load requirements data from Confluence-Requirements.csv
    loadRequirements();
    // Load assessments data from JIRA-Assessments.csv
    loadAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  
  // Check for backup reminder on mount and periodically
  useEffect(() => {
    const checkBackupReminder = () => {
      if (shouldShowBackupReminder()) {
        setShowBackupReminder(true);
        updateLastReminderDate();
      }
    };
    
    // Check on mount after a delay (let user settle in)
    const initialTimeout = setTimeout(checkBackupReminder, 30000); // 30 seconds
    
    // Check periodically (every hour)
    const interval = setInterval(checkBackupReminder, 3600000); // 1 hour
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);
  
  const handleExportFromReminder = () => {
    setShowBackupReminder(false);
    exportRequirementsCSV();
    setLastBackupTrigger(Date.now()); // Trigger re-render of indicator
  };
  
  const handleExportFromIndicator = () => {
    exportRequirementsCSV();
    setLastBackupTrigger(Date.now()); // Trigger re-render of indicator
  };
  
  const handleCloseReminder = () => {
    setShowBackupReminder(false);
  };

  return (
    <React.Fragment>
    <div className="flex flex-col h-screen">
      <div className="flex flex-col h-full bg-white text-gray-700">
        {/* Header - Compact Jira-style */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex justify-between items-center">
            {/* Left: Logo and title */}
            <div className="flex items-center gap-3">
              <img
                src="/SC_SimplyCyberAcademy.png"
                alt="Simply Cyber Academy Logo"
                className="h-8"
              />
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">CSF Profile Assessment</span>
            </div>

            {/* Center: Navigation */}
            <Navigation />

            {/* Right: Utilities */}
            <div className="flex items-center gap-2">
              <LastBackupIndicator onExportClick={handleExportFromIndicator} key={lastBackupTrigger} />
              <AutoSaveIndicator />
              <UndoRedoButtons />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Requirements />} />
            <Route path="/controls" element={<UserControls />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scoring" element={<ScoringLegend />} />
            <Route path="/artifacts" element={<Artifacts />} />
            <Route path="/findings" element={<Findings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Routes>
        </main>
      </div>
    </div>
    
    {/* First Visit Warning Modal - Rendered outside main container */}
    <FirstVisitWarning />
    
    {/* Backup Reminder Notification - Rendered outside main container */}
    {showBackupReminder && (
      <BackupReminder 
        onClose={handleCloseReminder}
        onExport={handleExportFromReminder}
      />
    )}
    </React.Fragment>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;
