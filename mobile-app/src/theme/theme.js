export const colors = {
  background: '#FAF6F0',
  surface: '#FFFFFF',
  primary: '#8C2F1B',
  primaryDark: '#5E1F12',
  accent: '#C9973F',
  text: '#2B2118',
  textMuted: '#7A6E63',
  border: '#E8DFD3',
  success: '#3F7D4E',
  error: '#A83A2B',
  warning: '#A77726',
  info: '#557486',
  subtle: '#F3EDE5',
  white: '#FFFFFF',
  disabled: '#D8CEC2',
  overlay: 'rgba(43, 33, 24, 0.52)',
  imageOverlayLight: 'rgba(31, 20, 14, 0.08)',
  imageOverlayDark: 'rgba(31, 20, 14, 0.82)',
  imageButton: 'rgba(255, 255, 255, 0.92)',
};

export const gradients = {
  hero: [colors.imageOverlayLight, colors.imageOverlayDark],
};

export const spacing = {
  xs: 8,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  screen: 20,
};

export const fontSizes = {
  xs: 11,
  sm: 12,
  body: 14,
  bodyLarge: 16,
  title: 20,
  heading: 24,
  display: 30,
};

export const fonts = {
  serif: 'PlayfairDisplay_700Bold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const COLORS = {
  primary: colors.primary,
  primaryDark: colors.primaryDark,
  primaryLight: colors.subtle,
  secondary: colors.accent,
  background: colors.background,
  card: colors.surface,
  surfaceLight: colors.subtle,
  border: colors.border,
  textPrimary: colors.text,
  textSecondary: colors.textMuted,
  textMuted: colors.textMuted,
  white: colors.white,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  badgePending: '#F6E9C9',
  badgePreparing: '#E5EEF0',
  badgeReady: '#E7F0E5',
  badgeCompleted: '#F0ECE6',
  badgeCancelled: '#F4E2DE',
};

export const SPACING = spacing;
export const FONTS = fonts;
export const SHADOWS = shadows;
