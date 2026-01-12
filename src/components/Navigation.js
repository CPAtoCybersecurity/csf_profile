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
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/"
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
        <span>Requirements</span>
      </NavLink>

      <NavLink
        to="/controls"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <Shield size={18} />
        <span>Controls</span>
      </NavLink>

      <NavLink
        to="/assessments"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <ClipboardList size={18} />
        <span>Assessments</span>
      </NavLink>

      <NavLink
        to="/artifacts"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <FileArchive size={18} />
        <span>Artifacts</span>
      </NavLink>

      <NavLink
        to="/findings"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-amber-700 dark:bg-amber-800 text-white border border-amber-500 dark:border-amber-700'
              : 'text-white hover:bg-amber-700 dark:hover:bg-amber-800'
          }`
        }
      >
        <AlertTriangle size={18} />
        <span>Findings</span>
      </NavLink>

      <NavLink
        to="/scoring"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <Award size={18} />
        <span>Reference</span>
      </NavLink>

      <NavLink
        to="/users"
        className={({ isActive }) =>
          `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-800 dark:bg-blue-900 text-white border border-blue-600 dark:border-blue-800'
              : 'text-white hover:bg-blue-800 dark:hover:bg-blue-900'
          }`
        }
      >
        <Users size={18} />
        <span>Users</span>
      </NavLink>

      <NavLink
        to="/ai-assistant"
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
      </NavLink>

      <NavLink
        to="/settings"
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
      </NavLink>
    </nav>
  );
};

export default Navigation;
