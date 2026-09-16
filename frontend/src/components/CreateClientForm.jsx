import { useState } from 'react'
import { UserPlus } from 'lucide-react'

export function CreateClientForm({ onSuccess, onCancel }) {
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ fullName, phoneNumber }),
      })

      if (!response.ok) throw new Error('Не удалось создать клиента')

      const client = await response.json()
      onSuccess(client)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Имя клиента
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Иван Иванов"
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Телефон
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          placeholder="+79991234567"
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <UserPlus size={16} />
          {loading ? 'Создание...' : 'Создать клиента'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
