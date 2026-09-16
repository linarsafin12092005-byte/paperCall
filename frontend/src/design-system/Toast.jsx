import { colors, spacing, shadows, transitions, borderRadius } from './tokens'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

export function Toast({ type = 'info', message, isVisible, onClose }) {
  if (!isVisible) return null

  const Icon = icons[type]

  const variants = {
    success: {
      background: colors.success,
      icon: colors.textPrimary,
    },
    error: {
      background: colors.error,
      icon: colors.textPrimary,
    },
    warning: {
      background: colors.warning,
      icon: colors.textPrimary,
    },
    info: {
      background: colors.info,
      icon: colors.textPrimary,
    },
  }

  const variant = variants[type]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: spacing[6],
        right: spacing[6],
        background: colors.surface,
        border: `2px solid ${variant.background}`,
        borderRadius: borderRadius.md,
        padding: spacing[4],
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        boxShadow: shadows.xl,
        minWidth: '300px',
        maxWidth: '500px',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: borderRadius.full,
          background: variant.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={variant.icon} />
      </div>
      <div style={{ flex: 1, color: colors.textPrimary, fontWeight: 500 }}>
        {message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: colors.textSecondary,
          cursor: 'pointer',
          padding: spacing[1],
          display: 'flex',
          transition: transitions.base,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = colors.accent
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = colors.textSecondary
        }}
      >
        <XCircle size={18} />
      </button>
    </div>
  )
}

// Add CSS animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)
}
