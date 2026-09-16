import { colors, spacing, borderRadius, typography, shadows, transitions } from '../design-system/tokens'
import { TrendingUp, TrendingDown, Activity, Phone, Users, Clock } from 'lucide-react'

function StatCard({ label, value, change, trend, icon: Icon }) {
  const isPositive = trend === 'up'

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      transition: transitions.base,
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.accent
        e.currentTarget.style.boxShadow = shadows.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing[3] }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          fontWeight: typography.fontWeight.medium,
        }}>
          {label}
        </div>
        {Icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: borderRadius.md,
            background: colors.surfaceHover,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={18} color={colors.textSecondary} />
          </div>
        )}
      </div>

      <div style={{
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing[2],
      }}>
        {value}
      </div>

      {change && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
          fontSize: typography.fontSize.xs,
          color: isPositive ? colors.success : colors.danger,
          fontWeight: typography.fontWeight.medium,
        }}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}
        </div>
      )}
    </div>
  )
}

function ActivityItem({ call }) {
  const statusColors = {
    FINISHED: colors.success,
    FAILED: colors.danger,
    ANSWERED: colors.success,
    RINGING: colors.warning,
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
      padding: `${spacing[3]} 0`,
      borderBottom: `1px solid ${colors.border}`,
      transition: transitions.fast,
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = colors.surfaceHover}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Avatar */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: borderRadius.full,
        background: colors.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        flexShrink: 0,
      }}>
        {call.client?.fullName?.charAt(0) || '?'}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.textPrimary,
          marginBottom: spacing[1],
        }}>
          {call.client?.fullName || 'Неизвестно'}
        </div>
        <div style={{
          fontSize: typography.fontSize.xs,
          color: colors.textSecondary,
        }}>
          {new Date(call.createdAt).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })} • {call.operator?.fullName || 'Не назначен'}
        </div>
      </div>

      {/* Status */}
      <div style={{
        padding: `${spacing[1]} ${spacing[3]}`,
        borderRadius: borderRadius.md,
        background: call.status === 'FINISHED' ? colors.successLight : call.status === 'FAILED' ? colors.dangerLight : colors.warningLight,
        color: statusColors[call.status] || colors.textSecondary,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
      }}>
        {call.status === 'FINISHED' ? 'Завершен' : call.status === 'FAILED' ? 'Не отвечен' : 'Активен'}
      </div>
    </div>
  )
}

export function DashboardPage({ calls = [] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const callsToday = calls.filter(c => new Date(c.createdAt) >= today)
  const activeCalls = calls.filter(c => c.status === 'RINGING' || c.status === 'ANSWERED')
  const finishedCalls = calls.filter(c => c.status === 'FINISHED')
  const avgDuration = finishedCalls.length > 0
    ? Math.floor(finishedCalls.reduce((acc, c) => acc + (c.duration || 0), 0) / finishedCalls.length / 60)
    : 0

  const recentCalls = [...calls].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)

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
          Dashboard
        </h1>
        <p style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
        }}>
          Обзор активности контакт-центра в реальном времени
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: spacing[4],
        marginBottom: spacing[8],
      }}>
        <StatCard
          label="Звонков сегодня"
          value={callsToday.length}
          change="+12% за неделю"
          trend="up"
          icon={Phone}
        />
        <StatCard
          label="Активных сейчас"
          value={activeCalls.length}
          icon={Activity}
        />
        <StatCard
          label="Завершенных"
          value={finishedCalls.length}
          change="+8% за неделю"
          trend="up"
          icon={Users}
        />
        <StatCard
          label="Ср. длительность"
          value={`${avgDuration} мин`}
          icon={Clock}
        />
      </div>

      {/* Recent Activity */}
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
          marginBottom: spacing[4],
        }}>
          <h2 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
          }}>
            Последние звонки
          </h2>
          <button style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.md,
            color: colors.textSecondary,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
            transition: transitions.fast,
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.accent
              e.currentTarget.style.color = colors.accent
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border
              e.currentTarget.style.color = colors.textSecondary
            }}
          >
            Все звонки →
          </button>
        </div>

        <div>
          {recentCalls.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: spacing[12],
              color: colors.textTertiary,
              fontSize: typography.fontSize.sm,
            }}>
              Пока нет звонков
            </div>
          ) : (
            recentCalls.map(call => <ActivityItem key={call.id} call={call} />)
          )}
        </div>
      </div>
    </div>
  )
}
