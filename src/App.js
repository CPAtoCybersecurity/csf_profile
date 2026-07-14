import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components (eager — part of the always-visible shell)
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import AutoSaveIndicator from './components/AutoSaveIndicator';
import UndoRedoButtons from './components/UndoRedoButtons';
import ThemeToggle from './components/ThemeToggle';
import FirstVisitWarning from './components/FirstVisitWarning';
import BackupReminder from './components/BackupReminder';
import TerminalStatusBar from './components/TerminalStatusBar';
import KeyboardShortcutsOverlay from './components/KeyboardShortcutsOverlay';
import { SkeletonTable } from './components/SkeletonLoader';

// Hooks
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

// Stores
import useUserStore from './stores/userStore';
import useRequirementsStore from './stores/requirementsStore';
import useAssessmentsStore from './stores/assessmentsStore';

// Utils
import { shouldShowBackupReminder, updateLastReminderDate, isFirstVisit } from './utils/backupTracking';
import { checkEnvironmentVariables } from './utils/envValidation';
import { initializeEntryIdMappings, loadConfluenceConfig } from './utils/confluenceSync';

// Pages - New Architecture (code-split via React.lazy to shrink the initial
// bundle; each route now loads its own chunk on demand).
const Requirements = lazy(() => import('./pages/Requirements'));
const UserControls = lazy(() => import('./pages/UserControls'));
const Assessments = lazy(() => import('./pages/Assessments'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const ScoringLegend = lazy(() => import('./pages/ScoringLegend'));
const Artifacts = lazy(() => import('./pages/Artifacts'));
const Settings = lazy(() => import('./pages/Settings'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Findings = lazy(() => import('./pages/Findings'));
const AuditLog = lazy(() => import('./pages/AuditLog'));

// Lightweight fallback shown while a route chunk loads or its store hydrates.
const RouteFallback = () => (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-auto">
      <SkeletonTable rows={10} columns={8} hasCheckbox hasRowNumber />
    </div>
  </div>
);

const AppContent = () => {
  const loadRequirements = useRequirementsStore((state) => state.loadInitialData);
  const loadAssessments = useAssessmentsStore((state) => state.loadInitialData);
  const exportRequirementsCSV = useRequirementsStore((state) => state.exportRequirementsCSV);
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [lastBackupTrigger, setLastBackupTrigger] = useState(0);

  useEffect(() => {
    loadConfluenceConfig();
    initializeEntryIdMappings();
  }, []);

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
      // Don't stack the backup reminder on top of the first-visit welcome modal
      if (isFirstVisit()) {
        return;
      }
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
        {/* Terminal top status bar — sticky, top of frozen panes */}
        <TerminalStatusBar onBackupClick={handleExportFromIndicator} />

        {/* Header — sticky right beneath the status bar */}
        <header className="terminal-app-header bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Left: Logo and title */}
            <div className="flex items-center gap-3">
              <div className="terminal-logo-disc">
                <img
                  src="/SC_SimplyCyberAcademy.png"
                  alt="Simply Cyber Academy Logo"
                />
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex flex-col">
                <span className="terminal-section-heading text-sm font-semibold">CSF_PROFILE</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal uppercase tracking-wider">NIST CSF 2.0 Assessment Tool</span>
              </div>
            </div>

            {/* Center: Navigation */}
            <Navigation />

            {/* Right: Utilities */}
            <div className="flex items-center gap-2">
              <AutoSaveIndicator />
              <UndoRedoButtons />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/requirements" element={<Requirements />} />
              <Route path="/controls" element={<UserControls />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/scoring" element={<ScoringLegend />} />
              <Route path="/artifacts" element={<Artifacts />} />
              <Route path="/findings" element={<Findings />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/history" element={<AuditLog />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
    
    {/* Global keyboard-shortcuts overlay (opens on '?') */}
    <KeyboardShortcutsOverlay />

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
              background: '#000000',
              color: '#33ff66',
              border: '1px solid #33ff66',
              borderRadius: 0,
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
              fontSize: '12px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '8px 12px',
              boxShadow: 'none',
            },
            success: {
              iconTheme: {
                primary: '#33ff66',
                secondary: '#000000',
              },
            },
            error: {
              style: {
                background: '#000000',
                color: '#ff4444',
                border: '1px solid #ff4444',
                borderRadius: 0,
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', Menlo, Monaco, Consolas, monospace",
                fontSize: '12px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '8px 12px',
                boxShadow: 'none',
              },
              iconTheme: {
                primary: '#ff4444',
                secondary: '#000000',
              },
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
