import { $fetch } from 'ofetch'
import { useAsyncData } from '#app'
import type { ComputedRef } from 'vue'

type SiteContentRecord = {
  page_key: string
  content: Record<string, any>
  is_published: boolean
}

export const useSiteContent = async () => {
  const config = useRuntimeConfig()
  const { locale } = useLocale()
  const fetchPages = async (): Promise<Record<string, Record<string, any>>> => {
    const apiBase = useApiBaseUrl()
    const response = await $fetch('/site-content', {
      baseURL: apiBase,
      timeout: 8000,
    }) as { data: SiteContentRecord[] | { data?: SiteContentRecord[] } }
    const records: SiteContentRecord[] = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data) ? response.data.data : []
    return Object.fromEntries(records.map((record) => [record.page_key, record.content || {}]))
  }
  const { data: pages, pending, error, refresh } = await useAsyncData<Record<string, Record<string, any>>>(
    'legacy-site-content', fetchPages,
    {
      default: () => ({}),
      dedupe: 'defer',
      getCachedData: (key, nuxtApp, context) =>
        context.cause === 'initial' ? nuxtApp.payload.data[key] : undefined,
    },
  )
  const refreshSilently = async () => {
    try {
      const updated = await fetchPages()
      if (updated.global) pages.value = updated
    } catch {
      // Keep the prerendered content available when the CMS cannot be reached.
    }
  }

  const page = (key: string): ComputedRef<Record<string, any>> => computed(() => pages.value?.[key] || {})
  const rebrand = (value: string) => value.replace(/StorePro/g, 'FounderLinkX').replace(/ستور برو/g, 'FounderLinkX')
  const text = (value: unknown): string => {
    if (typeof value === 'string' || typeof value === 'number') return rebrand(String(value))
    if (!value || typeof value !== 'object') return ''
    const translations = value as Record<string, unknown>
    const selected = translations[locale.value] || translations.en || translations.ar
    return typeof selected === 'string' || typeof selected === 'number' ? rebrand(String(selected)) : ''
  }

  return { pages, page, text, pending, error, refresh, refreshSilently }
}
