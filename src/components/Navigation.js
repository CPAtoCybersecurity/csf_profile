import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  FileArchive,
  ClipboardList,
  Shield,
  Settings,
  Bot,
  AlertTriangle,
  History
} from 'lucide-react';

const Navigation = () => {
  // "/" renders the Dashboard, so the Dashboard link must highlight there too
  const { pathname } = useLocation();

  // Inline style to force no underline
  const linkStyle = { textDecoration: 'none' };

  // Base styles for nav items — terminal bracket aesthetic, monospace, uppercase
  const baseStyles = "terminal-nav-link flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-[2px]";
  const activeStyles = "terminal-nav-link-active border-amber-600 dark:border-green-400 text-amber-700 dark:text-green-300 bg-transparent";
  const inactiveStyles = "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";

  // Special styles for AI (success) — bottom-border variant
  const aiActiveStyles = "terminal-nav-link-active border-green-600 dark:border-green-400 text-green-700 dark:text-green-300 bg-transparent";
  const aiInactiveStyles = "border-transparent text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800";

  // Vertical divider between groups
  const Divider = () => (
    <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2 self-center" />
  );

  return (
    <nav className="flex items-center">
      {/* Assessment group */}
      <div className="flex items-center gap-2">
        <NavLink
          to="/dashboard"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive || pathname === '/' ? activeStyles : inactiveStyles}`}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/requirements"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <FileText size={16} />
          <span>Requirements</span>
        </NavLink>

        <NavLink
          to="/controls"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Shield size={16} />
          <span>Controls</span>
        </NavLink>

        <NavLink
          to="/assessments"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <ClipboardList size={16} />
          <span>Assessments</span>
        </NavLink>
      </div>

      <Divider />

      {/* Evidence group */}
      <div className="flex items-center gap-2">
        <NavLink
          to="/artifacts"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <FileArchive size={16} />
          <span>Artifacts</span>
        </NavLink>

        <NavLink
          to="/findings"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <AlertTriangle size={16} />
          <span>Findings</span>
        </NavLink>
      </div>

      <Divider />

      {/* Admin group */}
      <div className="flex items-center gap-2">
        <NavLink
          to="/scoring"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Award size={16} />
          <span>Reference</span>
        </NavLink>

        <NavLink
          to="/history"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <History size={16} />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/users"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Users size={16} />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/ai-assistant"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? aiActiveStyles : aiInactiveStyles}`}
        >
          <Bot size={16} />
          <span>AI</span>
        </NavLink>

        <NavLink
          to="/settings"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Settings size={16} />
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
