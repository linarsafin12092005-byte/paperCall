import { useEffect, useState } from 'react'
import { Edit3, KeyRound, Plus, UserCheck, UserX } from 'lucide-react'
import { AdminErrorBoundary } from '../components/AdminErrorBoundary'
import { CredentialModal, EmployeeModal, ResetPasswordModal } from '../components/EmployeeModal'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'

export function EmployeesPage({ user }) {
  return <AdminErrorBoundary><EmployeesContent user={user} /></AdminErrorBoundary>
}

function EmployeesContent({ user }) {
  const [employees, setEmployees] = useState([])
  const [modal, setModal] = useState(null)
  const [credential, setCredential] = useState(null)
  const [error, setError] = useState('')
  const token = () => localStorage.getItem('token')
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  const loadEmployees = async () => {
    const response = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token()}` } })
    if (!response.ok) throw new Error('Не удалось загрузить сотрудников')
    setEmployees(await response.json())
  }

  useEffect(() => {
    if (isAdmin) loadEmployees().catch((loadError) => setError(loadError.message))
  }, [isAdmin])

  if (!isAdmin) return <section style={emptyStyle}><h2>Доступ запрещён</h2><p>Раздел доступен только администраторам.</p></section>

  const saveEmployee = async (form) => {
    const isEdit = Boolean(form.id)
    const response = await fetch(isEdit ? `/api/admin/users/${form.id}` : '/api/admin/users', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber, ...(!isEdit ? { role: form.role } : {}) }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.error || 'Не удалось сохранить сотрудника' }
    if (data.temporaryPassword) setCredential({ title: 'Доступ сотрудника', name: form.fullName, password: data.temporaryPassword })
    await loadEmployees()
    return null
  }

  const resetPassword = async (employee) => {
    const response = await fetch(`/api/admin/users/${employee.id}/reset-password`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` } })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { error: data.error || 'Не удалось сбросить пароль' }
    setCredential({ title: 'Новый временный пароль', name: employee.fullName, password: data.temporaryPassword })
    return null
  }

  const toggleStatus = async (employee) => {
    const response = await fetch(`/api/admin/users/${employee.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ active: !employee.active }) })
    if (!response.ok) { setError('Не удалось изменить статус'); return }
    await loadEmployees()
  }

  const changeRole = async (employee, role) => {
    const response = await fetch(`/api/admin/users/${employee.id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ role }) })
    if (!response.ok) { setError('Не удалось изменить роль'); return }
    await loadEmployees()
  }

  return (
    <section>
      <header style={headerStyle}><div><h1 style={titleStyle}>Сотрудники</h1><p style={subtitleStyle}>Управление доступом сотрудников к paperCall</p></div><button type="button" style={primaryButton} onClick={() => setModal({ type: 'edit', employee: null })}><Plus size={17} /> Добавить сотрудника</button></header>
      {error && <div style={errorStyle}>{error}</div>}
      <div style={tableWrap}>
        <div style={tableHeader}><span>Сотрудник</span><span>Email</span><span>Роль</span><span>SIP</span><span>Статус</span><span>Действия</span></div>
        {employees.map((employee) => <div key={employee.id} style={rowStyle}>
          <div style={personCell}><div style={avatarStyle}>{employee.fullName?.charAt(0)?.toUpperCase() || '?'}</div><strong>{employee.fullName}</strong></div>
          <div style={truncate}>{employee.email}</div><div><span style={roleBadge(employee.role)}>{roleLabel(employee.role)}</span></div><div style={mono}>{employee.sipExtension || '—'}</div><div><span style={statusBadge(employee.active)}>{employee.active ? 'Активен' : 'Заблокирован'}</span></div>
<div style={actions}><button type="button" style={iconButton} title="Изменить" aria-label="Изменить" onClick={() => setModal({ type: 'edit', employee })}><Edit3 size={16} /></button><button type="button" style={iconButton} title="Статус" aria-label="Изменить статус" onClick={() => toggleStatus(employee)}>{employee.active ? <UserX size={16} /> : <UserCheck size={16} />}</button><button type="button" style={iconButton} title="Сбросить пароль" aria-label="Сбросить пароль" onClick={() => setModal({ type: 'reset', employee })}><KeyRound size={16} /></button>{user.role === 'SUPER_ADMIN' && employee.id !== user.userId && <select className="paper-form-control" value={normalizeRole(employee.role)} onChange={(e) => changeRole(employee, e.target.value)} style={roleSelect} aria-label={`Изменить роль сотрудника ${employee.fullName}`}><option value="USER">USER</option><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option><option value="OPERATOR">OPERATOR</option></select>}</div>
        </div>)}
      </div>
      {modal?.type === 'edit' && <EmployeeModal employee={modal.employee} isSuperAdmin={user.role === 'SUPER_ADMIN'} onClose={() => setModal(null)} onSubmit={saveEmployee} />}
      {modal?.type === 'reset' && <ResetPasswordModal employee={modal.employee} onClose={() => setModal(null)} onConfirm={resetPassword} />}
      {credential && <CredentialModal credential={credential} onClose={() => setCredential(null)} />}
    </section>
  )
}

const headerStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing[4], marginBottom: spacing[6], flexWrap: 'wrap' }
const titleStyle = { margin: 0, color: colors.textPrimary, fontSize: typography.fontSize['2xl'] }
const subtitleStyle = { margin: `${spacing[2]} 0 0`, color: colors.textSecondary }
const tableWrap = { overflowX: 'auto', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }
const tableHeader = { minWidth: '900px', display: 'grid', gridTemplateColumns: '1.3fr 1.5fr .8fr .6fr .8fr 1.5fr', gap: spacing[3], padding: `${spacing[3]} ${spacing[4]}`, color: colors.textTertiary, fontSize: typography.fontSize.xs, textTransform: 'uppercase', borderBottom: `1px solid ${colors.border}` }
const rowStyle = { minWidth: '900px', display: 'grid', gridTemplateColumns: '1.3fr 1.5fr .8fr .6fr .8fr 1.5fr', gap: spacing[3], alignItems: 'center', padding: `${spacing[3]} ${spacing[4]}`, color: colors.textSecondary, fontSize: typography.fontSize.sm, borderBottom: `1px solid ${colors.border}` }
const personCell = { display: 'flex', alignItems: 'center', gap: spacing[3], minWidth: 0, color: colors.textPrimary }
const avatarStyle = { width: '34px', height: '34px', flexShrink: 0, borderRadius: borderRadius.full, display: 'grid', placeItems: 'center', background: colors.accent, color: colors.textPrimary, fontWeight: typography.fontWeight.semibold }
const truncate = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const mono = { fontFamily: 'monospace', color: colors.textPrimary }
const actions = { display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }
const iconButton = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary, cursor: 'pointer' }
const normalizeRole = (role) => String(role ?? '').trim().toUpperCase()
const roleLabel = (role) => ({
  USER: 'Сотрудник',
  ADMIN: 'Администратор',
  SUPER_ADMIN: 'Владелец системы',
  OPERATOR: 'Оператор',
}[normalizeRole(role)] || 'Роль не указана')
const rolePalette = (role) => {
  switch (normalizeRole(role)) {
    case 'USER': return { fg: colors.roleUser, bg: colors.roleUserLight }
    case 'ADMIN': return { fg: colors.roleAdmin, bg: colors.roleAdminLight }
    case 'SUPER_ADMIN': return { fg: colors.roleSuperAdmin, bg: colors.roleSuperAdminLight }
    case 'OPERATOR': return { fg: colors.roleOperator, bg: colors.roleOperatorLight }
    default: return { fg: colors.textSecondary, bg: colors.grayLight }
  }
}
const roleSelect = { width: '150px', maxWidth: '100%', fontSize: typography.fontSize.xs }
const roleBadge = (role) => {
  const palette = rolePalette(role)
  return { display: 'inline-flex', padding: `${spacing[1]} ${spacing[2]}`, borderRadius: borderRadius.md, background: palette.bg, color: palette.fg, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold }
}
const statusBadge = (active) => ({ display: 'inline-flex', padding: `${spacing[1]} ${spacing[2]}`, borderRadius: borderRadius.md, background: active ? colors.successLight : colors.dangerLight, color: active ? colors.success : colors.danger, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold })
const primaryButton = { display: 'inline-flex', alignItems: 'center', gap: spacing[2], padding: `${spacing[2]} ${spacing[3]}`, background: colors.accent, border: 'none', borderRadius: borderRadius.md, color: colors.textPrimary, cursor: 'pointer', fontWeight: typography.fontWeight.semibold }
const emptyStyle = { padding: spacing[8], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg, color: colors.textSecondary }
const errorStyle = { marginBottom: spacing[4], padding: spacing[3], background: colors.dangerLight, border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.danger }
