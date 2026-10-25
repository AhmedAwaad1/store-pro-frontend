import type { ThemeDefinition, ThemeKey } from '~/types/theme'

export const DEFAULT_THEME: ThemeKey = '3b_retail'

export const THEMES: readonly ThemeDefinition[] = [
  { key: '3b_retail', name: '3B Electronics Retail', mode: 'light', preview: ['#17344f', '#f4f7fa', '#087f8c'] },
  { key: 'warm_neutral_luxury', name: 'Warm Neutral Luxury', mode: 'light', preview: ['#4a321f', '#fffaf2', '#b7472d'] },
  { key: 'navy_gold_modern', name: 'Navy Gold Modern', mode: 'light', preview: ['#0b2740', '#f4f8fb', '#e7b84e'] },
  { key: 'forest_sage_earthy', name: 'Forest Sage Earthy', mode: 'light', preview: ['#123f33', '#f5f1e8', '#cf6e4c'] },
  { key: 'olive_sage_living', name: 'Olive Sage Living', mode: 'light', preview: ['#3d4932', '#f4efe5', '#9a6b43', '#a7ab8e'], previewRoles: { primary: '#3d4932', surface: '#f4efe5', accent: '#9a6b43' } },
  { key: 'blush_boutique', name: 'Blush Boutique', mode: 'light', preview: ['#7b1822', '#fff8f5', '#cf8c7d'] },
  { key: 'dark_teal_bold', name: 'Dark Teal Bold', mode: 'dark', preview: ['#0d2426', '#0bd4c3', '#f3fbfa'] },
  { key: 'royal_plum_premium', name: 'Royal Plum Premium', mode: 'light', preview: ['#502056', '#fff9fb', '#e6c5af'] },
  { key: 'crimson_ember_premium', name: 'Crimson Ember Premium', mode: 'light', preview: ['#9d0a0a', '#fffaf1', '#572619'] },
  { key: 'golden_sand_prestige', name: 'Golden Sand Prestige', mode: 'light', preview: ['#6b4a19', '#fff8e7', '#d2a83d'] },
  { key: 'black_gold_signature', name: 'Black Gold Signature', mode: 'dark', preview: ['#070909', '#e7bd5e', '#f5f1e7'] },
  { key: 'midnight_sand', name: 'Midnight Sand', mode: 'dark', preview: ['#202332', '#BB9974', '#434F5F', '#8B9A9F'], previewRoles: { primary: '#202332', surface: '#434F5F', accent: '#BB9974' } },
  { key: 'sunlit_yellow', name: 'Sunlit Yellow', mode: 'light', preview: ['#FFE72B', '#FFF9E0', '#111111', '#FBC702'], previewRoles: { primary: '#111111', surface: '#FFF9E0', accent: '#FFE72B' } },
] as const

export const isThemeKey = (value: unknown): value is ThemeKey =>
  typeof value === 'string' && THEMES.some(theme => theme.key === value)

export const getTheme = (key: ThemeKey) => THEMES.find(theme => theme.key === key)!
