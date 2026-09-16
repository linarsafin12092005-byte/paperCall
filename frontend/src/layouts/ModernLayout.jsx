import { colors, spacing, borderRadius, shadows, transitions, typography } from '../design-system/tokens'
import { LayoutDashboard, Phone, Users, User, BookOpen } from 'lucide-react'

export function ModernLayout({ children, activePage, onPageChange }) {
  const navItems = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'calls', label: 'Звонки', icon: Phone },
    { id: 'contacts', label: 'Контакты', icon: Users },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'start', label: 'Быстрый старт', icon: BookOpen },
  ]

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
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '2px 2px 0px rgba(59, 130, 246, 0.3)',
            }}>
              PaperCall
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
            Contact Center
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
            }}>
              И
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
                Иван Иванов
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.textTertiary,
              }}>
                ivan@papercall.com
              </div>
            </div>
          </div>
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
