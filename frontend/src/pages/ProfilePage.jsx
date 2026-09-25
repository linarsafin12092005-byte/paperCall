import { useState } from 'react'
import { colors, spacing, borderRadius, typography, transitions } from '../design-system/tokens'
import { User, Server, Key, Copy, Eye, EyeOff, CheckCircle, LogOut, Settings } from 'lucide-react'

export function ProfilePage({ user, onLogout, onEditProfile }) {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState('')

  const sipConfig = {
    localSipServer: 'localhost',
    lanSipServer: '192.168.207.102',
    sipExtension: user?.sipExtension || '—',
    sipPassword: user?.sipPassword || '********',
    domain: 'asterisk',
    transport: 'UDP',
    port: '5060',
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  const copyAllCredentials = () => {
    const credentials = `SIP Server (this computer): ${sipConfig.localSipServer}:${sipConfig.port}
SIP Server (LAN device): ${sipConfig.lanSipServer}:${sipConfig.port}
Domain: ${sipConfig.domain}
Extension: ${sipConfig.sipExtension}
Auth username: ${sipConfig.sipExtension}
Transport: ${sipConfig.transport}
Password: ${sipConfig.sipPassword}`
    navigator.clipboard.writeText(credentials)
    setCopied('all')
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="office-page profile-page">
      {/* Header */}
      <div className="office-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[8],
      }}>
        <div>
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
        <button
          onClick={onEditProfile}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: `${spacing[2]} ${spacing[4]}`,
            background: colors.accent,
            border: 'none',
            borderRadius: borderRadius.md,
            color: colors.textPrimary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            transition: transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.accentHover
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.accent
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <Settings size={16} />
          Редактировать
        </button>
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
            background: user?.avatarUrl
              ? `url(${user.avatarUrl}) center/cover`
              : colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            overflow: 'hidden',
          }}>
            {!user?.avatarUrl && (user?.fullName?.charAt(0)?.toUpperCase() || 'U')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing[1],
            }}>
              {user?.fullName || 'Пользователь'}
            </div>
            <div style={{
              fontSize: typography.fontSize.base,
              color: colors.textSecondary,
              wordBreak: 'break-all',
            }}>
              {user?.email || 'user@papercall.com'}
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[4]}`,
              background: colors.dangerLight,
              border: `1px solid ${colors.danger}`,
              borderRadius: borderRadius.md,
              color: colors.danger,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: transitions.fast,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.danger}
            onMouseLeave={(e) => e.currentTarget.style.background = colors.dangerLight}
          >
            <LogOut size={16} />
            Выйти
          </button>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {[
                ['server-local', 'На этом компьютере', `${sipConfig.localSipServer}:${sipConfig.port}`],
                ['server-lan', 'Телефон или другой компьютер в LAN', `${sipConfig.lanSipServer}:${sipConfig.port}`],
              ].map(([field, label, value]) => (
                <div key={field} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: spacing[3],
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: borderRadius.md,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: colors.textTertiary, fontSize: typography.fontSize.xs }}>{label}</div>
                    <code style={{ fontSize: typography.fontSize.base, color: colors.textPrimary, fontFamily: 'monospace' }}>{value}</code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value, field)}
                    style={{
                      padding: spacing[2],
                      background: 'transparent',
                      border: 'none',
                      color: copied === field ? colors.success : colors.textSecondary,
                      cursor: 'pointer',
                      transition: transitions.fast,
                    }}
                  >
                    {copied === field ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              ))}
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
                {sipConfig.sipExtension}
              </code>
              <button
                onClick={() => copyToClipboard(sipConfig.sipExtension, 'extension')}
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
                {showPassword ? sipConfig.sipPassword : '••••••••'}
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
                onClick={() => copyToClipboard(sipConfig.sipPassword, 'password')}
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
