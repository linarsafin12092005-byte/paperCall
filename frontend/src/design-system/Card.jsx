import { colors, borderRadius, shadows, spacing } from './tokens'

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  style = {}
}) {
  const paddingMap = {
    none: 0,
    sm: spacing[3],
    md: spacing[5],
    lg: spacing[8],
  }

  const baseStyles = {
    background: colors.surface,
    border: `2px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    padding: paddingMap[padding],
    transition: 'all 200ms ease-in-out',
  }

  const hoverStyles = hover ? {
    cursor: 'pointer',
    ':hover': {
      borderColor: colors.accent,
      boxShadow: shadows.accent,
    }
  } : {}

  return (
    <div
      className={`supreme-card ${className}`}
      onClick={onClick}
      style={{
        ...baseStyles,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = colors.accent
          e.currentTarget.style.boxShadow = shadows.accent
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = colors.border
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
    >
      {children}
    </div>
  )
}
