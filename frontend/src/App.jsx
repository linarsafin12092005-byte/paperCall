import { useState, useEffect, useCallback } from 'react'
import { ModernLayout } from './layouts/ModernLayout'
import { DashboardPage } from './pages/DashboardPage'
import { CallsPage } from './pages/CallsPage'
import { ContactsPage } from './pages/ContactsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfileSettingsPage } from './pages/ProfileSettingsPage'
import { GettingStartedPage } from './pages/GettingStartedPage'
import { LoginPage } from './pages/LoginPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { PasswordChangePage } from './pages/PasswordChangePage'

function useApi(path, token, wsEnabled = false) {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    if (!token) return

    fetch(path, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => { if (!res.ok) throw new Error('fail'); return res.json() })
      .then((json) => { setData(json); setError(null) })
      .catch(() => setError('Не удалось загрузить данные. Проверьте подключение к серверу и повторите попытку.'))
      .finally(() => setLoading(false))
  }, [path, token])

  useEffect(() => {
    fetchData()
    const interval = wsEnabled ? 30000 : 5000
    const id = setInterval(fetchData, interval)
    return () => clearInterval(id)
  }, [fetchData, wsEnabled])

  return { data, error, loading, refetch: fetchData, setData }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [activePage, setActivePage] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Unauthorized')
          return res.json()
        })
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
        })
    }
  }, [token])

  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const handleUpdateProfile = (updatedUser) => {
    setUser(updatedUser)
    setIsEditingProfile(false)
  }

  const { data: operators, error: operatorsError } = useApi('/api/operators', token, true)
  const { data: clients, error: clientsError, refetch: refetchClients } = useApi('/api/clients', token, true)
  const { data: calls, error: callsError, refetch: refetchCalls } = useApi('/api/calls', token, true)

  if (!token) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (user?.mustChangePassword) {
    return (
      <PasswordChangePage
        user={user}
        onChanged={setUser}
        onLogout={handleLogout}
      />
    )
  }

  const renderPage = () => {
    if (activePage === 'profile' && isEditingProfile) {
      return (
        <ProfileSettingsPage
          user={user}
          onBack={() => setIsEditingProfile(false)}
          onUpdate={handleUpdateProfile}
        />
      )
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardPage calls={calls} operators={operators} clients={clients} errors={[callsError, clientsError].filter(Boolean)} onViewAllCalls={() => setActivePage('calls')} />
      case 'calls':
        return <CallsPage calls={calls} clients={clients} user={user} apiError={callsError} onCallCreated={refetchCalls} />
      case 'contacts':
        return <ContactsPage clients={clients} user={user} apiError={clientsError} onClientCreated={refetchClients} />
      case 'employees':
        return <EmployeesPage user={user} />
      case 'profile':
        return <ProfilePage user={user} onLogout={handleLogout} onEditProfile={() => setIsEditingProfile(true)} />
      case 'start':
        return <GettingStartedPage />
      default:
        return <DashboardPage calls={calls} clients={clients} errors={[callsError, clientsError, operatorsError].filter(Boolean)} />
    }
  }

  return (
    <ModernLayout activePage={activePage} onPageChange={setActivePage} user={user} onLogout={handleLogout}>
      {renderPage()}
    </ModernLayout>
  )
}

export default App
