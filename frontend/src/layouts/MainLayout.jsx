import { useState } from 'react'
import { colors, spacing, shadows, transitions, borderRadius } from '../design-system/tokens'
import {
  LayoutDashboard,
  Phone,
  Users,
  User,
  BookOpen,
  Bell,
  Menu,
  X,
  Search,
  Settings,
  LogOut
} from 'lucide-react'
import { Avatar } from '../design-system'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
]

export function MainLayout({ children, activeTab, onTabChange, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notificationCount] = useState(3)

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.textPrimary,
      display: 'flex',
    }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '280px' : '80px',
          background: colors.surface,
          borderRight: `2px solid ${colors.border}`,
          transition: transitions.slow,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: spacing[6],
            borderBottom: `2px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'space-between' : 'center',
          }}
        >
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: colors.accent,
                  borderRadius: borderRadius.DEFAULT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                CF
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                  CALLFLOW
                </div>
                <div style={{ fontSize: '0.625rem', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Contact Center
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: spacing[2],
              display: 'flex',
              transition: transitions.base,
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.accent}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: spacing[4], overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: spacing[3],
                  marginBottom: spacing[2],
                  background: isActive ? colors.accent : 'transparent',
                  border: `2px solid ${isActive ? colors.accent : 'transparent'}`,
                  borderRadius: borderRadius.DEFAULT,
                  color: isActive ? colors.textPrimary : colors.textSecondary,
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  transition: transitions.base,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = colors.accent
                    e.currentTarget.style.color = colors.accent
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.color = colors.textSecondary
                  }
                }}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div
          style={{
            padding: spacing[4],
            borderTop: `2px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
              padding: spacing[3],
              background: colors.background,
              borderRadius: borderRadius.DEFAULT,
              border: `2px solid ${colors.border}`,
              cursor: 'pointer',
              transition: transitions.base,
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.accent}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border}
          >
            <Avatar
              name={user?.name || 'User'}
              size="sm"
              status="online"
            />
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', truncate: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.textTertiary }}>
                  Online
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '280px' : '80px',
          transition: transitions.slow,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top bar */}
        <header
          style={{
            background: colors.surface,
            borderBottom: `2px solid ${colors.border}`,
            padding: `${spacing[4]} ${spacing[6]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textTertiary,
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: '100%',
                padding: `${spacing[2]} ${spacing[3]} ${spacing[2]} ${spacing[10]}`,
                background: colors.background,
                border: `2px solid ${colors.border}`,
                borderRadius: borderRadius.DEFAULT,
                color: colors.textPrimary,
                fontSize: '0.875rem',
                outline: 'none',
                transition: transitions.base,
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = colors.accent}
              onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
            />
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            {/* Notifications */}
            <button
              style={{
                position: 'relative',
                background: colors.background,
                border: `2px solid ${colors.border}`,
                borderRadius: borderRadius.DEFAULT,
                padding: spacing[2],
                color: colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                transition: transitions.base,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.accent
                e.currentTarget.style.color = colors.accent
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.color = colors.textSecondary
              }}
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: colors.accent,
                    color: colors.textPrimary,
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: borderRadius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${colors.surface}`,
                  }}
                >
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              style={{
                background: colors.background,
                border: `2px solid ${colors.border}`,
                borderRadius: borderRadius.DEFAULT,
                padding: spacing[2],
                color: colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                transition: transitions.base,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.accent
                e.currentTarget.style.color = colors.accent
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border
                e.currentTarget.style.color = colors.textSecondary
              }}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: spacing[8],
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
