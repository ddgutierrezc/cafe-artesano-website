export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'cafe-artesano-theme';

export const THEME_COLORS = {
  light: '#F7F8F3',
  dark: '#17110D',
} as const satisfies Readonly<Record<Theme, string>>;
