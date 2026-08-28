import { useState, useEffect, useCallback, useMemo } from 'react'
import { Users, Phone, UserCircle, Activity, Mail, Clock, Zap, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const operatorStatusStyles = {
  OFFLINE: 'bg-gray-500/15 text-gray-300 ring-gray-500/30',
  AVAILABLE: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  BUSY: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  ON_CALL: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
}
const callStatusStyles = {
  RINGING: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  ANSWERED: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  FINISHED: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  FAILED: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
}
const CHART_COLORS = { OFFLINE: '#6b7280', AVAILABLE: '#10b981', BUSY: '#f59e0b', ON_CALL: '#f43f5e', RINGING: '#38bdf8', ANSWERED: '#f59e0b', FINISHED: '#10b981', FAILED: '#f43f5e' }
const AVATAR_GRADIENTS = ['from-indigo-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-sky-500 to-blue-500', 'from-rose-500 to-pink-500', 'from-violet-500 to-fuchsia-500']

function avatarGradient(seed) {
  const idx = (seed?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[idx]
}

function Badge({ text, styles }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${styles[text] || 'bg-gray-500/15 text-gray-300 ring-gray-500/30'}`}>
      {text}
    </span>
  )
}

function LivePulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  )
}

function StatCard({ icon: Icon, label, value, gradient, sub }) {
  return (
    <div className="relative overflow-hidden bg-slate-900/70 border border-slate-800 rounded-2xl p-5 group hover:border-slate-700 transition-colors">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-100 tabular-nums">{value}</div>
          <div className="text-sm text-slate-400">{label}</div>
        </div>
      </div>
      {sub && <div className="relative mt-3 text-xs text-slate-500">{sub}</div>}
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function useApi(path) {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    fetch(path)
      .then((res) => { if (!res.ok) throw new Error('fail'); return res.json() })
      .then((json) => { setData(json); setError(null) })
      .catch(() => setError(`Не удалось загрузить: ${path}`))
      .finally(() => setLoading(false))
  }, [path])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 5000)
    return () => clearInterval(id)
  }, [fetchData])

  return { data, error, loading }
}

function EmptyState({ text }) {
  return <div className="text-slate-500 text-center py-16 text-sm">{text}</div>
}
function ErrorBanner({ text }) {
  return <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">{text}</div>
}

function distribution(items, key) {
  const counts = {}
  items.forEach((it) => { counts[it[key]] = (counts[it[key]] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4 text-slate-300">
        <Icon size={16} />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 shadow-xl">
      {payload[0].name}: <span className="font-semibold">{payload[0].value}</span>
    </div>
  )
}

function OverviewTab({ operators, clients, calls }) {
  const activeCalls = calls.filter((c) => c.status === 'RINGING' || c.status === 'ANSWERED').length
  const availableOps = operators.filter((o) => o.status === 'AVAILABLE').length
  const finished = calls.filter((c) => c.status === 'FINISHED').length

  const opDist = useMemo(() => distribution(operators, 'status'), [operators])
  const callDist = useMemo(() => distribution(calls, 'status'), [calls])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Операторов всего" value={operators.length} gradient="from-indigo-500 to-purple-500" />
        <StatCard icon={Zap} label="Доступны сейчас" value={availableOps} gradient="from-emerald-500 to-teal-500" />
        <StatCard icon={UserCircle} label="Клиентов" value={clients.length} gradient="from-sky-500 to-blue-500" />
        <StatCard icon={Phone} label="Активных звонков" value={activeCalls} gradient="from-amber-500 to-orange-500" sub={`${finished} завершено всего`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <ChartCard title="Статусы операторов" icon={Users}>
          {opDist.length === 0 ? <EmptyState text="Нет данных" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={opDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {opDist.map((entry, i) => <Cell key={i} fill={CHART_COLORS[entry.name] || '#64748b'} stroke="none" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {opDist.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[d.name] || '#64748b' }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Звонки по статусу" icon={TrendingUp}>
          {callDist.length === 0 ? <EmptyState text="Нет данных" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={callDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {callDist.map((entry, i) => <Cell key={i} fill={CHART_COLORS[entry.name] || '#64748b'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </>
  )
}

function OperatorsTab() {
  const { data, error, loading } = useApi('/api/operators')
  if (loading) return <EmptyState text="Загрузка..." />
  return (
    <>
      {error && <ErrorBanner text={error} />}
      <div className="grid gap-3">
        {data.map((op) => (
          <div key={op.id} className="flex items-center justify-between bg-slate-900/70 rounded-xl px-5 py-4 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(op.fullName)} flex items-center justify-center text-white font-semibold shadow-md`}>
                {op.fullName?.[0] ?? '?'}
              </div>
              <div>
                <div className="font-medium text-slate-100">{op.fullName}</div>
                <div className="text-sm text-slate-400 flex items-center gap-1"><Mail size={13} /> {op.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {op.status === 'AVAILABLE' && <LivePulse />}
              <Badge text={op.status} styles={operatorStatusStyles} />
            </div>
          </div>
        ))}
        {data.length === 0 && !error && <EmptyState text="Операторов пока нет" />}
      </div>
    </>
  )
}

