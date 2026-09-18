import { useState } from 'react'
import { colors, spacing, borderRadius, typography, shadows, transitions } from '../design-system/tokens'
import { Eye, EyeOff } from 'lucide-react'

export function LoginPage({ onLogin }) {
  const registrationEnabled = import.meta.env.VITE_ENABLE_REGISTRATION === 'true'
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password) => {
    if (password.length < 8) return 'Пароль должен содержать минимум 8 символов'
    if (!/\d/.test(password)) return 'Пароль должен содержать хотя бы одну цифру'
    if (!/[a-zA-Z]/.test(password)) return 'Пароль должен содержать хотя бы одну букву'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Валидация email
    if (!validateEmail(formData.email)) {
      setError('Некорректный формат email')
      setLoading(false)
      return
    }

    // Валидация пароля при регистрации
    if (isRegister) {
      const passwordError = validatePassword(formData.password)
      if (passwordError) {
        setError(passwordError)
        setLoading(false)
        return
      }
    }

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const body = isRegister
        ? { fullName: formData.fullName, email: formData.email, password: formData.password, phoneNumber: formData.phoneNumber }
        : { email: formData.email, password: formData.password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Ошибка авторизации')
      }

      const data = await response.json()
      localStorage.setItem('token', data.token)
      onLogin(data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: colors.bg,
      padding: spacing[4],
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: spacing[8],
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 900,
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            letterSpacing: '-2px',
            transform: 'skewX(-8deg)',
            display: 'inline-block',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '2px 2px 0px rgba(59, 130, 246, 0.3)',
            }}>
              PAPERCALL
            </span>
          </div>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.textTertiary,
            marginTop: spacing[2],
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}>
            Контакт Центр
          </div>
        </div>

        {/* Form Card */}
        <div style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: borderRadius.lg,
          padding: spacing[8],
          boxShadow: shadows.lg,
        }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing[2],
            textAlign: 'center',
          }}>
            {isRegister ? 'Регистрация' : 'Вход в систему'}
          </h2>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: spacing[6],
          }}>
            {isRegister ? 'Создайте новый аккаунт' : 'Войдите в свой аккаунт'}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.textSecondary,
                    marginBottom: spacing[2],
                  }}>
                    Полное имя
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: borderRadius.md,
                      color: colors.textPrimary,
                      fontSize: typography.fontSize.sm,
                      transition: transitions.fast,
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.border}
                  />
                </div>

                <div style={{ marginBottom: spacing[4] }}>
                  <label style={{
                    display: 'block',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.textSecondary,
                    marginBottom: spacing[2],
                  }}>
                    Телефон (опционально)
                  </label>
                  <input
                    type="tel"
                    placeholder="+79991234567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: spacing[3],
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: borderRadius.md,
                      color: colors.textPrimary,
                      fontSize: typography.fontSize.sm,
                      transition: transitions.fast,
                    }}
                    onFocus={(e) => e.target.style.borderColor = colors.accent}
                    onBlur={(e) => e.target.style.borderColor = colors.border}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.textSecondary,
                marginBottom: spacing[2],
              }}>
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: spacing[3],
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: borderRadius.md,
                  color: colors.textPrimary,
                  fontSize: typography.fontSize.sm,
                  transition: transitions.fast,
                }}
                onFocus={(e) => e.target.style.borderColor = colors.accent}
                onBlur={(e) => e.target.style.borderColor = colors.border}
              />
            </div>

            <div style={{ marginBottom: spacing[6] }}>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.textSecondary,
                marginBottom: spacing[2],
              }}>
                Пароль
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    paddingRight: `calc(${spacing[3]} + 24px + ${spacing[2]})`,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: borderRadius.md,
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm,
                    transition: transitions.fast,
                  }}
                  onFocus={(e) => e.target.style.borderColor = colors.accent}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: spacing[3],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: colors.textTertiary,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: spacing[3],
                background: colors.dangerLight,
                border: `1px solid ${colors.danger}`,
                borderRadius: borderRadius.md,
                color: colors.danger,
                fontSize: typography.fontSize.sm,
                marginBottom: spacing[4],
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: spacing[3],
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentCyan} 100%)`,
                border: 'none',
                borderRadius: borderRadius.md,
                color: colors.textPrimary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: transitions.base,
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
            >
              {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <div style={{
            marginTop: spacing[6],
            textAlign: 'center',
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            {registrationEnabled && (
              <>
                {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister)
                    setError('')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.accent,
                    fontWeight: typography.fontWeight.medium,
                    cursor: 'pointer',
                  }}
                >
                  {isRegister ? 'Войти' : 'Зарегистрироваться'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
