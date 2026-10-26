import type { ComputedRef } from 'vue'

type SiteContentRecord = {
  page_key: string
  content: Record<string, any>
  is_published: boolean
}

export const useSiteContent = async () => {
  const config = useRuntimeConfig()
  const { locale } = useLocale()
  const { data: pages, pending, error, refresh } = await useAsyncData<Record<string, Record<string, any>>>(
    'storepro-site-content',
    async () => {
      try {
        const response = await $fetch<{ data: SiteContentRecord[] }>('/site-content', {
          baseURL: config.public.apiBase,
        })
        const records = Array.isArray(response.data) ? response.data : []
        return Object.fromEntries(records.map((record) => [record.page_key, record.content || {}]))
      } catch {
        return {}
      }
    },
    { server: false, default: () => ({}) },
  )

  const page = (key: string): ComputedRef<Record<string, any>> => computed(() => pages.value?.[key] || {})
  const text = (value: unknown): string => {
    if (typeof value === 'string' || typeof value === 'number') return String(value)
    if (!value || typeof value !== 'object') return ''
    const translations = value as Record<string, unknown>
    const selected = translations[locale.value] || translations.en || translations.ar
    return typeof selected === 'string' || typeof selected === 'number' ? String(selected) : ''
  }

  return { pages, page, text, pending, error, refresh }
}
