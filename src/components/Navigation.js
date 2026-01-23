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
  AlertTriangle
} from 'lucide-react';

const Navigation = () => {
  // Inline style to force no underline
  const linkStyle = { textDecoration: 'none' };

  // Base styles for nav items - Jira/Confluence style (no underline)
  const baseStyles = "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-semibold transition-colors";
  const activeStyles = "bg-blue-100 dark:bg-gray-600 text-blue-800 dark:text-white";
  const inactiveStyles = "text-gray-600 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700";

  // Special styles for AI (success) - Findings uses standard styles
  const aiActiveStyles = "bg-green-100 dark:bg-gray-600 text-green-800 dark:text-green-300";
  const aiInactiveStyles = "text-gray-600 dark:text-gray-100 hover:bg-green-50 dark:hover:bg-gray-700";

  return (
    <nav className="flex items-center gap-1">
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

      <NavLink
        to="/scoring"
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      >
        <Award size={16} />
        <span>Reference</span>
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
    </nav>
  );
};

export default Navigation;
