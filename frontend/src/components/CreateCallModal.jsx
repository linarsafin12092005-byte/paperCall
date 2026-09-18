import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'

export function CreateCallModal({ clients, currentUser, onClose, onCreated }) {
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState({ callType: 'EXTERNAL', recipientUserId: '', clientId: '', plannedAt: '', topic: '', note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/users/directory', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((response) => response.ok ? response.json() : [])
      .then(setEmployees)
      .catch(() => setEmployees([]))
  }, [])

  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          ...form,
          recipientUserId: form.callType === 'INTERNAL' ? Number(form.recipientUserId) : null,
          clientId: form.callType === 'EXTERNAL' ? Number(form.clientId) : null,
          plannedAt: new Date(form.plannedAt).toISOString(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || data.message || 'Не удалось создать запись звонка')
      onCreated?.(data); onClose()
    } catch (submitError) { setError(submitError.message) } finally { setLoading(false) }
  }

  return <div style={overlay} role="dialog" aria-modal="true"><div style={modal}><div style={header}><h2 style={title}>Новая запись звонка</h2><button type="button" onClick={onClose} style={iconButton} aria-label="Закрыть"><X size={18} /></button></div><p style={info}>Телефония Asterisk ещё не подключена. Здесь можно планировать и вести журнал звонков.</p><div style={initiator}>Инициатор: <strong>{currentUser?.fullName || 'Текущий сотрудник'}</strong></div><form onSubmit={submit} style={formStyle}><label>Тип звонка<select className="paper-form-control" value={form.callType} onChange={(e) => setForm({ ...form, callType: e.target.value, recipientUserId: '', clientId: '' })}><option value="EXTERNAL">Внешний</option><option value="INTERNAL">Внутренний</option></select></label>{form.callType === 'EXTERNAL' ? <label>Внешний контакт *<select className="paper-form-control" required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">Выберите контакт</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.fullName} — {client.phoneNumber}</option>)}</select></label> : <label>Сотрудник *<select className="paper-form-control" required value={form.recipientUserId} onChange={(e) => setForm({ ...form, recipientUserId: e.target.value })}><option value="">Выберите сотрудника</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} — {employee.sipExtension || 'без SIP'}</option>)}</select></label>}<label>Дата и время *<input className="paper-form-control" required type="datetime-local" value={form.plannedAt} onChange={(e) => setForm({ ...form, plannedAt: e.target.value })} /></label><label>Причина<input className="paper-form-control" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} /></label><label>Заметка<textarea className="paper-form-control" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>{error && <div style={errorStyle}>{error}</div>}<div style={actions}><button type="button" onClick={onClose} style={secondary}>Отмена</button><button type="submit" disabled={loading} style={primary}>{loading ? 'Создание...' : 'Создать запись'}</button></div></form></div></div>
}

const overlay = { position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center', padding: spacing[4], background: 'rgba(0,0,0,.65)' }
const modal = { width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: spacing[6], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }
const title = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize.xl }
const info = { padding: spacing[3], background: colors.warningLight, borderRadius: borderRadius.md, color: colors.warning, fontSize: typography.fontSize.sm }
const initiator = { marginTop: spacing[3], color: colors.textSecondary, fontSize: typography.fontSize.sm }
const formStyle = { display: 'grid', gap: spacing[3], marginTop: spacing[4], color: colors.textSecondary }
const actions = { display: 'flex', justifyContent: 'flex-end', gap: spacing[2], marginTop: spacing[2] }
const primary = { padding: `${spacing[2]} ${spacing[4]}`, background: colors.accent, border: 'none', borderRadius: borderRadius.md, color: colors.textPrimary, cursor: 'pointer' }
const secondary = { ...primary, background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textSecondary }
const iconButton = { width: '32px', height: '32px', display: 'grid', placeItems: 'center', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary, cursor: 'pointer' }
const errorStyle = { padding: spacing[3], background: colors.dangerLight, border: `1px solid ${colors.danger}`, borderRadius: borderRadius.md, color: colors.danger }
