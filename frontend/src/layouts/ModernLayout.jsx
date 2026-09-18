import { colors, spacing, borderRadius, shadows, transitions, typography } from '../design-system/tokens'
import { LayoutDashboard, Phone, Users, User, BookOpen, LogOut, ChevronRight, BriefcaseBusiness } from 'lucide-react'
import { useState } from 'react'

export function ModernLayout({ children, activePage, onPageChange, user, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'calls', label: 'Звонки', icon: Phone },
    { id: 'contacts', label: 'Контакты', icon: Users },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'start', label: 'Быстрый старт', icon: BookOpen },
  ]
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    navItems.splice(3, 0, { id: 'employees', label: 'Сотрудники', icon: BriefcaseBusiness })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
      }}>
        {/* Logo - Graffiti/Tag style */}
        <div style={{
          padding: spacing[6],
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 900,
            color: colors.textPrimary,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            letterSpacing: '-1px',
            textAlign: 'center',
            position: 'relative',
            textTransform: 'uppercase',
            transform: 'skewX(-8deg)',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '2px 2px 0px rgba(59, 130, 246, 0.3)',
            }}>
              paperCall
            </span>
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.textTertiary,
            marginTop: spacing[2],
            textAlign: 'center',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontWeight: typography.fontWeight.bold,
          }}>
            Контакт Центр
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: spacing[3] }}>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activePage === item.id

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: `${spacing[2]} ${spacing[3]}`,
                  marginBottom: spacing[1],
                  background: isActive ? colors.surfaceHover : 'transparent',
                  border: 'none',
                  borderRadius: borderRadius.md,
                  color: isActive ? colors.textPrimary : colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: transitions.fast,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = colors.surfaceHover
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div style={{
          padding: spacing[3],
          borderTop: `1px solid ${colors.border}`,
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            padding: spacing[2],
            borderRadius: borderRadius.md,
            cursor: 'pointer',
            transition: transitions.fast,
          }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: borderRadius.full,
              background: colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
              {!user?.avatarUrl && (user?.fullName?.charAt(0)?.toUpperCase() || 'U')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.textPrimary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.fullName || 'Пользователь'}
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.textTertiary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.email || 'user@papercall.com'}
              </div>
            </div>
            <ChevronRight
              size={16}
              style={{
                color: colors.textTertiary,
                transform: showUserMenu ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: transitions.fast,
              }}
            />
          </div>

          {/* User dropdown menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: spacing[3],
              right: spacing[3],
              marginBottom: spacing[2],
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: borderRadius.md,
              boxShadow: shadows.lg,
              overflow: 'hidden',
              zIndex: 1000,
            }}>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  onPageChange('profile')
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: `${spacing[3]} ${spacing[4]}`,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                  fontSize: typography.fontSize.sm,
                  cursor: 'pointer',
                  transition: transitions.fast,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <User size={16} />
                Мой профиль
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false)
                  if (onLogout) {
                    onLogout()
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[3],
                  padding: `${spacing[3]} ${spacing[4]}`,
                  background: 'transparent',
                  border: 'none',
                  color: colors.danger,
                  fontSize: typography.fontSize.sm,
                  cursor: 'pointer',
                  transition: transitions.fast,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.dangerLight}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} />
                Выйти
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: '240px',
        padding: spacing[8],
        maxWidth: '1400px',
        width: '100%',
      }}>
        {children}
      </main>
    </div>
  )
}
