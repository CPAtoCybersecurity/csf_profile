import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components (eager — part of the always-visible shell)
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import FirstVisitWarning from './components/FirstVisitWarning';
import BackupReminder from './components/BackupReminder';
import Toolbar from './components/Toolbar';
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
const Metrics = lazy(() => import('./pages/Metrics'));
const Inventory = lazy(() => import('./pages/Inventory'));

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
    // Ask the browser to protect this origin's storage from eviction under
    // disk pressure — all assessment data lives in localStorage, so eviction
    // is data loss. Best-effort: browsers may ignore it; regular exports
    // (BackupReminder) remain the real durability story.
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  // Initialize keyboard navigation
  useKeyboardNavigation();

  // Load data on mount - run once
  useEffect(() => {
    // Fix email addresses using store directly
    useUserStore.getState().fixEmailAddresses();
    // Load requirements data from the seed CSV
    loadRequirements();
    // Load assessments data from the seed CSV
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
    <div className="app-shell">
      {/* Left rail — brand + primary nav; a drawer below 1024px */}
      <Navigation />

      <div className="app-main">
        <Toolbar onBackupClick={handleExportFromIndicator} />

        {/* Main content */}
        <main className="app-content">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/requirements" element={<Requirements />} />
              <Route path="/controls" element={<UserControls />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/inventory" element={<Inventory />} />
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
            className: 'app-toast',
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '13px',
              padding: '10px 14px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: {
                primary: 'var(--terminal-green)',
                secondary: 'var(--bg-secondary)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--terminal-red)',
                secondary: 'var(--bg-secondary)',
              },
            },
          }}
        />
      </Router>
    </ErrorBoundary>
  );
};

export default App;