function ClientsTab() {
  const { data, error, loading } = useApi('/api/clients')
  if (loading) return <EmptyState text="Загрузка..." />
  return (
    <>
      {error && <ErrorBanner text={error} />}
      <div className="grid gap-3">
        {data.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-slate-900/70 rounded-xl px-5 py-4 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(c.fullName)} flex items-center justify-center text-white shadow-md`}>
                <UserCircle size={20} />
              </div>
              <div>
                <div className="font-medium text-slate-100">{c.fullName}</div>
                <div className="text-sm text-slate-400">{c.phoneNumber}</div>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">ID {c.id}</span>
          </div>
        ))}
        {data.length === 0 && !error && <EmptyState text="Клиентов пока нет" />}
      </div>
    </>
  )
}

function CallsTab() {
  const { data, error, loading } = useApi('/api/calls')
  if (loading) return <EmptyState text="Загрузка..." />
  const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return (
    <>
      {error && <ErrorBanner text={error} />}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-800 bg-slate-900/50">
              <th className="px-5 py-3 font-medium">Клиент</th>
              <th className="px-5 py-3 font-medium">Оператор</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">Создан</th>
              <th className="px-5 py-3 font-medium">Завершён</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((call) => (
              <tr key={call.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors">
                <td className="px-5 py-3 text-slate-100 font-medium">{call.client?.fullName ?? '—'}</td>
                <td className="px-5 py-3 text-slate-300">{call.operator?.fullName ?? '—'}</td>
                <td className="px-5 py-3"><Badge text={call.status} styles={callStatusStyles} /></td>
                <td className="px-5 py-3 text-slate-400"><span className="flex items-center gap-1"><Clock size={13} />{formatTime(call.createdAt)}</span></td>
                <td className="px-5 py-3 text-slate-400">{formatTime(call.finishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && !error && <EmptyState text="Звонков пока нет" />}
      </div>
    </>
  )
}

const tabs = [
  { id: 'overview', label: 'Обзор', icon: Activity },
  { id: 'operators', label: 'Операторы', icon: Users },
  { id: 'clients', label: 'Клиенты', icon: UserCircle },
  { id: 'calls', label: 'Звонки', icon: Phone },
]

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const { data: operators } = useApi('/api/operators')
  const { data: clients } = useApi('/api/clients')
  const { data: calls } = useApi('/api/calls')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Phone size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">CallFlow</h1>
              <p className="text-xs text-slate-500">Панель контакт-центра</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1.5">
            <LivePulse />
            live · обновление 5с
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 border border-slate-800 bg-slate-900/50 rounded-xl p-1 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300 shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'overview' && <OverviewTab operators={operators} clients={clients} calls={calls} />}
        {activeTab === 'operators' && <OperatorsTab />}
        {activeTab === 'clients' && <ClientsTab />}
        {activeTab === 'calls' && <CallsTab />}
      </main>
    </div>
  )
}

export default App