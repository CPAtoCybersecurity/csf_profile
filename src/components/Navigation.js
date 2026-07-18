import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  FileArchive,
  ClipboardList,
  Gauge,
  Shield,
  Settings,
  Bot,
  AlertTriangle,
  History,
  Menu,
  X
} from 'lucide-react';

// Single source of truth for the nav — used by BOTH the desktop bar and the
// responsive (<1200px) hamburger menu so every route stays reachable in both.
const NAV_GROUPS = [
  {
    title: 'Assessment',
    items: [
      // "/" also renders the Dashboard, so the Dashboard link highlights there too
      { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, matchRoot: true },
      { to: '/requirements', label: 'Requirements', Icon: FileText },
      { to: '/controls', label: 'Controls', Icon: Shield },
      { to: '/assessments', label: 'Assessments', Icon: ClipboardList },
      { to: '/metrics', label: 'Metrics', Icon: Gauge },
    ],
  },
  {
    title: 'Evidence',
    items: [
      { to: '/artifacts', label: 'Artifacts', Icon: FileArchive },
      { to: '/findings', label: 'Findings', Icon: AlertTriangle },
    ],
  },
  {
    title: 'Admin',
    items: [
      { to: '/scoring', label: 'Reference', Icon: Award },
      { to: '/history', label: 'History', Icon: History },
      { to: '/users', label: 'Users', Icon: Users },
      { to: '/ai-assistant', label: 'AI', Icon: Bot, variant: 'ai' },
      // Icon-only on the desktop bar to save space; labeled in the mobile menu.
      { to: '/settings', label: 'Settings', Icon: Settings, desktopIconOnly: true },
    ],
  },
];

const linkStyle = { textDecoration: 'none' };

// Base styles for desktop nav items — terminal bracket aesthetic, mono, uppercase.
const baseStyles = 'terminal-nav-link flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-[2px]';
const activeStyles = 'terminal-nav-link-active border-amber-600 dark:border-green-400 text-amber-700 dark:text-green-300 bg-transparent';
const inactiveStyles = 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';
// AI link (success) variant.
const aiActiveStyles = 'terminal-nav-link-active border-green-600 dark:border-green-400 text-green-700 dark:text-green-300 bg-transparent';
const aiInactiveStyles = 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800';

const Divider = () => (
  <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2 self-center" />
);

const DesktopNavItem = ({ item, forceActive = false }) => {
  const isAi = item.variant === 'ai';
  return (
    <NavLink
      to={item.to}
      end={item.end}
      style={linkStyle}
      className={({ isActive }) =>
        `${baseStyles} ${(isActive || forceActive)
          ? (isAi ? aiActiveStyles : activeStyles)
          : (isAi ? aiInactiveStyles : inactiveStyles)}`
      }
    >
      <item.Icon size={16} />
      {!item.desktopIconOnly && <span>{item.label}</span>}
    </NavLink>
  );
};

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { pathname } = useLocation();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close the mobile menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on outside click and Escape while the menu is open; restore focus.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Desktop bar — visible at >=1200px */}
      <nav className="terminal-nav-desktop" aria-label="Primary">
        {NAV_GROUPS.map((group, gi) => (
          <React.Fragment key={group.title}>
            {gi > 0 && <Divider />}
            <div className="flex items-center gap-2">
              {group.items.map((item) => (
                <DesktopNavItem
                  key={item.to}
                  item={item}
                  forceActive={Boolean(item.matchRoot) && pathname === '/'}
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </nav>

      {/* Responsive disclosure — visible at <1200px */}
      <nav className="terminal-nav-mobile" aria-label="Primary">
        <button
          type="button"
          ref={buttonRef}
          className="terminal-nav-hamburger"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-controls="primary-nav-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
          <span>Menu</span>
        </button>

        {menuOpen && (
          <div
            id="primary-nav-menu"
            ref={menuRef}
            className="terminal-nav-menu"
            role="menu"
            aria-label="Primary navigation"
          >
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="terminal-nav-menu-group">
                <div className="terminal-nav-menu-group-title">{group.title}</div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    role="menuitem"
                    style={linkStyle}
                    className={({ isActive }) =>
                      `terminal-nav-menu-item${(isActive || (Boolean(item.matchRoot) && pathname === '/')) ? ' is-active' : ''}`
                    }
                    onClick={closeMenu}
                  >
                    <item.Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
