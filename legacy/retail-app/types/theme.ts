export type ThemeKey =
  | '3b_retail'
  | 'warm_neutral_luxury'
  | 'navy_gold_modern'
  | 'forest_sage_earthy'
  | 'olive_sage_living'
  | 'blush_boutique'
  | 'dark_teal_bold'
  | 'royal_plum_premium'
  | 'crimson_ember_premium'
  | 'golden_sand_prestige'
  | 'black_gold_signature'
  | 'midnight_sand'
  | 'sunlit_yellow'

export type ThemeDefinition = {
  key: ThemeKey
  name: string
  mode: 'light' | 'dark'
  preview: [string, string, string] | [string, string, string, string]
  previewRoles?: { primary: string; surface: string; accent: string }
}
