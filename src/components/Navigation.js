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
<<<<<<< HEAD
  Bot
} from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="flex items-center gap-2">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <LayoutDashboard size={18} />
=======
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
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
        end
      >
        <FileText size={18} />
=======
        end
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      >
        <FileText size={16} />
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        <span>Requirements</span>
      </NavLink>

      <NavLink
        to="/controls"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <Shield size={18} />
=======
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      >
        <Shield size={16} />
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        <span>Controls</span>
      </NavLink>

      <NavLink
        to="/assessments"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <ClipboardList size={18} />
=======
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      >
        <ClipboardList size={16} />
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        <span>Assessments</span>
      </NavLink>

      <NavLink
        to="/artifacts"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <FileArchive size={18} />
        <span>Evidence</span>
=======
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
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      </NavLink>

      <NavLink
        to="/scoring"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <Award size={18} />
=======
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      >
        <Award size={16} />
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        <span>Reference</span>
      </NavLink>

      <NavLink
        to="/users"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <Users size={18} />
=======
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      >
        <Users size={16} />
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
        <span>Users</span>
      </NavLink>

      <NavLink
        to="/ai-assistant"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-green-700 dark:bg-green-800 text-white border border-green-500 dark:border-green-700'
              : 'text-white hover:bg-green-700 dark:hover:bg-green-800'
          }`
        }
      >
        <Bot size={18} />
        <span>AI Assistant</span>
=======
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? aiActiveStyles : aiInactiveStyles}`}
      >
        <Bot size={16} />
        <span>AI</span>
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      </NavLink>

      <NavLink
        to="/settings"
<<<<<<< HEAD
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <Settings size={18} />
        <span>Settings</span>
=======
        style={linkStyle}
        className={({ isActive }) => `${baseStyles} ${isActive ? activeStyles : inactiveStyles}`}
      >
        <Settings size={16} />
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
      </NavLink>
    </nav>
  );
};

export default Navigation;
