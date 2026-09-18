import { useState } from 'react'
import { X } from 'lucide-react'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'

export function CreateClientModal({ client, onClose, onCreated }) {
  const editing = Boolean(client)
  const [form, setForm] = useState({
    fullName: client?.fullName || '', phoneNumber: client?.phoneNumber || '',
    email: client?.email || '', organization: client?.organization || '', note: client?.note || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try {
      const response = await fetch(editing ? `/api/clients/${client.id}` : '/api/clients', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(form) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || data.message || 'Не удалось сохранить контакт')
      onCreated?.(data); onClose()
    } catch (submitError) { setError(submitError.message) } finally { setLoading(false) }
  }
  return <div style={overlay} role="dialog" aria-modal="true"><div style={modal}><div style={header}><h2 style={title}>{editing ? 'Изменить внешний контакт' : 'Добавить внешний контакт'}</h2><button type="button" onClick={onClose} style={iconButton} aria-label="Закрыть"><X size={18} /></button></div><form onSubmit={submit} style={formStyle}><label>ФИО / название *<input className="paper-form-control" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label><label>Телефон *<input className="paper-form-control" required value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} /></label><label>Email<input className="paper-form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Организация<input className="paper-form-control" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></label><label>Заметка<textarea className="paper-form-control" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></label>{error && <div style={errorStyle}>{error}</div>}<div style={actions}><button type="button" onClick={onClose} disabled={loading} style={secondary}>Отмена</button><button type="submit" disabled={loading} style={primary}>{loading ? 'Сохранение...' : 'Сохранить'}</button></div></form></div></div>
}
const overlay = { position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center', padding: spacing[4], background: 'rgba(0,0,0,.65)' }
const modal = { width: '100%', maxWidth: '500px', padding: spacing[6], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }
const title = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize.xl }
const formStyle = { display: 'grid', gap: spacing[3], color: colors.textSecondary }
const actions = { display: 'flex', justifyContent: 'flex-end', gap: spacing[2], marginTop: spacing[2] }
const primary = { padding: `${spacing[2]} ${spacing[4]}`, background: colors.accent, border: 'none', borderRadius: borderRadius.md, color: colors.textPrimary, cursor: 'pointer' }
const secondary = { ...primary, background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textSecondary }
const iconButton = { width: '32px', height: '32px', display: 'grid', placeItems: 'center', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary, cursor: 'pointer' }
const errorStyle = { padding: spacing[3], background: colors.dangerLight, border: `1px solid ${colors.danger}`, borderRadius: borderRadius.md, color: colors.danger }
