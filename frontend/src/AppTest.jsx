import { useState, useEffect } from 'react'

function AppTest() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/operators')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error(err))
  }, [])

  return (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h1>CallFlow Test</h1>
      <p>Если видите это — React работает!</p>
      {data ? (
        <div>
          <h2>Операторы:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  )
}

export default AppTest
