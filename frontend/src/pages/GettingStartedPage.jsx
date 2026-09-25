import { colors, spacing, borderRadius, typography, transitions } from '../design-system/tokens'
import { Download, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react'

function StepCard({ number, title, children, action }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borderRadius.lg,
      padding: spacing[6],
      transition: transitions.base,
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.accent
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing[4],
      }}>
        {/* Step number */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: borderRadius.full,
          background: colors.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.textPrimary,
          flexShrink: 0,
        }}>
          {number}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing[3],
          }}>
            {title}
          </h3>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            lineHeight: typography.lineHeight.relaxed,
            marginBottom: action ? spacing[4] : 0,
          }}>
            {children}
          </div>
          {action}
        </div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }) {
  return (
    <details style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: borderRadius.md,
      padding: spacing[4],
      cursor: 'pointer',
      transition: transitions.fast,
    }}>
      <summary style={{
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.textPrimary,
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
      }}>
        <HelpCircle size={18} color={colors.accent} />
        {question}
      </summary>
      <div style={{
        marginTop: spacing[3],
        paddingLeft: '26px',
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        lineHeight: typography.lineHeight.relaxed,
      }}>
        {answer}
      </div>
    </details>
  )
}

export function GettingStartedPage({ user, telephonyStatus }) {
  const sipExtension = user?.sipExtension || '—'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing[8] }}>
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.semibold,
          color: colors.textPrimary,
          marginBottom: spacing[2],
        }}>
          Быстрый старт
        </h1>
        <p style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          lineHeight: typography.lineHeight.relaxed,
        }}>
          Настройте SIP-клиент с данными вашего аккаунта и начните совершать звонки
        </p>
      </div>

      <div style={{
        marginBottom: spacing[6],
        padding: spacing[4],
        background: telephonyStatus?.connected ? colors.successLight : colors.warningLight,
        border: `1px solid ${telephonyStatus?.connected ? colors.success : colors.warning}`,
        borderRadius: borderRadius.md,
        color: telephonyStatus?.connected ? colors.success : colors.warning,
      }}>
        {telephonyStatus?.connected
          ? 'Телефония подключена. Можно регистрировать SIP-устройства.'
          : telephonyStatus && typeof telephonyStatus.connected === 'boolean'
            ? 'Телефония недоступна. Проверьте подключение позже.'
            : 'Статус телефонии временно недоступен'}
      </div>

      {/* Steps */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[4],
        marginBottom: spacing[8],
      }}>
        <StepCard
          number="1"
          title="Скачайте MicroSIP"
          action={
            <button
              onClick={() => window.open('https://www.microsip.org/downloads', '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[3]} ${spacing[4]}`,
                background: colors.accent,
                border: 'none',
                borderRadius: borderRadius.md,
                color: colors.textPrimary,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: transitions.fast,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.accentHover
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.accent
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <Download size={20} />
              Скачать MicroSIP
              <ExternalLink size={16} />
            </button>
          }
        >
          MicroSIP — это бесплатный SIP клиент для Windows. Небольшой размер (~2 МБ), простая настройка, отличное качество звука.
        </StepCard>

        <StepCard
          number="2"
          title="Получите данные для подключения"
        >
          <div>Перейдите на страницу <strong style={{ color: colors.textPrimary }}>Профиль</strong> и скопируйте ваши SIP настройки:</div>
          <ul style={{
            marginTop: spacing[3],
            paddingLeft: spacing[6],
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
          }}>
            <li style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>Сервер на этом компьютере:</strong> localhost:5060 — если SIP-клиент запущен здесь же
            </li>
            <li style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>Сервер для телефона или другого компьютера:</strong> 192.168.207.102:5060 — если устройство подключено к той же LAN
            </li>
            <li style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>Domain:</strong> asterisk
            </li>
            <li style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>Extension:</strong> {sipExtension}
            </li>
            <li style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>Auth username:</strong> {sipExtension}
            </li>
            <li style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>Transport:</strong> UDP, порт 5060
            </li>
            <li style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.textPrimary }}>Пароль:</strong> используйте пароль SIP из профиля; он не показывается автоматически
            </li>
          </ul>
        </StepCard>

        <StepCard
          number="3"
          title="Настройте MicroSIP"
        >
          <ol style={{
            paddingLeft: spacing[6],
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
          }}>
            <li style={{ color: colors.textSecondary }}>
              Откройте MicroSIP
            </li>
            <li style={{ color: colors.textSecondary }}>
              Нажмите на иконку → <strong style={{ color: colors.textPrimary }}>Меню → Аккаунты → Добавить</strong>
            </li>
            <li style={{ color: colors.textSecondary }}>
              Вставьте данные из профиля
            </li>
            <li style={{ color: colors.textSecondary }}>
              Нажмите <strong style={{ color: colors.textPrimary }}>Сохранить</strong>
            </li>
            <li style={{ color: colors.textSecondary }}>
              Дождитесь статуса <span style={{ color: colors.success, fontWeight: typography.fontWeight.semibold }}>Готов</span> в интерфейсе
            </li>
          </ol>
        </StepCard>
      </div>

      {/* Test call */}
      <div style={{
        background: colors.successLight,
        border: `1px solid ${colors.success}`,
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        marginBottom: spacing[8],
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
          <CheckCircle size={24} color={colors.success} />
          <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>
            Проверка связи
          </h3>
        </div>
        <p style={{
          fontSize: typography.fontSize.base,
          color: colors.textSecondary,
          marginBottom: spacing[4],
        }}>
          Для проверки позвоните с одного зарегистрированного SIP-устройства на другой внутренний номер.
        </p>
      </div>

      {/* FAQ */}
      <div>
        <h2 style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.textPrimary,
          marginBottom: spacing[4],
        }}>
          Частые вопросы
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[3],
        }}>
          <FAQItem
            question="Не могу подключиться к серверу"
            answer="Проверьте, что сервер доступен и вы используете правильный порт 5060. Убедитесь, что в настройках указан UDP протокол."
          />
          <FAQItem
            question="Нет звука во время звонка"
            answer="Проверьте настройки звука в MicroSIP (меню → Options → Audio). Убедитесь, что выбраны правильные устройства воспроизведения и записи."
          />
          <FAQItem
            question="Статус показывает «Ошибка» или «Нет доступа»"
            answer="Проверьте правильность логина и пароля. Скопируйте их заново из раздела Профиль, чтобы избежать опечаток."
          />
          <FAQItem
            question="Как позвонить с мобильного телефона?"
            answer="Установите SIP клиент на телефон (например, Linphone для Android/iOS) и используйте те же настройки из профиля."
          />
        </div>
      </div>
    </div>
  )
}
