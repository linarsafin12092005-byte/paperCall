import { useState, useMemo } from 'react'
import { colors, spacing, borderRadius, typography, transitions } from '../design-system/tokens'
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Plus } from 'lucide-react'

function CallItem({ call }) {
  const statusConfig = {
    FINISHED: { label: 'Завершен', color: colors.success, bg: colors.successLight, icon: Phone },
    FAILED: { label: 'Не отвечен', color: colors.danger, bg: colors.dangerLight, icon: PhoneMissed },
    ANSWERED: { label: 'Активен', color: colors.warning, bg: colors.warningLight, icon: Phone },
    RINGING: { label: 'Звонит', color: colors.warning, bg: colors.warningLight, icon: PhoneIncoming },
  }

  const status = statusConfig[call.status] || statusConfig.FAILED
  const StatusIcon = status.icon

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
      padding: spacing[4],
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borderRadius.lg,
      transition: transitions.base,
      cursor: 'pointer',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.accent
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: borderRadius.full,
        background: colors.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        flexShrink: 0,
      }}>
        {call.client?.fullName?.charAt(0) || '?'}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.textPrimary,
          marginBottom: spacing[1],
        }}>
          {call.client?.fullName || 'Неизвестный контакт'}
        </div>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
        }}>
          <span>
            {new Date(call.createdAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {call.duration && (
            <>
              <span>•</span>
              <span>{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</span>
            </>
          )}
          <span>•</span>
          <span>{call.operator?.fullName || 'Не назначен'}</span>
        </div>
      </div>

      {/* Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[2]} ${spacing[3]}`,
        borderRadius: borderRadius.md,
        background: status.bg,
        color: status.color,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
      }}>
        <StatusIcon size={16} />
        {status.label}
      </div>
    </div>
  )
}

export function CallsPage({ calls = [] }) {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCalls = useMemo(() => {
    let filtered = [...calls]

    // Фильтр по статусу
    if (filter === 'answered') {
      filtered = filtered.filter(c => c.status === 'FINISHED' || c.status === 'ANSWERED')
    } else if (filter === 'missed') {
      filtered = filtered.filter(c => c.status === 'FAILED')
    } else if (filter === 'active') {
      filtered = filtered.filter(c => c.status === 'RINGING' || c.status === 'ANSWERED')
    }

    // Поиск
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.client?.fullName?.toLowerCase().includes(q) ||
        c.operator?.fullName?.toLowerCase().includes(q)
      )
    }

    // Сортировка по дате (новые первые)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [calls, filter, searchQuery])

  const stats = useMemo(() => {
    return {
      all: calls.length,
      answered: calls.filter(c => c.status === 'FINISHED').length,
      missed: calls.filter(c => c.status === 'FAILED').length,
      active: calls.filter(c => c.status === 'RINGING' || c.status === 'ANSWERED').length,
    }
  }, [calls])

  const filters = [
    { id: 'all', label: 'Все', count: stats.all },
    { id: 'answered', label: 'Отвеченные', count: stats.answered },
    { id: 'missed', label: 'Пропущенные', count: stats.missed },
    { id: 'active', label: 'Активные', count: stats.active },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing[6],
      }}>
        <div>
          <h1 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing[2],
          }}>
            Звонки
          </h1>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            История всех звонков контакт-центра
          </p>
        </div>
        <button style={{
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
          <Plus size={18} />
          Новый звонок
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: spacing[2],
        marginBottom: spacing[6],
      }}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              background: filter === f.id ? colors.surfaceHover : colors.surface,
              border: `1px solid ${filter === f.id ? colors.accent : colors.border}`,
              borderRadius: borderRadius.md,
              color: filter === f.id ? colors.textPrimary : colors.textSecondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: transitions.fast,
            }}
            onMouseEnter={(e) => {
              if (filter !== f.id) {
                e.currentTarget.style.borderColor = colors.borderHover
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== f.id) {
                e.currentTarget.style.borderColor = colors.border
              }
            }}
          >
            {f.label} <span style={{ color: colors.textTertiary }}>({f.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{
        position: 'relative',
        marginBottom: spacing[6],
        maxWidth: '400px',
      }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: spacing[3],
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textTertiary,
          }}
        />
        <input
          type="text"
          placeholder="Поиск по имени..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: `${spacing[2]} ${spacing[3]} ${spacing[2]} ${spacing[10]}`,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.md,
            color: colors.textPrimary,
            fontSize: typography.fontSize.sm,
            outline: 'none',
            transition: transitions.fast,
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = colors.accent}
          onBlur={(e) => e.currentTarget.style.borderColor = colors.border}
        />
      </div>

      {/* Calls list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3],
      }}>
        {filteredCalls.length === 0 ? (
          <div style={{
            padding: spacing[12],
            textAlign: 'center',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.lg,
          }}>
            <Phone size={48} color={colors.textTertiary} style={{ marginBottom: spacing[4] }} />
            <div style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.medium,
              color: colors.textSecondary,
              marginBottom: spacing[2],
            }}>
              Пока нет звонков
            </div>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: colors.textTertiary,
            }}>
              {searchQuery || filter !== 'all' ? 'Попробуйте изменить фильтры' : 'Начните новый звонок используя кнопку выше'}
            </div>
          </div>
        ) : (
          filteredCalls.map(call => <CallItem key={call.id} call={call} />)
        )}
      </div>
    </div>
  )
}
