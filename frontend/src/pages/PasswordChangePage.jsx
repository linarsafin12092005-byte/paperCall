import { useState } from 'react'
import { colors, spacing, borderRadius, typography, transitions } from '../design-system/tokens'

export function PasswordChangePage({ user, onChanged, onLogout }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('Новый пароль должен содержать минимум 8 символов')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fullName: user.fullName,
          email: user.email,
          oldPassword,
          newPassword,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Не удалось сменить пароль')
      onChanged(data)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, padding: spacing[4] }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: '460px', padding: spacing[8], background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: borderRadius.lg }}>
        <h1 style={{ color: colors.textPrimary, marginTop: 0 }}>Смените временный пароль</h1>
        <p style={{ color: colors.textSecondary }}>Для продолжения работы задайте личный пароль.</p>
        <input required type="password" placeholder="Временный пароль" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={inputStyle} />
        <input required type="password" minLength={8} placeholder="Новый пароль" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
        <input required type="password" minLength={8} placeholder="Повторите новый пароль" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
        {error && <div style={errorStyle}>{error}</div>}
        <button type="submit" disabled={loading} style={buttonStyle}>{loading ? 'Сохранение...' : 'Сменить пароль'}</button>
        <button type="button" onClick={onLogout} style={logoutStyle}>Выйти</button>
      </form>
    </div>
  )
}

const inputStyle = { width: '100%', boxSizing: 'border-box', marginTop: spacing[3], padding: spacing[3], background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textPrimary }
const buttonStyle = { width: '100%', marginTop: spacing[4], padding: spacing[3], background: colors.accent, border: 'none', borderRadius: borderRadius.md, color: colors.textPrimary, cursor: 'pointer', fontWeight: typography.fontWeight.semibold, transition: transitions.fast }
const logoutStyle = { width: '100%', marginTop: spacing[3], padding: spacing[3], background: 'transparent', border: `1px solid ${colors.border}`, borderRadius: borderRadius.md, color: colors.textSecondary, cursor: 'pointer' }
const errorStyle = { marginTop: spacing[3], padding: spacing[3], background: colors.dangerLight, border: `1px solid ${colors.danger}`, borderRadius: borderRadius.md, color: colors.danger }
