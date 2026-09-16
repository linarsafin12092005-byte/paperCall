import { colors, borderRadius, spacing, typography, transitions } from './tokens'

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  icon: Icon,
  className = '',
  fullWidth = false,
  ...props
}) {
  const baseStyles = {
    width: fullWidth ? '100%' : 'auto',
    padding: Icon ? `${spacing[3]} ${spacing[4]} ${spacing[3]} ${spacing[10]}` : `${spacing[3]} ${spacing[4]}`,
    background: colors.background,
    border: `2px solid ${error ? colors.error : colors.border}`,
    borderRadius: borderRadius.DEFAULT,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    outline: 'none',
    transition: transitions.base,
  }

  return (
    <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      {Icon && (
        <div style={{
          position: 'absolute',
          left: spacing[4],
          top: '50%',
          transform: 'translateY(-50%)',
          color: colors.textTertiary,
          pointerEvents: 'none',
        }}>
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`supreme-input ${className}`}
        style={baseStyles}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.accent
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.error : colors.border
        }}
        {...props}
      />
    </div>
  )
}

export function Textarea({
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  rows = 4,
  className = '',
  fullWidth = true,
  ...props
}) {
  const baseStyles = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${spacing[3]} ${spacing[4]}`,
    background: colors.background,
    border: `2px solid ${error ? colors.error : colors.border}`,
    borderRadius: borderRadius.DEFAULT,
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.sans,
    outline: 'none',
    transition: transitions.base,
    resize: 'vertical',
  }

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      rows={rows}
      className={`supreme-textarea ${className}`}
      style={baseStyles}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = error ? colors.error : colors.accent
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error ? colors.error : colors.border
      }}
      {...props}
    />
  )
}
