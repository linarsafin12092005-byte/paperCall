import { useState } from 'react'
import { colors, spacing, borderRadius, typography, transitions } from '../design-system/tokens'
import { User, Server, Key, Copy, Eye, EyeOff, CheckCircle } from 'lucide-react'

export function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState('')

  const user = {
    fullName: 'Иван Иванов',
    email: 'ivan@papercall.com',
    sipServer: window.location.hostname,
    sipExtension: '1001',
    sipPassword: 'secret123',
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  const copyAllCredentials = () => {
    const credentials = `SIP Server: ${user.sipServer}:5060
Extension: ${user.sipExtension}
Password: ${user.sipPassword}`
    navigator.clipboard.writeText(credentials)
    setCopied('all')
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing[8] }}>
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.semibold,
          color: colors.textPrimary,
          marginBottom: spacing[2],
        }}>
          Профиль
        </h1>
        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        }}>
          Информация о вашей учетной записи и SIP настройках
        </p>
      </div>

      {/* User Info Card */}
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        marginBottom: spacing[4],
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4],
          marginBottom: spacing[6],
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: borderRadius.full,
            background: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
          }}>
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing[1],
            }}>
              {user.fullName}
            </div>
            <div style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
            }}>
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* SIP Credentials Card */}
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: borderRadius.lg,
        padding: spacing[6],
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[6],
        }}>
          <h2 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
          }}>
            SIP Настройки
          </h2>
          <button
            onClick={copyAllCredentials}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[4]}`,
              background: copied === 'all' ? colors.success : colors.accent,
              border: 'none',
              borderRadius: borderRadius.md,
              color: colors.textPrimary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: transitions.fast,
            }}
          >
            {copied === 'all' ? <CheckCircle size={16} /> : <Copy size={16} />}
            {copied === 'all' ? 'Скопировано' : 'Копировать все'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* Server */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginBottom: spacing[2],
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
            }}>
              <Server size={16} />
              SIP Сервер
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: spacing[3],
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: borderRadius.md,
            }}>
              <code style={{
                flex: 1,
                fontSize: typography.fontSize.base,
                color: colors.textPrimary,
                fontFamily: 'monospace',
              }}>
                {user.sipServer}:5060
              </code>
              <button
                onClick={() => copyToClipboard(`${user.sipServer}:5060`, 'server')}
                style={{
                  padding: spacing[2],
                  background: 'transparent',
                  border: 'none',
                  color: copied === 'server' ? colors.success : colors.textSecondary,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                {copied === 'server' ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Extension */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginBottom: spacing[2],
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
            }}>
              <User size={16} />
              Номер / Extension
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: spacing[3],
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: borderRadius.md,
            }}>
              <code style={{
                flex: 1,
                fontSize: typography.fontSize.base,
                color: colors.textPrimary,
                fontFamily: 'monospace',
              }}>
                {user.sipExtension}
              </code>
              <button
                onClick={() => copyToClipboard(user.sipExtension, 'extension')}
                style={{
                  padding: spacing[2],
                  background: 'transparent',
                  border: 'none',
                  color: copied === 'extension' ? colors.success : colors.textSecondary,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                {copied === 'extension' ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginBottom: spacing[2],
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
            }}>
              <Key size={16} />
              Пароль
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: spacing[3],
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: borderRadius.md,
            }}>
              <code style={{
                flex: 1,
                fontSize: typography.fontSize.base,
                color: colors.textPrimary,
                fontFamily: 'monospace',
              }}>
                {showPassword ? user.sipPassword : '••••••••'}
              </code>
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  padding: spacing[2],
                  background: 'transparent',
                  border: 'none',
                  color: colors.textSecondary,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button
                onClick={() => copyToClipboard(user.sipPassword, 'password')}
                style={{
                  padding: spacing[2],
                  background: 'transparent',
                  border: 'none',
                  color: copied === 'password' ? colors.success : colors.textSecondary,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                {copied === 'password' ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
