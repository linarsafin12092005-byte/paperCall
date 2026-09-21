import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'

export function EmployeeModal({ employee, isSuperAdmin, onClose, onSubmit }) {
  const isEdit = Boolean(employee?.id)
  const [form, setForm] = useState({
    fullName: employee?.fullName || '',
    email: employee?.email || '',
    phoneNumber: employee?.phoneNumber || '',
    role: employee?.role || 'USER',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({
      fullName: employee?.fullName || '',
      email: employee?.email || '',
      phoneNumber: employee?.phoneNumber || '',
      role: employee?.role || 'USER',
    })
    setError('')
  }, [employee])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await onSubmit({
        ...form,
        ...(isEdit ? {} : { role: form.role }),
      })
      if (result?.error) {
        setError(result.error)
        return
      }
      onClose()
    } catch (submitError) {
      setError(submitError.message || 'Не удалось сохранить сотрудника')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Изменить сотрудника' : 'Добавить сотрудника'} onClose={onClose}>
      <form onSubmit={submit} style={formStyle}>
        <label>ФИО<input className="paper-form-control" required placeholder="Например, Иван Петров" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
        <label>Корпоративный email<input className="paper-form-control" required type="email" placeholder="name@company.local" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Телефон<input className="paper-form-control" type="tel" placeholder="+7 (___) ___-__-__" value={form.phoneNumber} onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })} /></label>
        {!isEdit && (
          <label>Роль
            <select className="paper-form-control" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="USER">Сотрудник</option>
              {isSuperAdmin && <option value="ADMIN">Администратор</option>}
            </select>
          </label>
        )}
        {error && <div style={errorStyle}>{error}</div>}
        <div style={actionsStyle}>
          <button type="button" onClick={onClose} disabled={loading} style={secondaryButton}>Отмена</button>
          <button type="submit" disabled={loading} style={primaryButton}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
        </div>
      </form>
    </Modal>
  )
}

export function ResetPasswordModal({ employee, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await onConfirm(employee)
      if (result?.error) setError(result.error)
      else onClose()
    } catch (confirmError) {
      setError(confirmError.message || 'Не удалось сбросить пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Сбросить пароль?" onClose={loading ? undefined : onClose}>
      <p style={{ color: colors.textSecondary }}>
        Для сотрудника <strong style={{ color: colors.textPrimary }}>{employee.fullName}</strong> будет создан новый временный пароль.
      </p>
      {error && <div style={errorStyle}>{error}</div>}
      <div style={actionsStyle}>
        <button type="button" onClick={onClose} disabled={loading} style={secondaryButton}>Отмена</button>
        <button type="button" onClick={confirm} disabled={loading} style={primaryButton}>{loading ? 'Сброс...' : 'Сбросить пароль'}</button>
      </div>
    </Modal>
  )
}

export function CredentialModal({ credential, onClose }) {
  const [copyError, setCopyError] = useState('')

  const copy = async () => {
    setCopyError('')
    try {
      await navigator.clipboard.writeText(credential.password)
    } catch {
      setCopyError('Не удалось скопировать пароль. Скопируйте его вручную.')
    }
  }

  return (
    <Modal title={credential.title} onClose={onClose}>
      <p style={{ color: colors.textSecondary }}>{credential.name}</p>
      <div style={credentialBox}>
        <code>{credential.password}</code>
        <button type="button" onClick={copy} title="Скопировать временный пароль" aria-label="Скопировать временный пароль" style={iconButton}>
          <span aria-hidden="true">⧉</span>
        </button>
      </div>
      <p style={{ color: colors.warning, fontSize: typography.fontSize.sm }}>
        Передайте пароль сотруднику. После закрытия это окно больше не будет доступно.
      </p>
      {copyError && <div style={errorStyle}>{copyError}</div>}
      <button type="button" onClick={onClose} style={primaryButton}>Я сохранил пароль</button>
    </Modal>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
      <div style={modalStyle}>
        <div style={modalHeader}>
          <h2 id="employee-modal-title" style={modalTitle}>{title}</h2>
          <button type="button" onClick={onClose} disabled={!onClose} aria-label="Закрыть" style={iconButton}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const overlayStyle = { position: 'fixed', inset: 0, zIndex: 3000, display: 'grid', placeItems: 'center', padding: spacing[4], background: 'rgba(0,0,0,.65)' }
const modalStyle = { width: '100%', maxWidth: '480px', padding: spacing[6], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const modalHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }
const modalTitle = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize.xl }
const formStyle = { display: 'grid', gap: spacing[3], color: colors.textSecondary }
const actionsStyle = { display: 'flex', justifyContent: 'flex-end', gap: spacing[2], marginTop: spacing[3] }
const primaryButton = { display: 'inline-flex', alignItems: 'center', gap: spacing[2], padding: `${spacing[2]} ${spacing[3]}`, background: colors.accent, border: 'none', borderRadius: borderRadius.md, color: colors.textPrimary, cursor: 'pointer', fontWeight: typography.fontWeight.semibold }
const secondaryButton = { ...primaryButton, background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textSecondary }
const iconButton = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary, cursor: 'pointer' }
const errorStyle = { padding: spacing[3], background: colors.dangerLight, border: `1px solid ${colors.danger}`, borderRadius: borderRadius.md, color: colors.danger }
const credentialBox = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3], padding: spacing[3], background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textPrimary }
