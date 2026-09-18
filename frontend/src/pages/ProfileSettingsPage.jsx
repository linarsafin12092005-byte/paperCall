import { useState } from 'react'
import { colors, spacing, borderRadius, typography, transitions } from '../design-system/tokens'
import { ArrowLeft, Eye, EyeOff, Upload, User } from 'lucide-react'

export function ProfileSettingsPage({ user, onBack, onUpdate }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null)
  const [avatarFile, setAvatarFile] = useState(null)

  const validatePassword = (password) => {
    if (password.length < 8) return 'Пароль должен содержать минимум 8 символов'
    return null
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Выберите изображение JPG, PNG или GIF')
      setAvatarFile(null)
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Размер аватара не должен превышать 2 МБ')
      setAvatarFile(null)
      return
    }

    setError('')
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Валидация нового пароля если он введен
      if (formData.newPassword) {
        const passwordError = validatePassword(formData.newPassword)
        if (passwordError) {
          setError(passwordError)
          setLoading(false)
          return
        }

        if (formData.newPassword !== formData.confirmPassword) {
          setError('Пароли не совпадают')
          setLoading(false)
          return
        }

        if (!formData.oldPassword) {
          setError('Введите старый пароль для смены пароля')
          setLoading(false)
          return
        }
      }

      const token = localStorage.getItem('token')
      const updateData = new FormData()
      updateData.append('fullName', formData.fullName)
      updateData.append('email', formData.email)

      // Добавляем телефон только если он изменился
      if (formData.phoneNumber && formData.phoneNumber !== user?.phoneNumber) {
        updateData.append('phoneNumber', formData.phoneNumber)
      }

      // Добавляем пароли только если пользователь хочет их изменить
      if (formData.newPassword) {
        updateData.append('oldPassword', formData.oldPassword)
        updateData.append('newPassword', formData.newPassword)
      }
      if (avatarFile) {
        updateData.append('avatar', avatarFile)
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: updateData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Ошибка обновления профиля')
      }

      const data = await response.json()
      onUpdate(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[4],
        marginBottom: spacing[8],
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.md,
            color: colors.textSecondary,
            cursor: 'pointer',
            transition: transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = colors.accent
            e.currentTarget.style.color = colors.textPrimary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border
            e.currentTarget.style.color = colors.textSecondary
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing[1],
          }}>
            Редактировать профиль
          </h1>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            Обновите свою личную информацию и настройки
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{
        maxWidth: '800px',
      }}>
        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[6],
          }}>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing[4],
            }}>
              Фото профиля
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[4],
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: borderRadius.full,
                background: avatarPreview ? `url(${avatarPreview}) center/cover` : colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.semibold,
                color: colors.textPrimary,
                overflow: 'hidden',
              }}>
                {!avatarPreview && (user?.fullName?.charAt(0)?.toUpperCase() || <User size={32} />)}
              </div>
              <div>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[2]} ${spacing[4]}`,
                  background: colors.surfaceHover,
                  border: `1px solid ${colors.border}`,
                  borderRadius: borderRadius.md,
                  color: colors.textPrimary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border
                  }}
                >
                  <Upload size={16} />
                  Загрузить фото
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{
                  fontSize: typography.fontSize.xs,
                  color: colors.textTertiary,
                  marginTop: spacing[2],
                }}>
                  JPG, PNG или GIF (макс. 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[6],
          }}>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing[4],
            }}>
              Личная информация
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing[4],
            }}>
              <div>
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

              <div>
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
            </div>

            <div style={{ marginTop: spacing[4] }}>
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
          </div>

          {/* Password Change */}
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.lg,
            padding: spacing[6],
            marginBottom: spacing[6],
          }}>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing[1],
            }}>
              Изменить пароль
            </h3>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.textTertiary,
              marginBottom: spacing[4],
            }}>
              Оставьте поля пустыми, если не хотите менять пароль
            </p>

            <div style={{ marginBottom: spacing[4] }}>
              <label style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.textSecondary,
                marginBottom: spacing[2],
              }}>
                Текущий пароль
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
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
                  onClick={() => setShowOldPassword(!showOldPassword)}
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
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing[4],
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.textSecondary,
                  marginBottom: spacing[2],
                }}>
                  Новый пароль
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
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
                    onClick={() => setShowNewPassword(!showNewPassword)}
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
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.textSecondary,
                  marginBottom: spacing[2],
                }}>
                  Подтвердите пароль
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
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

          {/* Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: spacing[3],
          }}>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: borderRadius.md,
                color: colors.textPrimary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: transitions.fast,
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = colors.surfaceHover)}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = colors.surface)}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
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
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
