import { useMemo } from 'react'
import { CalendarClock, Phone, Users } from 'lucide-react'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'

export function DashboardPage({ calls = [], clients = [] }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const regularCalls = calls.filter((call) => !call.legacyDemo)
  const plannedToday = regularCalls.filter((call) => call.status === 'PLANNED' && new Date(call.plannedAt || call.createdAt) >= today)
  const completedToday = regularCalls.filter((call) => ['COMPLETED', 'FINISHED'].includes(call.status) && new Date(call.createdAt) >= today)
  const nextCall = useMemo(() => regularCalls.filter((call) => call.status === 'PLANNED').sort((a, b) => new Date(a.plannedAt) - new Date(b.plannedAt))[0], [regularCalls])
  const recent = regularCalls.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  return <div>
    <header style={{ marginBottom: spacing[6] }}><h1 style={title}>Главная</h1><p style={subtitle}>Обзор звонков и задач организации</p></header>
    <div style={stats}><Stat label="Запланировано сегодня" value={plannedToday.length} icon={CalendarClock} /><Stat label="Завершено сегодня" value={completedToday.length} icon={Phone} /><Stat label="Ближайший звонок" value={nextCall ? new Date(nextCall.plannedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Нет'} icon={CalendarClock} /><Stat label="Внешних контактов" value={clients.length} icon={Users} /></div>
    <section style={panel}><h2 style={sectionTitle}>Последние звонки</h2><p style={subtitle}>Только новые записи журнала</p>{recent.length === 0 ? <div style={empty}><Phone size={34} color={colors.textTertiary} /><strong>Пока нет звонков</strong><span>Создайте первую запланированную запись.</span></div> : recent.map((call) => <div key={call.id} style={row}><div style={avatar}>{(call.recipientName || call.clientName || '?').charAt(0).toUpperCase()}</div><div style={{ flex: 1 }}><strong style={{ color: colors.textPrimary }}>{call.recipientName || call.clientName || 'Получатель'}</strong><div style={muted}>{call.callType === 'INTERNAL' ? 'Внутренний' : 'Внешний'} · {call.status === 'PLANNED' ? 'Запланирован' : call.status === 'COMPLETED' ? 'Завершён' : 'В журнале'}</div></div><div style={muted}>{new Date(call.plannedAt || call.createdAt).toLocaleString('ru-RU')}</div></div>)}</section>
    <div style={hint}>Телефония пока не подключена. Здесь отображаются планируемые записи и история.</div>
  </div>
}
function Stat({ label, value, icon: Icon }) { return <div style={stat}><div style={statTop}><span>{label}</span><Icon size={17} color={colors.textTertiary} /></div><strong>{value}</strong></div> }
const title = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize['2xl'] }
const subtitle = { margin: `${spacing[2]} 0 ${spacing[4]}`, color: colors.textSecondary, fontSize: typography.fontSize.sm }
const stats = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: spacing[3], marginBottom: spacing[6] }
const stat = { padding: spacing[5], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const statTop = { display: 'flex', justifyContent: 'space-between', gap: spacing[2], color: colors.textSecondary, fontSize: typography.fontSize.sm }
const panel = { padding: spacing[6], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const sectionTitle = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize.lg }
const row = { display: 'flex', alignItems: 'center', gap: spacing[3], padding: `${spacing[3]} 0`, borderBottom: `1px solid ${colors.border}` }
const avatar = { width: '36px', height: '36px', display: 'grid', placeItems: 'center', borderRadius: borderRadius.full, background: colors.accent, color: colors.textPrimary }
const muted = { color: colors.textSecondary, fontSize: typography.fontSize.sm }
const empty = { display: 'grid', justifyItems: 'center', gap: spacing[2], padding: spacing[8], color: colors.textSecondary }
const hint = { marginTop: spacing[4], padding: spacing[3], background: colors.warningLight, borderRadius: borderRadius.md, color: colors.warning, fontSize: typography.fontSize.sm }
