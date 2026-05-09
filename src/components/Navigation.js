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

  // Base styles for nav items — on dark header
  const baseStyles = "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 border-b-2";
  const activeStyles = "border-sky-400 text-sky-300 bg-white/10";
  const inactiveStyles = "border-transparent text-slate-300 hover:text-white hover:bg-white/10";

  // Special styles for AI
  const aiActiveStyles = "border-emerald-400 text-emerald-300 bg-white/10";
  const aiInactiveStyles = "border-transparent text-slate-300 hover:text-white hover:bg-white/10";

  // Vertical divider between groups
  const Divider = () => (
    <div className="h-4 w-px bg-slate-600 mx-1 self-center" />
  );

  return (
    <nav className="flex items-center">
      {/* Assessment group */}
      <div className="flex items-center gap-1">
        <NavLink
          to="/dashboard"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <LayoutDashboard size={14} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/"
          end
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <FileText size={14} />
          <span>Requirements</span>
        </NavLink>

        <NavLink
          to="/controls"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Shield size={14} />
          <span>Controls</span>
        </NavLink>

        <NavLink
          to="/assessments"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <ClipboardList size={14} />
          <span>Assessments</span>
        </NavLink>
      </div>

      <Divider />

      {/* Evidence group */}
      <div className="flex items-center gap-1">
        <NavLink
          to="/artifacts"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <FileArchive size={14} />
          <span>Artifacts</span>
        </NavLink>

        <NavLink
          to="/findings"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <AlertTriangle size={14} />
          <span>Findings</span>
        </NavLink>
      </div>

      <Divider />

      {/* Admin group */}
      <div className="flex items-center gap-1">
        <NavLink
          to="/scoring"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Award size={14} />
          <span>Reference</span>
        </NavLink>

        <NavLink
          to="/history"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <History size={14} />
          <span>History</span>
        </NavLink>

        <NavLink
          to="/users"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Users size={14} />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/ai-assistant"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? aiActiveStyles : aiInactiveStyles}`}
        >
          <Bot size={14} />
          <span>AI</span>
        </NavLink>

        <NavLink
          to="/settings"
          style={linkStyle}
          className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
        >
          <Settings size={14} />
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
