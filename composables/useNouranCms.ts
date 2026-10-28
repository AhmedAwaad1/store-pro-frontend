import { $fetch } from 'ofetch'
import type { NouranBlogArticle, NouranGlobalSettings, NouranSiteContent } from '~/data/nouranSiteContent'
import { nouranSiteContent } from '~/data/nouranSiteContent'

type CmsPage = { page_key: string; content: Record<string, any>; is_published: boolean }
type NouranCmsPayload = {
  content: NouranSiteContent
  settings: NouranGlobalSettings
  articles: NouranBlogArticle[]
}

const defaultSettings: NouranGlobalSettings = {
  website_name: nouranSiteContent.brand.full,
  brand: nouranSiteContent.brand,
  instagram_url: nouranSiteContent.instagramUrl,
  whatsapp_url: '',
  booking_url: nouranSiteContent.instagramUrl,
  seo: { ...nouranSiteContent.seo, social_image_path: null, social_image_url: null },
}

function mergeContent<T extends Record<string, any>>(defaults: T, updates: Record<string, any>): T {
  const merged = { ...defaults } as Record<string, any>
  for (const [key, value] of Object.entries(updates || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && defaults[key] && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
      merged[key] = mergeContent(defaults[key], value)
    } else {
      merged[key] = value
    }
  }
  return merged as T
}

function recordsFrom(response: any): CmsPage[] {
  const data = response?.data
  if (Array.isArray(data)) return data
  return Array.isArray(data?.data) ? data.data : []
}

function articlesFrom(response: any): NouranBlogArticle[] {
  const data = response?.data
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  return list.filter((article: NouranBlogArticle) => typeof article?.slug === 'string')
}

export const useNouranCms = async () => {
  const apiBase = useApiBaseUrl()
  const { data, pending, error, refresh } = await useAsyncData<NouranCmsPayload>('nouran-public-cms', async () => {
    const [pageResult, articleResult] = await Promise.allSettled([
      $fetch('/site-content', { baseURL: apiBase, timeout: 8000 }),
      $fetch('/blog', { baseURL: apiBase, timeout: 8000 }),
    ])

    const pageRecords = pageResult.status === 'fulfilled' ? recordsFrom(pageResult.value) : []
    const published = new Map(pageRecords.filter((record) => record.is_published).map((record) => [record.page_key, record.content || {}]))
    const content = mergeContent(nouranSiteContent, published.get('nouran-home') || {})
    const settings = mergeContent(defaultSettings, published.get('nouran-settings') || {})
    content.brand = settings.brand
    content.seo = { ...content.seo, ...settings.seo }

    return {
      content,
      settings,
      articles: articleResult.status === 'fulfilled' ? articlesFrom(articleResult.value) : [],
    }
  }, {
    default: () => ({ content: nouranSiteContent, settings: defaultSettings, articles: [] }),
  })

  return {
    content: computed(() => data.value?.content || nouranSiteContent),
    settings: computed(() => data.value?.settings || defaultSettings),
    articles: computed(() => data.value?.articles || []),
    pending,
    error,
    refresh,
  }
}
