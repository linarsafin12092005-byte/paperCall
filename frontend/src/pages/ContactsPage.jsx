import { useState, useMemo } from 'react'
import { colors, spacing, borderRadius, typography, transitions } from '../design-system/tokens'
import { User, Phone, Mail, Plus, Search } from 'lucide-react'

function ContactCard({ contact, type }) {
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
        width: '56px',
        height: '56px',
        borderRadius: borderRadius.full,
        background: type === 'operator' ? colors.success : colors.accent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textPrimary,
        flexShrink: 0,
      }}>
        {contact.fullName?.charAt(0) || '?'}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.semibold,
          color: colors.textPrimary,
          marginBottom: spacing[1],
        }}>
          {contact.fullName || 'Без имени'}
        </div>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
        }}>
          <Mail size={14} />
          {contact.email || 'Нет email'}
        </div>
        {contact.sipExtension && (
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginTop: spacing[1],
          }}>
            <Phone size={14} />
            {contact.sipExtension}
          </div>
        )}
      </div>

      {/* Type badge */}
      <div style={{
        padding: `${spacing[1]} ${spacing[3]}`,
        borderRadius: borderRadius.md,
        background: type === 'operator' ? colors.successLight : colors.accentLight,
        color: type === 'operator' ? colors.success : colors.accent,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textTransform: 'uppercase',
      }}>
        {type === 'operator' ? 'Оператор' : 'Клиент'}
      </div>
    </div>
  )
}

export function ContactsPage({ clients = [], operators = [] }) {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const allContacts = useMemo(() => {
    const combined = [
      ...operators.map(o => ({ ...o, type: 'operator' })),
      ...clients.map(c => ({ ...c, type: 'client' })),
    ]

    let filtered = combined

    if (filter === 'operators') {
      filtered = filtered.filter(c => c.type === 'operator')
    } else if (filter === 'clients') {
      filtered = filtered.filter(c => c.type === 'client')
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.sipExtension?.includes(q)
      )
    }

    return filtered.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
  }, [clients, operators, filter, searchQuery])

  const stats = {
    all: clients.length + operators.length,
    operators: operators.length,
    clients: clients.length,
  }

  const filters = [
    { id: 'all', label: 'Все', count: stats.all },
    { id: 'operators', label: 'Операторы', count: stats.operators },
    { id: 'clients', label: 'Клиенты', count: stats.clients },
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
            Контакты
          </h1>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
          }}>
            Операторы и клиенты контакт-центра
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
          Добавить контакт
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
          placeholder="Поиск по имени, email..."
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

      {/* Contacts grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: spacing[4],
      }}>
        {allContacts.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: spacing[12],
            textAlign: 'center',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: borderRadius.lg,
          }}>
            <User size={48} color={colors.textTertiary} style={{ marginBottom: spacing[4] }} />
            <div style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.medium,
              color: colors.textSecondary,
              marginBottom: spacing[2],
            }}>
              Контакты не найдены
            </div>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: colors.textTertiary,
            }}>
              {searchQuery || filter !== 'all' ? 'Попробуйте изменить фильтры' : 'Добавьте первый контакт'}
            </div>
          </div>
        ) : (
          allContacts.map(contact => (
            <ContactCard key={`${contact.type}-${contact.id}`} contact={contact} type={contact.type} />
          ))
        )}
      </div>
    </div>
  )
}
