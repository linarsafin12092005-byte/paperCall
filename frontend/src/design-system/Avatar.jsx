import { colors, borderRadius, shadows } from './tokens'

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
]

function getGradient(seed) {
  if (!seed) return gradients[0]
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

export function Avatar({
  src,
  name,
  size = 'md',
  status,
  onClick,
  className = ''
}) {
  const sizes = {
    xs: { width: '24px', height: '24px', fontSize: '0.625rem' },
    sm: { width: '32px', height: '32px', fontSize: '0.75rem' },
    md: { width: '40px', height: '40px', fontSize: '1rem' },
    lg: { width: '56px', height: '56px', fontSize: '1.5rem' },
    xl: { width: '80px', height: '80px', fontSize: '2rem' },
    '2xl': { width: '112px', height: '112px', fontSize: '3rem' },
  }

  const sizeStyles = sizes[size]
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'

  const statusColors = {
    online: colors.online,
    offline: colors.offline,
    busy: colors.busy,
    dnd: colors.dnd,
  }

  return (
    <div
      className={`supreme-avatar ${className}`}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-flex',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          ...sizeStyles,
          borderRadius: borderRadius.full,
          border: `3px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: colors.textPrimary,
          background: src ? `url(${src}) center/cover` : getGradient(name),
          overflow: 'hidden',
          boxShadow: shadows.md,
        }}
      >
        {!src && initials}
      </div>
      {status && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size === 'xs' ? '8px' : size === 'sm' ? '10px' : size === 'md' ? '12px' : '16px',
            height: size === 'xs' ? '8px' : size === 'sm' ? '10px' : size === 'md' ? '12px' : '16px',
            borderRadius: borderRadius.full,
            background: statusColors[status] || colors.offline,
            border: `2px solid ${colors.background}`,
          }}
        />
      )}
    </div>
  )
}
