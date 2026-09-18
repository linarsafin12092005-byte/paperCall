import { Component } from 'react'
import { colors, spacing, borderRadius, typography } from '../design-system/tokens'

export class AdminErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[paperCall admin UI error]', {
      name: error?.name,
      message: error?.message,
      componentStack: info?.componentStack,
    })
  }

  retry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <section style={{
        padding: spacing[8],
        background: colors.surface,
        border: `1px solid ${colors.danger}`,
        borderRadius: borderRadius.lg,
        color: colors.textPrimary,
      }}>
        <h2 style={{ marginTop: 0, fontSize: typography.fontSize.xl }}>
          Не удалось открыть раздел сотрудников
        </h2>
        <p style={{ color: colors.textSecondary }}>
          Произошла ошибка интерфейса. Данные сотрудников не были изменены.
        </p>
        <button
          type="button"
          onClick={this.retry}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            background: colors.accent,
            border: 'none',
            borderRadius: borderRadius.md,
            color: colors.textPrimary,
            cursor: 'pointer',
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          Повторить
        </button>
      </section>
    )
  }
}
