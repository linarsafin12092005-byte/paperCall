import { useMemo, useState } from 'react'
import { Archive, Edit3, Mail, Phone, Plus, Search } from 'lucide-react'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'
import { CreateClientModal } from '../components/CreateClientModal'

export function ContactsPage({ clients = [], user, apiError, onClientCreated }) {
  const [query, setQuery] = useState('')
  const [modalClient, setModalClient] = useState(undefined)
  const [error, setError] = useState('')
  const visible = useMemo(() => clients.filter((client) => [client.fullName, client.phoneNumber, client.email, client.organization].join(' ').toLowerCase().includes(query.toLowerCase())), [clients, query])
  const archive = async (client) => {
    const response = await fetch(`/api/clients/${client.id}/archive`, { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    if (!response.ok) setError('Не удалось архивировать контакт')
    else onClientCreated?.()
  }
  return <section className="contacts-page">
    <header className="office-header" style={headerStyle}><div><h1 style={titleStyle}>Внешние контакты</h1><p style={subtitleStyle}>Клиенты, поставщики и партнёры без аккаунта paperCall</p></div><button type="button" style={primary} onClick={() => setModalClient(null)}><Plus size={17} /> Добавить контакт</button></header>
    <div style={infoStyle}>Внешние контакты не могут войти в систему. Сотрудники используют их для телефонной книги и журнала общения.</div>
    {(error || apiError) && <div style={errorStyle}>{error || apiError}</div>}
    <div className="office-search" style={searchWrap}><Search size={17} color={colors.textTertiary} title="Поиск" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по имени, телефону, email, организации" style={searchInput} /></div>
    {visible.length === 0 ? <div style={empty}><Phone size={36} color={colors.textTertiary} title="Нет контактов" /><h2>Внешних контактов нет</h2><p>Добавьте клиента, поставщика или партнёра, чтобы связывать с ним звонки.</p></div> : <div className="office-contact-grid" style={grid}>{visible.map((client) => <article key={client.id} className="office-contact-card" style={card}><div style={avatar} title={client.fullName || 'Контакт'}>{client.fullName?.charAt(0)?.toUpperCase() || '?'}</div><div style={{ flex: 1, minWidth: 0 }}><h3 className="office-truncate" style={name} title={client.fullName}>{client.fullName}</h3><div className="office-truncate" style={line} title={client.phoneNumber}><Phone size={14} title="Телефон" />{client.phoneNumber}</div>{client.email && <div className="office-truncate" style={line} title={client.email}><Mail size={14} title="Email" />{client.email}</div>}{client.organization && <div className="office-truncate" style={meta} title={client.organization}>{client.organization}</div>}{client.note && <div className="office-truncate" style={meta} title={client.note}>{client.note}</div>}</div>{(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && <div style={actions}><button type="button" title="Изменить контакт" aria-label="Изменить контакт" style={iconButton} onClick={() => setModalClient(client)}><Edit3 size={16} /></button><button type="button" title="Архивировать контакт" aria-label="Архивировать контакт" style={iconButton} onClick={() => archive(client)}><Archive size={16} /></button></div>}</article>)}</div>}
    {modalClient !== undefined && <CreateClientModal client={modalClient} onClose={() => setModalClient(undefined)} onCreated={onClientCreated} />}
  </section>
}

const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[4], marginBottom: spacing[5], flexWrap: 'wrap' }
const titleStyle = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize['2xl'] }
const subtitleStyle = { margin: `${spacing[2]} 0 0`, color: colors.textSecondary }
const primary = { display: 'inline-flex', alignItems: 'center', gap: spacing[2], padding: `${spacing[2]} ${spacing[3]}`, background: colors.accent, border: 'none', borderRadius: borderRadius.md, color: colors.textPrimary, cursor: 'pointer' }
const infoStyle = { marginBottom: spacing[4], padding: spacing[3], background: colors.accentLight, border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary }
const searchWrap = { display: 'flex', alignItems: 'center', gap: spacing[2], maxWidth: '620px', marginBottom: spacing[5], padding: `${spacing[2]} ${spacing[3]}`, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.md }
const searchInput = { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: colors.textPrimary, font: 'inherit' }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: spacing[3] }
const card = { display: 'flex', alignItems: 'flex-start', gap: spacing[3], padding: spacing[4], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const avatar = { width: '42px', height: '42px', flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: borderRadius.full, background: colors.accent, color: colors.textPrimary, fontWeight: typography.fontWeight.semibold }
const name = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize.base }
const line = { display: 'flex', alignItems: 'center', gap: spacing[2], marginTop: spacing[2], color: colors.textSecondary, fontSize: typography.fontSize.sm }
const meta = { marginTop: spacing[2], color: colors.textTertiary, fontSize: typography.fontSize.sm }
const actions = { display: 'flex', gap: spacing[2] }
const iconButton = { width: '32px', height: '32px', display: 'grid', placeItems: 'center', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary, cursor: 'pointer' }
const empty = { padding: spacing[8], textAlign: 'center', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg, color: colors.textSecondary }
const errorStyle = { marginBottom: spacing[4], padding: spacing[3], background: colors.dangerLight, border: `1px solid ${colors.danger}`, borderRadius: borderRadius.md, color: colors.danger }
