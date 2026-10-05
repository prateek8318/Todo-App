export const palette = {
  primary: '#10b981', // Emerald 500
  primaryDark: '#047857', // Emerald 700
  secondary: '#f59e0b', // Amber
  backgroundLight: '#f8fafc',
  backgroundDark: '#0f172a',
  surfaceLight: '#ffffff',
  surfaceDark: '#1e293b',
  textLight: '#0f172a',
  textLightSecondary: '#64748b',
  textDark: '#f8fafc',
  textDarkSecondary: '#cbd5e1',
  error: '#ef4444',
  success: '#10b981', // Emerald matches primary
  warning: '#f59e0b',
  borderLight: '#e2e8f0',
  borderDark: '#334155',
  priorityLow: '#3b82f6',
  priorityMedium: '#f59e0b',
  priorityHigh: '#ef4444',
  gradientStart: '#064e3b', // Deep Emerald/Teal
  gradientEnd: '#10b981', // Emerald 500
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  sizes: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

export const shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
};

export const lightTheme = {
  dark: false,
  colors: {
    primary: palette.primary,
    secondary: palette.secondary,
    background: palette.backgroundLight,
    surface: palette.surfaceLight,
    text: palette.textLight,
    textSecondary: palette.textLightSecondary,
    border: palette.borderLight,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    priorityLow: palette.priorityLow,
    priorityMedium: palette.priorityMedium,
    priorityHigh: palette.priorityHigh,
    gradientStart: palette.gradientStart,
    gradientEnd: palette.gradientEnd,
  },
  spacing, typography, radius, shadows,
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: palette.primary,
    secondary: palette.secondary,
    background: palette.backgroundDark,
    surface: palette.surfaceDark,
    text: palette.textDark,
    textSecondary: palette.textDarkSecondary,
    border: palette.borderDark,
    error: palette.error,
    success: palette.success,
    warning: palette.warning,
    priorityLow: palette.priorityLow,
    priorityMedium: palette.priorityMedium,
    priorityHigh: palette.priorityHigh,
    gradientStart: palette.gradientStart,
    gradientEnd: palette.gradientEnd,
  },
  spacing, typography, radius, shadows,
};

export type Theme = typeof lightTheme;
