import { useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Phone, Plus, Search, XCircle } from 'lucide-react'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'
import { CreateCallModal } from '../components/CreateCallModal'

const statusLabels = {
  PLANNED: 'Запланирован',
  INITIATED: 'Подготовка звонка',
  RINGING: 'Выполняется вызов',
  ANSWERED: 'Принят',
  COMPLETED: 'Завершён',
  FINISHED: 'Завершён',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменён',
  LEGACY: 'Архивная тестовая запись',
}

export function CallsPage({ calls = [], clients = [], user, onCallCreated }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const filtered = useMemo(() => calls.filter((call) => {
    const haystack = [call.initiatorName, call.recipientName, call.clientName, call.clientPhone, call.topic, call.note].join(' ').toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const isArchive = call.legacyDemo || call.status === 'LEGACY'
    const matchesArchiveAccess = !isArchive || filter === 'legacy'
    const matchesFilter = matchesArchiveAccess && (filter === 'all' || (filter === 'legacy' ? isArchive : filter === 'planned' ? ['PLANNED', 'INITIATED'].includes(call.status) : filter === 'completed' ? ['COMPLETED', 'FINISHED'].includes(call.status) : true))
    return matchesQuery && matchesFilter
  }), [calls, query, filter])

  const updateStatus = async (call, status) => {
    const response = await fetch(`/api/calls/${call.id}/status?status=${status}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    if (response.ok) onCallCreated?.()
  }

  return <section>
    <header style={headerStyle}><div><h1 style={titleStyle}>Звонки</h1><p style={subtitleStyle}>Планирование и журнал внутренних и внешних звонков</p></div><button type="button" style={primary} onClick={() => setCreateOpen(true)}><Plus size={17} /> Создать запись</button></header>
    <div style={infoStyle}>Телефония Asterisk ещё не подключена. Новые записи создаются как «Запланирован» и не имитируют дозвон.</div>
    <div style={toolbar}><div style={searchWrap}><Search size={17} color={colors.textTertiary} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по участникам, теме или заметке" style={searchInput} /></div><div style={filters}>{[['all', 'Все'], ['planned', 'Планируемые'], ['completed', 'Завершённые'], ...(['ADMIN', 'SUPER_ADMIN'].includes(user?.role) ? [['legacy', 'Архивные записи']] : [])].map(([id, label]) => <button key={id} type="button" onClick={() => setFilter(id)} style={filter === id ? activeFilter : filterStyle}>{label}</button>)}</div></div>
    {filtered.length === 0 ? <div style={empty}><CalendarClock size={36} color={colors.textTertiary} /><h2>Записей звонков нет</h2><p>Создайте планируемую запись с конкретным сотрудником или внешним контактом.</p></div> : <div style={list}>{filtered.map((call) => <CallRow key={call.id} call={call} onStatus={updateStatus} />)}</div>}
    {createOpen && <CreateCallModal clients={clients} currentUser={user} onClose={() => setCreateOpen(false)} onCreated={onCallCreated} />}
  </section>
}

function CallRow({ call, onStatus }) {
  const status = statusLabels[call.status] || 'Статус не указан'
  const recipient = call.recipientName || call.clientName || 'Получатель не указан'
  const number = call.recipientNumber || call.clientPhone || '—'
  const callType = call.callType === 'INTERNAL' ? 'Внутренний' : call.callType === 'EXTERNAL' ? 'Внешний' : 'Архивная запись'
  return <article style={row}><div style={callIcon}><Phone size={18} /></div><div style={main}><div style={rowTop}><strong style={name}>{recipient}</strong><span style={statusBadge(call.status)}>{status}</span></div><div style={details}><span>Инициатор: {call.initiatorName || 'Историческая запись'}</span><span>Тип: {callType}</span><span>Номер: {number}</span></div>{call.topic && <div style={muted}>Причина: {call.topic}</div>}{call.note && <div style={muted}>Заметка: {call.note}</div>}<div style={muted}>{new Date(call.plannedAt || call.createdAt).toLocaleString('ru-RU')}</div>{!call.legacyDemo && call.status === 'PLANNED' && <div style={rowActions}><button type="button" style={actionButton} onClick={() => onStatus(call, 'COMPLETED')}>Отметить завершённым</button><button type="button" style={cancelButton} onClick={() => onStatus(call, 'CANCELLED')}>Отменить</button></div>}</div>{call.legacyDemo ? <span style={legacyBadge}>Архив</span> : call.status === 'COMPLETED' ? <CheckCircle2 color={colors.success} size={18} /> : call.status === 'CANCELLED' ? <XCircle color={colors.danger} size={18} /> : null}</article>
}

const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[4], marginBottom: spacing[5], flexWrap: 'wrap' }
const titleStyle = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize['2xl'] }
const subtitleStyle = { margin: `${spacing[2]} 0 0`, color: colors.textSecondary }
const primary = { display: 'inline-flex', alignItems: 'center', gap: spacing[2], padding: `${spacing[2]} ${spacing[3]}`, background: colors.accent, border: 'none', borderRadius: borderRadius.md, color: colors.textPrimary, cursor: 'pointer' }
const infoStyle = { marginBottom: spacing[4], padding: spacing[3], background: colors.warningLight, borderRadius: borderRadius.md, color: colors.warning, fontSize: typography.fontSize.sm }
const toolbar = { display: 'flex', gap: spacing[3], alignItems: 'center', flexWrap: 'wrap', marginBottom: spacing[5] }
const searchWrap = { display: 'flex', alignItems: 'center', gap: spacing[2], flex: '1 1 320px', padding: `${spacing[2]} ${spacing[3]}`, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.md }
const searchInput = { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: colors.textPrimary, font: 'inherit' }
const filters = { display: 'flex', gap: spacing[2], flexWrap: 'wrap' }
const filterStyle = { padding: `${spacing[2]} ${spacing[3]}`, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary, cursor: 'pointer' }
const activeFilter = { ...filterStyle, borderColor: colors.accent, color: colors.textPrimary, background: colors.accentLight }
const list = { display: 'grid', gap: spacing[3] }
const row = { display: 'flex', alignItems: 'flex-start', gap: spacing[3], padding: spacing[4], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const callIcon = { width: '36px', height: '36px', display: 'grid', placeItems: 'center', borderRadius: borderRadius.full, background: colors.accentLight, color: colors.accent, flexShrink: 0 }
const main = { flex: 1, minWidth: 0 }
const rowTop = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], flexWrap: 'wrap' }
const name = { color: colors.textPrimary }
const details = { display: 'flex', gap: spacing[3], flexWrap: 'wrap', marginTop: spacing[2], color: colors.textSecondary, fontSize: typography.fontSize.sm }
const muted = { marginTop: spacing[2], color: colors.textTertiary, fontSize: typography.fontSize.sm }
const statusBadge = (status) => ({ padding: `${spacing[1]} ${spacing[2]}`, borderRadius: borderRadius.md, background: ['COMPLETED', 'FINISHED'].includes(status) ? colors.successLight : status === 'FAILED' ? colors.dangerLight : colors.warningLight, color: ['COMPLETED', 'FINISHED'].includes(status) ? colors.success : status === 'FAILED' ? colors.danger : colors.warning, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold })
const legacyBadge = { color: colors.textTertiary, fontSize: typography.fontSize.xs }
const empty = { padding: spacing[8], textAlign: 'center', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg, color: colors.textSecondary }
const rowActions = { display: 'flex', gap: spacing[2], marginTop: spacing[3] }
const actionButton = { padding: `${spacing[1]} ${spacing[2]}`, background: colors.successLight, border: `1px solid ${colors.success}`, borderRadius: borderRadius.md, color: colors.success, cursor: 'pointer', fontSize: typography.fontSize.xs }
const cancelButton = { ...actionButton, background: colors.dangerLight, borderColor: colors.danger, color: colors.danger }
