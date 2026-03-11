/**
 * Sidebar.jsx — App Navigation
 *
 * Design system classes used
 * ──────────────────────────
 * z-sidebar        → 200px panel, base-1 bg, border-right
 * z-nav-item       → link row (color, hover, transitions)
 * z-nav-item.active → amber glow bg + amber text (auto via NavLink)
 * z-nav-section    → mono uppercase group label
 * z-brand-mark     → amber Z square (Logo fallback / compact mode)
 * z-mono-label     → muted mono text for kbd shortcuts
 * z-scroll         → styled thin scrollbar
 *
 * Active state
 * ────────────
 * React Router's <NavLink> adds the "active" class automatically
 * when the current URL matches. The .z-nav-item.active rule in
 * zenboard.css handles the amber highlight.
 *
 * Props
 * ─────
 * collapsed  boolean   Narrow icon-only rail mode.  Default: false
 */

import { NavLink, useNavigate } from 'react-router-dom';
import Logo        from '../../components/ui/Logo';
import IconDashboard from '../../assets/Icons/IconDashboard';
import IconTasks from '../../assets/Icons/IconTasks';
import IconHabits from '../../assets/Icons/IconHabits';
import IconNotes from '../../assets/Icons/IconNotes';
import IconSettings from '../../assets/Icons/IconSettings';
import IconSignOut from '../../assets/Icons/IconSignout';
import { useAuthStore } from '../../store/useAuthStore';

// ── Nav structure ─────────────────────────────────────────────────
// Add items here. Never hardcode them in JSX.
const NAV_SECTIONS = [
  {
    label: 'Workspace',
    items: [
      { to: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
      { to: 'tasks',     label: 'Tasks',     icon: <IconTasks />,     badge: '4' },
      { to: 'habits',    label: 'Habits',    icon: <IconHabits />,    badge: '12' },
      { to: 'notes',     label: 'Notes',     icon: <IconNotes /> },
    ],
  },
  {
    label: 'System',
    items: [
      { to: 'settings',  label: 'Settings',  icon: <IconSettings /> },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────
export default function Sidebar({ collapsed = false }) {

    const {user,logout,error,isLoading} = useAuthStore();
    const navigate = useNavigate();

    if(isLoading){
        return <div>Loading...</div>
    }

    if(error){
        return <div>Error: {error}</div>
    }

    const handleLogout = async() => {
        const res = await logout();
        if(res.success){
            navigate('/login');
        }
    }

  return (
    <aside className="z-sidebar z-scroll flex flex-col h-screen">

      {/* ── Logo ── */}
      <div className="px-1 mb-6">
        <Logo size="sm" showWordmark={!collapsed} showTag={false} />
      </div>

      {/* ── Ambient decorative bar ── */}
      <div
        aria-hidden="true"
        className="mx-2 mb-5 rounded-pill"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(232,147,58,0.35) 50%, transparent)',
        }}
      />

      {/* ── Nav groups ── */}
      <nav className="flex-1" aria-label="Main navigation">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>

            {/* Section label — hidden when collapsed */}
            {!collapsed && (
              <p className="z-nav-section">{section.label}</p>
            )}

            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `z-nav-item z-focus-ring ${isActive ? 'active' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                {/* Icon */}
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                  {item.icon}
                </span>

                {/* Label + badge — hidden when collapsed */}
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className="z-mono-label"
                        style={{
                          fontSize: '9px',
                          background: 'rgba(232,147,58,0.12)',
                          color: 'var(--color-amber)',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-pill)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Bottom divider ── */}
      <div
        aria-hidden="true"
        className="mx-2 my-3 rounded-pill"
        style={{
          height: '1px',
          background: 'var(--color-border)',
        }}
      />

      {/* ── User profile row ── */}
      <div
        className="z-nav-item cursor-default hover:bg-base-3 mt-auto"
        role="status"
        aria-label="Signed in as Ashok Kumar"
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 rounded-pill flex items-center justify-center font-display font-bold text-base-0 bg-amber"
          style={{ width: 26, height: 26, fontSize: 11 }}
          aria-hidden="true"
        >
          A
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-fg text-xs font-medium truncate leading-tight capitalize">
              {user?.user?.name}
            </p>
            <p className="z-mono-label truncate mt-0.5">
              Free plan
            </p>
          </div>
        )}

        {!collapsed && (
          <button
            className="z-btn-icon flex-shrink-0"
            style={{ padding: 4, border: 'none', background: 'transparent' }}
            aria-label="Sign out"
            title="Sign out"
            onClick={handleLogout}
          >
            <IconSignOut />
          </button>
        )}
      </div>

    </aside>
  );
}

