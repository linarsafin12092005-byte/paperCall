import { useState, useEffect, useCallback } from 'react'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { CallsPage } from './pages/CallsPage'
import { ContactsPage } from './pages/ContactsPage'
import { ProfilePage } from './pages/ProfilePage'
import { GettingStartedPage } from './pages/GettingStartedPage'
import { useWebSocket } from './useWebSocket'
import { colors } from './design-system'

// Custom hook for API calls
function useApi(path, wsEnabled = false) {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    fetch(path)
      .then((res) => { if (!res.ok) throw new Error('fail'); return res.json() })
      .then((json) => { setData(json); setError(null) })
      .catch(() => setError(`Failed to load: ${path}`))
      .finally(() => setLoading(false))
  }, [path])

  useEffect(() => {
    fetchData()
    const interval = wsEnabled ? 30000 : 5000
    const id = setInterval(fetchData, interval)
    return () => clearInterval(id)
  }, [fetchData, wsEnabled])

  return { data, error, loading, refetch: fetchData, setData }
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // Fetch data
