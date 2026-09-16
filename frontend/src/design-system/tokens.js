// Modern SaaS Design Tokens - Dark Theme (Linear/Vercel style)

export const colors = {
  // Background
  bg: '#0A0A0A',
  surface: '#161616',
  surfaceHover: '#1F1F1F',

  // Borders
  border: '#2A2A2A',
  borderHover: '#3A3A3A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#6B6B6B',

  // Accent - Blue
  accent: '#3B82F6',
  accentHover: '#2563EB',
  accentLight: 'rgba(59, 130, 246, 0.1)',

  // Status
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
}

export const typography = {
  fontFamily: {
    sans: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
}

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
  md: '0 4px 12px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.2)',
  accent: '0 4px 12px rgba(59, 130, 246, 0.3)',
}

export const transitions = {
  fast: '0.15s ease',
  base: '0.2s ease',
}
