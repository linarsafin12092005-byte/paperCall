import { colors, transitions, borderRadius, shadows } from './tokens'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = ''
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: 700,
    border: '2px solid',
    transition: transitions.base,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    outline: 'none',
  }

  const variants = {
    primary: {
      background: colors.accent,
      color: colors.textPrimary,
      borderColor: colors.accent,
      ':hover': {
        background: colors.accentHover,
        borderColor: colors.accentHover,
      }
    },
    secondary: {
      background: 'transparent',
      color: colors.accent,
      borderColor: colors.accent,
      ':hover': {
        background: colors.accent,
        color: colors.textPrimary,
      }
    },
    ghost: {
      background: 'transparent',
      color: colors.textPrimary,
      borderColor: colors.border,
      ':hover': {
        borderColor: colors.accent,
        color: colors.accent,
      }
    },
    danger: {
      background: colors.error,
      color: colors.textPrimary,
      borderColor: colors.error,
      ':hover': {
        background: '#DC2626',
        borderColor: '#DC2626',
      }
    }
  }

  const sizes = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      borderRadius: borderRadius.DEFAULT,
    },
    md: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      borderRadius: borderRadius.DEFAULT,
    },
    lg: {
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      borderRadius: borderRadius.md,
    }
  }

  const variantStyles = variants[variant]
  const sizeStyles = sizes[size]

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`supreme-button ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles,
        ...sizeStyles,
        width: fullWidth ? '100%' : 'auto',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, variantStyles[':hover'])
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = variantStyles.background
          e.currentTarget.style.color = variantStyles.color
          e.currentTarget.style.borderColor = variantStyles.borderColor
        }
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />}
      {children}
    </button>
  )
}
