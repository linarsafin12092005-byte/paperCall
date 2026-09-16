import { colors, spacing, typography } from '../design-system/tokens'

export function SupremeLayout({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.textPrimary,
    }}>
      {/* Simple top bar */}
      <header style={{
        padding: `${spacing[8]} ${spacing[12]}`,
        borderBottom: `4px solid ${colors.border}`,
        background: colors.surface,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{
            background: colors.accent,
            padding: `${spacing[2]} ${spacing[6]}`,
            border: `3px solid ${colors.border}`,
          }}>
            <span style={{
              fontFamily: typography.fontFamily.sans,
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.black,
              color: colors.textInverse,
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              CALLFLOW
            </span>
          </div>

          {/* Date/Time */}
          <div style={{
            fontFamily: typography.fontFamily.sans,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.bold,
            textTransform: 'uppercase',
          }}>
            {new Date().toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </header>

      {/* Main content - centered with huge padding */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: `${spacing[32]} ${spacing[12]}`,
      }}>
        {children}
      </main>
    </div>
  )
}
