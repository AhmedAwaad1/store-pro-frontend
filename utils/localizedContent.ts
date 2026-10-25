import type { StoreLocale } from '~/composables/useLocale'

export const getLocalizedContent = (
  locale: StoreLocale,
  arabic?: string | null,
  english?: string | null,
  fallback?: string | null,
) => (locale === 'en'
  ? english?.trim() || fallback?.trim() || arabic?.trim()
  : arabic?.trim() || fallback?.trim() || english?.trim()) || ''
