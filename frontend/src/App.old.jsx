import Background from './Background'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Users, Phone, UserCircle, Activity, Mail, Clock, Zap, TrendingUp, Bell, Plus, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useWebSocket } from './useWebSocket'
import { Modal } from './components/Modal'
import { SearchInput } from './components/SearchInput'
import { CreateClientForm } from './components/CreateClientForm'
import { CreateCallForm } from './components/CreateCallForm'

const operatorStatusStyles = {
  OFFLINE: 'bg-zinc-800/50 text-zinc-400 ring-zinc-700/50',
  AVAILABLE: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/40',
  BUSY: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/40',
  ON_CALL: 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/40',
}
const callStatusStyles = {
  RINGING: 'bg-cyan-500/20 text-cyan-400 ring-cyan-500/40',
  ANSWERED: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/40',
  FINISHED: 'bg-green-500/20 text-green-400 ring-green-500/40',
  FAILED: 'bg-red-500/20 text-red-400 ring-red-500/40',
}
const CHART_COLORS = { OFFLINE: '#52525b', AVAILABLE: '#10b981', BUSY: '#eab308', ON_CALL: '#34d399', RINGING: '#06b6d4', ANSWERED: '#10b981', FINISHED: '#22c55e', FAILED: '#ef4444' }
const AVATAR_GRADIENTS = ['from-emerald-500 to-green-600', 'from-green-500 to-emerald-600', 'from-teal-500 to-cyan-600', 'from-lime-500 to-green-600', 'from-emerald-400 to-teal-600']

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
    <div className="relative overflow-hidden bg-black/60 border border-emerald-500/20 rounded-lg p-5 group hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg shadow-emerald-500/20`}>
          <Icon size={20} className="text-black" />
        </div>
        <div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums">{value}</div>
          <div className="text-sm text-emerald-500/70">{label}</div>
        </div>
      </div>
      {sub && <div className="relative mt-3 text-xs text-zinc-500">{sub}</div>}
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function useApi(path, wsEnabled = false) {
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
    // Если WebSocket включен, polling реже (30 сек), иначе каждые 5 сек
    const interval = wsEnabled ? 30000 : 5000
    const id = setInterval(fetchData, interval)
    return () => clearInterval(id)
  }, [fetchData, wsEnabled])

  return { data, error, loading, refetch: fetchData, setData }
}

function EmptyState({ text }) {
  return <div className="text-zinc-600 text-center py-16 text-sm">{text}</div>
}
function ErrorBanner({ text }) {
  return <div className="bg-red-950/50 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{text}</div>
}

