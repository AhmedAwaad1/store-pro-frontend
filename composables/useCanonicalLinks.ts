export const useCanonicalLinks = (path: MaybeRefOrGetter<string>) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const origin = String(config.public.siteUrl || 'http://localhost:3000').replace(/\/$/, '')
  const canonicalPath = computed(() => toValue(path))

  useHead(() => {
    const localizedPath = canonicalPath.value
    const canonicalUrl = new URL(localizedPath, `${origin}/`)
    if (route.query.lang === 'en' || route.query.lang === 'ar') canonicalUrl.searchParams.set('lang', String(route.query.lang))
    const alternateUrl = (lang: 'ar' | 'en') => {
      const url = new URL(localizedPath, `${origin}/`)
      url.searchParams.set('lang', lang)
      return url.toString()
    }

    return {
      link: [
        { rel: 'canonical', href: canonicalUrl.toString() },
        { rel: 'alternate', hreflang: 'ar-EG', href: alternateUrl('ar') },
        { rel: 'alternate', hreflang: 'en-EG', href: alternateUrl('en') },
        { rel: 'alternate', hreflang: 'x-default', href: alternateUrl('ar') },
      ],
    }
  })
}

export const serializeJsonLd = (value: Record<string, unknown>) => JSON.stringify(value)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')
