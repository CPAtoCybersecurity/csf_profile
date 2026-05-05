import React from 'react';
import { NavLink } from 'react-router-dom';
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
  // Inline style to force no underline
  const linkStyle = { textDecoration: 'none' };

  // Base styles for nav items
  const baseStyles = "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 border-b-[3px]";
  const activeStyles = "border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/25";
  const inactiveStyles = "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/60";

  // Special styles for AI (success)
  const aiActiveStyles = "border-green-600 dark:border-green-400 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20";
  const aiInactiveStyles = "border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-green-50 dark:hover:bg-gray-700/60";

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
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/"
          end
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
