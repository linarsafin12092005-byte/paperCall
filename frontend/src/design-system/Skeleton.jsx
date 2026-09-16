import { colors, borderRadius } from './tokens'

export function Skeleton({
  width = '100%',
  height = '20px',
  variant = 'rect',
  className = ''
}) {
  const variants = {
    rect: borderRadius.DEFAULT,
    circle: borderRadius.full,
    rounded: borderRadius.md,
  }

  return (
    <div
      className={`supreme-skeleton ${className}`}
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${colors.surface} 25%, ${colors.surfaceHover} 50%, ${colors.surface} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
        borderRadius: variants[variant],
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Skeleton variant="circle" width="40px" height="40px" />
        <div style={{ flex: 1 }}>
          <Skeleton height="16px" width="60%" style={{ marginBottom: '0.5rem' }} />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <Skeleton height="12px" width="100%" style={{ marginBottom: '0.5rem' }} />
      <Skeleton height="12px" width="80%" />
    </div>
  )
}

// Добавим CSS анимацию через style tag
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes skeleton-pulse {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `
  document.head.appendChild(style)
}