function distribution(items, key) {
  const counts = {}
  items.forEach((it) => { counts[it[key]] = (counts[it[key]] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-black/60 border border-emerald-500/20 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4 text-emerald-400">
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
    <div className="bg-black border border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-emerald-400 shadow-xl">
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
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const q = searchQuery.toLowerCase()
    return data.filter(op =>
      op.fullName?.toLowerCase().includes(q) ||
      op.email?.toLowerCase().includes(q)
    )
  }, [data, searchQuery])

  if (loading) return <EmptyState text="Загрузка..." />

  return (
    <>
      {error && <ErrorBanner text={error} />}
      <div className="mb-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск по имени или email..."
        />
      </div>
      <div className="grid gap-3">
        {filteredData.map((op) => (
          <div key={op.id} className="flex items-center justify-between bg-black/60 rounded-lg px-5 py-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(op.fullName)} flex items-center justify-center text-black font-semibold shadow-md`}>
                {op.fullName?.[0] ?? '?'}
              </div>
              <div>
                <div className="font-medium text-emerald-400">{op.fullName}</div>
                <div className="text-sm text-emerald-500/60 flex items-center gap-1"><Mail size={13} /> {op.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {op.status === 'AVAILABLE' && <LivePulse />}
              <Badge text={op.status} styles={operatorStatusStyles} />
            </div>
          </div>
        ))}
        {filteredData.length === 0 && !error && (
          <EmptyState text={searchQuery ? 'Ничего не найдено' : 'Операторов пока нет'} />
        )}
      </div>
    </>
  )
}

function ClientsTab() {
  const { data, error, loading, refetch } = useApi('/api/clients', true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const q = searchQuery.toLowerCase()
    return data.filter(c =>
      c.fullName?.toLowerCase().includes(q) ||
      c.phoneNumber?.includes(q)
    )
  }, [data, searchQuery])

  const handleCreateSuccess = (newClient) => {
    setShowCreateModal(false)
    refetch()
  }

  if (loading) return <EmptyState text="Загрузка..." />

  return (
    <>
      {error && <ErrorBanner text={error} />}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск по имени или телефону..."
          />
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} />
          Добавить клиента
        </button>
      </div>

      <div className="grid gap-3">
        {filteredData.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-black/60 rounded-lg px-5 py-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(c.fullName)} flex items-center justify-center text-black shadow-md`}>
                <UserCircle size={20} />
              </div>
              <div>
                <div className="font-medium text-emerald-400">{c.fullName}</div>
                <div className="text-sm text-emerald-500/60">{c.phoneNumber}</div>
              </div>
            </div>
            <span className="text-xs text-zinc-600 font-mono">ID {c.id}</span>
          </div>
        ))}
        {filteredData.length === 0 && !error && (
          <EmptyState text={searchQuery ? 'Ничего не найдено' : 'Клиентов пока нет'} />
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать нового клиента"
      >
        <CreateClientForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </>
  )
}

function CallsTab() {
  const { data, error, loading, refetch } = useApi('/api/calls', true)
  const { data: clients } = useApi('/api/clients', true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredData = useMemo(() => {
    const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (statusFilter === 'ALL') return sorted
    return sorted.filter(call => call.status === statusFilter)
  }, [data, statusFilter])

  const handleCreateSuccess = (newCall) => {
    setShowCreateModal(false)
    refetch()
  }

  if (loading) return <EmptyState text="Загрузка..." />

  const statusOptions = ['ALL', 'RINGING', 'ANSWERED', 'FINISHED', 'FAILED']

  return (
    <>
      {error && <ErrorBanner text={error} />}
      <div className="flex gap-3 mb-4">
        <div className="flex gap-2 flex-1">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-500'
              }`}
            >
              {status === 'ALL' ? 'Все' : status}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} />
          Создать звонок
        </button>
      </div>

      <div className="bg-black/60 border border-emerald-500/20 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-emerald-500/70 border-b border-emerald-500/20 bg-black/40">
              <th className="px-5 py-3 font-medium">Клиент</th>
              <th className="px-5 py-3 font-medium">Оператор</th>
              <th className="px-5 py-3 font-medium">Статус</th>
              <th className="px-5 py-3 font-medium">Создан</th>
              <th className="px-5 py-3 font-medium">Завершён</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((call) => (
              <tr key={call.id} className="border-b border-emerald-500/10 last:border-0 hover:bg-emerald-500/5 transition-colors">
                <td className="px-5 py-3 text-emerald-400 font-medium">{call.client?.fullName ?? '—'}</td>
                <td className="px-5 py-3 text-emerald-500/70">{call.operator?.fullName ?? '—'}</td>
                <td className="px-5 py-3"><Badge text={call.status} styles={callStatusStyles} /></td>
                <td className="px-5 py-3 text-emerald-500/60"><span className="flex items-center gap-1"><Clock size={13} />{formatTime(call.createdAt)}</span></td>
                <td className="px-5 py-3 text-emerald-500/60">{formatTime(call.finishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && !error && <EmptyState text="Звонков пока нет" />}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать новый звонок"
      >
        <CreateCallForm
          clients={clients}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
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
  const [wsConnected, setWsConnected] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const { data: operators, refetch: refetchOperators, setData: setOperators } = useApi('/api/operators', true)
  const { data: clients, refetch: refetchClients, setData: setClients } = useApi('/api/clients', true)
  const { data: calls, refetch: refetchCalls, setData: setCalls } = useApi('/api/calls', true)

  // Запрашиваем разрешение на уведомления при загрузке
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted')
      })
    } else if (Notification.permission === 'granted') {
      setNotificationsEnabled(true)
    }
  }, [])

  // Показываем browser notification для нового звонка
  const showNotification = useCallback((event) => {
    if (!notificationsEnabled || event.type !== 'CALL_CREATED') return

    const title = '📞 Новый звонок'
    const body = `Клиент ID: ${event.clientId}`

    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `call-${event.callId}`, // Предотвращает дубликаты
    })
  }, [notificationsEnabled])

  // WebSocket обработчик событий
  const handleCallEvent = useCallback((event) => {
    console.log('📨 Received call event:', event)

    // Обновляем данные в зависимости от типа события
    switch (event.type) {
      case 'CALL_CREATED':
        refetchCalls()
        showNotification(event)
        break
      case 'CALL_ASSIGNED':
        refetchCalls()
        refetchOperators()
        break
      case 'CALL_FINISHED':
        refetchCalls()
        refetchOperators()
        break
      default:
        refetchCalls()
    }
  }, [refetchCalls, refetchOperators, showNotification])

  // Подключаемся к WebSocket
  const { isConnected } = useWebSocket('/topic/call-events', handleCallEvent)

  useEffect(() => {
    setWsConnected(isConnected)
  }, [isConnected])

  return (
        <div className="min-h-screen text-slate-100 relative">
      <Background />
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
          <div className="flex items-center gap-3">
            {notificationsEnabled && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1.5">
                <Bell size={12} className="text-emerald-400" />
                уведомления
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1.5">
              {wsConnected ? (
                <>
                  <LivePulse />
                  WebSocket
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2 bg-amber-500 rounded-full" />
                  подключение...
                </>
              )}
            </div>
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