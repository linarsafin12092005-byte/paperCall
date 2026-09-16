import { colors, borderRadius, spacing, typography } from './tokens'

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) {
  const variants = {
    default: {
      background: colors.surface,
      color: colors.textSecondary,
      borderColor: colors.border,
    },
    success: {
      background: 'rgba(16, 185, 129, 0.15)',
      color: colors.success,
      borderColor: colors.success,
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.15)',
      color: colors.warning,
      borderColor: colors.warning,
    },
    error: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: colors.error,
      borderColor: colors.error,
    },
    info: {
      background: 'rgba(59, 130, 246, 0.15)',
      color: colors.info,
      borderColor: colors.info,
    },
    accent: {
      background: 'rgba(255, 0, 0, 0.15)',
      color: colors.accent,
      borderColor: colors.accent,
    }
  }

  const sizes = {
    sm: {
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
    },
    md: {
      padding: `${spacing[1]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
    },
    lg: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
    }
  }

  const variantStyles = variants[variant]
  const sizeStyles = sizes[size]

  return (
    <span
      className={`supreme-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: typography.fontWeight.bold,
        borderRadius: borderRadius.DEFAULT,
        border: `2px solid`,
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        ...variantStyles,
        ...sizeStyles,
      }}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status, size = 'md' }) {
  const statusMap = {
    online: { variant: 'success', text: 'Online' },
    offline: { variant: 'default', text: 'Offline' },
    busy: { variant: 'warning', text: 'Busy' },
    dnd: { variant: 'error', text: 'DND' },
    available: { variant: 'success', text: 'Available' },
    on_call: { variant: 'info', text: 'On Call' },
  }

  const config = statusMap[status?.toLowerCase()] || statusMap.offline

  return (
    <Badge variant={config.variant} size={size}>
      {config.text}
    </Badge>
  )
}
