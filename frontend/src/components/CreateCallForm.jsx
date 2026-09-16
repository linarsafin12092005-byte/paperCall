import { useState } from 'react'
import { PhoneCall } from 'lucide-react'

export function CreateCallForm({ clients, onSuccess, onCancel }) {
  const [clientId, setClientId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/calls?clientId=${clientId}`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Не удалось создать звонок')

      const call = await response.json()
      onSuccess(call)
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
          Выберите клиента
        </label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          <option value="">-- Выберите клиента --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName} ({client.phoneNumber})
            </option>
          ))}
        </select>
      </div>

      {clients.length === 0 && (
        <div className="text-sm text-slate-400 bg-slate-800/30 border border-slate-800 rounded-lg px-4 py-3">
          Нет клиентов. Сначала создайте клиента.
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || clients.length === 0}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <PhoneCall size={16} />
          {loading ? 'Создание...' : 'Создать звонок'}
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
