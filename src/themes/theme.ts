export const lightTheme = {
  background: '#F8FAF7',
  canvas: '#FFFFFF',
  card: '#FFFFFF',
  border: '#D8E0D5',
  text: '#1F2933',
  muted: '#6B7280',
  green: '#00843D',
  gold: '#C9A227',
  danger: '#B42318',
  input: '#EAF7EF',
  formula: '#F8FAFC',
  selected: '#DCFCE7',
  pathHighlight: '#22C55E',
};

export const darkTheme = {
  background: '#0B0F0D',
  canvas: '#111827',
  card: '#161B22',
  border: '#30363D',
  text: '#E5E7EB',
  muted: '#9CA3AF',
  green: '#22C55E',
  gold: '#D6B84A',
  danger: '#F87171',
  input: '#102A1A',
  formula: '#1F2937',
  selected: '#064E3B',
  pathHighlight: '#22C55E',
};

export type ThemeTokenMap = typeof lightTheme;

export function applyThemeTokens(theme: ThemeTokenMap) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--vdt-${key}`, value);
  });
}
