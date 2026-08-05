import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useUserStore from '../stores/userStore';
import useOrgProfileStore from '../stores/orgProfileStore';
import { isSafeLogoDataUrl } from '../utils/brandLogo';
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  FileArchive,
  ClipboardList,
  Gauge,
  Server,
  Shield,
  Settings,
  Bot,
  AlertTriangle,
  History,
  Menu,
  X
} from 'lucide-react';

// Single source of truth for the nav — used by BOTH the sidebar rail and the
// (<1024px) drawer so every route stays reachable in both.
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
      { to: '/inventory', label: 'Inventory', Icon: Server },
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
      { to: '/ai-assistant', label: 'AI', Icon: Bot },
      // The rail has room for a label, so Settings no longer goes icon-only
      // the way it had to on the old horizontal bar.
      { to: '/settings', label: 'Settings', Icon: Settings },
    ],
  },
];

const linkStyle = { textDecoration: 'none' };

const NavItem = ({ item, forceActive = false, onNavigate }) => (
  <NavLink
    to={item.to}
    end={item.end}
    style={linkStyle}
    onClick={onNavigate}
    className={({ isActive }) =>
      `app-nav-item${(isActive || forceActive) ? ' is-active' : ''}`
    }
  >
    <item.Icon size={16} className="app-nav-icon" />
    <span>{item.label}</span>
  </NavLink>
);

const NavGroups = ({ pathname, onNavigate }) => (
  <>
    {NAV_GROUPS.map((group) => (
      <div key={group.title} className="app-nav-group">
        <div className="app-nav-group-title">{group.title}</div>
        {group.items.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            forceActive={Boolean(item.matchRoot) && pathname === '/'}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    ))}
  </>
);

// Who comments and audit-log entries are attributed to. Honor-system by
// design — the app has no authentication; this is a directory pick.
const ActingUserSelect = () => {
  const users = useUserStore((state) => state.users);
  const currentUserId = useUserStore((state) => state.currentUserId);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  return (
    <div className="app-acting-user">
      <label className="app-acting-user-label" htmlFor="acting-user-select">Acting as</label>
      <select
        id="acting-user-select"
        value={currentUserId ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') { setCurrentUser(null); return; }
          // ids are numeric for seeded users, uuid strings for created ones
          const user = users.find(u => String(u.id) === raw);
          setCurrentUser(user ? user.id : null);
        }}
      >
        <option value="">Not selected (System)</option>
        {users.map((user) => (
          <option key={user.id} value={String(user.id)}>{user.name}</option>
        ))}
      </select>
    </div>
  );
};

// The brand mark. Rendered by BOTH the rail and the drawer, so the custom-logo
// swap lives here once rather than in two places that could drift.
const Brand = () => {
  const branding = useOrgProfileStore((state) => state.branding);
  const orgName = useOrgProfileStore((state) => state.profile?.orgName);
  // A stored value can arrive from a restored backup without ever passing the
  // upload form, so the guard runs at render too — a value that fails it falls
  // through to the shield rather than becoming an attacker-chosen `src`.
  const customLogo = isSafeLogoDataUrl(branding?.logoDataUrl) ? branding.logoDataUrl : null;
  // ...and a data URL that passes the shape check can still be corrupt bytes.
  // onError retires it for this session so the sidebar shows the shield rather
  // than a broken-image glyph nobody can clear.
  const [logoBroken, setLogoBroken] = useState(false);
  const showCustom = Boolean(customLogo) && !logoBroken;

  useEffect(() => { setLogoBroken(false); }, [customLogo]);

  return (
    <div className="app-sidebar-brand">
      <div className="terminal-logo-disc">
        {showCustom ? (
          <img
            src={customLogo}
            alt={orgName ? `${orgName} logo` : 'Company logo'}
            onError={() => setLogoBroken(true)}
          />
        ) : (
          <img src="/SC_Logo.png" alt="Simply Cyber shield" />
        )}
      </div>
      <div className="app-sidebar-brand-text">
        <span className="app-sidebar-brand-name">CSF Profile</span>
        <span className="app-sidebar-brand-sub">NIST CSF 2.0 Assessment Tool</span>
      </div>
    </div>
  );
};

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const buttonRef = useRef(null);
  const { pathname } = useLocation();

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Close the drawer on route change.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close on outside click and Escape while the drawer is open; restore focus.
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const handlePointerDown = (event) => {
      if (
        drawerRef.current && !drawerRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setDrawerOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDrawerOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  return (
    <>
      {/* The rail — primary nav at >=1024px. Hidden below that, where the
          drawer carries the same NAV_GROUPS. */}
      <aside className="app-sidebar" aria-label="Primary">
        <Brand />
        <nav className="app-sidebar-nav">
          <NavGroups pathname={pathname} />
        </nav>
        <ActingUserSelect />
      </aside>

      {/* Drawer trigger — only visible below 1024px (see CSS). */}
      <button
        type="button"
        ref={buttonRef}
        className="app-drawer-trigger"
        aria-expanded={drawerOpen}
        aria-haspopup="menu"
        aria-controls="primary-nav-drawer"
        aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setDrawerOpen((o) => !o)}
      >
        {drawerOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {drawerOpen && (
        <div className="app-drawer-scrim">
          <div
            id="primary-nav-drawer"
            ref={drawerRef}
            className="app-drawer"
            role="menu"
            aria-label="Primary navigation"
          >
            <Brand />
            <nav className="app-sidebar-nav">
              <NavGroups pathname={pathname} onNavigate={closeDrawer} />
            </nav>
            <ActingUserSelect />
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
