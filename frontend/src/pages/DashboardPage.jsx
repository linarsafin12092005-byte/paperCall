import { useMemo } from 'react'
import { ArrowRight, CalendarClock, CheckCircle2, Info, Phone, Users } from 'lucide-react'

const statusLabels = {
  PLANNED: 'Запланирован',
  COMPLETED: 'Завершён',
  FINISHED: 'Завершён',
  CANCELLED: 'Отменён',
}

export function DashboardPage({ calls = [], clients = [], telephonyStatus, errors = [], onViewAllCalls }) {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const workingCalls = useMemo(() => calls.filter((call) => !isNonProductionRecord(call)), [calls])
  const plannedToday = workingCalls.filter((call) => call.status === 'PLANNED' && isSameDay(call.plannedAt, today))
  const completedToday = workingCalls.filter((call) => ['COMPLETED', 'FINISHED'].includes(call.status) && isSameDay(call.completedAt || call.createdAt, today))
  const nextCall = workingCalls
    .filter((call) => call.status === 'PLANNED' && isFuture(call.plannedAt, now))
    .sort((a, b) => timestamp(a.plannedAt) - timestamp(b.plannedAt))[0]
  const recentCalls = workingCalls
    .filter((call) => !isPastPlanned(call, now))
    .sort((a, b) => timestamp(b.startedAt || b.plannedAt || b.createdAt) - timestamp(a.startedAt || a.plannedAt || a.createdAt))
    .slice(0, 3)

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Главная</h1>
          <p className="dashboard-subtitle">Краткий обзор звонков и контактов организации</p>
        </div>
        <button type="button" className="dashboard-header-action dashboard-create-action" onClick={onViewAllCalls}>Все звонки <ArrowRight size={16} /></button>
      </header>

      {errors.length > 0 && <div className="dashboard-error">{errors[0]}</div>}

      <section className="dashboard-stats" aria-label="Сводка">
        <StatCard label="Запланировано сегодня" value={plannedToday.length} icon={CalendarClock} tone="blue" />
        <StatCard label="Завершено сегодня" value={completedToday.length} icon={CheckCircle2} tone="green" />
        <StatCard label="Ближайший звонок" value={nextCall ? formatNextCall(nextCall.plannedAt) : null} icon={Phone} tone="violet" compactValue />
        <StatCard label="Внешних контактов" value={clients.length} icon={Users} tone="cyan" />
      </section>

      <section className="dashboard-panel" aria-labelledby="recent-calls-title">
        <div className="dashboard-panel-header">
          <div>
            <h2 id="recent-calls-title" className="dashboard-panel-title">Последние записи</h2>
            <p className="dashboard-panel-subtitle">Недавние запланированные и завершённые звонки</p>
          </div>
          <button type="button" className="dashboard-panel-link" onClick={onViewAllCalls}>Все звонки <ArrowRight size={15} /></button>
        </div>

        {recentCalls.length === 0 ? (
          <div className="dashboard-empty">
            <span className="dashboard-empty-icon"><Phone size={22} /></span>
            <strong>Пока нет рабочих записей звонков</strong>
            <span>Откройте журнал звонков, чтобы посмотреть и создать записи.</span>
            <button type="button" className="dashboard-empty-action" onClick={onViewAllCalls}>Открыть журнал <ArrowRight size={15} /></button>
          </div>
        ) : (
          <div className="dashboard-call-list">{recentCalls.map((call) => <RecentCall key={call.id} call={call} onOpenCalls={onViewAllCalls} />)}</div>
        )}
      </section>

      <div className="dashboard-notice"><Info size={16} /><span>{telephonyStatus?.connected
        ? 'Телефония подключена. В журнал поступают реальные SIP-звонки.'
        : telephonyStatus && typeof telephonyStatus.connected === 'boolean'
          ? 'Телефония не подключена. Доступен режим планирования звонков.'
          : 'Статус телефонии временно недоступен'}</span></div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, tone, compactValue = false }) {
  return <article className={`dashboard-stat-card dashboard-stat-${tone}`}>
    <div className="dashboard-stat-top"><span className="dashboard-stat-label">{label}</span><span className="dashboard-stat-icon" title={label}><Icon size={18} /></span></div>
    {compactValue ? (
      value ? <div className="dashboard-next-value"><strong>{value.time}</strong><span>{value.date}</span></div> : <strong className="dashboard-stat-empty-value">Нет будущих звонков</strong>
    ) : <strong className={`dashboard-stat-value${compactValue ? ' dashboard-stat-value-compact' : ''}`}>{value}</strong>}
  </article>
}

function RecentCall({ call, onOpenCalls }) {
  const recipient = call.recipientName || call.clientName || 'Получатель'
  const status = statusLabels[call.status] || 'В журнале'
  const type = call.callType === 'INTERNAL' ? 'Внутренний' : 'Внешний'
  const openCalls = () => onOpenCalls?.()
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openCalls()
    }
  }
  return <article className="dashboard-call-row" role="button" tabIndex="0" onClick={openCalls} onKeyDown={handleKeyDown} title="Открыть журнал звонков"><div className="dashboard-call-avatar"><Phone size={18} /></div><div className="dashboard-call-main"><strong className="dashboard-call-name" title={recipient}>{recipient}</strong><span className="dashboard-call-meta">{type} · {status}</span></div><time className="dashboard-call-date" dateTime={call.startedAt || call.plannedAt || call.createdAt}>{formatDate(call.startedAt || call.plannedAt || call.createdAt)}</time></article>
}

function formatDate(value) {
  if (!value) return 'Нет'
  return new Date(value).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatNextCall(value) {
  if (!value) return null
  const date = new Date(value)
  return {
    date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' }),
    time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  }
}

function isNonProductionRecord(call) {
  return call.legacyDemo === true
    || call.status === 'LEGACY'
    || call.legacy === true
    || call.nonProduction === true
    || call.serviceRecord === true
}

function timestamp(value) {
  const parsed = value ? Date.parse(value) : Number.NaN
  return Number.isNaN(parsed) ? 0 : parsed
}

function isFuture(value, now) {
  return timestamp(value) > now.getTime()
}

function isSameDay(value, day) {
  const parsed = timestamp(value)
  if (!parsed) return false
  const date = new Date(parsed)
  return date.getFullYear() === day.getFullYear()
    && date.getMonth() === day.getMonth()
    && date.getDate() === day.getDate()
}

function isPastPlanned(call, now) {
  return call.status === 'PLANNED' && timestamp(call.plannedAt) <= now.getTime()
}
