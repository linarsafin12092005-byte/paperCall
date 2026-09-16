import { colors, spacing, shadows, zIndex, transitions, borderRadius } from './tokens'
import { X } from 'lucide-react'

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) {
  if (!isOpen) return null

  const sizes = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex.modal,
        padding: spacing[4],
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className={`supreme-modal ${className}`}
        style={{
          background: colors.surface,
          border: `2px solid ${colors.border}`,
          borderRadius: borderRadius.md,
          maxWidth: sizes[size],
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing[6],
            borderBottom: `2px solid ${colors.border}`,
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: colors.textPrimary,
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: spacing[2],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: transitions.base,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.accent
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textSecondary
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[6] }}>
          {children}
        </div>
      </div>
    </div>
  )
}
